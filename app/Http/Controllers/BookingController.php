<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePilatesBookingRequest;
use App\Models\Customer;
use App\Models\PaymentSetting;
use App\Models\PilatesBooking;
use App\Models\PilatesTimetable;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function create(Request $request): Response
    {
        $timetable = PilatesTimetable::query()
            ->with(['pilatesClass:id,name,price,credit,duration,difficulty_level', 'trainer:id,name'])
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->findOrFail($request->integer('timetable_id'));

        $bookedSlots = (int) ($timetable->booked_slots ?? 0);
        $remainingSlots = max(0, $timetable->capacity - $bookedSlots);

        $customers = Customer::query()
            ->select('id', 'user_id', 'name', 'no_telp', 'address', 'credit')
            ->latest()
            ->take(30)
            ->get();

        $paymentSetting = PaymentSetting::first();

        return Inertia::render('Dashboard/Timetable/Booking', [
            'session' => [
                'id' => $timetable->id,
                'status' => $timetable->status,
                'class_name' => $timetable->pilatesClass?->name,
                'trainer_name' => $timetable->trainer?->name,
                'start_at_label' => $timetable->start_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                'end_at_label' => $timetable->start_at?->clone()->timezone('Asia/Jakarta')->addMinutes($timetable->duration_minutes ?: ($timetable->pilatesClass?->duration ?? 0))->format('H:i'),
                'price' => $timetable->price_override ?? $timetable->pilatesClass?->price,
                'credit' => $timetable->credit_override ?? $timetable->pilatesClass?->credit,
                'capacity' => $timetable->capacity,
                'remaining_slots' => $remainingSlots,
                'difficulty_level' => $timetable->pilatesClass?->difficulty_level,
            ],
            'customers' => $customers,
            'paymentGateways' => $paymentSetting?->enabledGateways() ?? [],
        ]);
    }

    public function store(StorePilatesBookingRequest $request): RedirectResponse
    {
        $timetable = PilatesTimetable::query()
            ->with(['pilatesClass:id,name,price,credit'])
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->findOrFail($request->integer('timetable_id'));

        if ($timetable->status !== 'scheduled') {
            throw ValidationException::withMessages([
                'timetable_id' => 'Sesi tidak tersedia untuk reservasi.',
            ]);
        }

        $customer = Customer::query()->findOrFail($request->integer('customer_id'));

        if (! $customer->user_id) {
            throw ValidationException::withMessages([
                'customer_id' => 'Pelanggan ini belum terhubung ke akun user.',
            ]);
        }

        $participants = $request->integer('participants');
        $bookedSlots = (int) ($timetable->booked_slots ?? 0);
        $remainingSlots = max(0, $timetable->capacity - $bookedSlots);

        if ($participants > $remainingSlots) {
            throw ValidationException::withMessages([
                'participants' => 'Jumlah peserta melebihi sisa slot kelas.',
            ]);
        }

        $alreadyBooked = PilatesBooking::query()
            ->where('user_id', $customer->user_id)
            ->where('timetable_id', $timetable->id)
            ->exists();

        if ($alreadyBooked) {
            throw ValidationException::withMessages([
                'customer_id' => 'Pelanggan sudah melakukan booking pada sesi ini.',
            ]);
        }

        $paymentType = $request->string('payment_type')->toString();
        $paymentMethod = $paymentType === 'credit' ? 'credits' : ($request->string('payment_method')->toString() ?: 'cash');

        $priceAmount = (float) ($timetable->price_override ?? $timetable->pilatesClass?->price ?? 0);
        $creditUsed = (float) ($timetable->credit_override ?? $timetable->pilatesClass?->credit ?? 0);

        if ($paymentType === 'credit') {
            $neededCredits = $creditUsed * $participants;
            if ((float) $customer->credit < $neededCredits) {
                throw ValidationException::withMessages([
                    'payment_type' => 'Credit pelanggan tidak cukup untuk jumlah peserta yang dipilih.',
                ]);
            }
        }

        try {
            DB::transaction(function () use ($customer, $timetable, $participants, $paymentType, $paymentMethod, $priceAmount, $creditUsed) {
                PilatesBooking::create([
                    'user_id' => $customer->user_id,
                    'timetable_id' => $timetable->id,
                    'participants' => $participants,
                    'status' => 'confirmed',
                    'booked_at' => now(),
                    'payment_type' => $paymentType,
                    'payment_method' => $paymentMethod,
                    'price_amount' => $paymentType === 'drop_in' ? $priceAmount * $participants : 0,
                    'credit_used' => $paymentType === 'credit' ? $creditUsed * $participants : 0,
                ]);

                if ($paymentType === 'credit') {
                    $customer->decrement('credit', $creditUsed * $participants);
                }
            });
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'customer_id' => 'Pelanggan sudah melakukan booking pada sesi ini.',
            ]);
        }

        return redirect()
            ->route('timetable.index', ['date' => $timetable->start_at?->timezone('Asia/Jakarta')->toDateString()])
            ->with('success', 'Booking berhasil disimpan.');
    }
}
