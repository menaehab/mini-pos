<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleReturn;
use Illuminate\Support\Facades\DB;

class SaleReturnService
{
    public function create(array $data, int $userId): SaleReturn
    {
        $sale = Sale::with('items')->findOrFail($data['sale_id']);

        [$returnItems, $totalPrice] = $this->prepareReturnItems($sale, $data['items']);

        return DB::transaction(function () use ($data, $returnItems, $totalPrice, $userId): SaleReturn {
            $saleReturn = SaleReturn::create([
                'total_price' => $totalPrice,
                'note' => $data['note'] ?? null,
                'is_refunded' => $data['is_refunded'], // استرداد نقدي
                'user_id' => $userId,
                'sale_id' => $data['sale_id'],
            ]);

            $saleReturn->items()->createMany($returnItems);

            // ⚠️ الأهم: زيادة المخزون (لأن البضاعة رجعت للمحل)
            foreach ($returnItems as $item) {
                Product::where('id', $item['product_id'])
                    ->increment('stock', $item['quantity']);
            }

            return $saleReturn;
        });
    }

    public function update(SaleReturn $saleReturn, array $data): SaleReturn
    {
        $sale = Sale::with('items')->findOrFail($data['sale_id']);

        [$returnItems, $totalPrice] = $this->prepareReturnItems($sale, $data['items']);

        return DB::transaction(function () use ($saleReturn, $data, $totalPrice, $returnItems): SaleReturn {
            
            // 1. تنقيص المخزون القديم قبل التعديل (كأن المرتجع ملغى)
            $this->rollbackStock($saleReturn);

            $saleReturn->update([
                'total_price' => $totalPrice,
                'note' => $data['note'] ?? null,
                'is_refunded' => $data['is_refunded'],
                'sale_id' => $data['sale_id'],
            ]);

            $saleReturn->items()->delete();
            $saleReturn->items()->createMany($returnItems);

            // 2. زيادة المخزون بالكميات الجديدة
            foreach ($returnItems as $item) {
                Product::where('id', $item['product_id'])
                    ->increment('stock', $item['quantity']);
            }

            return $saleReturn;
        });
    }

    // ⚠️ دالة الحذف الآمنة للمرتجع
    public function delete(SaleReturn $saleReturn)
    {
        return DB::transaction(function () use ($saleReturn) {
            $this->rollbackStock($saleReturn); // خصم البضاعة من المخزن تاني
            $saleReturn->items()->delete();
            $saleReturn->delete();
        });
    }

    // خصم البضاعة من المخزن
    private function rollbackStock(SaleReturn $saleReturn)
    {
        foreach ($saleReturn->items as $item) {
            Product::where('id', $item->product_id)
                ->decrement('stock', $item->quantity);
        }
    }

    private function prepareReturnItems(Sale $sale, array $items): array
    {
        $productIds = [];
        foreach ($items as $item) {
            $productIds[] = (int) $item['product_id'];
        }

        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        $salePricesByItemName = [];
        $purchasePricesByItemName = [];
        foreach ($sale->items as $saleItem) {
            if (! isset($salePricesByItemName[$saleItem->product_name])) {
                $salePricesByItemName[$saleItem->product_name] = (float) $saleItem->sale_price;
            }

            if (! isset($purchasePricesByItemName[$saleItem->product_name])) {
                $purchasePricesByItemName[$saleItem->product_name] = (float) $saleItem->purchase_price;
            }
        }

        $returnItems = [];
        $totalPrice = 0;

        foreach ($items as $item) {
            $product = $products->get((int) $item['product_id']);
            $quantity = (int) $item['quantity'];
            $salePrice = (float) ($salePricesByItemName[$product->name] ?? $product->sale_price);
            $purchasePrice = (float) ($purchasePricesByItemName[$product->name] ?? $product->purchase_price);

            $returnItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sale_price' => $salePrice,
                'purchase_price' => $purchasePrice,
                'quantity' => $quantity,
            ];

            $totalPrice += $quantity * $salePrice;
        }

        return [$returnItems, $totalPrice];
    }
}