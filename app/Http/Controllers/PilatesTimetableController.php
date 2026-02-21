<?php

namespace App\Http\Controllers;

use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PilatesTimetableController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Timetable/Create', [
            'classes' => PilatesClass::query()->select('id', 'name')->orderBy('name')->get(),
            'trainers' => Trainer::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function edit(PilatesTimetable $timetable): Response
    {
        return Inertia::render('Timetable/Edit', [
            'classes' => PilatesClass::query()->select('id', 'name')->orderBy('name')->get(),
            'trainers' => Trainer::query()->select('id', 'name')->orderBy('name')->get(),
            'session' => [
                'id' => $timetable->id,
                'pilates_class_id' => $timetable->pilates_class_id,
                'trainer_id' => $timetable->trainer_id,
                'start_at' => $timetable->start_at?->timezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
                'capacity' => $timetable->capacity,
                'status' => $timetable->status,
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
                'pilatesClass:id,name,difficulty_level,duration,about,equipment,price,credit',
                'trainer:id,name',
            ])
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->whereBetween('start_at', [$startDate->clone()->timezone('UTC'), $endDate->clone()->timezone('UTC')])
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesTimetable $session) {
                $bookedSlots = (int) ($session->booked_slots ?? 0);
                $remainingSlots = max(0, $session->capacity - $bookedSlots);

                return [
                    'id' => $session->id,
                    'status' => $session->status,
                    'start_at' => $session->start_at,
                    'start_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'end_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->addMinutes($session->duration_minutes ?: ($session->pilatesClass?->duration ?? 0))->format('H:i'),
                    'capacity' => $session->capacity,
                    'confirmed_bookings_count' => $bookedSlots,
                    'remaining_slots' => $remainingSlots,
                    'duration_minutes' => $session->duration_minutes ?: $session->pilatesClass?->duration,
                    'price_drop_in' => $session->price_override ?? $session->pilatesClass?->price,
                    'credit_membership' => $session->credit_override ?? $session->pilatesClass?->credit,
                    'trainer' => [
                        'name' => $session->trainer?->name,
                    ],
                    'class' => [
                        'name' => $session->pilatesClass?->name,
                        'level' => $session->pilatesClass?->difficulty_level,
                        'about' => $session->pilatesClass?->about,
                        'equipment' => $session->pilatesClass?->equipment,
                        'duration' => $session->pilatesClass?->duration,
                        'price_default' => $session->pilatesClass?->price,
                        'credit_default' => $session->pilatesClass?->credit,
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
            'start_at' => ['required', 'date'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:scheduled,cancelled,closed'],
        ]);

        $session = PilatesTimetable::query()->create($validated);

        return redirect()
            ->route('timetable.index', ['start_date' => $session->start_at->timezone('Asia/Jakarta')->toDateString(), 'end_date' => $session->start_at->timezone('Asia/Jakarta')->toDateString()])
            ->with('success', 'Session berhasil ditambahkan.');
    }

    public function update(Request $request, PilatesTimetable $timetable): RedirectResponse
    {
        $validated = $request->validate([
            'pilates_class_id' => ['required', 'exists:pilates_classes,id'],
            'trainer_id' => ['required', 'exists:trainers,id'],
            'start_at' => ['required', 'date'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:scheduled,cancelled,closed'],
        ]);

        $timetable->update($validated);

        $date = $timetable->start_at?->timezone('Asia/Jakarta')->toDateString();

        return redirect()
            ->route('timetable.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Session berhasil diperbarui.');
    }

    public function destroy(PilatesTimetable $timetable): RedirectResponse
    {
        $date = $timetable->start_at?->timezone('Asia/Jakarta')->toDateString();
        $timetable->delete();

        return redirect()
            ->route('timetable.index', ['start_date' => $date, 'end_date' => $date])
            ->with('success', 'Session berhasil dihapus.');
    }
}
