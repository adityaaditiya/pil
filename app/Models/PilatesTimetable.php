<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesTimetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'pilates_class_id',
        'trainer_id',
        'start_at',
        'capacity',
        'duration_minutes',
        'price_override',
        'credit_override',
        'allow_drop_in',
        'status',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'capacity' => 'integer',
        'duration_minutes' => 'integer',
        'price_override' => 'decimal:2',
        'credit_override' => 'decimal:2',
        'allow_drop_in' => 'boolean',
    ];

    public function pilatesClass()
    {
        return $this->belongsTo(PilatesClass::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function bookings()
    {
        return $this->hasMany(PilatesBooking::class, 'timetable_id');
    }
}
