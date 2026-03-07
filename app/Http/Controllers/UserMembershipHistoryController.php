<?php

namespace App\Http\Controllers;

use App\Models\UserMembership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserMembershipHistoryController extends Controller
{
    /**
     * Display authenticated user's membership history page (user area).
     */
    public function index(Request $request): Response
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

                return [
                    'id' => $membership->id,
                    'status' => $membership->status,
                    'credits_total' => $membership->credits_total,
                    'credits_remaining' => $membership->credits_remaining,
                    'starts_at' => optional($membership->starts_at)->toISOString(),
                    'expires_at' => optional($membership->expires_at)->toISOString(),
                    'plan_name' => $membership->plan?->name,
                ];
            })
            ->values();

        return Inertia::render('User/MyMemberships', [
            'memberships' => $memberships,
        ]);
    }
}
