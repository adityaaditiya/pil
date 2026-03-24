<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\CashEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CashEntryController extends Controller
{
    private const ENTRY_CATEGORIES = [
        'BAYAR BUNGA BANK',
        'BON OPERASIONAL',
        'BON PRIBADI OWNER',
        'BON TRANSFER BANK',
        'DEBIT CREDIT CARD',
        'KURANG MODAL',
        'TAMBAH MODAL',
        'SETOR KE OWNER',
        'SETOR KE BANK',
        'UANG LAIN LAIN',
    ];

    /**
     * Display the cash entry form.
     */
    public function index(Request $request, string $type)
    {
        abort_unless(in_array($type, ['in', 'out'], true), 404);

        return Inertia::render('Dashboard/Transactions/CashEntry', [
            'entryType' => $type,
            'entryCategories' => self::ENTRY_CATEGORIES,
        ]);
    }

    /**
     * Store a newly created cash entry.
     */
    public function store(Request $request, string $type)
    {
        abort_unless(in_array($type, ['in', 'out'], true), 404);

        $validated = $request->validate([
            'transaction_category' => ['required', 'string', Rule::in(self::ENTRY_CATEGORIES)],
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
        ]);

        CashEntry::create([
            'cashier_id' => $request->user()->id,
            'category' => $type,
            'transaction_category' => $validated['transaction_category'],
            'description' => $validated['description'],
            'amount' => (int) $validated['amount'],
        ]);

        return to_route($type === 'in' ? 'transactions.cash.in' : 'transactions.cash.out');
    }
}
