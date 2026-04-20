<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    public function create(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $items = $this->normalizeItemsWithProductData($data['items']);
            $supplier = Supplier::query()->findOrFail($data['supplier_id']);

            $purchase = Purchase::create([
                'supplier_id' => $data['supplier_id'],
                'supplier_name' => $supplier->name,
                'user_id' => $data['user_id'],
                'payment_type' => $data['payment_type'],
                'total_price' => 0,
                'note' => $data['note'] ?? null,
            ]);

            $this->syncItems($purchase, $items);

            $total = $this->calculateTotal($items);
            $purchase->update(['total_price' => $total]);

            $amount = min((float) ($data['amount'] ?? 0), $total);

            if ($amount > 0) {
                $this->createPayment(
                    $purchase,
                    (int) $data['supplier_id'],
                    $amount,
                    $data['payment_note'] ?? null,
                    (int) $data['user_id'],
                );
            }

            return $purchase;
        });
    }

    public function update(Purchase $purchase, array $data): Purchase
    {
        return DB::transaction(function () use ($purchase, $data) {
            $items = $this->normalizeItemsWithProductData($data['items']);
            $supplier = Supplier::query()->findOrFail($data['supplier_id']);

            $this->rollbackStock($purchase);
            $purchase->items()->delete();

            $this->syncItems($purchase, $items);

            $total = $this->calculateTotal($items);

            $purchase->update([
                'total_price' => $total,
                'supplier_id' => $data['supplier_id'],
                'supplier_name' => $supplier->name,
                'payment_type' => $data['payment_type'],
                'note' => $data['note'] ?? null,
            ]);

            $this->deleteOldFirstPayments($purchase);

            $amount = min((float) ($data['amount'] ?? 0), $total);

            if ($amount > 0) {
                $this->createPayment(
                    $purchase,
                    (int) $data['supplier_id'],
                    $amount,
                    $data['payment_note'] ?? null,
                    (int) $purchase->user_id,
                );
            }

            return $purchase;
        });
    }

    public function delete(Purchase $purchase): void
    {
        DB::transaction(function () use ($purchase) {
            $this->rollbackStock($purchase);
            $this->deleteOldFirstPayments($purchase);
            $purchase->items()->delete();
            $purchase->delete();
        });
    }

    /**
     * @param  array<int, array{product_id: int, item_name: string, quantity: int, purchase_price: float, sale_price: float}>  $items
     */
    private function syncItems(Purchase $purchase, array $items): void
    {
        foreach ($items as $item) {
            $purchase->items()->create([
                'product_id' => $item['product_id'],
                'item_name' => $item['item_name'],
                'purchase_price' => $item['purchase_price'],
                'quantity' => $item['quantity'],
            ]);

            Product::where('id', $item['product_id'])
                ->update([
                    'purchase_price' => $item['purchase_price'],
                    'sale_price' => $item['sale_price'],
                ]);

            Product::where('id', $item['product_id'])
                ->increment('stock', $item['quantity']);
        }
    }

    private function rollbackStock(Purchase $purchase): void
    {
        foreach ($purchase->items as $item) {
            Product::where('id', $item->product_id)
                ->decrement('stock', $item->quantity);
        }
    }

    /**
     * @param  array<int, array{quantity: int, purchase_price: float}>  $items
     */
    private function calculateTotal(array $items): float
    {
        return collect($items)->sum(fn ($item) => $item['quantity'] * $item['purchase_price']);
    }

    private function createPayment(
        Purchase $purchase,
        int $supplierId,
        float $amount,
        ?string $note,
        int $userId,
    ): void {
        $payment = SupplierPayment::create([
            'supplier_id' => $supplierId,
            'amount' => $amount,
            'note' => $note,
            'user_id' => $userId,
        ]);

        $purchase->supplierPaymentAllocations()->create([
            'supplier_payment_id' => $payment->id,
            'is_first_payment' => true,
        ]);
    }

    /**
     * @param  array<int, array{product_id: int, quantity: int, purchase_price?: float, sale_price?: float}>  $items
     * @return array<int, array{product_id: int, item_name: string, quantity: int, purchase_price: float, sale_price: float}>
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

                $purchasePrice = array_key_exists('purchase_price', $item)
                    ? (float) $item['purchase_price']
                    : (float) $product->purchase_price;

                $salePrice = array_key_exists('sale_price', $item)
                    ? (float) $item['sale_price']
                    : (float) $product->sale_price;

                return [
                    'product_id' => $productId,
                    'item_name' => (string) $product->name,
                    'quantity' => (int) $item['quantity'],
                    'purchase_price' => $purchasePrice,
                    'sale_price' => $salePrice,
                ];
            })
            ->all();
    }

    private function deleteOldFirstPayments(Purchase $purchase): void
    {
        $oldFirstPaymentAllocations = $purchase->supplierPaymentAllocations()
            ->where('is_first_payment', true)
            ->with('supplierPayment')
            ->get();

        if ($oldFirstPaymentAllocations->isEmpty()) {
            return;
        }

        foreach ($oldFirstPaymentAllocations as $allocation) {
            $payment = $allocation->supplierPayment;
            $allocation->delete();

            if (! $payment) {
                continue;
            }

            if (! $payment->supplierPaymentAllocations()->exists()) {
                $payment->delete();
            }
        }
    }
}
