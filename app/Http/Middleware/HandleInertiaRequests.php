<?php

namespace App\Http\Middleware;

use App\Models\AppointmentBooking;
use App\Models\LandingPageSetting;
use App\Models\PilatesBooking;
use App\Models\UserMembership;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->getPermissions() : [],
                'roles' => $request->user() ? $request->user()->getRoleNames()->values()->all() : [],
                'super' => $request->user() ? $request->user()->isSuperAdmin() : false,
            ],
            'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            ],
            'landingPageSetting' => fn () => LandingPageSetting::firstOrCreate([], LandingPageSetting::defaultAttributes()),
            'dashboardNotifications' => fn () => $this->getDashboardNotifications($request),
        ];
    }

    private function getDashboardNotifications(Request $request): array
    {
        if (! $request->user()) {
            return [];
        }

        $appointmentNotifications = AppointmentBooking::query()
            ->with('customer:id,name')
            ->where('status', 'pending')
            ->whereNotNull('payment_proof_image')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (AppointmentBooking $booking) => [
                'type' => 'Appointment',
                'invoice' => $booking->invoice,
                'customer_name' => $booking->customer?->name ?? '-',
                'url' => route('appointments.history'),
                'created_at' => optional($booking->created_at)->toISOString(),
            ]);

        $bookingNotifications = PilatesBooking::query()
            ->with('user:id,name')
            ->where('status', 'pending')
            ->whereNotNull('payment_proof_image')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (PilatesBooking $booking) => [
                'type' => 'Booking Schedule',
                'invoice' => $booking->invoice,
                'customer_name' => $booking->user?->name ?? '-',
                'url' => route('bookings.history'),
                'created_at' => optional($booking->created_at)->toISOString(),
            ]);

        $membershipNotifications = UserMembership::query()
            ->with('user:id,name')
            ->where('status', 'pending')
            ->whereNotNull('payment_proof_image')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (UserMembership $membership) => [
                'type' => 'Membership',
                'invoice' => $membership->invoice,
                'customer_name' => $membership->user?->name ?? '-',
                'url' => route('memberships.history'),
                'created_at' => optional($membership->created_at)->toISOString(),
            ]);

        return $appointmentNotifications
            ->concat($bookingNotifications)
            ->concat($membershipNotifications)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->all();
    }
}
