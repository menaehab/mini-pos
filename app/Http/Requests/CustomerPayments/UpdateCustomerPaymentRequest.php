<?php

namespace App\Http\Requests\CustomerPayments;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('edit_customer_payments') || auth()->user()->can('manage_customer_payments');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
        ];
    }
}
