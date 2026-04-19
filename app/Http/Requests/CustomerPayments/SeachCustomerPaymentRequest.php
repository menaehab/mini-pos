<?php

namespace App\Http\Requests\CustomerPayments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SeachCustomerPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('view_customer_payments') || auth()->user()->can('manage_customer_payments');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
