<?php

namespace App\Http\Controllers;

use App\Models\UserMembership;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserMembershipHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));
        $status = trim((string) $request->string('status'));

        $memberships = UserMembership::query()
            ->with('plan:id,name')
            ->where('user_id', $request->user()->id)
            ->when($startDate !== '', fn ($query) => $query->where('starts_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC')))
            ->when($endDate !== '', fn ($query) => $query->where('starts_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC')))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'pending_payment' THEN 1 WHEN 'confirmed' THEN 2 WHEN 'active' THEN 2 ELSE 3 END")
            ->latest('starts_at')
            ->latest('id')
            ->get()
            ->map(function (UserMembership $membership) {
                if (in_array($membership->status, ['pending', 'pending_payment'], true) && ! $membership->payment_proof_image && $membership->expired_at && $membership->expired_at->isPast()) {
                    $membership->status = 'expired';
                    $membership->save();
                }

                if ($membership->status === 'active' && $membership->expires_at && $membership->expires_at->isPast()) {
                    $membership->status = 'expired';
                    $membership->save();
                }

                return [
                    'id' => $membership->id,
                    'invoice' => $membership->invoice,
                    'status' => $membership->status,
                    'credits_total' => $membership->credits_total,
                    'credits_remaining' => $membership->credits_remaining,
                    'starts_at' => optional($membership->starts_at)->toISOString(),
                    'expires_at' => optional($membership->expires_at)->toISOString(),
                    'payment_method' => $membership->payment_method,
                    'payment_proof_image' => $membership->payment_proof_image,
                    'payment_due_at' => optional($membership->expired_at)->toISOString(),
                    'payment_proof_image_url' => $membership->payment_proof_image ? Storage::disk('public')->url($membership->payment_proof_image) : null,
                    'plan_name' => $membership->plan?->name,
                    'membership_plan_id' => $membership->membership_plan_id,
                ];
            })
            ->values();

        return Inertia::render('User/MyMemberships', [
            'memberships' => $memberships,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }
}
