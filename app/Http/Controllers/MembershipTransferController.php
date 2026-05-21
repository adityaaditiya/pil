<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\UserMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MembershipTransferController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::query()
            ->whereNotNull('user_id')
            ->select('id', 'name', 'user_id')
            ->orderBy('name')
            ->get();

        $activeMemberships = UserMembership::query()
            ->where('status', 'active')
            ->where('credits_remaining', '>', 0)
            ->whereNotNull('user_id')
            ->with(['plan:id,name', 'user:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (UserMembership $membership) => [
                'id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_plan_id' => $membership->membership_plan_id,
                'membership_plan_name' => $membership->plan?->name ?? '-',
                'credits_remaining' => (int) $membership->credits_remaining,
                'expires_at' => $membership->expires_at?->toDateString(),
                'activated_at' => $membership->activated_at?->toDateString(),
            ]);

        return Inertia::render('Dashboard/Memberships/Transfer', [
            'customers' => $customers,
            'senderMemberships' => $activeMemberships,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_user_id' => ['required', 'integer', 'exists:users,id'],
            'to_user_id' => ['required', 'integer', 'exists:users,id', 'different:from_user_id'],
            'sender_membership_id' => ['required', 'integer', 'exists:user_memberships,id'],
            'credits_amount' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $senderMembership = UserMembership::query()
                ->lockForUpdate()
                ->with(['plan:id,name'])
                ->where('id', $validated['sender_membership_id'])
                ->where('user_id', $validated['from_user_id'])
                ->where('status', 'active')
                ->firstOrFail();

            if ((int) $senderMembership->credits_remaining < (int) $validated['credits_amount']) {
                abort(422, 'Credits transfer melebihi sisa credits pengirim.');
            }

            $receiver = Customer::query()
                ->where('user_id', $validated['to_user_id'])
                ->first();

            if (! $receiver) {
                abort(422, 'Penerima tidak valid atau tidak aktif.');
            }

            $senderMembership->decrement('credits_remaining', (int) $validated['credits_amount']);

            $receiverMembership = UserMembership::query()
                ->lockForUpdate()
                ->where('user_id', $validated['to_user_id'])
                ->where('membership_plan_id', $senderMembership->membership_plan_id)
                ->where('status', 'active')
                ->whereDate('expires_at', optional($senderMembership->expires_at)->toDateString())
                ->first();

            if (! $receiverMembership) {
                $receiverMembership = UserMembership::create([
                    'user_id' => (int) $validated['to_user_id'],
                    'membership_plan_id' => (int) $senderMembership->membership_plan_id,
                    'credits_total' => 0,
                    'credits_remaining' => 0,
                    'starts_at' => now(),
                    'activated_at' => $senderMembership->activated_at,
                    'expires_at' => $senderMembership->expires_at,
                    'payment_method' => 'transfer_credits',
                    'status' => 'active',
                    'cashier_id' => auth()->id(),
                ]);
            }

            $receiverMembership->increment('credits_total', (int) $validated['credits_amount']);
            $receiverMembership->increment('credits_remaining', (int) $validated['credits_amount']);

            DB::table('membership_credit_transfers')->insert([
                'sender_membership_id' => $senderMembership->id,
                'receiver_membership_id' => $receiverMembership->id,
                'from_user_id' => (int) $validated['from_user_id'],
                'to_user_id' => (int) $validated['to_user_id'],
                'membership_plan_id' => $senderMembership->membership_plan_id,
                'credits_transferred' => (int) $validated['credits_amount'],
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'plan_name' => $senderMembership->plan?->name ?? 'Membership',
                'sender_name' => $senderMembership->user?->name ?? 'Pengirim',
                'receiver_name' => $receiver->name,
            ];
        });

        return to_route('memberships.transfer.index')->with('success', "Berhasil mentransfer {$result['plan_name']} {$validated['credits_amount']} credits dari {$result['sender_name']} ke {$result['receiver_name']}.");
    }
}
