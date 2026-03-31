<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PilatesBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'timetable_id',
        'invoice',
        'user_membership_id',
        'membership_plan_id',
        'participants',
        'status',
        'attendance_status',
        'booked_at',
        'payment_type',
        'payment_method',
        'payment_proof_image',
        'price_amount',
        'credit_used',
        'expired_at',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'participants' => 'integer',
        'price_amount' => 'decimal:2',
        'credit_used' => 'decimal:2',
        'expired_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $booking) {
            if (! $booking->invoice) {
                $booking->invoice = self::generateInvoice();
            }

            if ($booking->payment_type === 'drop_in' && ! $booking->expired_at) {
                $booking->expired_at = Carbon::now()->addMinutes(15);
            }
        });

        static::retrieved(function (self $booking) {
            if (
                $booking->payment_type === 'drop_in'
                && in_array($booking->status, ['pending', 'pending_payment'], true)
                && $booking->expired_at
                && now()->greaterThan($booking->expired_at)
            ) {
                $booking->forceFill([
                    'status' => 'expired',
                ])->saveQuietly();

                $booking->status = 'expired';
            }
        });
    }

    public static function generateInvoice(): string
    {
        do {
            $invoice = 'INV-' . strtoupper(Str::random(10));
        } while (self::query()->where('invoice', $invoice)->exists());

        return $invoice;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timetable()
    {
        return $this->belongsTo(PilatesTimetable::class, 'timetable_id');
    }

    public function userMembership()
    {
        return $this->belongsTo(UserMembership::class);
    }

    public function membershipPlan()
    {
        return $this->belongsTo(MembershipPlan::class);
    }
}
