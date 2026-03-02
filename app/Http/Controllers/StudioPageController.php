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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
                ? PilatesClass::with('trainers:id,name')->latest()->get(['id', 'image', 'name', 'duration', 'difficulty_level', 'about', 'equipment', 'price'])
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
        $schedule = $pilatesTimetable
            ->load(['pilatesClass:id,name,image', 'trainer:id,name'])
            ->loadSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants');
        $bookedSlots = (int) ($schedule->booked_slots ?? 0);
        $remainingSlots = max(0, ((int) $schedule->capacity) - $bookedSlots);

        $paymentSetting = PaymentSetting::first();
        $paymentGateways = collect($paymentSetting?->enabledGateways() ?? [])->filter(function ($gateway) {
            return strtolower($gateway['value'] ?? '') !== 'cash';
        })->values();

        $customer = Customer::query()
            ->where('user_id', Auth::id())
            ->first(['id', 'credit']);

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
        ]);
    }

    public function processSchedulePayment(Request $request, PilatesTimetable $pilatesTimetable): RedirectResponse
    {
        $data = $request->validate([
            'payment_type' => ['required', 'in:credit,drop_in'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ]);

        $timetable = PilatesTimetable::query()
            ->with(['pilatesClass:id,name'])
            ->withSum(['bookings as booked_slots' => fn ($query) => $query->where('status', 'confirmed')], 'participants')
            ->findOrFail($pilatesTimetable->id);

        if ($timetable->status !== 'scheduled') {
            throw ValidationException::withMessages([
                'payment_type' => 'Sesi tidak tersedia untuk reservasi.',
            ]);
        }

        $bookedSlots = (int) ($timetable->booked_slots ?? 0);
        $remainingSlots = max(0, ((int) $timetable->capacity) - $bookedSlots);
        if ($remainingSlots < 1) {
            throw ValidationException::withMessages([
                'payment_type' => 'Slot kelas sudah penuh.',
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

        $paymentMethod = $paymentType === 'credit' ? 'credits' : ($data['payment_method'] ?? 'manual_transfer');
        $priceAmount = (float) ($timetable->price_override ?? 0);
        $creditUsed = (float) ($timetable->credit_override ?? 0);
        $selectedMembership = null;

        if ($paymentType === 'credit') {
            $selectedMembership = UserMembership::query()
                ->with(['plan.classRules' => fn ($query) => $query->where('pilates_class_id', $timetable->pilates_class_id)])
                ->where('user_id', Auth::id())
                ->where('status', 'active')
                ->where('credits_remaining', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->get()
                ->first(fn (UserMembership $membership) => $membership->plan?->classRules->contains('pilates_class_id', $timetable->pilates_class_id));

            $rule = $selectedMembership?->plan?->classRules?->first();

            if (! $selectedMembership || ! $rule) {
                throw ValidationException::withMessages([
                    'payment_type' => 'Tidak ada membership aktif yang valid untuk kelas ini.',
                ]);
            }

            $creditUsed = (float) ($rule->credit_cost ?? 1);
            if ((int) $selectedMembership->credits_remaining < (int) $creditUsed) {
                throw ValidationException::withMessages([
                    'payment_type' => 'Credit membership tidak cukup.',
                ]);
            }
        }

        try {
            DB::transaction(function () use ($timetable, $paymentType, $paymentMethod, $priceAmount, $creditUsed, $selectedMembership) {
                PilatesBooking::create([
                    'user_id' => Auth::id(),
                    'timetable_id' => $timetable->id,
                    'participants' => 1,
                    'user_membership_id' => $selectedMembership?->id,
                    'membership_plan_id' => $selectedMembership?->membership_plan_id,
                    'status' => 'confirmed',
                    'booked_at' => now(),
                    'payment_type' => $paymentType,
                    'payment_method' => $paymentMethod,
                    'price_amount' => $paymentType === 'drop_in' ? $priceAmount : 0,
                    'credit_used' => $paymentType === 'credit' ? $creditUsed : 0,
                ]);

                if ($paymentType === 'credit' && $selectedMembership) {
                    $selectedMembership->decrement('credits_remaining', (int) $creditUsed);
                }
            });
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'payment_type' => 'Anda sudah melakukan booking untuk sesi ini.',
            ]);
        }

        return back()->with('success', 'Transaksi selesai. Booking berhasil dibuat.');
    }
}
