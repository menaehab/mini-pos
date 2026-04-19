<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use Illuminate\Support\Facades\DB;

class PurchaseReturnService
{
    public function create(array $data, int $userId): PurchaseReturn
    {
        $purchase = Purchase::with('items')->findOrFail($data['purchase_id']);

        [$returnItems, $totalPrice] = $this->prepareReturnItems($purchase, $data['items']);

        return DB::transaction(function () use ($data, $returnItems, $totalPrice, $userId): PurchaseReturn {
            $purchaseReturn = PurchaseReturn::create([
                'total_price' => $totalPrice,
                'note' => $data['note'] ?? null,
                'is_refunded' => $data['is_refunded'],
                'user_id' => $userId,
                'purchase_id' => $data['purchase_id'],
            ]);

            $purchaseReturn->items()->createMany($returnItems);

            return $purchaseReturn;
        });
    }

    public function update(PurchaseReturn $purchaseReturn, array $data): PurchaseReturn
    {
        $purchase = Purchase::with('items')->findOrFail($data['purchase_id']);

        [$returnItems, $totalPrice] = $this->prepareReturnItems($purchase, $data['items']);

        return DB::transaction(function () use ($purchaseReturn, $data, $totalPrice, $returnItems): PurchaseReturn {
            $purchaseReturn->update([
                'total_price' => $totalPrice,
                'note' => $data['note'] ?? null,
                'is_refunded' => $data['is_refunded'],
                'purchase_id' => $data['purchase_id'],
            ]);

            $purchaseReturn->items()->delete();
            $purchaseReturn->items()->createMany($returnItems);

            return $purchaseReturn;
        });
    }

    private function prepareReturnItems(Purchase $purchase, array $items): array
    {
        $productIds = [];
        foreach ($items as $item) {
            $productIds[] = (int) $item['product_id'];
        }

        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        $purchasePricesByItemName = [];
        foreach ($purchase->items as $purchaseItem) {
            if (! isset($purchasePricesByItemName[$purchaseItem->item_name])) {
                $purchasePricesByItemName[$purchaseItem->item_name] = (float) $purchaseItem->purchase_price;
            }
        }

        $returnItems = [];
        $totalPrice = 0;

        foreach ($items as $item) {
            $product = $products->get((int) $item['product_id']);
            $quantity = (int) $item['quantity'];
            $purchasePrice = (float) ($purchasePricesByItemName[$product->name] ?? $product->purchase_price);

            $returnItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'purchase_price' => $purchasePrice,
                'quantity' => $quantity,
            ];

            $totalPrice += $quantity * $purchasePrice;
        }

        return [$returnItems, $totalPrice];
    }
}
