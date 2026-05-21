<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_user_membership_id',
        'to_user_membership_id',
        'from_user_id',
        'to_user_id',
        'membership_plan_id',
        'credits_transferred',
        'notes',
        'processed_by',
    ];
}
