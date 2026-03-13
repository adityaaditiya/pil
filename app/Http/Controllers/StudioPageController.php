<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\Customer;
use App\Models\PilatesBooking;
use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use App\Models\PaymentSetting;
use App\Models\StudioPage;
use App\Models\Trainer;
use App\Models\UserMembership;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudioPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/StudioPages/Index', [
            'studioPages' => StudioPage::when(request()->search, function ($query) {
                $query->where('name', 'like', '%' . request()->search . '%')
                    ->orWhere('title', 'like', '%' . request()->search . '%');
            })->orderBy('id')->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/StudioPages/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:255|alpha_dash|unique:studio_pages,key',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        StudioPage::create($request->only(['name', 'key', 'title', 'content']));

        return to_route('studio-pages.index');
    }

    public function edit(StudioPage $studioPage): Response
    {
        return Inertia::render('Dashboard/StudioPages/Edit', [
            'studioPage' => $studioPage,
        ]);
    }

    public function update(Request $request, StudioPage $studioPage): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:255|alpha_dash|unique:studio_pages,key,' . $studioPage->id,
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $studioPage->update($request->only(['name', 'key', 'title', 'content']));

        return to_route('studio-pages.index');
    }

    public function destroy(StudioPage $studioPage): RedirectResponse
    {
        $studioPage->delete();

        return to_route('studio-pages.index');
    }

    public function showByKey(string $key): Response
    {
        $normalizedKey = $key === 'trainer' ? 'trainers' : $key;

        $page = StudioPage::where('key', $normalizedKey)->first();
        $menuItems = StudioPage::orderBy('id')->get(['name', 'key']);

        return Inertia::render('WelcomeSection', [
            'page' => $page,
            'pageKey' => $normalizedKey,
            'menuItems' => $menuItems,
            'initialFilters' => [
                'className' => request()->string('class_name')->toString(),
                'difficulty' => request()->string('difficulty')->toString(),
                'trainer' => request()->string('trainer')->toString(),
                'classCategory' => request()->string('class_category')->toString(),
            ],
            'classes' => $normalizedKey === 'classes'
                ? PilatesClass::with(['trainers:id,name', 'classCategory:id,name'])->latest()->get(['id', 'class_category_id', 'image', 'name', 'duration', 'difficulty_level', 'about', 'equipment', 'price'])
                : [],
            'schedules' => $normalizedKey === 'schedule'
                ? PilatesTimetable::with([
                    'pilatesClass:id,class_category_id,name,image,difficulty_level',
                    'pilatesClass.classCategory:id,name',
                    'trainer:id,name',
                ])
                    ->where('status', 'scheduled')
                    ->orderBy('start_at')
                    ->get(['id', 'pilates_class_id', 'trainer_id', 'start_at', 'capacity', 'duration_minutes', 'price_override', 'allow_drop_in'])
                : [],
            'memberships' => $normalizedKey === 'pricing'
                ? MembershipPlan::where('is_active', true)
                    ->orderBy('price')
                    ->get(['id', 'name', 'credits', 'price', 'valid_days', 'description'])
                : [],
            'trainers' => $normalizedKey === 'trainers'
                ? Trainer::latest()->get(['id', 'name', 'photo', 'age', 'gender', 'address', 'biodata'])
                : [],
        ]);
    }

    public function showClassDetail(PilatesClass $pilatesClass): Response
    {
        $menuItems = StudioPage::orderBy('id')->get(['name', 'key']);

        return Inertia::render('WelcomeClassDetail', [
            'menuItems' => $menuItems,
            'classItem' => $pilatesClass->load(['classCategory:id,name', 'trainers:id,name,photo,gender,age,address,biodata']),
        ]);
    }

    public function showScheduleDetail(PilatesTimetable $pilatesTimetable): Response
    {
        $menuItems = StudioPage::orderBy('id')->get(['name', 'key']);
        $schedule = $pilatesTimetable->load([
            'pilatesClass:id,class_category_id,image,name,duration,difficulty_level,about,equipment,price',
            'pilatesClass.classCategory:id,name',
            'trainer:id,name,photo,gender,age,address,biodata',
        ]);

        return Inertia::render('WelcomeScheduleDetail', [
            'menuItems' => $menuItems,
            'schedule' => $schedule,
        ]);
    }

    public function showSchedulePayment(PilatesTimetable $pilatesTimetable): Response
    {
        $this->expirePendingBookings($pilatesTimetable->id);
        $schedule = $pilatesTimetable
            ->load(['pilatesClass:id,name,image', 'trainer:id,name'])
            ->loadSum(['bookings as booked_slots' => fn ($query) => $this->bookingSlotsQuery($query)], 'participants');
        $bookedSlots = (int) ($schedule->booked_slots ?? 0);
        $remainingSlots = max(0, ((int) $schedule->capacity) - $bookedSlots);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

        $customer = Customer::query()
            ->where('user_id', Auth::id())
            ->first(['id', 'credit']);

        $alreadyBooked = PilatesBooking::query()
            ->where('user_id', Auth::id())
            ->where('timetable_id', $schedule->id)
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->exists();

        $availableMemberships = UserMembership::query()
            ->with(['plan.classRules' => fn ($query) => $query->where('pilates_class_id', $schedule->pilates_class_id)])
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->where('credits_remaining', '>', 0)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get()
            ->filter(fn (UserMembership $membership) => $membership->plan?->classRules->contains('pilates_class_id', $schedule->pilates_class_id))
            ->map(function (UserMembership $membership) {
                $rule = $membership->plan?->classRules->first();

                return [
                    'id' => $membership->id,
                    'plan_name' => $membership->plan?->name,
                    'credits_remaining' => $membership->credits_remaining,
                    'credit_cost' => $rule?->credit_cost ?? 1,
                ];
            })
            ->values();

        return Inertia::render('WelcomeSchedulePayment', [
            'schedule' => $schedule,
            'paymentGateways' => $paymentGateways,
            'customerCredit' => (int) ($customer?->credit ?? 0),
            'availableMemberships' => $availableMemberships,
            'remainingSlots' => $remainingSlots,
            'alreadyBooked' => $alreadyBooked,
        ]);
    }


    public function showDropInCheckout(Request $request, PilatesTimetable $pilatesTimetable): Response|RedirectResponse
    {
        $this->expirePendingBookings($pilatesTimetable->id);
        $schedule = $pilatesTimetable
            ->load(['pilatesClass:id,name,image', 'trainer:id,name'])
            ->loadSum(['bookings as booked_slots' => fn ($query) => $this->bookingSlotsQuery($query)], 'participants');
        $bookedSlots = (int) ($schedule->booked_slots ?? 0);
        $remainingSlots = max(0, ((int) $schedule->capacity) - $bookedSlots);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

        $bookingId = (int) $request->integer('booking_id');
        $booking = PilatesBooking::query()
            ->where('id', $bookingId)
            ->where('user_id', Auth::id())
            ->where('timetable_id', $schedule->id)
            ->where('payment_type', 'drop_in')
            ->where('status', 'pending')
            ->first();
        $selectedGateway = $paymentGateways->firstWhere('value', $booking?->payment_method);
        $checkoutRemainingSlots = $remainingSlots + (int) ($booking?->participants ?? 0);

        if (! $schedule->allow_drop_in || ! $booking || ! $selectedGateway || $checkoutRemainingSlots < 1) {
            return to_route('welcome.schedule-payment', $schedule->id);
        }

        return Inertia::render('WelcomeScheduleDropInCheckout', [
            'schedule' => $schedule,
            'booking' => [
                'id' => $booking->id,
                'invoice' => $booking->invoice,
                'payment_proof_image' => $booking->payment_proof_image,
                'expired_at' => $booking->expired_at?->toISOString(),
            ],
            'selectedGateway' => $selectedGateway,
            'participants' => min((int) $booking->participants, $checkoutRemainingSlots),
            'remainingSlots' => $checkoutRemainingSlots,
            'paymentInstructions' => [
                'qris_full_name' => $paymentSetting?->qris_full_name,
                'qris_image' => $paymentSetting?->qris_image,
                'bank_name' => $paymentSetting?->bank_name,
                'bank_account_name' => $paymentSetting?->bank_account_name,
                'bank_account_number' => $paymentSetting?->bank_account_number,
            ],
        ]);
    }

    public function processSchedulePayment(Request $request, PilatesTimetable $pilatesTimetable): RedirectResponse
    {
        $this->expirePendingBookings($pilatesTimetable->id);
        $data = $request->validate([
            'payment_type' => ['required', 'in:credit,drop_in'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'membership_id' => ['nullable', 'integer'],
            'participants' => ['nullable', 'integer', 'min:1'],
        ]);

        $timetable = PilatesTimetable::query()
            ->with(['pilatesClass:id,name'])
            ->withSum(['bookings as booked_slots' => fn ($query) => $this->bookingSlotsQuery($query)], 'participants')
            ->findOrFail($pilatesTimetable->id);

        if ($timetable->status !== 'scheduled') {
            throw ValidationException::withMessages([
                'payment_type' => 'Sesi tidak tersedia untuk reservasi.',
            ]);
        }

        $bookedSlots = (int) ($timetable->booked_slots ?? 0);
        $remainingSlots = max(0, ((int) $timetable->capacity) - $bookedSlots);
        $participants = (int) ($data['participants'] ?? 1);
        if ($remainingSlots < 1 || $participants > $remainingSlots) {
            throw ValidationException::withMessages([
                'participants' => 'Slot kelas tidak mencukupi jumlah peserta yang dipilih.',
            ]);
        }

        $customer = Customer::query()
            ->where('user_id', Auth::id())
            ->first();

        if (! $customer) {
            throw ValidationException::withMessages([
                'payment_type' => 'Akun Anda belum terhubung dengan data customer.',
            ]);
        }

        $alreadyBooked = PilatesBooking::query()
            ->where('user_id', Auth::id())
            ->where('timetable_id', $timetable->id)
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->exists();

        if ($alreadyBooked) {
            throw ValidationException::withMessages([
                'payment_type' => 'Anda sudah melakukan booking untuk sesi ini.',
            ]);
        }

        $paymentType = $data['payment_type'];

        if (! $timetable->allow_drop_in && $paymentType === 'drop_in') {
            throw ValidationException::withMessages([
                'payment_type' => 'Sesi ini hanya menerima pembayaran credit.',
            ]);
        }

        if ($paymentType === 'drop_in') {
            $paymentSetting = PaymentSetting::first();
            $availableGatewayValues = collect($paymentSetting?->enabledGateways() ?? [])
                ->pluck('value')
                ->map(fn ($value) => strtolower((string) $value));

            if (! $availableGatewayValues->contains(strtolower((string) ($data['payment_method'] ?? '')))) {
                throw ValidationException::withMessages([
                    'payment_method' => 'Metode pembayaran drop-in tidak tersedia.',
                ]);
            }
        }

        $paymentMethod = $paymentType === 'credit' ? 'credits' : ($data['payment_method'] ?? 'manual_transfer');
        $priceAmount = (float) (($timetable->price_override ?? 0) * $participants);
        $creditUsed = (float) ($timetable->credit_override ?? 0);
        $selectedMembership = null;

        if ($paymentType === 'credit') {
            $eligibleMemberships = UserMembership::query()
                ->with(['plan.classRules' => fn ($query) => $query->where('pilates_class_id', $timetable->pilates_class_id)])
                ->where('user_id', Auth::id())
                ->where('status', 'active')
                ->where('credits_remaining', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->get()
                ->filter(fn (UserMembership $membership) => $membership->plan?->classRules->contains('pilates_class_id', $timetable->pilates_class_id));

            $selectedMembershipId = isset($data['membership_id']) ? (int) $data['membership_id'] : null;
            $selectedMembership = $selectedMembershipId
                ? $eligibleMemberships->firstWhere('id', $selectedMembershipId)
                : $eligibleMemberships->first();
            $rule = $selectedMembership?->plan?->classRules?->first();

            if (! $selectedMembership || ! $rule) {
                throw ValidationException::withMessages([
                    'membership_id' => 'Pilih membership aktif yang valid untuk kelas ini.',
                ]);
            }

            $creditUsed = (float) (($rule->credit_cost ?? 1) * $participants);
            if ((int) $selectedMembership->credits_remaining < (int) $creditUsed) {
                throw ValidationException::withMessages([
                    'membership_id' => 'Credit membership tidak cukup.',
                ]);
            }
        }

        try {
            $booking = DB::transaction(function () use ($timetable, $paymentType, $paymentMethod, $priceAmount, $creditUsed, $selectedMembership, $participants) {
                $booking = PilatesBooking::create([
                    'user_id' => Auth::id(),
                    'timetable_id' => $timetable->id,
                    'participants' => $participants,
                    'user_membership_id' => $selectedMembership?->id,
                    'membership_plan_id' => $selectedMembership?->membership_plan_id,
                    'status' => $paymentType === 'drop_in' ? 'pending' : 'confirmed',
                    'booked_at' => now(),
                    'payment_type' => $paymentType,
                    'payment_method' => $paymentMethod,
                    'price_amount' => $paymentType === 'drop_in' ? $priceAmount : 0,
                    'credit_used' => $paymentType === 'credit' ? $creditUsed : 0,
                    'expired_at' => $paymentType === 'drop_in' ? Carbon::now()->addMinutes(15) : null,
                ]);

                if ($paymentType === 'credit' && $selectedMembership) {
                    $selectedMembership->decrement('credits_remaining', (int) $creditUsed);
                }

                return $booking;
            });
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'payment_type' => 'Anda sudah melakukan booking untuk sesi ini.',
            ]);
        }

        if ($paymentType === 'drop_in') {
            return to_route('welcome.schedule-payment.drop-in-checkout', [
                'pilatesTimetable' => $timetable->id,
                'booking_id' => $booking->id,
            ]);
        }

        return back()->with('success', 'Transaksi selesai. Booking berhasil dibuat.');
    }

    public function uploadDropInPaymentProof(Request $request, PilatesBooking $booking): RedirectResponse
    {
        $this->expirePendingBookings($booking->timetable_id);
        $booking->refresh();
        if ((int) $booking->user_id !== (int) Auth::id() || $booking->status !== 'pending' || $booking->payment_type !== 'drop_in') {
            return to_route('welcome.page', 'schedule')->withErrors(['payment_proof' => 'Transaksi tidak ditemukan atau sudah tidak aktif.']);
        }

        $data = $request->validate([
            'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $storedPath = $data['payment_proof']->store('booking-payment-proofs', 'public');

        if ($booking->payment_proof_image) {
            Storage::disk('public')->delete($booking->payment_proof_image);
        }

        $booking->update([
            'payment_proof_image' => $storedPath,
        ]);

        return back()->with('success', 'Foto bukti pembayaran berhasil diupload. Menunggu konfirmasi admin.');
    }

    public function cancelDropInTransaction(PilatesBooking $booking): RedirectResponse
    {
        $this->expirePendingBookings($booking->timetable_id);
        $booking->refresh();
        if ((int) $booking->user_id !== (int) Auth::id() || $booking->status !== 'pending' || $booking->payment_type !== 'drop_in') {
            return to_route('welcome.page', 'schedule')->withErrors(['payment_proof' => 'Transaksi tidak ditemukan atau sudah tidak aktif.']);
        }

        if ($booking->payment_proof_image) {
            Storage::disk('public')->delete($booking->payment_proof_image);
        }

        $booking->update([
            'status' => 'cancelled',
            'payment_proof_image' => null,
        ]);

        return to_route('welcome.schedule-payment', $booking->timetable_id)->with('success', 'Transaksi berhasil dibatalkan.');
    }
    private function expirePendingBookings(?int $timetableId = null): void
    {
        $query = PilatesBooking::query()
            ->where('status', 'pending')
            ->where('payment_type', 'drop_in')
            ->where(function ($builder) {
                $builder
                    ->where('expired_at', '<=', now())
                    ->orWhere(function ($fallback) {
                        $fallback->whereNull('expired_at')->where('created_at', '<=', now()->subMinutes(15));
                    });
            });

        if ($timetableId) {
            $query->where('timetable_id', $timetableId);
        }

        $query->update([
            'status' => 'expired',
        ]);
    }

    private function bookingSlotsQuery($query)
    {
        $query->where('status', 'confirmed')
            ->orWhere(function ($pendingQuery) {
                $pendingQuery
                    ->where('status', 'pending')
                    ->where('payment_type', 'drop_in')
                    ->where(function ($activePending) {
                        $activePending
                            ->where('expired_at', '>', now())
                            ->orWhere(function ($fallbackPending) {
                                $fallbackPending->whereNull('expired_at')->where('created_at', '>', now()->subMinutes(15));
                            });
                    });
            });
    }

}
