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
        'participants',
        'status',
        'booked_at',
        'payment_type',
        'payment_method',
        'price_amount',
        'credit_used',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'participants' => 'integer',
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
