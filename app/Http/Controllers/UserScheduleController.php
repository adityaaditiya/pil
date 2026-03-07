<?php

namespace App\Http\Controllers;

use App\Models\PilatesBooking;
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
        $bookings = PilatesBooking::query()
            ->with([
                'timetable.pilatesClass:id,name,image,difficulty_level,duration,equipment',
                'timetable.trainer:id,name',
            ])
            ->where('user_id', $request->user()->id)
            ->latest('booked_at')
            ->latest('id')
            ->get()
            ->map(function (PilatesBooking $booking) {
                return [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'participants' => $booking->participants,
                    'payment_type' => $booking->payment_type,
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
        ]);
    }
}
