<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesTimetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'pilates_class_id',
        'trainer_id',
        'start_at',
        'capacity',
        'duration_minutes',
        'price_override',
        'credit_override',
        'allow_drop_in',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'start_at' => 'datetime',
        'capacity' => 'integer',
        'duration_minutes' => 'integer',
        'price_override' => 'decimal:2',
        'credit_override' => 'decimal:2',
        'allow_drop_in' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

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
