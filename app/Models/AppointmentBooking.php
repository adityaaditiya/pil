<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AppointmentBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'customer_id',
        'trainer_id',
        'invoice',
        'appointment_session_id',
        'session_name',
        'price_amount',
        'payment_type',
        'payment_method',
        'user_membership_id',
        'credit_used',
        'payment_proof_image',
        'expired_at',
        'booked_at',
        'status',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'expired_at' => 'datetime',
        'price_amount' => 'decimal:2',
        'credit_used' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $booking) {
            if (! $booking->invoice) {
                $booking->invoice = self::generateInvoice();
            }
        });
    }

    public static function generateInvoice(): string
    {
        do {
            $invoice = 'APT-' . strtoupper(Str::random(10));
        } while (self::query()->where('invoice', $invoice)->exists());

        return $invoice;
    }

    public function appointment()
    {
        return $this->belongsTo(PilatesAppointment::class, 'appointment_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function userMembership()
    {
        return $this->belongsTo(UserMembership::class);
    }
}
