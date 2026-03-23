<?php

namespace App\Http\Controllers;

use App\Models\PilatesAppointment;
use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
            ->where('start_at', '>=', $start->clone()->timezone('Asia/Jakarta'))
            ->where('start_at', '<=', $end->clone()->timezone('Asia/Jakarta'))
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesAppointment $appointment) {
                return [
                    'id' => $appointment->id,
                    'invoice' => $appointment->invoice,
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

    public function edit(PilatesAppointment $appointment): Response
    {
        return Inertia::render('Dashboard/Appointments/Edit', [
            'classes' => PilatesClass::query()
                ->where(function ($query) use ($appointment) {
                    $query->where('available_for_appointment', true)
                        ->orWhere('id', $appointment->pilates_class_id);
                })
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'trainers' => Trainer::query()->select('id', 'name')->orderBy('name')->get(),
            'appointment' => [
                'id' => $appointment->id,
                'invoice' => $appointment->invoice,
                'pilates_class_id' => $appointment->pilates_class_id,
                'trainer_id' => $appointment->trainer_id,
                'session_name' => $appointment->session_name,
                'description' => $appointment->description,
                'price' => $appointment->price,
                'duration_minutes' => $appointment->duration_minutes,
                'start_at' => $appointment->start_at?->timezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
            ],
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
            'repeat_schedule' => ['required', 'boolean'],
            'schedules' => ['required', 'array'],
        ]);

        $hourOptions = array_map(fn (int $hour) => str_pad((string) $hour, 2, '0', STR_PAD_LEFT), range(6, 22));

        foreach (array_keys(self::WEEKDAY_MAP) as $day) {
            $request->validate([
                "schedules.$day.active" => ['required', 'boolean'],
                "schedules.$day.slots" => ['required', 'array', 'min:1'],
                "schedules.$day.slots.*.start_hour" => ['required', Rule::in($hourOptions)],
                "schedules.$day.slots.*.start_minute" => ['required', 'in:00,30'],
                "schedules.$day.slots.*.end_hour" => ['required', Rule::in($hourOptions)],
                "schedules.$day.slots.*.end_minute" => ['required', 'in:00,30'],
            ]);
        }

        $validated['schedules'] = $request->input('schedules', []);

        $occurrences = $this->buildOccurrences($validated);

        if ($occurrences->isEmpty()) {
            throw ValidationException::withMessages([
                'schedules' => 'Tidak ada slot appointment yang dapat dibuat dari pengaturan hari dan jam yang dipilih.',
            ]);
        }

        $this->assertNoConflicts($occurrences, (int) $validated['trainer_id']);

        DB::transaction(function () use ($validated, $occurrences) {
            $parent = null;

            foreach ($occurrences as $index => $occurrence) {
                $appointment = PilatesAppointment::query()->create([
                    'invoice' => $this->generateInvoiceNumber(),
                    'parent_id' => $parent?->id,
                    'pilates_class_id' => $validated['pilates_class_id'],
                    'trainer_id' => $validated['trainer_id'],
                    'session_name' => $validated['session_name'],
                    'description' => $validated['description'] ?? null,
                    'price' => $validated['price'],
                    'duration_minutes' => $occurrence['duration_minutes'],
                    'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                    'end_at' => $occurrence['end_at']->clone()->timezone('Asia/Jakarta'),
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

    public function update(Request $request, PilatesAppointment $appointment): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_id' => ['required', 'exists:trainers,id'],
            'session_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'start_at' => ['required', 'date'],
        ]);

        $startAt = Carbon::parse($validated['start_at'], 'Asia/Jakarta');
        $endAt = $startAt->copy()->addMinutes((int) $validated['duration_minutes']);
        $occurrences = collect([[
            'start_at' => $startAt,
            'end_at' => $endAt,
            'duration_minutes' => (int) $validated['duration_minutes'],
        ]]);

        $this->assertNoConflicts($occurrences, (int) $validated['trainer_id'], $appointment->id);

        $appointment->update([
            'pilates_class_id' => $validated['pilates_class_id'],
            'trainer_id' => $validated['trainer_id'],
            'session_name' => $validated['session_name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'],
            'start_at' => $startAt->clone()->timezone('Asia/Jakarta'),
            'end_at' => $endAt->clone()->timezone('Asia/Jakarta'),
        ]);

        $date = $appointment->start_at?->timezone('Asia/Jakarta')->toDateString();

        return redirect()
            ->route('appointments.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Appointment berhasil diperbarui.');
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
        $startDate = Carbon::parse($validated['start_date'], 'Asia/Jakarta')->startOfDay();
        $endDate = Carbon::parse($validated['end_date'], 'Asia/Jakarta')->startOfDay();
        $durationMinutes = (int) $validated['duration_minutes'];

        $schedules = collect($validated['schedules'] ?? [])
            ->mapWithKeys(function (array $schedule, string $day) {
                $slots = collect(Arr::get($schedule, 'slots', []))
                    ->map(function (array $slot, int $index) use ($day) {
                        $startAt = Carbon::createFromFormat(
                            'H:i',
                            sprintf('%s:%s', $slot['start_hour'], $slot['start_minute']),
                            'Asia/Jakarta'
                        );
                        $endAt = Carbon::createFromFormat(
                            'H:i',
                            sprintf('%s:%s', $slot['end_hour'], $slot['end_minute']),
                            'Asia/Jakarta'
                        );

                        if ($endAt->lessThanOrEqualTo($startAt)) {
                            throw ValidationException::withMessages([
                                "schedules.$day.slots.$index.time_range" => 'Jam sampai harus lebih besar dari jam mulai.',
                            ]);
                        }

                        return [
                            'start_hour' => $slot['start_hour'],
                            'start_minute' => $slot['start_minute'],
                            'end_hour' => $slot['end_hour'],
                            'end_minute' => $slot['end_minute'],
                        ];
                    })
                    ->values();

                return [$day => [
                    'active' => filter_var(Arr::get($schedule, 'active', false), FILTER_VALIDATE_BOOL),
                    'slots' => $slots,
                ]];
            });

        $activeSchedules = $schedules->filter(fn (array $schedule) => $schedule['active'] && collect($schedule['slots'])->isNotEmpty());

        if ($activeSchedules->isEmpty()) {
            throw ValidationException::withMessages([
                'schedules' => 'Aktifkan minimal satu hari dan isi minimal satu slot jam.',
            ]);
        }

        if (! $validated['repeat_schedule']) {
            $weekdayKey = strtolower($startDate->englishDayOfWeek);
            $selectedSchedule = $schedules->get($weekdayKey);

            if (! $selectedSchedule || ! $selectedSchedule['active']) {
                throw ValidationException::withMessages([
                    'schedules' => 'Untuk jadwal tunggal, aktifkan hari yang sesuai dengan tanggal mulai.',
                ]);
            }

            return collect($selectedSchedule['slots'])->flatMap(function (array $slot) use ($startDate, $durationMinutes) {
                $startAt = $startDate->copy()->setTime((int) $slot['start_hour'], (int) $slot['start_minute']);
                $endAt = $startDate->copy()->setTime((int) $slot['end_hour'], (int) $slot['end_minute']);

                return $this->splitSlotIntoOccurrences($startAt, $endAt, $durationMinutes);
            })->values();
        }

        return collect(range(0, $startDate->diffInDays($endDate)))
            ->flatMap(function ($offset) use ($startDate, $schedules, $durationMinutes) {
                $date = $startDate->copy()->addDays($offset);
                $weekdayKey = strtolower($date->englishDayOfWeek);
                $selectedSchedule = $schedules->get($weekdayKey);

                if (! $selectedSchedule || ! $selectedSchedule['active']) {
                    return [];
                }

                return collect($selectedSchedule['slots'])->flatMap(function (array $slot) use ($date, $durationMinutes) {
                    $startAt = $date->copy()->setTime((int) $slot['start_hour'], (int) $slot['start_minute']);
                    $endAt = $date->copy()->setTime((int) $slot['end_hour'], (int) $slot['end_minute']);

                    return $this->splitSlotIntoOccurrences($startAt, $endAt, $durationMinutes);
                });
            })->values();
    }

    private function splitSlotIntoOccurrences(Carbon $startAt, Carbon $endAt, int $durationMinutes): Collection
    {
        $slotDuration = $startAt->diffInMinutes($endAt);

        if ($slotDuration < $durationMinutes) {
            throw ValidationException::withMessages([
                'duration_minutes' => 'Durasi kelas tidak boleh lebih besar dari rentang slot jam aktif.',
            ]);
        }

        if ($slotDuration % $durationMinutes !== 0) {
            throw ValidationException::withMessages([
                'duration_minutes' => 'Durasi kelas harus membagi slot jam aktif tanpa sisa.',
            ]);
        }

        return collect(range(0, (int) ($slotDuration / $durationMinutes) - 1))
            ->map(function (int $index) use ($startAt, $durationMinutes) {
                $occurrenceStart = $startAt->copy()->addMinutes($index * $durationMinutes);

                return [
                    'start_at' => $occurrenceStart,
                    'end_at' => $occurrenceStart->copy()->addMinutes($durationMinutes),
                    'duration_minutes' => $durationMinutes,
                ];
            });
    }

    private function assertNoConflicts(Collection $occurrences, int $trainerId, ?int $ignoreAppointmentId = null): void
    {
        $rangeStart = $occurrences->min(fn ($occurrence) => $occurrence['start_at'])->clone()->timezone('Asia/Jakarta');
        $rangeEnd = $occurrences->max(fn ($occurrence) => $occurrence['end_at'])->clone()->timezone('Asia/Jakarta');

        $timetables = PilatesTimetable::query()
            ->with('pilatesClass:id,duration')
            ->where('start_at', '>=', $rangeStart->copy()->subDay())
            ->where('start_at', '<', $rangeEnd)
            ->get();

        $appointments = PilatesAppointment::query()
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
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
                    'schedules' => 'Jadwal bentrok dengan timetable studio atau appointment trainer lain.',
                ]);
            }
        }
    }

    private function generateInvoiceNumber(): string
    {
        do {
            $invoice = 'APT-'.Str::upper(Str::random(10));
        } while (PilatesAppointment::query()->where('invoice', $invoice)->exists());

        return $invoice;
    }
}
