<?php

namespace App\Http\Requests\Users;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('manage_users');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required_without_all:phone',
                'nullable',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone' => [
                'required_without_all:email',
                'nullable',
                'string',
                'unique:users,phone',
                'regex:/^01(0|1|2|5)[0-9]{8}$/',
            ],

            'password' => ['required', 'string', 'min:8', 'confirmed'],

            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => __('keywords.name'),
            'email' => __('keywords.email'),
            'phone' => __('keywords.phone'),
            'password' => __('keywords.password'),
            'permissions' => __('keywords.permissions'),
        ];
    }
}
