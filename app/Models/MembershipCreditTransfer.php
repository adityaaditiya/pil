<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipCreditTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_customer_id',
        'receiver_customer_id',
        'credits_transferred',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'credits_transferred' => 'integer',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_customer_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'receiver_customer_id');
    }
}
