<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\Customer;
use App\Models\AppointmentSession;
use App\Models\PilatesBooking;
use App\Models\PilatesAppointment;
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
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudioPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/StudioPages/Index', [
            'studioPages' => StudioPage::where('key', '!=', 'about')->when(request()->search, function ($query) {
                $query->where(function ($subQuery) {
                    $subQuery->where('name', 'like', '%' . request()->search . '%')
                        ->orWhere('title', 'like', '%' . request()->search . '%');
                });
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
        $appointmentData = $normalizedKey === 'appointment'
            ? $this->buildAppointmentLandingData()
            : [
                'appointmentSlots' => collect(),
                'appointmentSessionOptions' => collect(),
            ];

        $page = StudioPage::where('key', $normalizedKey)->first();
        $menuItems = StudioPage::where('key', '!=', 'about')->orderBy('id')->get(['name', 'key']);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

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
            'schedules' => in_array($normalizedKey, ['schedule', 'appointment'], true)
                ? PilatesTimetable::with([
                    'pilatesClass:id,class_category_id,name,image,difficulty_level,about,available_for_appointment',
                    'pilatesClass.classCategory:id,name',
                    'trainer:id,name',
                ])
                    ->where('status', 'scheduled')
                    ->when($normalizedKey === 'appointment', fn ($query) => $query->whereHas('pilatesClass', fn ($classQuery) => $classQuery->where('available_for_appointment', true)))
                    ->orderBy('start_at')
                    ->get(['id', 'pilates_class_id', 'trainer_id', 'start_at', 'capacity', 'duration_minutes', 'price_override', 'allow_drop_in'])
                : [],
            'memberships' => $normalizedKey === 'pricing'
                ? MembershipPlan::with(['classes:id,name'])
                    ->where('is_active', true)
                    ->orderBy('price')
                    ->get(['id', 'name', 'credits', 'price', 'valid_days', 'description'])
                : [],
            'trainers' => in_array($normalizedKey, ['trainers', 'appointment'], true)
                ? Trainer::query()->forTrainerRole()->latest()->get(['id', 'name', 'photo', 'gender', 'date_of_birth', 'expertise', 'address', 'biodata'])
                : [],
            'paymentGateways' => $normalizedKey === 'appointment' ? $paymentGateways : [],
            'appointmentClasses' => $normalizedKey === 'appointment'
                ? PilatesClass::query()
                    ->where('available_for_appointment', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'about'])
                : [],
            'appointmentSlots' => $appointmentData['appointmentSlots'],
            'appointmentSessionOptions' => $appointmentData['appointmentSessionOptions'],
        ]);
    }

    private function buildAppointmentLandingData(): array
    {
        $timezone = 'Asia/Jakarta';
        $appointments = PilatesAppointment::query()
            ->with([
                'pilatesClass:id,name',
                'trainers:id,name',
            ])
            ->withCount([
                'bookings as active_bookings_count' => fn ($query) => $query->whereIn('status', ['pending', 'pending_payment', 'confirmed']),
            ])
            ->where('start_at', '>=', now($timezone)->startOfDay())
            ->orderBy('start_at')
            ->get(['id', 'pilates_class_id', 'session_options', 'start_at', 'end_at', 'duration_minutes']);

        $sessionIds = $appointments
            ->pluck('session_options')
            ->flatten(1)
            ->pluck('appointment_session_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $sessionMap = AppointmentSession::query()
            ->whereIn('id', $sessionIds)
            ->get(['id', 'session_name', 'description'])
            ->keyBy('id');

        $appointmentSlots = $appointments->map(function (PilatesAppointment $appointment) use ($sessionMap, $timezone) {
            $slotStart = $appointment->start_at?->copy()->timezone($timezone);

            return [
                'id' => $appointment->id,
                'date_key' => $slotStart?->toDateString(),
                'start_time' => $slotStart?->format('H:i'),
                'start_at_label' => $slotStart?->format('d M Y, H:i'),
                'duration_minutes' => $appointment->duration_minutes,
                'pilates_class_id' => (string) $appointment->pilates_class_id,
                'pilates_class_name' => $appointment->pilatesClass?->name,
                'trainer_ids' => $appointment->trainers->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                'trainer_names' => $appointment->trainers->pluck('name')->values()->all(),
                'is_available' => ((int) $appointment->active_bookings_count) === 0,
                'session_options' => collect($appointment->session_options ?? [])->map(function (array $option) use ($sessionMap) {
                    $sessionId = (int) ($option['appointment_session_id'] ?? 0);
                    $master = $sessionMap->get($sessionId);

                    return [
                        'appointment_session_id' => (string) $sessionId,
                        'session_name' => $master?->session_name ?? ($option['session_name'] ?? ''),
                        'description' => $master?->description,
                        'price_drop_in' => (float) ($option['price_drop_in'] ?? $option['price'] ?? 0),
                        'payment_method' => $option['payment_method'] ?? 'allow_drop_in',
                    ];
                })->filter(fn (array $option) => filled($option['session_name']))->values()->all(),
            ];
        })->values();

        $appointmentSessionOptions = $appointmentSlots
            ->pluck('session_options')
            ->flatten(1)
            ->groupBy('appointment_session_id')
            ->map(function (Collection $items, string $sessionId) {
                $prices = $items->pluck('price_drop_in')->map(fn ($price) => (float) $price)->filter(fn ($price) => $price > 0)->unique()->sort()->values();

                return [
                    'id' => $sessionId,
                    'name' => $items->first()['session_name'] ?? 'Session',
                    'description' => $items->first()['description'] ?? '',
                    'payment_methods' => $items->pluck('payment_method')->filter()->unique()->values()->all(),
                    'price_min' => $prices->first() ?? 0,
                    'price_max' => $prices->last() ?? 0,
                ];
            })
            ->sortBy('name')
            ->values();

        return [
            'appointmentSlots' => $appointmentSlots,
            'appointmentSessionOptions' => $appointmentSessionOptions,
        ];
    }

    public function showClassDetail(PilatesClass $pilatesClass): Response
    {
        $menuItems = StudioPage::where('key', '!=', 'about')->orderBy('id')->get(['name', 'key']);

        return Inertia::render('WelcomeClassDetail', [
            'menuItems' => $menuItems,
            'classItem' => $pilatesClass->load(['classCategory:id,name', 'trainers:id,name,photo,gender,date_of_birth,expertise,address,biodata']),
        ]);
    }

    public function showScheduleDetail(PilatesTimetable $pilatesTimetable): Response
    {
        $menuItems = StudioPage::where('key', '!=', 'about')->orderBy('id')->get(['name', 'key']);
        $schedule = $pilatesTimetable->load([
            'pilatesClass:id,class_category_id,image,name,duration,difficulty_level,about,equipment,price',
            'pilatesClass.classCategory:id,name',
            'trainer:id,name,photo,gender,date_of_birth,expertise,address,biodata',
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


    public function showMembershipDetail(MembershipPlan $membershipPlan): Response|RedirectResponse
    {
        abort_if(! $membershipPlan->is_active, 404);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

        return Inertia::render('WelcomeMembershipDetail', [
            'plan' => $membershipPlan->load(['classes:id,name']),
            'paymentGateways' => $paymentGateways,
        ]);
    }

    public function showMembershipCheckout(Request $request, MembershipPlan $membershipPlan): Response|RedirectResponse
    {
        abort_if(! $membershipPlan->is_active, 404);
        $this->expirePendingMemberships($request->user()->id);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

        $membershipId = (int) $request->integer('membership_id');
        $membership = UserMembership::query()
            ->where('id', $membershipId)
            ->where('user_id', Auth::id())
            ->where('membership_plan_id', $membershipPlan->id)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->first();
        $selectedGateway = $paymentGateways->firstWhere('value', $membership?->payment_method);

        if (! $membership || ! $selectedGateway) {
            return to_route('welcome.membership-detail', $membershipPlan->id);
        }

        return Inertia::render('WelcomeMembershipCheckout', [
            'plan' => $membershipPlan->load(['classes:id,name']),
            'membership' => [
                'id' => $membership->id,
                'invoice' => $membership->invoice,
                'payment_proof_image' => $membership->payment_proof_image,
                'expired_at' => $membership->expired_at?->toISOString(),
                'status' => $membership->status,
            ],
            'selectedGateway' => $selectedGateway,
            'paymentInstructions' => [
                'qris_full_name' => $paymentSetting?->qris_full_name,
                'qris_image' => $paymentSetting?->qris_image,
                'bank_name' => $paymentSetting?->bank_name,
                'bank_account_name' => $paymentSetting?->bank_account_name,
                'bank_account_number' => $paymentSetting?->bank_account_number,
            ],
        ]);
    }

    public function processMembershipCheckout(Request $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        abort_if(! $membershipPlan->is_active, 404);
        $this->expirePendingMemberships($request->user()->id);

        $data = $request->validate([
            'payment_method' => ['required', 'string', 'max:50'],
        ]);

        $paymentSetting = PaymentSetting::first();
        $availableGatewayValues = collect($paymentSetting?->enabledGateways() ?? [])
            ->reject(fn ($gateway) => strtolower((string) ($gateway['value'] ?? '')) === 'cash')
            ->pluck('value')
            ->map(fn ($value) => strtolower((string) $value));

        if (! $availableGatewayValues->contains(strtolower((string) $data['payment_method']))) {
            throw ValidationException::withMessages([
                'payment_method' => 'Metode pembayaran membership tidak tersedia.',
            ]);
        }

        $membership = UserMembership::query()
            ->where('user_id', $request->user()->id)
            ->where('membership_plan_id', $membershipPlan->id)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->where(function ($query) {
                $query->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->latest('id')
            ->first();

        if (! $membership) {
            $startsAt = now();

            $membership = UserMembership::create([
                'user_id' => $request->user()->id,
                'membership_plan_id' => $membershipPlan->id,
                'credits_total' => $membershipPlan->credits,
                'credits_remaining' => $membershipPlan->credits,
                'starts_at' => $startsAt,
                'expires_at' => $membershipPlan->valid_days ? $startsAt->copy()->addDays($membershipPlan->valid_days) : null,
                'payment_method' => $data['payment_method'],
                'status' => 'pending_payment',
                'expired_at' => Carbon::now()->addMinutes(15),
            ]);
        } else {
            $membership->update([
                'payment_method' => $data['payment_method'],
                'expired_at' => Carbon::now()->addMinutes(15),
                'status' => 'pending_payment',
            ]);
        }

        return to_route('welcome.membership-checkout', [
            'membershipPlan' => $membershipPlan->id,
            'membership_id' => $membership->id,
            't' => Str::lower(Str::random(6)),
        ]);
    }

    public function uploadMembershipPaymentProof(Request $request, UserMembership $userMembership): RedirectResponse
    {
        $this->expirePendingMemberships(Auth::id());
        $userMembership->refresh();

        if ((int) $userMembership->user_id !== (int) Auth::id() || ! in_array($userMembership->status, ['pending', 'pending_payment'], true)) {
            return to_route('user.my-memberships')->withErrors(['payment_proof' => 'Transaksi membership tidak ditemukan atau sudah tidak aktif.']);
        }

        $data = $request->validate([
            'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $storedPath = $data['payment_proof']->store('membership-payment-proofs', 'public');

        if ($userMembership->payment_proof_image) {
            Storage::disk('public')->delete($userMembership->payment_proof_image);
        }

        $userMembership->update([
            'payment_proof_image' => $storedPath,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Foto bukti pembayaran membership berhasil diupload. Menunggu konfirmasi admin.');
    }

    public function cancelMembershipTransaction(UserMembership $userMembership): RedirectResponse
    {
        $this->expirePendingMemberships(Auth::id());
        $userMembership->refresh();

        if ((int) $userMembership->user_id !== (int) Auth::id() || ! in_array($userMembership->status, ['pending', 'pending_payment'], true)) {
            return to_route('user.my-memberships')->withErrors(['payment_proof' => 'Transaksi membership tidak ditemukan atau sudah tidak aktif.']);
        }

        if ($userMembership->payment_proof_image) {
            Storage::disk('public')->delete($userMembership->payment_proof_image);
        }

        $userMembership->update([
            'status' => 'cancelled',
            'payment_proof_image' => null,
        ]);

        return to_route('welcome.membership-detail', $userMembership->membership_plan_id)->with('success', 'Transaksi membership berhasil dibatalkan.');
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
            ->whereIn('status', ['pending', 'pending_payment'])
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
        if ((int) $booking->user_id !== (int) Auth::id() || ! in_array($booking->status, ['pending', 'pending_payment'], true) || $booking->payment_type !== 'drop_in') {
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
        if ((int) $booking->user_id !== (int) Auth::id() || ! in_array($booking->status, ['pending', 'pending_payment'], true) || $booking->payment_type !== 'drop_in') {
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
            ->whereIn('status', ['pending', 'pending_payment'])
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
                    ->whereIn('status', ['pending', 'pending_payment'])
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

    private function expirePendingMemberships(?int $userId = null): void
    {
        $query = UserMembership::query()
            ->whereIn('status', ['pending', 'pending_payment'])
            ->where(function ($builder) {
                $builder
                    ->where('expired_at', '<=', now())
                    ->orWhere(function ($fallback) {
                        $fallback->whereNull('expired_at')->where('created_at', '<=', now()->subMinutes(15));
                    });
            });

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->update([
            'status' => 'expired',
        ]);
    }

}
