<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePilatesBookingRequest;
use App\Models\PilatesBooking;
use App\Models\PilatesTimetable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $bookings = PilatesBooking::query()
            ->with(['timetable.pilatesClass:id,name', 'timetable.trainer:id,name'])
            ->where('user_id', $request->user()->id)
            ->latest('booked_at')
            ->paginate(10);

        return Inertia::render('Dashboard/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function store(StorePilatesBookingRequest $request): JsonResponse|RedirectResponse
    {
        $timetable = PilatesTimetable::query()
            ->with(['pilatesClass:id,name,price,credit'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn ($query) => $query->where('status', 'confirmed'),
            ])
            ->findOrFail($request->integer('timetable_id'));

        if ($timetable->status !== 'scheduled') {
            throw ValidationException::withMessages([
                'timetable_id' => 'Sesi tidak tersedia untuk reservasi.',
            ]);
        }

        if ($timetable->confirmed_bookings_count >= $timetable->capacity) {
            throw ValidationException::withMessages([
                'timetable_id' => 'Slot sesi sudah penuh.',
            ]);
        }

        $alreadyBooked = PilatesBooking::query()
            ->where('user_id', $request->user()->id)
            ->where('timetable_id', $timetable->id)
            ->exists();

        if ($alreadyBooked) {
            throw ValidationException::withMessages([
                'timetable_id' => 'Anda sudah melakukan booking pada sesi ini.',
            ]);
        }

        $paymentType = $request->string('payment_type')->toString() ?: null;
        $priceAmount = $timetable->price_override ?? $timetable->pilatesClass?->price;
        $creditUsed = $timetable->credit_override ?? $timetable->pilatesClass?->credit;

        try {
            $booking = PilatesBooking::create([
                'user_id' => $request->user()->id,
                'timetable_id' => $timetable->id,
                'status' => 'confirmed',
                'booked_at' => now(),
                'payment_type' => $paymentType,
                'price_amount' => $priceAmount,
                'credit_used' => $creditUsed,
            ]);
        } catch (QueryException $exception) {
            throw ValidationException::withMessages([
                'timetable_id' => 'Anda sudah melakukan booking pada sesi ini.',
            ]);
        }

        $remainingSlots = max(0, $timetable->capacity - ($timetable->confirmed_bookings_count + 1));

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Booking confirmed',
                'booking_id' => $booking->id,
                'remaining_slots' => $remainingSlots,
            ]);
        }

        return back(303);
    }
}
