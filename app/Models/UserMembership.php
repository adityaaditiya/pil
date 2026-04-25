<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class UserMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'membership_plan_id',
        'invoice',
        'credits_total',
        'credits_remaining',
        'starts_at',
        'expires_at',
        'payment_method',
        'payment_proof_image',
        'expired_at',
        'status',
    ];

    protected $casts = [
        'credits_total' => 'integer',
        'credits_remaining' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $membership) {
            if (! $membership->invoice) {
                $membership->invoice = self::generateInvoice();
            }

            if ($membership->status === 'pending_payment' && ! $membership->expired_at) {
                $membership->expired_at = Carbon::now()->addMinutes(15);
            }
        });

        static::saving(function (self $membership) {
            if (
                $membership->status === 'pending_payment'
                && $membership->expired_at
                && now()->greaterThan($membership->expired_at)
            ) {
                $membership->status = 'expired';
            }
        });
    }

    public static function generateInvoice(): string
    {
        do {
            $invoice = 'MEM-' . Str::upper(Str::random(10));
        } while (self::query()->where('invoice', $invoice)->exists());

        return $invoice;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }
}
