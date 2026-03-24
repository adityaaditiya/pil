<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'customer_id',
        'appointment_session_id',
        'session_name',
        'price_amount',
        'payment_method',
        'booked_at',
        'status',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'price_amount' => 'decimal:2',
    ];

    public function appointment()
    {
        return $this->belongsTo(PilatesAppointment::class, 'appointment_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
