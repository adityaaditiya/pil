<?php

namespace App\Http\Controllers;

use App\Models\PilatesBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserScheduleController extends Controller
{
    /**
     * Display authenticated customer's booking schedule history.
     */
    public function index(Request $request): Response
    {
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));
        $status = trim((string) $request->string('status'));

        $bookings = PilatesBooking::query()
            ->with([
                'timetable.pilatesClass:id,name,image,difficulty_level,duration,equipment',
                'timetable.trainer:id,name',
            ])
            ->where('user_id', $request->user()->id)
            ->when($startDate !== '', fn ($query) => $query->whereHas('timetable', fn ($timetableQuery) => $timetableQuery->where('start_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC'))))
            ->when($endDate !== '', fn ($query) => $query->whereHas('timetable', fn ($timetableQuery) => $timetableQuery->where('start_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC'))))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'pending_payment' THEN 1 WHEN 'confirmed' THEN 2 WHEN 'active' THEN 2 ELSE 3 END")
            ->latest('booked_at')
            ->latest('id')
            ->get()
            ->map(function (PilatesBooking $booking) {
                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'status' => $booking->status,
                    'participants' => $booking->participants,
                    'payment_type' => $booking->payment_type,
                    'payment_proof_image' => $booking->payment_proof_image,
                    'booked_at' => optional($booking->booked_at)->toISOString(),
                    'schedule' => [
                        'id' => $booking->timetable?->id,
                        'start_at' => optional($booking->timetable?->start_at)->toISOString(),
                        'duration_minutes' => $booking->timetable?->duration_minutes,
                        'trainer_name' => $booking->timetable?->trainer?->name,
                        'class' => [
                            'name' => $booking->timetable?->pilatesClass?->name,
                            'image' => $booking->timetable?->pilatesClass?->image,
                            'difficulty_level' => $booking->timetable?->pilatesClass?->difficulty_level,
                            'duration' => $booking->timetable?->pilatesClass?->duration,
                            'equipment' => $booking->timetable?->pilatesClass?->equipment,
                        ],
                    ],
                ];
            })
            ->values();

        return Inertia::render('User/MySchedule', [
            'bookings' => $bookings,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }
}
