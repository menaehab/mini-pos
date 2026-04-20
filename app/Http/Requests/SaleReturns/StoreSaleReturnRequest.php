<?php

namespace App\Http\Requests\SaleReturns;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleReturnItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSaleReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('add_sale_returns') || auth()->user()->can('manage_sale_returns');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'sale_id' => ['required', 'integer', 'exists:sales,id'],
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

                $sale = Sale::with('items')->find($this->sale_id);

                $requested = [];
                foreach ($this->items as $item) {
                    $requested[$item['product_id']] =
                        ($requested[$item['product_id']] ?? 0) + $item['quantity'];
                }

                $products = Product::whereIn('id', array_keys($requested))
                    ->get()
                    ->keyBy('id');

                $sold = [];
                foreach ($sale->items as $item) {
                    $sold[$item->product_name] =
                        ($sold[$item->product_name] ?? 0) + $item->quantity;
                }

                $returned = SaleReturnItem::whereIn('product_id', array_keys($requested))
                    ->whereHas('saleReturn', fn ($q) => $q->where('sale_id', $sale->id))
                    ->selectRaw('product_id, SUM(quantity) as total')
                    ->groupBy('product_id')
                    ->pluck('total', 'product_id');

                foreach ($requested as $productId => $qty) {
                    $product = $products[$productId] ?? null;
                    if (! $product) {
                        continue;
                    }

                    $soldQty = $sold[$product->name] ?? 0;

                    if ($soldQty == 0) {
                        $validator->errors()->add('items', __('keywords.add', ['item' => $product->name]).' '.__('keywords.to_sale_first'));

                        continue;
                    }

                    $remaining = $soldQty - ($returned[$productId] ?? 0);

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
