<?php

namespace App\Http\Requests\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SearchProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_products') || auth()->user()->can('manage_products');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|in:10,25,50,100',
            'category_id' => 'nullable|exists:categories,id',
            'stock_status' => 'nullable|in:in_stock,out_of_stock,low_stock',
        ];
    }
}
