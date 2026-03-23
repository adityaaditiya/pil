<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesAppointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice',
        'parent_id',
        'pilates_class_id',
        'trainer_id',
        'session_name',
        'description',
        'price',
        'duration_minutes',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
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
}
