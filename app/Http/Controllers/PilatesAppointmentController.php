<?php

namespace App\Http\Controllers;

use App\Models\PilatesAppointment;
use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PilatesAppointmentController extends Controller
{
    private const WEEKDAY_MAP = [
        'monday' => Carbon::MONDAY,
        'tuesday' => Carbon::TUESDAY,
        'wednesday' => Carbon::WEDNESDAY,
        'thursday' => Carbon::THURSDAY,
        'friday' => Carbon::FRIDAY,
        'saturday' => Carbon::SATURDAY,
        'sunday' => Carbon::SUNDAY,
    ];

    public function index(Request $request): Response
    {
        $startDate = $request->string('start_date')->toString() ?: now('Asia/Jakarta')->toDateString();
        $endDate = $request->string('end_date')->toString() ?: $startDate;

        $start = Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay();
        $end = Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay();

        if ($start->gt($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        $appointments = PilatesAppointment::query()
            ->with(['pilatesClass:id,name', 'trainer:id,name'])
            ->where('start_at', '>=', $start->clone()->timezone('UTC'))
            ->where('start_at', '<=', $end->clone()->timezone('UTC'))
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesAppointment $appointment) {
                return [
                    'id' => $appointment->id,
                    'parent_id' => $appointment->parent_id,
                    'session_name' => $appointment->session_name,
                    'description' => $appointment->description,
                    'price' => $appointment->price,
                    'duration_minutes' => $appointment->duration_minutes,
                    'start_at' => $appointment->start_at,
                    'end_at' => $appointment->end_at,
                    'start_at_label' => $appointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'end_at_label' => $appointment->end_at?->timezone('Asia/Jakarta')->format('H:i'),
                    'pilates_class' => [
                        'name' => $appointment->pilatesClass?->name,
                    ],
                    'trainer' => [
                        'name' => $appointment->trainer?->name,
                    ],
                ];
            })
            ->values();

        return Inertia::render('Dashboard/Appointments/Index', [
            'appointments' => $appointments,
            'selectedStartDate' => $start->toDateString(),
            'selectedEndDate' => $end->toDateString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Appointments/Create', [
            'classes' => PilatesClass::query()
                ->where('available_for_appointment', true)
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'trainers' => Trainer::query()->select('id', 'name')->orderBy('name')->get(),
            'weekdayOptions' => collect(self::WEEKDAY_MAP)->keys()->map(fn ($day) => [
                'value' => $day,
                'label' => ucfirst(__($day)),
            ])->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_id' => ['required', 'exists:trainers,id'],
            'session_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'start_time' => ['required', 'date_format:H:i'],
            'repeat_schedule' => ['required', 'boolean'],
            'days' => ['array'],
            'days.*' => ['in:' . implode(',', array_keys(self::WEEKDAY_MAP))],
        ]);

        $occurrences = $this->buildOccurrences($validated);

        if ($occurrences->isEmpty()) {
            throw ValidationException::withMessages([
                'days' => 'Pilih minimal satu hari ketika Ulangi Jadwal dicentang.',
            ]);
        }

        $this->assertNoConflicts($occurrences, (int) $validated['trainer_id']);

        DB::transaction(function () use ($validated, $occurrences) {
            $parent = null;

            foreach ($occurrences as $index => $occurrence) {
                $appointment = PilatesAppointment::query()->create([
                    'parent_id' => $parent?->id,
                    'pilates_class_id' => $validated['pilates_class_id'],
                    'trainer_id' => $validated['trainer_id'],
                    'session_name' => $validated['session_name'],
                    'description' => $validated['description'] ?? null,
                    'price' => $validated['price'],
                    'duration_minutes' => $validated['duration_minutes'],
                    'start_at' => $occurrence['start_at']->clone()->timezone('UTC'),
                    'end_at' => $occurrence['end_at']->clone()->timezone('UTC'),
                ]);

                if ($index === 0) {
                    $parent = $appointment;
                    $appointment->update(['parent_id' => $appointment->id]);
                }
            }
        });

        return redirect()
            ->route('appointments.index', [
                'start_date' => $occurrences->first()['start_at']->toDateString(),
                'end_date' => $occurrences->last()['start_at']->toDateString(),
            ])
            ->with('success', 'Appointment berhasil disimpan.');
    }

    public function destroy(PilatesAppointment $appointment): RedirectResponse
    {
        $date = $appointment->start_at?->timezone('Asia/Jakarta')->toDateString();
        $appointment->delete();

        return redirect()
            ->route('appointments.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Appointment berhasil dihapus.');
    }

    private function buildOccurrences(array $validated): Collection
    {
        $duration = (int) $validated['duration_minutes'];
        $startDate = Carbon::parse($validated['start_date'], 'Asia/Jakarta')->startOfDay();
        $endDate = Carbon::parse($validated['end_date'], 'Asia/Jakarta')->startOfDay();
        $time = Carbon::createFromFormat('H:i', $validated['start_time'], 'Asia/Jakarta');

        if (! $validated['repeat_schedule']) {
            $startAt = $startDate->copy()->setTime($time->hour, $time->minute);
            return collect([[ 
                'start_at' => $startAt,
                'end_at' => $startAt->copy()->addMinutes($duration),
            ]]);
        }

        $selectedDays = collect($validated['days'] ?? [])->map(fn ($day) => self::WEEKDAY_MAP[$day] ?? null)->filter()->values();

        return collect(range(0, $startDate->diffInDays($endDate)))->map(function ($offset) use ($startDate, $time, $duration, $selectedDays) {
            $date = $startDate->copy()->addDays($offset);

            if (! $selectedDays->contains($date->dayOfWeekIso)) {
                return null;
            }

            $startAt = $date->copy()->setTime($time->hour, $time->minute);

            return [
                'start_at' => $startAt,
                'end_at' => $startAt->copy()->addMinutes($duration),
            ];
        })->filter()->values();
    }

    private function assertNoConflicts(Collection $occurrences, int $trainerId): void
    {
        $rangeStart = $occurrences->min(fn ($occurrence) => $occurrence['start_at'])->clone()->timezone('UTC');
        $rangeEnd = $occurrences->max(fn ($occurrence) => $occurrence['end_at'])->clone()->timezone('UTC');

        $timetables = PilatesTimetable::query()
            ->with('pilatesClass:id,duration')
            ->where('start_at', '>=', $rangeStart->copy()->subDay())
            ->where('start_at', '<', $rangeEnd)
            ->get();

        $appointments = PilatesAppointment::query()
            ->where('start_at', '<', $rangeEnd)
            ->where('end_at', '>', $rangeStart)
            ->get();

        foreach ($occurrences as $occurrence) {
            $startAt = $occurrence['start_at'];
            $endAt = $occurrence['end_at'];

            $timetableConflict = $timetables->first(function (PilatesTimetable $timetable) use ($startAt, $endAt) {
                $duration = $timetable->duration_minutes ?: (int) ($timetable->pilatesClass?->duration ?? 0);
                $existingStart = $timetable->start_at?->clone()->timezone('Asia/Jakarta');
                $existingEnd = $existingStart?->copy()->addMinutes($duration);

                return $existingStart && $existingEnd && $startAt->lt($existingEnd) && $endAt->gt($existingStart);
            });

            $trainerConflict = $appointments->first(function (PilatesAppointment $appointment) use ($startAt, $endAt, $trainerId) {
                $existingStart = $appointment->start_at?->clone()->timezone('Asia/Jakarta');
                $existingEnd = $appointment->end_at?->clone()->timezone('Asia/Jakarta');

                return $appointment->trainer_id === $trainerId
                    && $existingStart
                    && $existingEnd
                    && $startAt->lt($existingEnd)
                    && $endAt->gt($existingStart);
            });

            if ($timetableConflict || $trainerConflict) {
                throw ValidationException::withMessages([
                    'start_time' => 'Jadwal Bentrok.',
                ]);
            }
        }
    }
}
