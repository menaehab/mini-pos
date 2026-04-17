<?php

namespace App\Http\Requests\Categories;

use Illuminate\Foundation\Http\FormRequest;

class SearchCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }

    public function authorize(): bool
    {
        return auth()->user()->can('manage_categories') || auth()->user()->can('view_categories');
    }
}
