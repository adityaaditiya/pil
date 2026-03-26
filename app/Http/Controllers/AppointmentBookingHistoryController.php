<?php

namespace App\Http\Controllers;

use App\Models\AppointmentBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentBookingHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $invoice = trim((string) $request->string('invoice'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));

        $query = AppointmentBooking::query()
            ->with([
                'customer:id,name',
                'appointment:id,pilates_class_id,start_at,end_at',
                'appointment.pilatesClass:id,name',
                'appointment.trainers:id,name',
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
            ->through(function (AppointmentBooking $booking) {
                return [
                    'id' => $booking->id,
                    'invoice' => $booking->invoice,
                    'booked_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'status' => $booking->status,
                    'payment_type' => $booking->payment_type,
                    'payment_method' => $booking->payment_method,
                    'price_amount' => $booking->price_amount,
                    'customer' => $booking->customer?->name,
                    'class_name' => $booking->appointment?->pilatesClass?->name,
                    'session_name' => $booking->session_name,
                    'trainer_names' => $booking->appointment?->trainers?->pluck('name')?->values() ?? [],
                    'schedule_at' => $booking->appointment?->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('Dashboard/Appointments/History', [
            'bookings' => $bookings,
            'filters' => [
                'invoice' => $invoice,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
