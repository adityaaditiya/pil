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
        'age',
        'gender',
        'address',
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
}
