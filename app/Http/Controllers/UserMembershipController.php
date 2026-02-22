<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\UserMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserMembershipController extends Controller
{
    public function plans(): Response
    {
        return Inertia::render('Dashboard/Memberships/User/Plans', [
            'plans' => MembershipPlan::query()
                ->with(['classes:id,name'])
                ->where('is_active', true)
                ->orderBy('price')
                ->get(),
        ]);
    }

    public function activate(Request $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $user = $request->user();
        $startsAt = now();

        UserMembership::create([
            'user_id' => $user->id,
            'membership_plan_id' => $membershipPlan->id,
            'credits_total' => $membershipPlan->credits,
            'credits_remaining' => $membershipPlan->credits,
            'starts_at' => $startsAt,
            'expires_at' => $membershipPlan->valid_days ? $startsAt->copy()->addDays($membershipPlan->valid_days) : null,
            'status' => 'active',
        ]);

        return to_route('memberships.my')->with('success', 'Membership berhasil diaktifkan.');
    }

    public function myMemberships(Request $request): Response
    {
        $memberships = UserMembership::query()
            ->with('plan:id,name')
            ->where('user_id', $request->user()->id)
            ->latest('starts_at')
            ->get()
            ->map(function (UserMembership $membership) {
                if ($membership->status === 'active' && $membership->expires_at && $membership->expires_at->isPast()) {
                    $membership->status = 'expired';
                    $membership->save();
                }

                return $membership;
            });

        return Inertia::render('Dashboard/Memberships/User/MyMemberships', [
            'memberships' => $memberships,
        ]);
    }
}
