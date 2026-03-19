<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserMembership;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MembershipHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $invoice = trim((string) $request->string('invoice'));
        $startDate = trim((string) $request->string('start_date'));
        $endDate = trim((string) $request->string('end_date'));

        $query = UserMembership::query()
            ->with(['user:id,name,email', 'plan:id,name,price,valid_days'])
            ->latest('created_at');

        if ($startDate) {
            $query->where('created_at', '>=', Carbon::parse($startDate, 'Asia/Jakarta')->startOfDay()->timezone('UTC'));
        }

        if ($endDate) {
            $query->where('created_at', '<=', Carbon::parse($endDate, 'Asia/Jakarta')->endOfDay()->timezone('UTC'));
        }

        if ($invoice !== '') {
            $query->where('invoice', 'like', '%' . strtoupper($invoice) . '%');
        }

        $memberships = $query
            ->paginate(10)
            ->withQueryString()
            ->through(function (UserMembership $membership) {
                if (in_array($membership->status, ['pending', 'pending_payment'], true) && $membership->expired_at && $membership->expired_at->isPast()) {
                    $membership->forceFill(['status' => 'expired'])->saveQuietly();
                    $membership->status = 'expired';
                }

                if ($membership->status === 'active' && $membership->expires_at && $membership->expires_at->isPast()) {
                    $membership->forceFill(['status' => 'expired'])->saveQuietly();
                    $membership->status = 'expired';
                }

                return [
                    'id' => $membership->id,
                    'invoice' => $membership->invoice,
                    'created_at' => $membership->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'status' => $membership->status,
                    'customer' => $membership->user?->name,
                    'customer_email' => $membership->user?->email,
                    'plan_name' => $membership->plan?->name,
                    'price' => $membership->plan?->price,
                    'credits_total' => $membership->credits_total,
                    'credits_remaining' => $membership->credits_remaining,
                    'payment_method' => $membership->payment_method,
                    'payment_proof_image' => $membership->payment_proof_image,
                    'starts_at' => $membership->starts_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                    'expires_at' => $membership->expires_at?->timezone('Asia/Jakarta')->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('Dashboard/Memberships/History', [
            'memberships' => $memberships,
            'filters' => [
                'invoice' => $invoice,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function print(string $invoice): Response
    {
        $membership = UserMembership::query()
            ->with(['user:id,name,email', 'plan:id,name,price,credits,valid_days'])
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Inertia::render('Dashboard/Memberships/Print', [
            'membership' => $membership,
        ]);
    }

    public function cancel(Request $request, UserMembership $userMembership): RedirectResponse
    {
        $validated = $request->validate([
            'authorization_note' => ['nullable', 'string'],
            'super_admin_email' => ['required', 'email'],
            'super_admin_password' => ['required', 'string'],
        ]);

        $superAdmin = User::query()->where('email', $validated['super_admin_email'])->first();

        if (! $superAdmin || ! $superAdmin->isSuperAdmin() || ! Hash::check($validated['super_admin_password'], $superAdmin->password)) {
            return back()->withErrors(['message' => 'Otorisasi super-admin gagal.']);
        }

        if ($userMembership->status === 'cancelled') {
            return back()->withErrors(['message' => 'Transaksi membership sudah dibatalkan.']);
        }

        DB::transaction(function () use ($userMembership) {
            $userMembership->update([
                'status' => 'cancelled',
                'credits_remaining' => $userMembership->credits_total,
                'expires_at' => null,
            ]);
        });

        return back()->with('success', 'Transaksi membership berhasil dibatalkan dan credit customer dikembalikan.');
    }

    public function confirmPayment(UserMembership $userMembership): RedirectResponse
    {
        if (! in_array($userMembership->status, ['pending', 'pending_payment'], true)) {
            return back()->withErrors(['message' => 'Pembayaran membership tidak dapat dikonfirmasi.']);
        }

        $startsAt = $userMembership->starts_at ?? now();
        $validDays = (int) ($userMembership->plan?->valid_days ?? 0);

        $userMembership->update([
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $validDays > 0 ? $startsAt->copy()->addDays($validDays) : null,
        ]);

        return back()->with('success', 'Pembayaran membership berhasil dikonfirmasi.');
    }

    public function rejectPayment(UserMembership $userMembership): RedirectResponse
    {
        if (! in_array($userMembership->status, ['pending', 'pending_payment'], true)) {
            return back()->withErrors(['message' => 'Pembayaran membership tidak dapat ditolak.']);
        }

        $userMembership->update([
            'status' => 'cancelled',
            'credits_remaining' => $userMembership->credits_total,
            'expires_at' => null,
        ]);

        return back()->with('success', 'Pembayaran membership berhasil ditolak dan transaksi dibatalkan.');
    }
}
