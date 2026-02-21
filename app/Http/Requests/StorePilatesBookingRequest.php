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
            'payment_type' => ['nullable', 'in:drop_in,credit'],
        ];
    }
}
