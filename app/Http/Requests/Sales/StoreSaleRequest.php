<?php

namespace App\Http\Requests\Sales;

use App\Enums\SaleTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('add_sales') || auth()->user()->can('manage_sales');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isInstallment = $this->input('type') === SaleTypeEnum::INSTALLMENT->value;

        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:'.implode(',', array_column(SaleTypeEnum::cases(), 'value'))],
            'note' => ['nullable', 'string', 'max:255'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.product_name' => ['nullable', 'string', 'max:255'],
            'items.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.purchase_price' => ['nullable', 'numeric', 'min:0'],

            // Installment-only fields
            'down_payment' => [$isInstallment ? 'required' : 'nullable', 'numeric', 'min:0'],
            'installment_months' => [$isInstallment ? 'required' : 'nullable', 'integer', 'min:1'],
            'installment_rate' => [$isInstallment ? 'required' : 'nullable', 'numeric', 'min:0'],
        ];
    }
}
