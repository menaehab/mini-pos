<?php

namespace App\Http\Requests\PurchaseReturns;

use Illuminate\Foundation\Http\FormRequest;

class SearchPurchaseReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_purchases') || auth()->user()->can('manage_purchases');
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
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
