<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\Customer;
use App\Models\PaymentSetting;
use App\Models\UserMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
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

    public function checkout(MembershipPlan $membershipPlan): Response
    {
        abort_if(! $membershipPlan->is_active, 404);

        $paymentSetting = PaymentSetting::first();

        return Inertia::render('Dashboard/Memberships/User/Checkout', [
            'plan' => $membershipPlan->load(['classes:id,name']),
            'customers' => Customer::query()
                ->with('user:id,email')
                ->select('id', 'user_id', 'name', 'no_telp', 'address')
                ->latest()
                ->take(30)
                ->get(),
            'paymentGateways' => $paymentSetting?->enabledGateways() ?? [],
        ]);
    }

    public function searchCustomers(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        if ($search === '') {
            return response()->json(['data' => []]);
        }

        $customers = Customer::query()
            ->with('user:id,email')
            ->select('id', 'user_id', 'name', 'no_telp', 'address')
            ->where(function (Builder $query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('no_telp', 'like', '%' . $search . '%')
                    ->orWhere('address', 'like', '%' . $search . '%');
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    public function activate(Request $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'payment_method' => ['required', 'string'],
            'cash_amount' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $customer = Customer::query()
            ->select('id', 'user_id')
            ->findOrFail($validated['customer_id']);

        if (! $customer->user_id) {
            return back()->withErrors([
                'customer_id' => 'Pelanggan belum memiliki akun user yang terhubung.',
            ]);
        }

        $discount = min((float) ($validated['discount'] ?? 0), (float) $membershipPlan->price);
        $total = max((float) $membershipPlan->price - $discount, 0);

        if (($validated['payment_method'] ?? 'cash') === 'cash') {
            $cashAmount = (float) ($validated['cash_amount'] ?? 0);

            if ($cashAmount < $total) {
                return back()->withErrors([
                    'cash_amount' => 'Jumlah bayar kurang dari total pembayaran.',
                ]);
            }
        }

        $startsAt = now();

        UserMembership::create([
            'user_id' => $customer->user_id,
            'membership_plan_id' => $membershipPlan->id,
            'credits_total' => $membershipPlan->credits,
            'credits_remaining' => $membershipPlan->credits,
            'starts_at' => $startsAt,
            'expires_at' => $membershipPlan->valid_days ? $startsAt->copy()->addDays($membershipPlan->valid_days) : null,
            'status' => 'active',
        ]);

        return to_route('memberships.plans')->with('success', 'Membership berhasil diaktifkan.');
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
