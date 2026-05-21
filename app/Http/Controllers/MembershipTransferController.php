<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\UserMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MembershipTransferController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Memberships/Transfer', [
            'customers' => Customer::query()->select('id', 'user_id', 'name', 'no_telp')->orderBy('name')->limit(100)->get(),
            'senderMemberships' => UserMembership::query()
                ->with(['plan:id,name', 'user:id,name'])
                ->where('status', 'active')
                ->where('credits_remaining', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (UserMembership $membership) => [
                    'id' => $membership->id,
                    'user_id' => $membership->user_id,
                    'customer_name' => $membership->user?->name,
                    'plan_id' => $membership->membership_plan_id,
                    'plan_name' => $membership->plan?->name,
                    'credits_remaining' => (int) $membership->credits_remaining,
                    'expires_at' => optional($membership->expires_at)->toISOString(),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sender_membership_id' => ['required', 'integer', 'exists:user_memberships,id'],
            'receiver_customer_id' => ['required', 'integer', 'exists:customers,id'],
            'credits_amount' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $senderMembership = UserMembership::query()->with(['user', 'plan'])->findOrFail($validated['sender_membership_id']);
        $receiverCustomer = Customer::query()->findOrFail($validated['receiver_customer_id']);

        if (! $senderMembership->user_id || ! $receiverCustomer->user_id) {
            return back()->withErrors(['receiver_customer_id' => 'Pengirim dan penerima harus memiliki user yang aktif.']);
        }

        if ((int) $senderMembership->user_id === (int) $receiverCustomer->user_id) {
            return back()->withErrors(['receiver_customer_id' => 'Pengirim dan penerima tidak boleh sama.']);
        }

        DB::transaction(function () use ($senderMembership, $receiverCustomer, $validated) {
            $senderMembership = UserMembership::query()->lockForUpdate()->findOrFail($senderMembership->id);

            if ($senderMembership->status !== 'active' || (int) $senderMembership->credits_remaining < (int) $validated['credits_amount']) {
                throw ValidationException::withMessages([
                    'credits_amount' => 'Credit pengirim tidak mencukupi atau membership tidak aktif.',
                ]);
            }

            $senderMembership->decrement('credits_remaining', (int) $validated['credits_amount']);

            UserMembership::create([
                'user_id' => $receiverCustomer->user_id,
                'membership_plan_id' => $senderMembership->membership_plan_id,
                'credits_total' => (int) $validated['credits_amount'],
                'credits_remaining' => (int) $validated['credits_amount'],
                'payment_method' => 'transfer credits',
                'starts_at' => $senderMembership->starts_at ?? now(),
                'activated_at' => $senderMembership->activated_at,
                'expires_at' => $senderMembership->expires_at,
                'status' => 'active',
                'cashier_id' => auth()->id(),
                'cancellation_note' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Berhasil mentransfer '.$senderMembership->plan?->name.' '.$validated['credits_amount'].' credits dari '.$senderMembership->user?->name.' ke '.$receiverCustomer->name.'.');
    }
}
