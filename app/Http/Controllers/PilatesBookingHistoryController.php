<?php

namespace App\Http\Controllers;

use App\Models\PilatesBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PilatesBookingHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $invoice = trim((string) $request->string('invoice'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));

        $query = PilatesBooking::query()
            ->with([
                'user:id,name',
                'timetable:id,pilates_class_id,trainer_id,start_at',
                'timetable.pilatesClass:id,name',
                'timetable.trainer:id,name',
            ])
            ->latest('booked_at');

        if ($startDate) {
            $query->where('booked_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC'));
        }

        if ($endDate) {
            $query->where('booked_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC'));
        }

        if ($invoice !== '') {
            $query->where('invoice', 'like', '%' . strtoupper($invoice) . '%');
        }

        $bookings = $query
            ->paginate(10)
            ->withQueryString()
            ->through(function (PilatesBooking $booking) {
                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'booked_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'status' => $booking->status,
                    'participants' => $booking->participants,
                    'payment_type' => $booking->payment_type,
                    'payment_method' => $booking->payment_method,
                    'price_amount' => $booking->price_amount,
                    'customer' => $booking->user?->name,
                    'class_name' => $booking->timetable?->pilatesClass?->name,
                    'trainer_name' => $booking->timetable?->trainer?->name,
                    'schedule_at' => $booking->timetable?->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('Dashboard/Timetable/BookingHistory', [
            'bookings' => $bookings,
            'filters' => [
                'invoice' => $invoice,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
