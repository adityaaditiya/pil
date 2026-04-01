<?php

namespace App\Http\Controllers;

use App\Models\AppointmentBooking;
use App\Models\PilatesBooking;
use App\Models\PilatesAppointment;
use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrainerFlowController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->hasRole('trainer'), 403);

        $trainerId = optional($user->trainer)->id;
        abort_unless($trainerId, 403);

        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));
        $classType = trim((string) $request->string('class_type'));
        if (! in_array($classType, ['', 'appointment', 'timetable'], true)) {
            $classType = '';
        }

        $todayJakarta = Carbon::now('Asia/Jakarta');
        $filterStartUtc = $startDate !== ''
            ? Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()
            : $todayJakarta->copy()->startOfDay();
        $filterEndUtc = $endDate !== ''
            ? Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()
            : $todayJakarta->copy()->endOfDay();

        if ($filterEndUtc->lt($filterStartUtc)) {
            [$filterStartUtc, $filterEndUtc] = [$filterEndUtc->copy()->startOfDay(), $filterStartUtc->copy()->endOfDay()];
        }

        $timetableSessions = PilatesTimetable::query()
            ->with([
                'pilatesClass:id,name,available_for_timetable',
                'bookings:id,timetable_id,user_id,status,attendance_status',
                'bookings.user:id,name',
            ])
            ->where('trainer_id', $trainerId)
            ->whereBetween('start_at', [$filterStartUtc, $filterEndUtc])
            ->when($classType === 'timetable', fn ($query) => $query->whereHas('pilatesClass', fn ($classQuery) => $classQuery->where('available_for_timetable', true)))
            ->when($classType === 'appointment', fn ($query) => $query->whereRaw('1 = 0'))
            ->orderBy('start_at')
            ->get()
            ->map(fn (PilatesTimetable $session) => $this->mapTimetableSession($session));

        $appointmentSessions = PilatesAppointment::query()
            ->with([
                'pilatesClass:id,name,available_for_appointment',
                'bookings:id,appointment_id,customer_id,status,attendance_status',
                'bookings.customer:id,name',
            ])
            ->where('trainer_id', $trainerId)
            ->whereBetween('start_at', [$filterStartUtc, $filterEndUtc])
            ->when($classType === 'appointment', fn ($query) => $query->whereHas('pilatesClass', fn ($classQuery) => $classQuery->where('available_for_appointment', true)))
            ->when($classType === 'timetable', fn ($query) => $query->whereRaw('1 = 0'))
            ->orderBy('start_at')
            ->get()
            ->map(fn (PilatesAppointment $session) => $this->mapAppointmentSession($session));

        $sessions = $timetableSessions
            ->concat($appointmentSessions)
            ->sortBy('start_at')
            ->values();

        $weekHours = $this->calculateDurationHours(
            PilatesTimetable::query()->where('trainer_id', $trainerId)
                ->whereBetween('start_at', [$todayJakarta->copy()->startOfWeek()->timezone('UTC'), $todayJakarta->copy()->endOfWeek()->timezone('UTC')])
                ->sum('duration_minutes'),
            PilatesAppointment::query()->where('trainer_id', $trainerId)
                ->whereBetween('start_at', [$todayJakarta->copy()->startOfWeek()->timezone('UTC'), $todayJakarta->copy()->endOfWeek()->timezone('UTC')])
                ->sum('duration_minutes')
        );

        $monthHours = $this->calculateDurationHours(
            PilatesTimetable::query()->where('trainer_id', $trainerId)
                ->whereBetween('start_at', [$todayJakarta->copy()->startOfMonth()->timezone('UTC'), $todayJakarta->copy()->endOfMonth()->timezone('UTC')])
                ->sum('duration_minutes'),
            PilatesAppointment::query()->where('trainer_id', $trainerId)
                ->whereBetween('start_at', [$todayJakarta->copy()->startOfMonth()->timezone('UTC'), $todayJakarta->copy()->endOfMonth()->timezone('UTC')])
                ->sum('duration_minutes')
        );

        $remainingTodaySessions = $sessions->filter(fn (array $session) => $session['session_status'] !== 'completed')->count();

        $classTypeOptions = PilatesClass::query()
            ->selectRaw('MAX(CASE WHEN available_for_timetable = 1 THEN 1 ELSE 0 END) as has_timetable')
            ->selectRaw('MAX(CASE WHEN available_for_appointment = 1 THEN 1 ELSE 0 END) as has_appointment')
            ->first();

        return Inertia::render('User/MyFlow', [
            'sessions' => $sessions,
            'stats' => [
                'week_hours' => $weekHours,
                'month_hours' => $monthHours,
                'remaining_today_sessions' => $remainingTodaySessions,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'class_type' => $classType,
            ],
            'classTypeOptions' => [
                'timetable' => (bool) ($classTypeOptions?->has_timetable ?? false),
                'appointment' => (bool) ($classTypeOptions?->has_appointment ?? false),
            ],
        ]);
    }

    public function updateAttendance(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasRole('trainer'), 403);

        $trainerId = optional($user->trainer)->id;
        abort_unless($trainerId, 403);

        $validated = $request->validate([
            'booking_type' => ['required', Rule::in(['timetable', 'appointment'])],
            'booking_id' => ['required', 'integer'],
            'attendance_status' => ['required', Rule::in(['pending', 'present', 'absent'])],
        ]);

        if ($validated['booking_type'] === 'timetable') {
            $booking = PilatesBooking::query()->with('timetable:id,trainer_id')->findOrFail($validated['booking_id']);
            abort_unless((int) $booking->timetable?->trainer_id === (int) $trainerId, 403);
        } else {
            $booking = AppointmentBooking::query()->with('appointment:id,trainer_id')->findOrFail($validated['booking_id']);
            abort_unless((int) $booking->appointment?->trainer_id === (int) $trainerId, 403);
        }

        $booking->update(['attendance_status' => $validated['attendance_status']]);

        return back()->with('success', 'Status kehadiran berhasil diperbarui.');
    }

    private function mapTimetableSession(PilatesTimetable $session): array
    {
        $startAt = $session->start_at?->timezone('Asia/Jakarta')->toDateTimeString();
        $endAt = $session->start_at?->copy()->addMinutes((int)$session->duration_minutes)->timezone('Asia/Jakarta')->toDateTimeString();

        return [
            'id' => $session->id,
            'session_type' => 'timetable',
            'indicator' => 'class',
            'title' => $session->pilatesClass?->name ?? 'Pilates Class',
            'start_at' => $startAt,
            'end_at' => $endAt,
            'duration_minutes' => (int) ($session->duration_minutes ?? 0),
            'session_status' => $this->resolveSessionStatus($session->start_at, $session->duration_minutes),
            'clients' => $session->bookings->map(fn (PilatesBooking $booking) => [
                'id' => $booking->id,
                'name' => $booking->user?->name ?? '-',
                'booking_status' => $booking->status,
                'attendance_status' => $booking->attendance_status ?? 'pending',
            ])->values(),
        ];
    }

    private function mapAppointmentSession(PilatesAppointment $session): array
    {
        return [
            'id' => $session->id,
            'session_type' => 'appointment',
            'indicator' => 'appointment',
            'title' => $session->session_name ?: ($session->pilatesClass?->name ?? 'Private Appointment'),
            'start_at' => $session->start_at?->timezone('Asia/Jakarta')->toDateTimeString(),
            'end_at' => $session->end_at?->timezone('Asia/Jakarta')->toDateTimeString(),
            'duration_minutes' => (int) ($session->duration_minutes ?? 0),
            'session_status' => $this->resolveSessionStatus($session->start_at, $session->duration_minutes, $session->end_at),
            'clients' => $session->bookings->map(fn (AppointmentBooking $booking) => [
                'id' => $booking->id,
                'name' => $booking->customer?->name ?? '-',
                'booking_status' => $booking->status,
                'attendance_status' => $booking->attendance_status ?? 'pending',
            ])->values(),
        ];
    }

    private function resolveSessionStatus(?Carbon $startAt, ?int $durationMinutes, ?Carbon $explicitEndAt = null): string
    {
        if (! $startAt) {
            return 'upcoming';
        }

        $now = now();
        $endAt = $explicitEndAt ?: $startAt->copy()->addMinutes((int) ($durationMinutes ?? 0));

        if ($now->lt($startAt)) {
            return 'upcoming';
        }

        if ($now->betweenIncluded($startAt, $endAt)) {
            return 'ongoing';
        }

        return 'completed';
    }

    private function calculateDurationHours(int $timetableMinutes, int $appointmentMinutes): float
    {
        return round(($timetableMinutes + $appointmentMinutes) / 60, 1);
    }
}
