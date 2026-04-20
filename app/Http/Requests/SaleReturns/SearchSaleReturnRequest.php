<?php

namespace App\Http\Requests\SaleReturns;

use Illuminate\Foundation\Http\FormRequest;

class SearchSaleReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_sale_returns') || auth()->user()->can('manage_sale_returns');
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
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
