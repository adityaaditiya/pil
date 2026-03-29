<?php

namespace App\Http\Controllers;

use App\Models\AppointmentBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserAppointmentController extends Controller
{
    /**
     * Display authenticated customer's appointment booking history.
     */
    public function index(Request $request): Response
    {
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));
        $status = trim((string) $request->string('status'));

        $customerId = optional($request->user()->customer)->id;

        $bookings = AppointmentBooking::query()
            ->with([
                'appointment:id,pilates_class_id,start_at,end_at,duration_minutes',
                'appointment.pilatesClass:id,name,image',
                'trainer:id,name',
            ])
            ->when($customerId, fn ($query) => $query->where('customer_id', $customerId))
            ->when(! $customerId, fn ($query) => $query->whereRaw('1 = 0'))
            ->when($startDate !== '', fn ($query) => $query->whereHas('appointment', fn ($appointmentQuery) => $appointmentQuery->where('start_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC'))))
            ->when($endDate !== '', fn ($query) => $query->whereHas('appointment', fn ($appointmentQuery) => $appointmentQuery->where('start_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC'))))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'pending_payment' THEN 1 WHEN 'confirmed' THEN 2 ELSE 3 END")
            ->latest('booked_at')
            ->latest('id')
            ->get()
            ->map(function (AppointmentBooking $booking) {
                if (in_array($booking->status, ['pending', 'pending_payment'], true) && $booking->expired_at && $booking->expired_at->isPast()) {
                    $booking->forceFill(['status' => 'expired'])->saveQuietly();
                    $booking->status = 'expired';
                }

                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'status' => $booking->status,
                    'session_name' => $booking->session_name,
                    'payment_type' => $booking->payment_type,
                    'payment_method' => $booking->payment_method,
                    'price_amount' => (float) $booking->price_amount,
                    'credit_used' => $booking->credit_used,
                    'booked_at' => optional($booking->booked_at)->toISOString(),
                    'payment_proof_image' => $booking->payment_proof_image,
                    'payment_due_at' => optional($booking->expired_at)->toISOString(),
                    'appointment' => [
                        'id' => $booking->appointment?->id,
                        'start_at' => optional($booking->appointment?->start_at)->toISOString(),
                        'end_at' => optional($booking->appointment?->end_at)->toISOString(),
                        'duration_minutes' => $booking->appointment?->duration_minutes,
                        'trainer_name' => $booking->trainer?->name,
                        'class' => [
                            'name' => $booking->appointment?->pilatesClass?->name,
                            'image' => $booking->appointment?->pilatesClass?->image,
                        ],
                    ],
                ];
            })
            ->values();

        return Inertia::render('User/MyAppointment', [
            'bookings' => $bookings,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }
}
