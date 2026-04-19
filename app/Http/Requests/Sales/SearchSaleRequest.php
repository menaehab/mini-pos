<?php

namespace App\Http\Requests\Sales;

use App\Enums\SaleTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SearchSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_sales')
            || auth()->user()->can('manage_sales')
            || auth()->user()->can('add_sales')
            || auth()->user()->can('edit_sales');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'type' => ['nullable', 'string', 'in:'.implode(',', array_column(SaleTypeEnum::cases(), 'value'))],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
