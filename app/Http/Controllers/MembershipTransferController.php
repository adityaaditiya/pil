<?php

namespace App\Http\Controllers;

use App\Models\MembershipTransfer;
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
        $members = UserMembership::query()
            ->with(['user:id,name,email', 'plan:id,name'])
            ->where('status', 'active')
            ->where('credits_remaining', '>', 0)
            ->orderByDesc('id')
            ->get()
            ->map(fn (UserMembership $membership) => [
                'id' => $membership->id,
                'label' => sprintf(
                    '%s (%s) - %s | Sisa %d credits',
                    $membership->user?->name ?? 'Tanpa Nama',
                    $membership->user?->email ?? '-',
                    $membership->plan?->name ?? 'Membership',
                    (int) $membership->credits_remaining,
                ),
                'member_name' => $membership->user?->name,
                'member_email' => $membership->user?->email,
                'membership_plan_name' => $membership->plan?->name,
                'credits_remaining' => (int) $membership->credits_remaining,
            ]);

        return Inertia::render('Dashboard/Memberships/Transfer', [
            'members' => $members,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'from_membership_id' => ['required', 'integer', 'exists:user_memberships,id'],
            'to_membership_id' => ['required', 'integer', 'exists:user_memberships,id', 'different:from_membership_id'],
            'credits_transferred' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $result = DB::transaction(function () use ($data, $request) {
            $sender = UserMembership::query()->with(['user:id,name', 'plan:id,name'])->lockForUpdate()->findOrFail($data['from_membership_id']);
            $receiver = UserMembership::query()->with(['user:id,name', 'plan:id,name'])->lockForUpdate()->findOrFail($data['to_membership_id']);

            if ($sender->status !== 'active' || (int) $sender->credits_remaining <= 0) {
                abort(422, 'Membership pengirim tidak aktif atau credits tidak tersedia.');
            }

            if ($receiver->status !== 'active') {
                abort(422, 'Membership penerima tidak aktif.');
            }

            if ((int) $sender->user_id === (int) $receiver->user_id) {
                abort(422, 'Pengirim dan penerima tidak boleh pelanggan yang sama.');
            }

            $credits = (int) $data['credits_transferred'];
            if ($credits > (int) $sender->credits_remaining) {
                abort(422, 'Jumlah credits melebihi sisa credits pengirim.');
            }

            $sender->decrement('credits_remaining', $credits);
            $receiver->increment('credits_remaining', $credits);

            MembershipTransfer::create([
                'from_user_membership_id' => $sender->id,
                'to_user_membership_id' => $receiver->id,
                'from_user_id' => $sender->user_id,
                'to_user_id' => $receiver->user_id,
                'membership_plan_id' => $sender->membership_plan_id,
                'credits_transferred' => $credits,
                'notes' => $data['notes'] ?? null,
                'processed_by' => $request->user()?->id,
            ]);

            return [
                'sender_name' => $sender->user?->name ?? '-',
                'receiver_name' => $receiver->user?->name ?? '-',
                'plan_name' => $sender->plan?->name ?? 'Membership',
                'credits' => $credits,
            ];
        });

        return to_route('memberships.transfer.index')->with(
            'success',
            "Berhasil mentransfer {$result['plan_name']} {$result['credits']} credits dari {$result['sender_name']} ke {$result['receiver_name']}."
        );
    }
}
