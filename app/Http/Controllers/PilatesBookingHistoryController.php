<?php

namespace App\Http\Controllers;

use App\Models\PilatesBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PilatesBookingHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $invoice = trim((string) $request->string('invoice'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));

        $query = PilatesBooking::query()
            ->with([
                'user:id,name',
                'timetable:id,pilates_class_id,trainer_id,start_at',
                'timetable.pilatesClass:id,name',
                'timetable.trainer:id,name',
            ])
            ->latest('booked_at');

        if ($startDate) {
            $query->where('booked_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC'));
        }

        if ($endDate) {
            $query->where('booked_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC'));
        }

        if ($invoice !== '') {
            $query->where('invoice', 'like', '%' . strtoupper($invoice) . '%');
        }

        $bookings = $query
            ->paginate(10)
            ->withQueryString()
            ->through(function (PilatesBooking $booking) {
                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'booked_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'status' => $booking->status,
                    'participants' => $booking->participants,
                    'payment_type' => $booking->payment_type,
                    'payment_method' => $booking->payment_method,
                    'price_amount' => $booking->price_amount,
                    'credit_used' => $booking->credit_used,
                    'payment_proof_image' => $booking->payment_proof_image,
                    'customer' => $booking->user?->name,
                    'class_name' => $booking->timetable?->pilatesClass?->name,
                    'trainer_name' => $booking->timetable?->trainer?->name,
                    'schedule_at' => $booking->timetable?->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('Dashboard/Timetable/BookingHistory', [
            'bookings' => $bookings,
            'filters' => [
                'invoice' => $invoice,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function print(string $invoice): Response
    {
        $booking = PilatesBooking::query()
            ->with([
                'user:id,name,email',
                // 'user:id,name,email,phone,address',
                'timetable:id,pilates_class_id,trainer_id,start_at,duration_minutes',
                'timetable.pilatesClass:id,name,duration',
                'timetable.trainer:id,name',
            ])
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Inertia::render('Dashboard/Timetable/Print', [
            'booking' => $booking,
        ]);
    }

    public function cancel(Request $request, PilatesBooking $booking)
    {
        $validated = $request->validate([
            'authorization_note' => ['nullable', 'string'],
            'super_admin_email' => ['required', 'email'],
            'super_admin_password' => ['required', 'string'],
        ]);

        $superAdmin = User::query()
            ->where('email', $validated['super_admin_email'])
            ->first();

        if (! $superAdmin || ! $superAdmin->isSuperAdmin() || ! Hash::check($validated['super_admin_password'], $superAdmin->password)) {
            return back()->withErrors([
                'message' => 'Otorisasi super-admin gagal.',
            ]);
        }

        if ($booking->status === 'cancelled') {
            return back()->withErrors([
                'message' => 'Booking sudah dibatalkan.',
            ]);
        }

        DB::transaction(function () use ($booking) {
            $booking->loadMissing('userMembership');

            if ($booking->payment_type === 'credit' && $booking->userMembership && (float) $booking->credit_used > 0) {
                $booking->userMembership->increment('credits_remaining', (int) round((float) $booking->credit_used));
            }

            $booking->update([
                'status' => 'cancelled',
            ]);
        });

        return back()->with('success', 'Booking berhasil dibatalkan. Slot peserta dan credit telah dikembalikan.');
    }

    public function confirmPayment(PilatesBooking $booking)
    {
        if ($booking->status !== 'pending' || $booking->payment_type !== 'drop_in') {
            return back()->withErrors([
                'message' => 'Booking tidak dapat dikonfirmasi.',
            ]);
        }

        $booking->update([
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Pembayaran booking berhasil dikonfirmasi.');
    }

    public function rejectPayment(PilatesBooking $booking)
    {
        if ($booking->status !== 'pending' || $booking->payment_type !== 'drop_in') {
            return back()->withErrors([
                'message' => 'Booking tidak dapat ditolak.',
            ]);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Pembayaran booking berhasil ditolak.');
    }
}
