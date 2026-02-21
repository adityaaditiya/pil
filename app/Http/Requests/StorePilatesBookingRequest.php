<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePilatesBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'timetable_id' => ['required', 'integer', 'exists:pilates_timetables,id'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'participants' => ['required', 'integer', 'min:1'],
            'payment_type' => ['required', 'in:drop_in,credit'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ];
    }
}
