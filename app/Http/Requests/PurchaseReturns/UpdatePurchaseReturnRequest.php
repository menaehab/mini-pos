<?php

namespace App\Http\Requests\PurchaseReturns;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePurchaseReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('edit_purchases') || auth()->user()->can('manage_purchases');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'purchase_id' => ['required', 'integer', 'exists:purchases,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'is_refunded' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $purchase = Purchase::with('items')->find($this->purchase_id);
                if (! $purchase) {
                    return;
                }

                $currentPurchaseReturn = $this->route('purchaseReturn');
                $currentPurchaseReturnId = $currentPurchaseReturn instanceof PurchaseReturn ? $currentPurchaseReturn->id : null;

                $requested = [];
                foreach ($this->items as $item) {
                    $requested[$item['product_id']] =
                        ($requested[$item['product_id']] ?? 0) + $item['quantity'];
                }

                $products = Product::whereIn('id', array_keys($requested))
                    ->get()
                    ->keyBy('id');

                $purchased = [];
                foreach ($purchase->items as $item) {
                    $purchased[$item->item_name] =
                        ($purchased[$item->item_name] ?? 0) + $item->quantity;
                }

                $returnedQuery = PurchaseReturnItem::whereIn('product_id', array_keys($requested))
                    ->whereHas('purchaseReturn', function ($q) use ($purchase, $currentPurchaseReturnId) {
                        $q->where('purchase_id', $purchase->id);

                        if ($currentPurchaseReturnId) {
                            $q->where('id', '!=', $currentPurchaseReturnId);
                        }
                    });

                $returned = $returnedQuery
                    ->selectRaw('product_id, SUM(quantity) as total')
                    ->groupBy('product_id')
                    ->pluck('total', 'product_id');

                foreach ($requested as $productId => $qty) {
                    $product = $products[$productId] ?? null;
                    if (! $product) {
                        continue;
                    }

                    $purchasedQty = $purchased[$product->name] ?? 0;

                    if ($purchasedQty == 0) {
                        $validator->errors()->add('items', 'Product not in this purchase.');

                        continue;
                    }

                    $remaining = $purchasedQty - ($returned[$productId] ?? 0);

                    if ($qty > $remaining) {
                        $validator->errors()->add(
                            'items',
                            "Quantity for {$product->name} exceeds available."
                        );
                    }
                }
            },
        ];
    }
}
