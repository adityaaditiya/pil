<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\MembershipExtension;
use App\Models\PaymentSetting;
use App\Models\UserMembership;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MembershipExtensionController extends Controller
{
    public function index(): Response
    {
        $paymentSetting = PaymentSetting::first();
        $paymentGateways = $paymentSetting?->enabledGateways() ?? [];

        $customers = Customer::query()
            ->whereNotNull('user_id')
            ->whereHas('user.memberships', fn ($query) => $query->where('status', 'active'))
            ->with([
                'user:id,name,email',
                'user.memberships' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with('plan:id,name')
                    ->orderByRaw('expires_at IS NULL')
                    ->orderByDesc('expires_at')
                    ->orderByDesc('created_at'),
            ])
            ->select('id', 'user_id', 'name', 'no_telp')
            ->orderBy('name')
            ->get()
            ->map(function (Customer $customer) {
                $membership = $customer->user?->memberships->first();

                return [
                    'id' => $customer->id,
                    'user_id' => $customer->user_id,
                    'name' => $customer->name,
                    'email' => $customer->user?->email,
                    'phone' => $customer->no_telp,
                    'membership' => $membership ? [
                        'id' => $membership->id,
                        'plan_name' => $membership->plan?->name ?? '-',
                        'credits_remaining' => (int) $membership->credits_remaining,
                        'expires_at' => $membership->expires_at?->toDateString(),
                    ] : null,
                ];
            })
            ->filter(fn (array $customer) => filled($customer['membership']))
            ->values();

        return Inertia::render('Dashboard/Memberships/Extend', [
            'customers' => $customers,
            'paymentGateways' => $paymentGateways,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $paymentGateways = collect(PaymentSetting::first()?->enabledGateways() ?? [])->pluck('value')->all();

        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'user_membership_id' => ['required', 'integer', 'exists:user_memberships,id'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'required_without:new_expires_at'],
            'new_expires_at' => ['nullable', 'date', 'required_without:duration_days'],
            'extension_fee' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', Rule::in(array_merge($paymentGateways, ['complimentary']))],
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        $fee = (float) ($validated['extension_fee'] ?? 0);
        $paymentMethod = $fee > 0 ? ($validated['payment_method'] ?? null) : 'complimentary';

        if ($fee > 0 && ! in_array($paymentMethod, $paymentGateways, true)) {
            return back()->withErrors([
                'payment_method' => 'Pilih metode pembayaran aktif untuk biaya perpanjangan berbayar.',
            ])->withInput();
        }

        $extension = DB::transaction(function () use ($validated, $fee, $paymentMethod) {
            $customer = Customer::query()
                ->whereNotNull('user_id')
                ->findOrFail($validated['customer_id']);

            $membership = UserMembership::query()
                ->lockForUpdate()
                ->with('plan:id,name')
                ->where('id', $validated['user_membership_id'])
                ->where('user_id', $customer->user_id)
                ->where('status', 'active')
                ->firstOrFail();

            $oldExpiresAt = $membership->expires_at;
            $baseDate = $oldExpiresAt && $oldExpiresAt->isFuture()
                ? $oldExpiresAt->copy()
                : now();

            if (! empty($validated['duration_days'])) {
                $newExpiresAt = $baseDate->copy()->addDays((int) $validated['duration_days']);
                $durationDays = (int) $validated['duration_days'];
            } else {
                $newExpiresAt = Carbon::parse($validated['new_expires_at'])->endOfDay();
                $durationDays = $oldExpiresAt ? max(1, $oldExpiresAt->copy()->startOfDay()->diffInDays($newExpiresAt->copy()->startOfDay(), false)) : null;
            }

            if ($oldExpiresAt && $newExpiresAt->lessThanOrEqualTo($oldExpiresAt)) {
                throw ValidationException::withMessages([
                    'new_expires_at' => 'Tanggal expired baru harus lebih besar dari tanggal expired saat ini.',
                ]);
            }

            $membership->update([
                'expires_at' => $newExpiresAt,
                'payment_method' => $paymentMethod,
                'cashier_id' => auth()->id(),
            ]);

            return MembershipExtension::create([
                'user_membership_id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_plan_id' => $membership->membership_plan_id,
                'old_expires_at' => $oldExpiresAt,
                'new_expires_at' => $newExpiresAt,
                'duration_days' => $durationDays,
                'extension_fee' => $fee,
                'payment_method' => $paymentMethod,
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);
        });

        return to_route('memberships.extend.index')->with('success', 'Masa aktif membership berhasil diperpanjang sampai ' . $extension->new_expires_at?->timezone('Asia/Jakarta')->format('d M Y') . '.');
    }
}
