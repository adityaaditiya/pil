<?php

namespace App\Http\Controllers;

use App\Models\PilatesAppointment;
use App\Models\PilatesBooking;
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

class PilatesTimetableController extends Controller
{
    private const WEEKDAY_MAP = [
    'senin'  => Carbon::MONDAY,
    'selasa' => Carbon::TUESDAY,
    'rabu'   => Carbon::WEDNESDAY,
    'kamis'  => Carbon::THURSDAY,
    'jumat'  => Carbon::FRIDAY,
    'sabtu'  => Carbon::SATURDAY,
    'minggu' => Carbon::SUNDAY,
];

    private const UPDATE_SCOPE_SINGLE = 'single';

    private const UPDATE_SCOPE_FOLLOWING = 'following';

    public function create(): Response
    {
        return Inertia::render('Timetable/Create', [
            'classes' => PilatesClass::query()
                ->where('available_for_timetable', true)
                ->select('id', 'name', 'credit', 'price', 'default_payment_method')
                ->orderBy('name')
                ->get(),
            'trainers' => Trainer::query()->forTrainerRole()->with('user.customer')->select('id', 'user_id')->get()->sortBy('name')->values(),
            'weekdayOptions' => collect(self::WEEKDAY_MAP)->keys()->map(fn ($day) => [
                'value' => $day,
                'label' => ucfirst(__($day)),
            ])->values(),
        ]);
    }

    public function edit(PilatesTimetable $timetable): Response
    {
        $seriesSessions = PilatesTimetable::query()
            ->where('parent_id', $timetable->parent_id ?: $timetable->id)
            ->where('start_at', '>=', $timetable->start_at?->clone()->timezone('Asia/Jakarta')->startOfDay())
            ->orderBy('start_at')
            ->get();

        $lockedIds = PilatesBooking::query()
            ->whereIn('timetable_id', $seriesSessions->pluck('id'))
            ->pluck('timetable_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return Inertia::render('Timetable/Edit', [
            'classes' => PilatesClass::query()
                ->where(function ($query) use ($timetable) {
                    $query->where('available_for_timetable', true)
                        ->orWhere('id', $timetable->pilates_class_id);
                })
                ->select('id', 'name')
                ->addSelect('credit', 'price', 'default_payment_method')
                ->orderBy('name')
                ->get(),
            'trainers' => Trainer::query()->forTrainerRole()->with('user.customer')->select('id', 'user_id')->get()->sortBy('name')->values(),
            'weekdayOptions' => collect(self::WEEKDAY_MAP)->keys()->map(fn ($day) => [
                'value' => $day,
                'label' => ucfirst(__($day)),
            ])->values(),
            'updateScopeOptions' => [
                ['value' => self::UPDATE_SCOPE_SINGLE, 'label' => 'Hanya Sesi Ini'],
                ['value' => self::UPDATE_SCOPE_FOLLOWING, 'label' => 'Sesi Ini dan Semua Seterusnya'],
            ],
            'session' => [
                'id' => $timetable->id,
                'parent_id' => $timetable->parent_id,
                'pilates_class_id' => $timetable->pilates_class_id,
                'trainer_id' => $timetable->trainer_id,
                'start_at' => $timetable->start_at?->timezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
                'capacity' => $timetable->capacity,
                'duration_minutes' => $timetable->duration_minutes,
                'credit_override' => $timetable->credit_override,
                'price_override' => $timetable->price_override,
                'allow_drop_in' => $timetable->allow_drop_in,
                'status' => $timetable->status,
                'admin_notes' => $timetable->admin_notes,
                'start_date' => $timetable->start_at?->timezone('Asia/Jakarta')->toDateString(),
                'end_date' => $seriesSessions->last()?->start_at?->timezone('Asia/Jakarta')->toDateString() ?? $timetable->start_at?->timezone('Asia/Jakarta')->toDateString(),
                'repeat_schedule' => $seriesSessions->count() > 1,
                'schedules' => $this->buildEditSchedules($seriesSessions->isNotEmpty() ? $seriesSessions : collect([$timetable])),
                'locked' => in_array($timetable->id, $lockedIds, true),
                'locked_ids' => $lockedIds,
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $startDateInput = $request->string('start_date')->toString();
        $endDateInput = $request->string('end_date')->toString();

        if (! $endDateInput) {
            $endDateInput = $request->string('date')->toString();
        }

        if (! $endDateInput) {
            $endDateInput = now('Asia/Jakarta')->toDateString();
        }

        if (! $startDateInput) {
            $startDateInput = $endDateInput;
        }

        $startDate = Carbon::createFromFormat('Y-m-d', $startDateInput, 'Asia/Jakarta')->startOfDay();
        $endDate = Carbon::createFromFormat('Y-m-d', $endDateInput, 'Asia/Jakarta')->endOfDay();

        if ($startDate->gt($endDate)) {
            [$startDate, $endDate] = [$endDate->copy()->startOfDay(), $startDate->copy()->endOfDay()];
        }

        $sessions = PilatesTimetable::query()
            ->with([
                'pilatesClass:id,name,difficulty_level,duration,about,equipment',
                'trainer:id,user_id',
            ])
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->whereBetween('start_at', [$startDate->clone()->timezone('Asia/Jakarta'), $endDate->clone()->timezone('Asia/Jakarta')])
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesTimetable $session) {
                $bookedSlots = (int) ($session->booked_slots ?? 0);
                $remainingSlots = max(0, $session->capacity - $bookedSlots);

                return [
                    'id' => $session->id,
                    'parent_id' => $session->parent_id,
                    'status' => $session->status,
                    'start_at' => $session->start_at,
                    'start_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'end_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->addMinutes($session->duration_minutes ?: ($session->pilatesClass?->duration ?? 0))->format('H:i'),
                    'capacity' => $session->capacity,
                    'confirmed_bookings_count' => $bookedSlots,
                    'remaining_slots' => $remainingSlots,
                    'duration_minutes' => $session->duration_minutes ?: $session->pilatesClass?->duration,
                    'price_drop_in' => $session->price_override,
                    'credit_membership' => $session->credit_override,
                    'allow_drop_in' => (bool) $session->allow_drop_in,
                    'admin_notes' => $session->admin_notes,
                    'trainer' => [
                        'name' => $session->trainer?->name,
                    ],
                    'class' => [
                        'name' => $session->pilatesClass?->name,
                        'level' => $session->pilatesClass?->difficulty_level,
                        'about' => $session->pilatesClass?->about,
                        'equipment' => $session->pilatesClass?->equipment,
                        'duration' => $session->pilatesClass?->duration,
                    ],
                ];
            })
            ->values();

        return Inertia::render('Dashboard/Timetable/Index', [
            'selectedStartDate' => $startDate->toDateString(),
            'selectedEndDate' => $endDate->toDateString(),
            'sessions' => $sessions,
            'canBook' => $request->user() !== null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_id' => ['required', 'exists:trainers,id'],
            'capacity' => ['required', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'credit_override' => ['nullable', 'numeric', 'min:0'],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'allow_drop_in' => ['nullable', 'boolean'],
            'status' => ['required', 'in:scheduled,cancelled,closed'],
            'admin_notes' => ['nullable', 'string'],
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

        $pilatesClass = PilatesClass::query()->findOrFail($validated['pilates_class_id']);
        $defaultAllowDropIn = ($pilatesClass->default_payment_method ?? 'drop_in') === 'drop_in';

        $validated['allow_drop_in'] = array_key_exists('allow_drop_in', $validated)
            ? (bool) $validated['allow_drop_in']
            : $defaultAllowDropIn;
        $validated['credit_override'] = $validated['credit_override'] ?? $pilatesClass->credit;
        $validated['price_override'] = $validated['price_override'] ?? $pilatesClass->price;

        if (! (bool) $validated['allow_drop_in']) {
            $validated['price_override'] = null;
        }

        $occurrences = $this->buildOccurrences($validated, (int) ($validated['duration_minutes'] ?: $pilatesClass->duration));
        $this->assertNoConflicts($occurrences, (int) $validated['trainer_id']);

        DB::transaction(function () use ($validated, $occurrences) {
            $parent = null;

            foreach ($occurrences as $index => $occurrence) {
                $session = PilatesTimetable::query()->create([
                    'parent_id' => $parent?->id,
                    'pilates_class_id' => $validated['pilates_class_id'],
                    'trainer_id' => $validated['trainer_id'],
                    'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                    'capacity' => $validated['capacity'],
                    'duration_minutes' => $occurrence['duration_minutes'],
                    'price_override' => $validated['price_override'],
                    'credit_override' => $validated['credit_override'],
                    'allow_drop_in' => $validated['allow_drop_in'],
                    'status' => $validated['status'],
                    'admin_notes' => $validated['admin_notes'] ?? null,
                ]);

                if ($index === 0) {
                    $parent = $session;
                    $session->update(['parent_id' => $session->id]);
                }
            }
        });

        return redirect()
            ->route('timetable.index', ['start_date' => $occurrences->first()['start_at']->toDateString(), 'end_date' => $occurrences->last()['start_at']->toDateString()])
            ->with('success', 'Session berhasil ditambahkan.');
    }

    public function update(Request $request, PilatesTimetable $timetable): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_id' => ['required', 'exists:trainers,id'],
            'start_at' => ['required', 'date'],
            'capacity' => ['required', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'credit_override' => ['nullable', 'numeric', 'min:0'],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'allow_drop_in' => ['nullable', 'boolean'],
            'status' => ['required', 'in:scheduled,cancelled,closed'],
            'admin_notes' => ['nullable', 'string'],
            'start_date' => ['required', 'date', 'after_or_equal:'.$timetable->start_at?->clone()->timezone('Asia/Jakarta')->toDateString()],
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

        $pilatesClass = PilatesClass::query()->findOrFail($validated['pilates_class_id']);
        $defaultAllowDropIn = ($pilatesClass->default_payment_method ?? 'drop_in') === 'drop_in';

        $validated['allow_drop_in'] = array_key_exists('allow_drop_in', $validated)
            ? (bool) $validated['allow_drop_in']
            : $defaultAllowDropIn;
        $validated['credit_override'] = $validated['credit_override'] ?? $pilatesClass->credit;
        $validated['price_override'] = $validated['price_override'] ?? $pilatesClass->price;

        if (! (bool) $validated['allow_drop_in']) {
            $validated['price_override'] = null;
        }

        if ($validated['update_scope'] === self::UPDATE_SCOPE_FOLLOWING) {
            $sessionsToUpdate = PilatesTimetable::query()
                ->where('parent_id', $timetable->parent_id ?: $timetable->id)
                ->where('start_at', '>=', $timetable->start_at?->clone()->timezone('Asia/Jakarta')->startOfDay())
                ->orderBy('start_at')
                ->get()
                ->values();

            $this->assertSessionsEditable($sessionsToUpdate->pluck('id')->all());

            $occurrences = $this->buildOccurrences($validated, (int) ($validated['duration_minutes'] ?: $pilatesClass->duration));
            $this->assertNoConflicts($occurrences, (int) $validated['trainer_id'], $sessionsToUpdate->pluck('id')->all());

            DB::transaction(function () use ($validated, $occurrences, $sessionsToUpdate, $timetable) {
                $existingSessions = $sessionsToUpdate->values();
                $occurrenceItems = $occurrences->values();
                $syncCount = min($existingSessions->count(), $occurrenceItems->count());

                for ($index = 0; $index < $syncCount; $index++) {
                    $item = $existingSessions[$index];
                    $occurrence = $occurrenceItems[$index];

                    $item->update([
                        'pilates_class_id' => $validated['pilates_class_id'],
                        'trainer_id' => $validated['trainer_id'],
                        'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                        'capacity' => $validated['capacity'],
                        'duration_minutes' => $occurrence['duration_minutes'],
                        'price_override' => $validated['price_override'],
                        'credit_override' => $validated['credit_override'],
                        'allow_drop_in' => $validated['allow_drop_in'],
                        'status' => $validated['status'],
                        'admin_notes' => $validated['admin_notes'] ?? null,
                    ]);
                }

                if ($occurrenceItems->count() > $existingSessions->count()) {
                    foreach ($occurrenceItems->slice($existingSessions->count()) as $occurrence) {
                        PilatesTimetable::query()->create([
                            'parent_id' => $timetable->parent_id ?: $timetable->id,
                            'pilates_class_id' => $validated['pilates_class_id'],
                            'trainer_id' => $validated['trainer_id'],
                            'start_at' => $occurrence['start_at']->clone()->timezone('Asia/Jakarta'),
                            'capacity' => $validated['capacity'],
                            'duration_minutes' => $occurrence['duration_minutes'],
                            'price_override' => $validated['price_override'],
                            'credit_override' => $validated['credit_override'],
                            'allow_drop_in' => $validated['allow_drop_in'],
                            'status' => $validated['status'],
                            'admin_notes' => $validated['admin_notes'] ?? null,
                        ]);
                    }
                }

                if ($existingSessions->count() > $occurrenceItems->count()) {
                    $existingSessions->slice($occurrenceItems->count())->each(fn (PilatesTimetable $item) => $item->delete());
                }
            });

            $date = $occurrences->first()['start_at']->toDateString();
        } else {
            $this->assertSessionsEditable([$timetable->id]);

            $startAt = Carbon::parse($validated['start_at'], 'Asia/Jakarta');
            $endAt = $startAt->copy()->addMinutes((int) ($validated['duration_minutes'] ?: $pilatesClass->duration));

            $occurrences = collect([[
                'start_at' => $startAt,
                'end_at' => $endAt,
                'duration_minutes' => (int) ($validated['duration_minutes'] ?: $pilatesClass->duration),
            ]]);

            $this->assertNoConflicts($occurrences, (int) $validated['trainer_id'], [$timetable->id]);

            $timetable->update([
                'pilates_class_id' => $validated['pilates_class_id'],
                'trainer_id' => $validated['trainer_id'],
                'start_at' => $startAt->clone()->timezone('Asia/Jakarta'),
                'capacity' => $validated['capacity'],
                'duration_minutes' => (int) ($validated['duration_minutes'] ?: $pilatesClass->duration),
                'price_override' => $validated['price_override'],
                'credit_override' => $validated['credit_override'],
                'allow_drop_in' => $validated['allow_drop_in'],
                'status' => $validated['status'],
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]);

            $date = $startAt->toDateString();
        }

        return redirect()
            ->route('timetable.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Session berhasil diperbarui.');
    }

    public function destroy(PilatesTimetable $timetable): RedirectResponse
    {
        $this->assertSessionsEditable([$timetable->id]);

        $date = $timetable->start_at?->timezone('Asia/Jakarta')->toDateString();
        $timetable->delete();

        return redirect()
            ->route('timetable.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Session berhasil dihapus.');
    }

    private function buildOccurrences(array $validated, int $durationMinutes): Collection
    {
        $startDate = Carbon::parse($validated['start_date'], 'Asia/Jakarta')->startOfDay();
        $endDate = Carbon::parse($validated['end_date'], 'Asia/Jakarta')->startOfDay();

        // Mapping manual untuk mencocokkan hari Carbon ke Key Indonesia kamu
    $englishToIndo = [
        'monday' => 'senin', 'tuesday' => 'selasa', 'wednesday' => 'rabu',
        'thursday' => 'kamis', 'friday' => 'jumat', 'saturday' => 'sabtu', 'sunday' => 'minggu'
    ];

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
            $weekdayKey = $englishToIndo[strtolower($startDate->englishDayOfWeek)]; // Pakai mapping indo
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
            ->flatMap(function ($offset) use ($startDate, $schedules, $durationMinutes, $englishToIndo) {
                $date = $startDate->copy()->addDays($offset);
                $weekdayKey = $englishToIndo[strtolower($date->englishDayOfWeek)]; // Pakai mapping indo
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

    private function buildEditSchedules(Collection $sessions): array
    {

        
        $englishToIndo = [
        'monday' => 'senin', 'tuesday' => 'selasa', 'wednesday' => 'rabu',
        'thursday' => 'kamis', 'friday' => 'jumat', 'saturday' => 'sabtu', 'sunday' => 'minggu'
    ];

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

        foreach ($sessions as $item) {
            $startAt = $item->start_at?->clone()->timezone('Asia/Jakarta');
            $endAt = $startAt?->copy()->addMinutes((int) $item->duration_minutes);

            if (! $startAt || ! $endAt) {
                continue;
            }

            $weekdayKey = $englishToIndo[strtolower($startAt->englishDayOfWeek)];
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

        return collect($defaultSchedules)->map(fn (array $schedule) => [
            'active' => $schedule['active'],
            'slots' => count($schedule['slots']) > 0 ? array_values($schedule['slots']) : [[
                'start_hour' => '06',
                'start_minute' => '00',
                'end_hour' => '07',
                'end_minute' => '00',
            ]],
        ])->toArray();
    }

    private function assertNoConflicts(Collection $occurrences, int $trainerId, array $ignoreTimetableIds = []): void
    {

            if ($occurrences->isEmpty()) {
            return;
        }

        $minStart = $occurrences->min(fn ($occurrence) => $occurrence['start_at']);
        $maxEnd = $occurrences->max(fn ($occurrence) => $occurrence['end_at']);

        if (!$minStart || !$maxEnd) {
            return;
        }

        $rangeStart = $occurrences->min(fn ($occurrence) => $occurrence['start_at'])->clone()->timezone('Asia/Jakarta');
        $rangeEnd = $occurrences->max(fn ($occurrence) => $occurrence['end_at'])->clone()->timezone('Asia/Jakarta');

        $timetables = PilatesTimetable::query()
            ->when(! empty($ignoreTimetableIds), fn ($query) => $query->whereNotIn('id', $ignoreTimetableIds))
            ->where('start_at', '<', $rangeEnd)
            ->where('start_at', '>=', $rangeStart->copy()->subDay())
            ->get();

        $appointments = PilatesAppointment::query()
            ->with('trainers:id')
            ->where('start_at', '<', $rangeEnd)
            ->where('end_at', '>', $rangeStart)
            ->get();

        foreach ($occurrences as $occurrence) {
            $startAt = $occurrence['start_at'];
            $endAt = $occurrence['end_at'];

            $trainerTimetableConflict = $timetables->first(function (PilatesTimetable $session) use ($trainerId, $startAt, $endAt) {
                $existingStart = $session->start_at?->clone()->timezone('Asia/Jakarta');
                $existingEnd = $existingStart?->copy()->addMinutes((int) $session->duration_minutes);

                return (int) $session->trainer_id === $trainerId
                    && $existingStart
                    && $existingEnd
                    && $startAt->lt($existingEnd)
                    && $endAt->gt($existingStart);
            });

            $appointmentConflict = $appointments->first(function (PilatesAppointment $appointment) use ($startAt, $endAt, $trainerId) {
                $existingStart = $appointment->start_at?->clone()->timezone('Asia/Jakarta');
                $existingEnd = $appointment->end_at?->clone()->timezone('Asia/Jakarta');
                $appointmentTrainerIds = $appointment->trainers->pluck('id')
                    ->whenEmpty(fn ($collection) => collect([$appointment->trainer_id])->filter())
                    ->map(fn ($id) => (int) $id)
                    ->all();

                return in_array($trainerId, $appointmentTrainerIds, true)
                    && $existingStart
                    && $existingEnd
                    && $startAt->lt($existingEnd)
                    && $endAt->gt($existingStart);
            });

            if ($trainerTimetableConflict || $appointmentConflict) {
                throw ValidationException::withMessages([
                    'schedules' => 'Jadwal bentrok dengan timetable lain atau appointment trainer.',
                ]);
            }
        }
    }

    private function assertSessionsEditable(array $sessionIds): void
    {
        $hasBooking = PilatesBooking::query()
            ->whereIn('timetable_id', $sessionIds)
            ->exists();

        if ($hasBooking) {
            throw ValidationException::withMessages([
                'update_scope' => 'Session tidak dapat diubah karena sudah memiliki data booking pelanggan.',
            ]);
        }
    }
}
