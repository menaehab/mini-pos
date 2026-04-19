<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\SupplierPayment;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            $purchase = Purchase::create($data);

            $this->syncItems($purchase, $data['items']);

            $total = $this->calculateTotal($data['items']);

            $purchase->update(['total_price' => $total]);

            $this->createPayment($purchase, $data['supplier_id'], $total);

            return $purchase;
        });
    }

    public function update(Purchase $purchase, array $data)
    {
        return DB::transaction(function () use ($purchase, $data) {

            $this->rollbackStock($purchase);

            $purchase->items()->delete();

            $this->syncItems($purchase, $data['items']);

            $total = $this->calculateTotal($data['items']);

            $purchase->update([
                'total_price' => $total,
                'supplier_id' => $data['supplier_id'],
                'note' => $data['note'] ?? null,
            ]);

            optional($purchase->firstPayment)->delete();

            $this->createPayment($purchase, $data['supplier_id'], $total);

            return $purchase;
        });
    }

    private function syncItems($purchase, $items)
    {
        foreach ($items as $item) {
            $purchase->items()->create($item);

            Product::where('id', $item['item_id'])
                ->increment('stock', $item['quantity']);
        }
    }

    private function rollbackStock($purchase)
    {
        foreach ($purchase->items as $item) {
            Product::where('id', $item->item_id)
                ->decrement('stock', $item->quantity);
        }
    }

    private function calculateTotal($items)
    {
        return collect($items)->sum(fn ($i) => $i['quantity'] * $i['purchase_price']
        );
    }

    private function createPayment($purchase, $supplierId, $amount)
    {
        $payment = SupplierPayment::create([
            'supplier_id' => $supplierId,
            'amount' => $amount,
            'is_first_payment' => true,
        ]);

        $purchase->supplierPaymentAllocations()->create([
            'supplier_payment_id' => $payment->id,
            'amount' => $amount,
            'is_first_payment' => true,
        ]);
    }
}
