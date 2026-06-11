<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipExtension extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_membership_id',
        'user_id',
        'membership_plan_id',
        'previous_expires_at',
        'new_expires_at',
        'duration_days',
        'extension_date',
        'fee_amount',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'previous_expires_at' => 'datetime',
        'new_expires_at' => 'datetime',
        'extension_date' => 'date',
        'duration_days' => 'integer',
        'fee_amount' => 'integer',
    ];

    public function membership()
    {
        return $this->belongsTo(UserMembership::class, 'user_membership_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
