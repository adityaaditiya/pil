<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $address = preg_replace('/[<>;]/', '', (string) $this->input('address', ''));

        $this->merge([
            'address' => trim((string) $address),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\s]+$/u'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'no_telp' => [
                'required',
                'regex:/^[0-9]+$/',
                'digits_between:7,15',
                Rule::unique('customers', 'no_telp')->ignore(
                    optional($this->user()->customer)->id
                ),
            ],
            'address' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}
