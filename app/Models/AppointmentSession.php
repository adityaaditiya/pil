<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_name',
        'description',
        'default_price_drop_in',
        'default_price_credit',
        'default_payment_method',
    ];

    protected $casts = [
        'default_price_drop_in' => 'decimal:2',
        'default_price_credit' => 'decimal:2',
        'default_payment_method' => 'string',
    ];

    public function appointments()
    {
        return $this->hasMany(PilatesAppointment::class);
    }
}
