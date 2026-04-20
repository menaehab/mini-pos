<?php

namespace App\Http\Requests\Purchases;

use App\Enums\PurchaseTypeEnum;
use Illuminate\Foundation\Http\FormRequest;

class SearchPurchaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_purchases') || auth()->user()->can('manage_purchases') || auth()->user()->can('add_purchases') || auth()->user()->can('edit_purchases');
    }

    /**
     * Get the validation rules that apply to the request.
     *
    * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'payment_type' => ['nullable', 'in:'.implode(',', PurchaseTypeEnum::values())],
            'payment_method' => ['nullable', 'in:'.implode(',', PurchaseTypeEnum::values())],
            'status' => ['nullable', 'in:paid,unpaid'],
            'date' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
