<?php

namespace App\Http\Requests\PurchaseReturns;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseReturnItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePurchaseReturnRequest extends FormRequest
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

                $returned = PurchaseReturnItem::whereIn('product_id', array_keys($requested))
                    ->whereHas('purchaseReturn', fn ($q) => $q->where('purchase_id', $purchase->id))
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
                        $validator->errors()->add('items', __('keywords.add', ['item' => $product->name]).' '.__('keywords.to_purchase_first'));

                        continue;
                    }

                    $remaining = $purchasedQty - ($returned[$productId] ?? 0);

                    if ($qty > $remaining) {
                        $validator->errors()->add(
                            'items',
                            __('keywords.return_quantity_exceeds_remaining', [
                                'item' => $product->name,
                                'remaining' => $remaining,
                            ])
                        );
                    }
                }
            },
        ];
    }
}
