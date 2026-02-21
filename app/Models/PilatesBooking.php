<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'timetable_id',
        'status',
        'booked_at',
        'payment_type',
        'price_amount',
        'credit_used',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'price_amount' => 'decimal:2',
        'credit_used' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timetable()
    {
        return $this->belongsTo(PilatesTimetable::class, 'timetable_id');
    }
}
