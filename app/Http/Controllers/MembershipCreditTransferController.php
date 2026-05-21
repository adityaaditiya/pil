<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\MembershipCreditTransfer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MembershipCreditTransferController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Memberships/Transfer', [
            'customers' => Customer::query()
                ->with('user:id,email')
                ->select('id', 'user_id', 'name', 'no_telp', 'address', 'credit')
                ->orderBy('name')
                ->take(30)
                ->get(),
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
            ->select('id', 'user_id', 'name', 'no_telp', 'address', 'credit')
            ->where(function (Builder $query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('no_telp', 'like', '%'.$search.'%')
                    ->orWhere('address', 'like', '%'.$search.'%');
            })
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $customers]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sender_customer_id' => ['required', 'integer', 'exists:customers,id', 'different:receiver_customer_id'],
            'receiver_customer_id' => ['required', 'integer', 'exists:customers,id'],
            'credits_amount' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($data): void {
            $sender = Customer::query()->lockForUpdate()->findOrFail($data['sender_customer_id']);
            $receiver = Customer::query()->lockForUpdate()->findOrFail($data['receiver_customer_id']);

            if (! $sender->user_id || (int) $sender->credit <= 0 || (int) $sender->credit < (int) $data['credits_amount']) {
                throw ValidationException::withMessages(['sender_customer_id' => 'Pengirim tidak memiliki membership aktif atau credit tidak cukup.']);
            }

            if (! $receiver->user_id) {
                throw ValidationException::withMessages(['receiver_customer_id' => 'Penerima bukan pelanggan aktif yang valid.']);
            }

            $sender->decrement('credit', (int) $data['credits_amount']);
            $receiver->increment('credit', (int) $data['credits_amount']);

            MembershipCreditTransfer::create([
                'sender_customer_id' => $sender->id,
                'receiver_customer_id' => $receiver->id,
                'credits_transferred' => (int) $data['credits_amount'],
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);
        });

        $senderName = Customer::query()->find($data['sender_customer_id'])?->name ?? 'Pengirim';
        $receiverName = Customer::query()->find($data['receiver_customer_id'])?->name ?? 'Penerima';

        return back()->with('success', "Berhasil mentransfer {$data['credits_amount']} credits dari {$senderName} ke {$receiverName}.");
    }
}
