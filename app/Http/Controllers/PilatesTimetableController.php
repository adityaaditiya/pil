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

    public function index(Request $request): Response
    {
        $selectedDate = $request->string('date')->toString();

        if (! $selectedDate) {
            $selectedDate = now('Asia/Jakarta')->toDateString();
        }

        $parsedDate = Carbon::createFromFormat('Y-m-d', $selectedDate, 'Asia/Jakarta');

        $sessions = PilatesTimetable::query()
            ->with([
                'pilatesClass:id,name,difficulty_level,duration,about,equipment,price,credit',
                'trainer:id,name',
            ])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn ($query) => $query->where('status', 'confirmed'),
            ])
            ->whereDate('start_at', $parsedDate->toDateString())
            ->orderBy('start_at')
            ->get()
            ->map(function (PilatesTimetable $session) {
                $remainingSlots = max(0, $session->capacity - $session->confirmed_bookings_count);

                return [
                    'id' => $session->id,
                    'status' => $session->status,
                    'start_at' => $session->start_at,
                    'start_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'end_at_label' => $session->start_at?->clone()->timezone('Asia/Jakarta')->addMinutes($session->duration_minutes ?: ($session->pilatesClass?->duration ?? 0))->format('H:i'),
                    'capacity' => $session->capacity,
                    'confirmed_bookings_count' => $session->confirmed_bookings_count,
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
            'selectedDate' => $parsedDate->toDateString(),
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
            ->route('timetable.index', ['date' => $session->start_at->timezone('Asia/Jakarta')->toDateString()])
            ->with('success', 'Session berhasil ditambahkan.');
    }
}
