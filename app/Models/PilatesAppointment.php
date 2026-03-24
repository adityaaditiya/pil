<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesAppointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'pilates_class_id',
        'trainer_id',
        'session_name',
        'admin_notes',
        'session_options',
        'duration_minutes',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'session_options' => 'array',
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

    public function appointmentSession()
    {
        return $this->belongsTo(AppointmentSession::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function trainers()
    {
        return $this->belongsToMany(Trainer::class, 'appointment_trainer')
            ->withTimestamps();
    }
}
