<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'credits',
        'price',
        'valid_days',
        'is_active',
        'description',
    ];

    protected $casts = [
        'credits' => 'integer',
        'price' => 'decimal:2',
        'valid_days' => 'integer',
        'is_active' => 'boolean',
    ];

    public function classRules()
    {
        return $this->hasMany(MembershipPlanClass::class);
    }

    public function classes()
    {
        return $this->belongsToMany(PilatesClass::class, 'membership_plan_classes')
            ->withPivot('credit_cost')
            ->withTimestamps();
    }

    public function userMemberships()
    {
        return $this->hasMany(UserMembership::class);
    }
}
