<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'photo',
        'gender',
        'date_of_birth',
        'expertise',
        'address',
        'biodata',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function pilatesClasses()
    {
        return $this->belongsToMany(PilatesClass::class, 'pilates_class_trainer')
            ->withTimestamps();
    }

    public function timetables()
    {
        return $this->hasMany(PilatesTimetable::class);
    }

    public function appointments()
    {
        return $this->hasMany(PilatesAppointment::class);
    }

    public function pilatesAppointments()
    {
        return $this->belongsToMany(PilatesAppointment::class, 'appointment_trainer')
            ->withTimestamps();
    }
}
