<?php

namespace App\Http\Controllers;

use App\Models\PilatesBooking;
use App\Models\PilatesTimetable;
use App\Models\RescheduleLog;
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
        $search = trim((string) $request->string('search'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));
        $status = trim((string) $request->string('status'));

        $query = PilatesBooking::query()
            ->with([
                'user:id,name',
                'timetable:id,pilates_class_id,trainer_id,start_at',
                'timetable.pilatesClass:id,name,class_category_id',
                'timetable.trainer:id,user_id',
                'cashier:id,name',
            ])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'pending_payment' THEN 1 ELSE 2 END")
            ->latest('booked_at');

        if ($startDate) {
            $query->whereDate('booked_at', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->whereDate('booked_at', '<=', $endDate);
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('invoice', 'like', '%' . strtoupper($search) . '%')
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', '%' . $search . '%'))
                    ->orWhere('price_amount', 'like', '%' . $search . '%');
            });
        }

        $bookings = $query
            ->paginate(10)
            ->withQueryString();

        $bookingCollection = $bookings->getCollection();
        $bookingIds = $bookingCollection->pluck('id')->all();
        $categoryIds = $bookingCollection
            ->pluck('timetable.pilatesClass.class_category_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $todayStartUtc = now('Asia/Jakarta')->startOfDay()->timezone('UTC');

        $targetMap = PilatesTimetable::query()
            ->whereHas('pilatesClass', fn ($query) => $query->whereIn('class_category_id', $categoryIds))
            ->where('status', 'scheduled')
            ->where('start_at', '>=', $todayStartUtc)
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->with('pilatesClass:id,name,class_category_id')
            ->get(['id', 'pilates_class_id', 'start_at', 'capacity'])
            ->groupBy(fn (PilatesTimetable $session) => (int) ($session->pilatesClass?->class_category_id ?? 0))
            ->map(function ($sessions) {
                return $sessions->map(function (PilatesTimetable $session) {
                    $remainingSlots = max(0, (int) $session->capacity - (int) ($session->booked_slots ?? 0));

                    return [
                        'id' => $session->id,
                        'class_name' => $session->pilatesClass?->name,
                        'schedule_at' => $session->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                        'remaining_slots' => $remainingSlots,
                    ];
                })->values();
            });

        $logs = RescheduleLog::query()
            ->with([
                'movedBy:id,name',
                'fromSession.pilatesClass:id,name',
                'toSession.pilatesClass:id,name',
            ])
            ->where('booking_type', 'timetable')
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

        $sessionMap = PilatesTimetable::query()
            ->with('pilatesClass:id,name,class_category_id')
            ->whereIn('id', $sessionIds)
            ->get(['id', 'pilates_class_id', 'start_at'])
            ->mapWithKeys(function (PilatesTimetable $session) {
                return [
                    $session->id => trim(
                        ($session->pilatesClass?->name ? $session->pilatesClass->name . ' - ' : '') .
                        ($session->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-')
                    ),
                ];
            });

        $bookings->setCollection($bookingCollection->map(function (PilatesBooking $booking) use ($targetMap, $logs, $sessionMap) {
            $sessionTargets = collect($targetMap->get((int) ($booking->timetable?->pilatesClass?->class_category_id ?? 0), []))
                ->filter(fn (array $target) => (int) $target['id'] !== (int) $booking->timetable_id)
                ->values();

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
                'class_id' => $booking->timetable?->pilates_class_id,
                'timetable_id' => $booking->timetable_id,
                'trainer_name' => $booking->timetable?->trainer?->name,
                'schedule_at' => $booking->timetable?->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                'cashier_name' => $booking->cashier?->name,
                'reschedule_targets' => $sessionTargets,
                'reschedule_logs' => collect($logs->get($booking->id, []))->map(function (RescheduleLog $log) {
                    return [
                        'from_session' => $log->fromSession
                            ? $log->fromSession->pilatesClass?->name . ' - ' .
                            $log->fromSession->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i')
                            : '-',

                        'to_session' => $log->toSession
                            ? $log->toSession->pilatesClass?->name . ' - ' .
                            $log->toSession->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i')
                            : '-',
                        'moved_by' => $log->movedBy?->name,
                        'moved_at' => $log->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    ];
                })->values(),
            ];
        }));

        return Inertia::render('Dashboard/Timetable/BookingHistory', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    public function print(string $invoice): Response
    {
        $booking = PilatesBooking::query()
            ->with([
                'user:id,name,email',
                'timetable:id,pilates_class_id,trainer_id,start_at,duration_minutes',
                'timetable.pilatesClass:id,name,duration',
                'timetable.trainer:id,user_id',
                'cashier:id,name',
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

        DB::transaction(function () use ($booking, $validated) {
            $booking->loadMissing('userMembership');

            if ($booking->payment_type === 'credit' && $booking->userMembership && (float) $booking->credit_used > 0) {
                $booking->userMembership->increment('credits_remaining', (int) round((float) $booking->credit_used));
            }

            $booking->update([
                'status' => 'cancelled',
                'cashier_id' => auth()->id(),
                'canceled_at' => now(),
                'cancellation_note' => $validated['authorization_note'] ?? null,
                'canceled_by_email' => $validated['super_admin_email'],
            ]);
        });

        return back()->with('success', 'Booking berhasil dibatalkan. Slot peserta dan credit telah dikembalikan.');
    }

    public function confirmPayment(PilatesBooking $booking)
    {
        if (! in_array($booking->status, ['pending', 'pending_payment'], true) || $booking->payment_type !== 'drop_in') {
            return back()->withErrors([
                'message' => 'Booking tidak dapat dikonfirmasi.',
            ]);
        }

        $booking->update([
            'status' => 'confirmed',
            'cashier_id' => auth()->id(),
        ]);

        return back()->with('success', 'Pembayaran booking berhasil dikonfirmasi.');
    }

    public function rejectPayment(PilatesBooking $booking)
    {
        if (! in_array($booking->status, ['pending', 'pending_payment'], true) || $booking->payment_type !== 'drop_in') {
            return back()->withErrors([
                'message' => 'Booking tidak dapat ditolak.',
            ]);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Pembayaran booking berhasil ditolak.');
    }

    public function reschedule(Request $request, PilatesBooking $booking)
    {
        $validated = $request->validate([
            'target_session_id' => ['required', 'integer', 'exists:pilates_timetables,id'],
        ]);

        if ($booking->status !== 'confirmed') {
            return back()->withErrors([
                'message' => 'Reschedule hanya bisa dilakukan untuk booking berstatus confirmed.',
            ]);
        }

        $booking->loadMissing('timetable:id,pilates_class_id,start_at', 'timetable.pilatesClass:id,class_category_id');

        if (! $booking->timetable || $booking->timetable->start_at?->timezone('Asia/Jakarta')->lt(now('Asia/Jakarta')->startOfDay())) {
            return back()->withErrors([
                'message' => 'Reschedule tidak dapat dilakukan untuk jadwal yang sudah lewat hari.',
            ]);
        }

        $targetSession = PilatesTimetable::query()
            ->with('pilatesClass:id,name,class_category_id')
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->findOrFail($validated['target_session_id']);

        $currentCategoryId = (int) ($booking->timetable->pilatesClass?->class_category_id ?? 0);
        $targetCategoryId = (int) ($targetSession->pilatesClass?->class_category_id ?? 0);

        if ($currentCategoryId === 0 || $targetCategoryId === 0 || $currentCategoryId !== $targetCategoryId) {
            return back()->withErrors([
                'message' => 'Reschedule hanya boleh ke jadwal dengan kategori kelas yang sama.',
            ]);
        }

        if ($targetSession->start_at?->timezone('Asia/Jakarta')->lt(now('Asia/Jakarta')->startOfDay())) {
            return back()->withErrors([
                'message' => 'Jadwal tujuan reschedule sudah lewat hari.',
            ]);
        }

        $remainingSlots = max(0, (int) $targetSession->capacity - (int) ($targetSession->booked_slots ?? 0));

        if ($remainingSlots < (int) $booking->participants) {
            return back()->withErrors([
                'message' => 'Slot pada jadwal tujuan tidak mencukupi.',
            ]);
        }

        $oldSessionId = (int) $booking->timetable_id;
        $newSessionId = (int) $targetSession->id;

        DB::transaction(function () use ($booking, $newSessionId, $oldSessionId) {
            $booking->update([
                'timetable_id' => $newSessionId,
            ]);

            RescheduleLog::query()->create([
                'booking_type' => 'timetable',
                'booking_id' => $booking->id,
                'from_session_id' => $oldSessionId,
                'to_session_id' => $newSessionId,
                'moved_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Reschedule booking berhasil dilakukan.');
    }
}
