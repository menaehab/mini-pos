<?php

namespace App\Http\Requests\Users;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required_without_all:phone',
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'phone' => [
                'required_without_all:email',
                'nullable',
                'string',
                'regex:/^01(0|1|2|5)[0-9]{8}$/',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],

            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

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
