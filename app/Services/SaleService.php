<?php

namespace App\Services;

use App\Enums\SaleTypeEnum;
use App\Models\CustomerPayment;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $items = $this->normalizeItemsWithProductData($data['items']);

            $this->validateStock($items);
            $data['total_price'] = 0; // Will be updated after items are synced
            $sale = Sale::create($data);

            $this->syncItems($sale, $items);

            $totalPrice = $this->calculateTotal($items);

            $monthlyInstallment = $this->calculateMonthlyInstallment(
                $data['type'],
                $totalPrice,
                $data['down_payment'] ?? 0,
                $data['installment_rate'] ?? 0,
                $data['installment_months'] ?? 0,
            );

            $sale->update([
                'total_price' => $totalPrice,
                'installment_amount' => $monthlyInstallment,
            ]);

            $this->createPayment($sale, $data['customer_id'], $data['down_payment'] ?? $totalPrice);

            return $sale;
        });
    }

    public function update(Sale $sale, array $data): Sale
    {
        return DB::transaction(function () use ($sale, $data) {
            $this->rollbackStock($sale);

            $sale->items()->delete();

            $items = $this->normalizeItemsWithProductData($data['items']);

            $this->validateStock($items);

            $this->syncItems($sale, $items);

            $totalPrice = $this->calculateTotal($items);

            $monthlyInstallment = $this->calculateMonthlyInstallment(
                $data['type'],
                $totalPrice,
                $data['down_payment'] ?? 0,
                $data['installment_rate'] ?? 0,
                $data['installment_months'] ?? 0,
            );

            $sale->update([
                'customer_id' => $data['customer_id'],
                'customer_name' => $data['customer_name'],
                'type' => $data['type'],
                'note' => $data['note'] ?? null,
                'total_price' => $totalPrice,
                'installment_months' => $data['installment_months'] ?? null,
                'installment_rate' => $data['installment_rate'] ?? null,
                'installment_amount' => $monthlyInstallment,
            ]);

            $this->deleteOldFirstPayments($sale);

            $this->createPayment($sale, $data['customer_id'], $data['down_payment'] ?? $totalPrice);

            return $sale;
        });
    }

    /**
     * Ensure no item quantity exceeds available stock.
     *
     * @param  array<int, array{product_id: int, quantity: int}>  $items
     *
     * @throws ValidationException
     */
    private function validateStock(array $items): void
    {
        foreach ($items as $index => $item) {
            $product = Product::find($item['product_id']);

            if ($product->stock < $item['quantity']) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" => __('validation.sale_stock_exceeded', [
                        'product' => $product->name,
                        'available' => $product->stock,
                    ]),
                ]);
            }
        }
    }

    private function syncItems(Sale $sale, array $items): void
    {
        foreach ($items as $item) {
            $sale->items()->create($item);

            Product::where('id', $item['product_id'])
                ->decrement('stock', $item['quantity']);
        }
    }

    private function rollbackStock(Sale $sale): void
    {
        foreach ($sale->items as $item) {
            Product::where('id', $item->product_id)
                ->increment('stock', $item->quantity);
        }
    }

    private function calculateTotal(array $items): float
    {
        return collect($items)->sum(fn ($item) => $item['quantity'] * $item['sale_price']);
    }

    /**
     * Build sale items from trusted product data and requested quantities only.
     *
     * @param  array<int, array{product_id: int, quantity: int}>  $items
     * @return array<int, array{product_id: int, product_name: string, quantity: int, sale_price: float, purchase_price: float}>
     */
    private function normalizeItemsWithProductData(array $items): array
    {
        $productIds = collect($items)
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        return collect($items)
            ->map(function ($item) use ($products) {
                $productId = (int) $item['product_id'];
                $product = $products->get($productId);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => __('validation.exists', ['attribute' => 'items']),
                    ]);
                }

                return [
                    'product_id' => $productId,
                    'product_name' => $product->name,
                    'quantity' => (int) $item['quantity'],
                    'sale_price' => (float) $product->sale_price,
                    'purchase_price' => (float) $product->purchase_price,
                ];
            })
            ->all();
    }

    /**
     * Calculate the monthly installment amount.
     *
     * Formula:
     *   total_after_interest = total_price + (total_price × rate / 100)
     *   remaining            = total_after_interest - down_payment
     *   monthly_installment  = remaining / months
     */
    private function calculateMonthlyInstallment(
        string $type,
        float $totalPrice,
        float $downPayment,
        float $interestRate,
        int $months,
    ): ?float {
        if ($type !== SaleTypeEnum::INSTALLMENT->value || $months <= 0) {
            return null;
        }

        $totalAfterInterest = $totalPrice + ($totalPrice * $interestRate / 100);
        $remaining = $totalAfterInterest - $downPayment;

        return round($remaining / $months, 2);
    }

    private function createPayment(Sale $sale, int $customerId, float $amount): void
    {
        $payment = CustomerPayment::create([
            'customer_id' => $customerId,
            'amount' => $amount,
            'user_id' => $sale->user_id,
        ]);

        $sale->paymentAllocations()->create([
            'customer_payment_id' => $payment->id,
            'is_first_payment' => true,
        ]);
    }

    private function deleteOldFirstPayments(Sale $sale): void
    {
        $oldFirstPaymentAllocations = $sale->paymentAllocations()
            ->where('is_first_payment', true)
            ->with('customerPayment')
            ->get();

        if ($oldFirstPaymentAllocations->isEmpty()) {
            return;
        }

        // Delete linked payments first so allocations are removed by FK cascade.
        foreach ($oldFirstPaymentAllocations as $allocation) {
            if ($allocation->customerPayment) {
                $allocation->customerPayment->delete();

                continue;
            }

            $allocation->delete();
        }
    }
}
