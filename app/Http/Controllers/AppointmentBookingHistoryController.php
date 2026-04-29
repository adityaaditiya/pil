<?php

namespace App\Http\Controllers;

use App\Models\AppointmentBooking;
use App\Models\PilatesAppointment;
use App\Models\RescheduleLog;
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
                'appointment:id,pilates_class_id,start_at,end_at,session_name',
                'appointment.pilatesClass:id,name,class_category_id',
                'trainer:id,user_id',
                'cashier:id,name',
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
            ->withQueryString();

        $bookingCollection = $bookings->getCollection();
        $bookingIds = $bookingCollection->pluck('id')->all();
        $categoryIds = $bookingCollection
            ->pluck('appointment.pilatesClass.class_category_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $todayStartUtc = now('Asia/Jakarta')->startOfDay()->timezone('UTC');

        $targetMap = PilatesAppointment::query()
            ->whereHas('pilatesClass', fn ($query) => $query->whereIn('class_category_id', $categoryIds))
            ->where('start_at', '>=', $todayStartUtc)
            ->withCount(['bookings as active_bookings_count' => fn ($query) => $query->where('status', 'confirmed')])
            ->with('pilatesClass:id,class_category_id')
            ->get(['id', 'pilates_class_id', 'start_at', 'end_at', 'session_name'])
            ->groupBy(fn (PilatesAppointment $appointment) => (int) ($appointment->pilatesClass?->class_category_id ?? 0))
            ->map(function ($appointments) {
                return $appointments->map(function (PilatesAppointment $appointment) {
                    return [
                        'id' => $appointment->id,
                        'session_name' => $appointment->session_name,
                        'schedule_at' => $appointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') . ' - ' . $appointment->end_at?->timezone('Asia/Jakarta')->format('H:i'),
                        'is_available' => ((int) $appointment->active_bookings_count) === 0,
                    ];
                })->values();
            });

        $logs = RescheduleLog::query()
            ->with([
                'movedBy:id,name',
                'fromAppointment.pilatesClass:id,name',
                'toAppointment.pilatesClass:id,name',
            ])
            ->where('booking_type', 'appointment')
            ->whereIn('booking_id', $bookingIds)
            ->latest('created_at')
            ->get()
            ->groupBy('booking_id');

        $sessionIds = $logs
            ->flatten()
            ->flatMap(fn (RescheduleLog $log) => [(int) $log->from_session_id, (int) $log->to_session_id])
            ->filter()
            ->unique()
            ->values();

        $sessionMap = PilatesAppointment::query()
            ->with('pilatesClass:id,name')
            ->whereIn('id', $sessionIds)
            ->get(['id', 'pilates_class_id', 'start_at', 'end_at'])
            ->mapWithKeys(function (PilatesAppointment $session) {
                $schedule = $session->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i')
                    . ' - '
                    . $session->end_at?->timezone('Asia/Jakarta')->format('H:i');

                return [
                    $session->id => trim(($session->pilatesClass?->name ? $session->pilatesClass->name . ' - ' : '') . $schedule),
                ];
            });

        $bookings->setCollection($bookingCollection->map(function (AppointmentBooking $booking) use ($targetMap, $logs, $sessionMap) {
            $sessionTargets = collect($targetMap->get((int) ($booking->appointment?->pilatesClass?->class_category_id ?? 0), []))
                ->filter(fn (array $target) => (int) $target['id'] !== (int) $booking->appointment_id)
                ->values();

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
                'class_id' => $booking->appointment?->pilates_class_id,
                'appointment_id' => $booking->appointment_id,
                'session_name' => $booking->session_name,
                'trainer_names' => collect([$booking->trainer?->name])->filter()->values(),
                'schedule_at' => $booking->appointment
                    ? $booking->appointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') . ' - ' . $booking->appointment->end_at?->timezone('Asia/Jakarta')->format('H:i')
                    : '-',
                'credit_used' => $booking->credit_used,
                'cashier_name' => $booking->cashier?->name,
                'reschedule_targets' => $sessionTargets,
                'reschedule_logs' => collect($logs->get($booking->id, []))->map(function (RescheduleLog $log) {
                    return [
                        'from_session' => $log->fromAppointment
                            ? $log->fromAppointment->pilatesClass?->name . ' - ' .
                            $log->fromAppointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i')
                            : '-',

                        'to_session' => $log->toAppointment
                            ? $log->toAppointment->pilatesClass?->name . ' - ' .
                            $log->toAppointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i')
                            : '-',
                        'moved_by' => $log->movedBy?->name,
                        'moved_at' => $log->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    ];
                })->values(),
            ];
        }));

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
                'appointment.pilatesClass:id,name,class_category_id',
                'trainer:id,user_id',
                'cashier:id,name',
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
            'cashier_id' => auth()->id(),
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

    public function reschedule(Request $request, AppointmentBooking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'target_session_id' => ['required', 'integer', 'exists:pilates_appointments,id'],
        ]);

        if ($booking->status !== 'confirmed') {
            return back()->withErrors([
                'message' => 'Reschedule hanya bisa dilakukan untuk transaksi berstatus confirmed.',
            ]);
        }

        $booking->loadMissing('appointment:id,pilates_class_id,start_at', 'appointment.pilatesClass:id,class_category_id');

        if (! $booking->appointment || $booking->appointment->start_at?->timezone('Asia/Jakarta')->lt(now('Asia/Jakarta')->startOfDay())) {
            return back()->withErrors([
                'message' => 'Reschedule tidak dapat dilakukan untuk jadwal yang sudah lewat hari.',
            ]);
        }

        $targetAppointment = PilatesAppointment::query()
            ->with('pilatesClass:id,class_category_id')
            ->withCount(['bookings as active_bookings_count' => fn ($query) => $query->where('status', 'confirmed')])
            ->findOrFail($validated['target_session_id']);

        $currentCategoryId = (int) ($booking->appointment->pilatesClass?->class_category_id ?? 0);
        $targetCategoryId = (int) ($targetAppointment->pilatesClass?->class_category_id ?? 0);

        if ($currentCategoryId === 0 || $targetCategoryId === 0 || $currentCategoryId !== $targetCategoryId) {
            return back()->withErrors([
                'message' => 'Reschedule hanya boleh ke jadwal dengan kategori kelas yang sama.',
            ]);
        }

        if ($targetAppointment->start_at?->timezone('Asia/Jakarta')->lt(now('Asia/Jakarta')->startOfDay())) {
            return back()->withErrors([
                'message' => 'Jadwal tujuan reschedule sudah lewat hari.',
            ]);
        }

        if ((int) $targetAppointment->active_bookings_count > 0) {
            return back()->withErrors([
                'message' => 'Jadwal appointment tujuan sudah terisi.',
            ]);
        }

        $oldSessionId = (int) $booking->appointment_id;
        $newSessionId = (int) $targetAppointment->id;

        DB::transaction(function () use ($booking, $newSessionId, $oldSessionId) {
            $booking->update([
                'appointment_id' => $newSessionId,
            ]);

            RescheduleLog::query()->create([
                'booking_type' => 'appointment',
                'booking_id' => $booking->id,
                'from_session_id' => $oldSessionId,
                'to_session_id' => $newSessionId,
                'moved_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Reschedule appointment berhasil dilakukan.');
    }
}
