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
            $this->validateStock($data['items']);
            $data['total_price'] = 0; // Will be updated after items are synced
            $sale = Sale::create($data);

            $this->syncItems($sale, $data['items']);

            $totalPrice = $this->calculateTotal($data['items']);

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

            $this->validateStock($data['items']);

            $this->syncItems($sale, $data['items']);

            $totalPrice = $this->calculateTotal($data['items']);

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

            optional($sale->firstPayment)->delete();

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
}
