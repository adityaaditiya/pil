<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Trainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'expertise',
        'biodata',
    ];

    protected $appends = [
        'name',
        'photo',
        'gender',
        'date_of_birth',
        'address',
    ];

    protected $with = [
        'user.customer',
    ];

    public function scopeForTrainerRole($query)
    {
        return $query->whereHas('user', fn ($userQuery) => $userQuery->role('trainer'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->customer?->name ?? $this->user?->name,
        );
    }

    protected function photo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->customer?->photo,
        );
    }

    protected function gender(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->customer?->gender,
        );
    }

    protected function dateOfBirth(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->customer?->date_of_birth,
        );
    }

    protected function address(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user?->customer?->address,
        );
    }

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
