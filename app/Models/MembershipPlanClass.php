<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlanClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'membership_plan_id',
        'pilates_class_id',
        'credit_cost',
    ];

    protected $casts = [
        'credit_cost' => 'integer',
    ];

    public function membershipPlan()
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function pilatesClass()
    {
        return $this->belongsTo(PilatesClass::class);
    }
}
