<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\MembershipExtension;
use App\Models\PaymentSetting;
use App\Models\UserMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipExtensionController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::query()
            ->whereNotNull('user_id')
            ->with('user:id,name,email')
            ->select('id', 'name', 'no_telp', 'user_id')
            ->orderBy('name')
            ->get()
            ->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'user_id' => $customer->user_id,
                'name' => $customer->name,
                'email' => $customer->user?->email,
                'phone' => $customer->no_telp,
            ]);

        $activeMemberships = UserMembership::query()
            ->where('status', 'active')
            ->whereNotNull('user_id')
            ->whereNotNull('expires_at')
            ->with(['plan:id,name', 'user:id,name,email'])
            ->orderByDesc('expires_at')
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

        $paymentSetting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        return Inertia::render('Dashboard/Memberships/Extend', [
            'customers' => $customers,
            'activeMemberships' => $activeMemberships,
            'paymentMethods' => $paymentSetting->enabledGateways(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $paymentSetting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);
        $enabledPaymentMethods = collect($paymentSetting->enabledGateways())->pluck('value')->all();
        $feeAmount = (int) $request->input('fee_amount', 0);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'user_membership_id' => ['required', 'integer', 'exists:user_memberships,id'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'required_without:extension_date'],
            'extension_date' => ['nullable', 'date', 'required_without:duration_days'],
            'fee_amount' => ['nullable', 'integer', 'min:0'],
            'payment_method' => $feeAmount > 0
                ? ['required', 'string', Rule::in($enabledPaymentMethods)]
                : ['nullable', 'string'],
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        if ($feeAmount > 0 && blank($validated['payment_method'] ?? null)) {
            return back()->withErrors([
                'payment_method' => 'Metode pembayaran wajib dipilih jika biaya perpanjangan lebih dari 0.',
            ])->withInput();
        }

        if ($feeAmount > 0 && empty($enabledPaymentMethods)) {
            return back()->withErrors([
                'payment_method' => 'Aktifkan minimal satu metode pembayaran di menu Payment Gateway terlebih dahulu.',
            ])->withInput();
        }

        $result = DB::transaction(function () use ($validated, $feeAmount) {
            $membership = UserMembership::query()
                ->lockForUpdate()
                ->with(['plan:id,name', 'user:id,name'])
                ->where('id', $validated['user_membership_id'])
                ->where('user_id', $validated['user_id'])
                ->where('status', 'active')
                ->firstOrFail();

            if (! $membership->expires_at) {
                abort(422, 'Membership tanpa tanggal expired tidak dapat diperpanjang melalui menu ini.');
            }

            $previousExpiresAt = $membership->expires_at->copy();
            $newExpiresAt = $this->resolveNewExpiresAt($previousExpiresAt, $validated);

            if ($newExpiresAt->lessThanOrEqualTo($previousExpiresAt)) {
                abort(422, 'Tanggal expired baru harus lebih besar dari tanggal expired saat ini.');
            }

            $paymentMethod = $feeAmount > 0 ? $validated['payment_method'] : 'complimentary';

            $membership->forceFill([
                'expires_at' => $newExpiresAt,
            ])->save();

            MembershipExtension::create([
                'user_membership_id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_plan_id' => $membership->membership_plan_id,
                'previous_expires_at' => $previousExpiresAt,
                'new_expires_at' => $newExpiresAt,
                'duration_days' => $validated['duration_days'] ?? null,
                'extension_date' => $validated['extension_date'] ?? null,
                'fee_amount' => $feeAmount,
                'payment_method' => $paymentMethod,
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);

            return [
                'member_name' => $membership->user?->name ?? 'Member',
                'plan_name' => $membership->plan?->name ?? 'Membership',
                'new_expires_at' => $newExpiresAt->translatedFormat('d M Y'),
            ];
        });

        return to_route('memberships.extensions.index')
            ->with('success', "Masa aktif {$result['plan_name']} milik {$result['member_name']} berhasil diperpanjang sampai {$result['new_expires_at']}.");
    }

    private function resolveNewExpiresAt(Carbon $previousExpiresAt, array $validated): Carbon
    {
        if (! blank($validated['extension_date'] ?? null)) {
            return Carbon::parse($validated['extension_date'])->endOfDay();
        }

        return $previousExpiresAt->copy()->addDays((int) $validated['duration_days']);
    }
}
