<?php

namespace App\Http\Controllers;

use App\Models\AppointmentBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentBookingHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $invoice = trim((string) $request->string('invoice'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));

        $query = AppointmentBooking::query()
            ->with([
                'customer:id,name',
                'appointment:id,pilates_class_id,start_at,end_at',
                'appointment.pilatesClass:id,name',
                'trainer:id,name',
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
            ->through(function (AppointmentBooking $booking) {
                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'booked_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'status' => $booking->status,
                    'payment_type' => $booking->payment_type,
                    'payment_method' => $booking->payment_method,
                    'payment_proof_image' => $booking->payment_proof_image,
                    'price_amount' => $booking->price_amount,
                    'customer' => $booking->customer?->name,
                    'class_name' => $booking->appointment?->pilatesClass?->name,
                    'session_name' => $booking->session_name,
                    'trainer_names' => collect([$booking->trainer?->name])->filter()->values(),
                    // 'schedule_at' => $booking->appointment?->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'schedule_at' => $booking->appointment 
                    ? $booking->appointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') . ' - ' . $booking->appointment->end_at?->timezone('Asia/Jakarta')->format('H:i')
                    : '-',
                    'credit_used' => $booking->credit_used,
                ];
            });

        return Inertia::render('Dashboard/Appointments/History', [
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
        $booking = AppointmentBooking::query()
            ->with([
                'customer:id,name,no_telp,address',
                'appointment:id,pilates_class_id,start_at,end_at,duration_minutes',
                'appointment.pilatesClass:id,name',
                'trainer:id,name',
            ])
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Inertia::render('Dashboard/Appointments/Print', [
            'booking' => $booking,
        ]);
    }

    public function cancel(Request $request, AppointmentBooking $booking): RedirectResponse
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
                'message' => 'Transaksi appointment sudah dibatalkan.',
            ]);
        }

        DB::transaction(function () use ($booking) {
            $booking->loadMissing('userMembership');

            if ($booking->payment_type === 'credit' && $booking->userMembership && (int) $booking->credit_used > 0) {
                $booking->userMembership->increment('credits_remaining', (int) $booking->credit_used);
            }

            $booking->update([
                'status' => 'cancelled',
            ]);
        });

        return back()->with('success', 'Transaksi appointment berhasil dibatalkan. Credit customer dan slot appointment telah dikembalikan.');
    }

    public function confirmPayment(AppointmentBooking $booking): RedirectResponse
    {
        if (! in_array($booking->status, ['pending', 'pending_payment'], true)) {
            return back()->withErrors([
                'message' => 'Pembayaran appointment tidak dapat dikonfirmasi.',
            ]);
        }

        $booking->update([
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Pembayaran appointment berhasil dikonfirmasi.');
    }

    public function rejectPayment(AppointmentBooking $booking): RedirectResponse
    {
        if (! in_array($booking->status, ['pending', 'pending_payment'], true)) {
            return back()->withErrors([
                'message' => 'Pembayaran appointment tidak dapat ditolak.',
            ]);
        }

        DB::transaction(function () use ($booking) {
            $booking->loadMissing('userMembership');

            if ($booking->payment_type === 'credit' && $booking->userMembership && (int) $booking->credit_used > 0) {
                $booking->userMembership->increment('credits_remaining', (int) $booking->credit_used);
            }

            $booking->update([
                'status' => 'cancelled',
            ]);
        });

        return back()->with('success', 'Pembayaran appointment berhasil ditolak dan transaksi dibatalkan.');
    }
}
