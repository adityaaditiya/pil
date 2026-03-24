<?php

namespace App\Http\Controllers;

use App\Models\AppointmentSession;
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

    private const UPDATE_SCOPE_SINGLE = 'single';

    private const UPDATE_SCOPE_FOLLOWING = 'following';

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
            ->with(['pilatesClass:id,name', 'trainers:id,name'])
            ->where('start_at', '>=', $start->clone()->timezone('Asia/Jakarta'))
            ->where('start_at', '<=', $end->clone()->timezone('Asia/Jakarta'))
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesAppointment $appointment) {
                return [
                    'id' => $appointment->id,
                    'parent_id' => $appointment->parent_id,
                    'session_name' => $appointment->session_name,
                    'session_options' => $appointment->session_options ?? [],
                    'price' => $appointment->price,
                    'duration_minutes' => $appointment->duration_minutes,
                    'start_at' => $appointment->start_at,
                    'end_at' => $appointment->end_at,
                    'start_at_label' => $appointment->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'end_at_label' => $appointment->end_at?->timezone('Asia/Jakarta')->format('H:i'),
                    'pilates_class' => [
                        'name' => $appointment->pilatesClass?->name,
                    ],
                    'trainers' => $appointment->trainers->pluck('name')->values(),
                    'admin_notes' => $appointment->admin_notes,
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
            'trainers' => Trainer::query()->forTrainerRole()->select('id', 'name')->orderBy('name')->get(),
            'appointmentSessions' => AppointmentSession::query()->select('id', 'session_name')->orderBy('id', 'asc')->get(),
            'weekdayOptions' => collect(self::WEEKDAY_MAP)->keys()->map(fn ($day) => [
                'value' => $day,
                'label' => ucfirst(__($day)),
            ])->values(),
        ]);
    }

    public function edit(PilatesAppointment $appointment): Response
    {
        $seriesAppointments = PilatesAppointment::query()
            ->where('parent_id', $appointment->parent_id)
            ->where('start_at', '>=', $appointment->start_at?->clone()->timezone('Asia/Jakarta')->startOfDay())
            ->orderBy('start_at')
            ->with('trainers:id')
            ->get();

        return Inertia::render('Dashboard/Appointments/Edit', [
            'classes' => PilatesClass::query()
                ->where(function ($query) use ($appointment) {
                    $query->where('available_for_appointment', true)
                        ->orWhere('id', $appointment->pilates_class_id);
                })
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'trainers' => Trainer::query()->forTrainerRole()->select('id', 'name')->orderBy('name')->get(),
            'appointmentSessions' => AppointmentSession::query()->select('id', 'session_name')->orderBy('id', 'asc')->get(),
            'weekdayOptions' => collect(self::WEEKDAY_MAP)->keys()->map(fn ($day) => [
                'value' => $day,
                'label' => ucfirst(__($day)),
            ])->values(),
            'updateScopeOptions' => [
                ['value' => self::UPDATE_SCOPE_SINGLE, 'label' => 'Hanya Sesi Ini'],
                ['value' => self::UPDATE_SCOPE_FOLLOWING, 'label' => 'Sesi Ini dan Semua Seterusnya'],
            ],
            'appointment' => [
                'id' => $appointment->id,
                'parent_id' => $appointment->parent_id,
                'session_options' => $appointment->session_options ?? [],
                'pilates_class_id' => $appointment->pilates_class_id,
                'trainer_ids' => $appointment->trainers->pluck('id')->whenEmpty(fn ($collection) => collect([$appointment->trainer_id])->filter())->values(),
                'session_name' => $appointment->session_name,
                'admin_notes' => $appointment->admin_notes,
                'price' => $appointment->price,
                'duration_minutes' => $appointment->duration_minutes,
                'start_at' => $appointment->start_at?->timezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
                'start_date' => $appointment->start_at?->timezone('Asia/Jakarta')->toDateString(),
                'end_date' => $seriesAppointments->last()?->start_at?->timezone('Asia/Jakarta')->toDateString()
                    ?? $appointment->start_at?->timezone('Asia/Jakarta')->toDateString(),
                'repeat_schedule' => $seriesAppointments->count() > 1,
                'schedules' => $this->buildEditSchedules($seriesAppointments->isNotEmpty() ? $seriesAppointments : collect([$appointment])),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_ids' => ['required', 'array', 'min:1'],
            'trainer_ids.*' => ['required', 'exists:trainers,id'],
            'session_options' => ['required', 'array', 'min:1'],
            'session_options.*.appointment_session_id' => ['required', 'exists:appointment_sessions,id'],
            'session_options.*.price' => ['required', 'numeric', 'min:0'],
            'admin_notes' => ['nullable', 'string'],
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
        $validated['trainer_ids'] = collect($request->input('trainer_ids', []))->map(fn ($id) => (int) $id)->unique()->values()->all();
        $validated['session_options'] = $this->normalizeSessionOptions($request->input('session_options', []));

        $occurrences = $this->buildOccurrences($validated);

        if ($occurrences->isEmpty()) {
            throw ValidationException::withMessages([
                'schedules' => 'Tidak ada slot appointment yang dapat dibuat dari pengaturan hari dan jam yang dipilih.',
            ]);
        }

        $this->assertNoConflicts($occurrences, $validated['trainer_ids']);

        DB::transaction(function () use ($validated, $occurrences) {
            $parent = null;

            foreach ($occurrences as $index => $occurrence) {
                $appointment = PilatesAppointment::query()->create([
                    'parent_id' => $parent?->id,
                    'pilates_class_id' => $validated['pilates_class_id'],
                    'appointment_session_id' => null,
                    'trainer_id' => $validated['trainer_ids'][0],
                    'session_name' => $this->buildSessionName($validated['session_options']),
                    'session_options' => $validated['session_options'],
                    'admin_notes' => $validated['admin_notes'] ?? null,
                    'price' => $this->calculateTotalPrice($validated['session_options']),
                    'duration_minutes' => $occurrence['duration_minutes'],
                    'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                    'end_at' => $occurrence['end_at']->clone()->timezone('Asia/Jakarta'),
                ]);

                $appointment->trainers()->sync($validated['trainer_ids']);

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
            'trainer_ids' => ['required', 'array', 'min:1'],
            'trainer_ids.*' => ['required', 'exists:trainers,id'],
            'session_options' => ['required', 'array', 'min:1'],
            'session_options.*.appointment_session_id' => ['required', 'exists:appointment_sessions,id'],
            'session_options.*.price' => ['required', 'numeric', 'min:0'],
            'admin_notes' => ['nullable', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'start_at' => ['required', 'date'],
            'start_date' => ['required', 'date', 'after_or_equal:'.$appointment->start_at?->clone()->timezone('Asia/Jakarta')->toDateString()],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'repeat_schedule' => ['required', 'boolean'],
            'schedules' => ['required', 'array'],
            'update_scope' => ['required', Rule::in([self::UPDATE_SCOPE_SINGLE, self::UPDATE_SCOPE_FOLLOWING])],
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
        $validated['trainer_ids'] = collect($request->input('trainer_ids', []))->map(fn ($id) => (int) $id)->unique()->values()->all();
        $validated['session_options'] = $this->normalizeSessionOptions($request->input('session_options', []));
        $startAt = Carbon::parse($validated['start_at'], 'Asia/Jakarta');

        if ($validated['update_scope'] === self::UPDATE_SCOPE_FOLLOWING) {
            $appointmentsToUpdate = PilatesAppointment::query()
                ->where('parent_id', $appointment->parent_id)
                ->where('start_at', '>=', $appointment->start_at?->clone()->timezone('Asia/Jakarta')->startOfDay())
                ->orderBy('start_at')
                ->get()
                ->values();

            $occurrences = $this->buildOccurrences($validated);

            if ($occurrences->isEmpty()) {
                throw ValidationException::withMessages([
                    'schedules' => 'Tidak ada slot appointment yang dapat dibuat dari pengaturan hari dan jam yang dipilih.',
                ]);
            }

            $this->assertNoConflicts($occurrences, $validated['trainer_ids'], $appointmentsToUpdate->pluck('id')->all());

            DB::transaction(function () use ($appointment, $appointmentsToUpdate, $occurrences, $validated) {
                $parentId = $appointment->parent_id ?: $appointment->id;
                $existingAppointments = $appointmentsToUpdate->values();
                $occurrenceItems = $occurrences->values();
                $syncCount = min($existingAppointments->count(), $occurrenceItems->count());

                for ($index = 0; $index < $syncCount; $index++) {
                    $item = $existingAppointments[$index];
                    $occurrence = $occurrenceItems[$index];

                    $item->update([
                        'pilates_class_id' => $validated['pilates_class_id'],
                        'appointment_session_id' => null,
                        'trainer_id' => $validated['trainer_ids'][0],
                        'session_name' => $this->buildSessionName($validated['session_options']),
                        'session_options' => $validated['session_options'],
                        'admin_notes' => $validated['admin_notes'] ?? null,
                        'price' => $this->calculateTotalPrice($validated['session_options']),
                        'duration_minutes' => $validated['duration_minutes'],
                        'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                        'end_at' => $occurrence['end_at']->clone()->timezone('Asia/Jakarta'),
                    ]);

                    $item->trainers()->sync($validated['trainer_ids']);
                }

                if ($occurrenceItems->count() > $existingAppointments->count()) {
                    foreach ($occurrenceItems->slice($existingAppointments->count()) as $occurrence) {
                        $newAppointment = PilatesAppointment::query()->create([
                            'parent_id' => $parentId,
                            'pilates_class_id' => $validated['pilates_class_id'],
                            'appointment_session_id' => null,
                            'trainer_id' => $validated['trainer_ids'][0],
                            'session_name' => $this->buildSessionName($validated['session_options']),
                            'session_options' => $validated['session_options'],
                            'admin_notes' => $validated['admin_notes'] ?? null,
                            'price' => $this->calculateTotalPrice($validated['session_options']),
                            'duration_minutes' => $validated['duration_minutes'],
                            'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                            'end_at' => $occurrence['end_at']->clone()->timezone('Asia/Jakarta'),
                        ]);

                        $newAppointment->trainers()->sync($validated['trainer_ids']);
                    }
                }

                if ($existingAppointments->count() > $occurrenceItems->count()) {
                    $existingAppointments->slice($occurrenceItems->count())->each->delete();
                }
            });

            $date = $occurrences->first()['start_at']->toDateString();
        } else {
            $endAt = $startAt->copy()->addMinutes((int) $validated['duration_minutes']);
            $occurrences = collect([[
                'start_at' => $startAt,
                'end_at' => $endAt,
                'duration_minutes' => (int) $validated['duration_minutes'],
            ]]);

            $this->assertNoConflicts($occurrences, $validated['trainer_ids'], [$appointment->id]);

            $appointment->update([
                'pilates_class_id' => $validated['pilates_class_id'],
                'appointment_session_id' => null,
                'trainer_id' => $validated['trainer_ids'][0],
                'session_name' => $this->buildSessionName($validated['session_options']),
                'session_options' => $validated['session_options'],
                'admin_notes' => $validated['admin_notes'] ?? null,
                'price' => $this->calculateTotalPrice($validated['session_options']),
                'duration_minutes' => $validated['duration_minutes'],
                'start_at' => $startAt->clone()->timezone('Asia/Jakarta'),
                'end_at' => $endAt->clone()->timezone('Asia/Jakarta'),
            ]);

            $appointment->trainers()->sync($validated['trainer_ids']);

            $date = $startAt->toDateString();
        }

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


    private function normalizeSessionOptions(array $sessionOptions): array
    {
        $selectedSessionIds = collect($sessionOptions)
            ->pluck('appointment_session_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $sessionNames = AppointmentSession::query()
            ->whereIn('id', $selectedSessionIds)
            ->pluck('session_name', 'id');

        return collect($sessionOptions)
            ->map(function (array $option) use ($sessionNames) {
                $sessionId = (int) $option['appointment_session_id'];

                return [
                    'appointment_session_id' => $sessionId,
                    'session_name' => $sessionNames->get($sessionId),
                    'price' => (float) $option['price'],
                ];
            })
            ->filter(fn (array $option) => filled($option['session_name']))
            ->values()
            ->all();
    }

    private function buildSessionName(array $sessionOptions): string
    {
        return collect($sessionOptions)
            ->pluck('session_name')
            ->filter()
            ->implode(', ');
    }

    private function calculateTotalPrice(array $sessionOptions): float
    {
        return (float) collect($sessionOptions)->sum(fn (array $option) => (float) ($option['price'] ?? 0));
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

    private function buildEditSchedules(Collection $appointments): array
    {
        $defaultSchedules = collect(array_keys(self::WEEKDAY_MAP))
            ->mapWithKeys(fn (string $day) => [$day => [
                'active' => false,
                'slots' => [[
                    'start_hour' => '06',
                    'start_minute' => '00',
                    'end_hour' => '07',
                    'end_minute' => '00',
                ]],
            ]])
            ->toArray();

        foreach ($appointments as $item) {
            $startAt = $item->start_at?->clone()->timezone('Asia/Jakarta');
            $endAt = $item->end_at?->clone()->timezone('Asia/Jakarta');

            if (! $startAt || ! $endAt) {
                continue;
            }

            $weekdayKey = strtolower($startAt->englishDayOfWeek);
            $slot = [
                'start_hour' => $startAt->format('H'),
                'start_minute' => $startAt->format('i'),
                'end_hour' => $endAt->format('H'),
                'end_minute' => $endAt->format('i'),
            ];

            $existingSlots = collect($defaultSchedules[$weekdayKey]['slots'] ?? [])
                ->reject(fn (array $candidate) => $candidate === [
                    'start_hour' => '06',
                    'start_minute' => '00',
                    'end_hour' => '07',
                    'end_minute' => '00',
                ] && ($defaultSchedules[$weekdayKey]['active'] ?? false))
                ->values()
                ->all();

            $slotExists = collect($existingSlots)->contains(fn (array $candidate) => $candidate === $slot);

            $defaultSchedules[$weekdayKey]['active'] = true;
            $defaultSchedules[$weekdayKey]['slots'] = $slotExists
                ? $existingSlots
                : [...$existingSlots, $slot];
        }

        return collect($defaultSchedules)->map(function (array $schedule) {
            return [
                'active' => $schedule['active'],
                'slots' => count($schedule['slots']) > 0 ? array_values($schedule['slots']) : [[
                    'start_hour' => '06',
                    'start_minute' => '00',
                    'end_hour' => '07',
                    'end_minute' => '00',
                ]],
            ];
        })->toArray();
    }

    private function assertNoConflicts(Collection $occurrences, array $trainerIds, array $ignoreAppointmentIds = []): void
    {
        $rangeStart = $occurrences->min(fn ($occurrence) => $occurrence['start_at'])->clone()->timezone('Asia/Jakarta');
        $rangeEnd = $occurrences->max(fn ($occurrence) => $occurrence['end_at'])->clone()->timezone('Asia/Jakarta');

        $timetables = PilatesTimetable::query()
            ->with('pilatesClass:id,duration')
            ->where('start_at', '>=', $rangeStart->copy()->subDay())
            ->where('start_at', '<', $rangeEnd)
            ->get();

        $appointments = PilatesAppointment::query()
            ->with('trainers:id')
            ->when(! empty($ignoreAppointmentIds), fn ($query) => $query->whereNotIn('id', $ignoreAppointmentIds))
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

            $trainerConflict = $appointments->first(function (PilatesAppointment $appointment) use ($startAt, $endAt, $trainerIds) {
                $existingStart = $appointment->start_at?->clone()->timezone('Asia/Jakarta');
                $existingEnd = $appointment->end_at?->clone()->timezone('Asia/Jakarta');
                $appointmentTrainerIds = $appointment->trainers->pluck('id')
                    ->whenEmpty(fn ($collection) => collect([$appointment->trainer_id])->filter())
                    ->all();

                return $existingStart
                    && $existingEnd
                    && count(array_intersect($trainerIds, $appointmentTrainerIds)) > 0
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
}
