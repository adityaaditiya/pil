<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_category_id',
        'image',
        'name',
        'duration',
        'difficulty_level',
        'about',
        'equipment',
        'credit',
        'price',
    ];

    protected $casts = [
        'duration' => 'integer',
        'credit' => 'decimal:2',
        'price' => 'decimal:2',
    ];

    public function classCategory()
    {
        return $this->belongsTo(ClassCategory::class);
    }

    public function trainers()
    {
        return $this->belongsToMany(Trainer::class, 'pilates_class_trainer')
            ->withTimestamps();
    }

    public function timetables()
    {
        return $this->hasMany(PilatesTimetable::class);
    }

    public function membershipPlans()
    {
        return $this->belongsToMany(MembershipPlan::class, 'membership_plan_classes')
            ->withPivot('credit_cost')
            ->withTimestamps();
    }
}
