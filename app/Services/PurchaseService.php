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
            // 1. إنشاء الفاتورة
            $purchase = Purchase::create([
                'supplier_id' => $data['supplier_id'],
                'user_id' => $data['user_id'],
                'payment_method' => $data['payment_method'], // كاش أو أقساط
                'total_price' => 0, // هنحدثها كمان شوية
                'note' => $data['note'] ?? null,
            ]);

            // 2. إضافة الأصناف وزيادة المخزون
            $this->syncItems($purchase, $data['items']);

            // 3. حساب الإجمالي وتحديث الفاتورة
            $total = $this->calculateTotal($data['items']);
            $purchase->update(['total_price' => $total]);

            // 4. تسجيل الدفعة (لو الدفع كاش بس بنسددها بالكامل)
            if ($data['payment_method'] === 'cash') {
                $this->createPayment($purchase, $data['supplier_id'], $total);
            }

            return $purchase;
        });
    }

    public function update(Purchase $purchase, array $data)
    {
        return DB::transaction(function () use ($purchase, $data) {
            // 1. إرجاع المخزون القديم قبل التعديل
            $this->rollbackStock($purchase);

            // 2. مسح الأصناف القديمة
            $purchase->items()->delete();

            // 3. إضافة الأصناف الجديدة وزيادة المخزون
            $this->syncItems($purchase, $data['items']);

            // 4. حساب الإجمالي الجديد
            $total = $this->calculateTotal($data['items']);

            $purchase->update([
                'total_price' => $total,
                'supplier_id' => $data['supplier_id'],
                'payment_method' => $data['payment_method'],
                'note' => $data['note'] ?? null,
            ]);

            // 5. تظبيط الدفعة (بنمسح القديمة ونعمل جديدة لو كاش)
            optional($purchase->firstPayment)->delete();
            $purchase->supplierPaymentAllocations()->delete();

            if ($data['payment_method'] === 'cash') {
                $this->createPayment($purchase, $data['supplier_id'], $total);
            }

            return $purchase;
        });
    }

    // دالة جديدة للحذف الآمن (عشان المخزون ميضربش)
    public function delete(Purchase $purchase)
    {
        return DB::transaction(function () use ($purchase) {
            $this->rollbackStock($purchase); // تنقيص المخزون
            optional($purchase->firstPayment)->delete(); // مسح الدفعة
            $purchase->supplierPaymentAllocations()->delete(); // مسح التوزيع
            $purchase->items()->delete(); // مسح الأصناف
            $purchase->delete(); // مسح الفاتورة
        });
    }

    private function syncItems($purchase, $items)
    {
        foreach ($items as $item) {
            $purchase->items()->create([
                'product_id' => $item['product_id'], // اتعدلت عشان تطابق الفرونت
                'cost_price' => $item['cost_price'], // اتعدلت عشان تطابق الفرونت
                'quantity' => $item['quantity'],
            ]);

            Product::where('id', $item['product_id'])
                ->increment('stock', $item['quantity']);
        }
    }

    private function rollbackStock($purchase)
    {
        foreach ($purchase->items as $item) {
            Product::where('id', $item->product_id)
                ->decrement('stock', $item->quantity);
        }
    }

    private function calculateTotal($items)
    {
        return collect($items)->sum(fn ($i) => $i['quantity'] * $i['cost_price']);
    }

    private function createPayment($purchase, $supplierId, $amount)
    {
        $payment = SupplierPayment::create([
            'supplier_id' => $supplierId,
            'amount' => $amount,
        ]);

        $purchase->supplierPaymentAllocations()->create([
            'supplier_payment_id' => $payment->id,
            'amount' => $amount,
            'is_first_payment' => true,
        ]);
    }
}