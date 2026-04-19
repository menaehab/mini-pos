<?php

namespace App\Http\Requests\SupplierPayments;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('add_supplier_payments') || auth()->user()->can('manage_supplier_payments');
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
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
        ];
    }
}
