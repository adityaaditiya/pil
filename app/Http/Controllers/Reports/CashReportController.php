<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\CashEntry;
use App\Models\Customer;
use App\Models\PilatesBooking;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserMembership;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class CashReportController extends Controller
{
    private const CATEGORY_SALES = 'transaksi_penjualan';
    private const CATEGORY_MEMBERSHIP = 'transaksi_membership';
    private const CATEGORY_APPOINTMENT_DROP_IN = 'transaksi_appointment_drop_in';
    private const CATEGORY_TIMETABLE_DROP_IN = 'transaksi_timetable_drop_in';

    private const CASH_ENTRY_CATEGORIES = [
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
     * Display the cash flow report.
     */
    public function index(Request $request)
    {
        $defaultDate = Carbon::today()->toDateString();
        $filters = [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
            'shift' => $request->input('shift'),
            'transaction_category' => $request->input('transaction_category'),
        ];

        $selectedCategories = $this->parseCategoryFilter($filters['transaction_category'] ?? null);

        $includeTransactions = empty($selectedCategories) || in_array(self::CATEGORY_SALES, $selectedCategories, true);
        $includeMemberships = empty($selectedCategories) || in_array(self::CATEGORY_MEMBERSHIP, $selectedCategories, true);
        $includeAppointmentDropIns = empty($selectedCategories) || in_array(self::CATEGORY_APPOINTMENT_DROP_IN, $selectedCategories, true);
        $includeTimetableDropIns = empty($selectedCategories) || in_array(self::CATEGORY_TIMETABLE_DROP_IN, $selectedCategories, true);
        $selectedCashCategories = empty($selectedCategories) ? [] : array_values(array_intersect($selectedCategories, self::CASH_ENTRY_CATEGORIES));
        $includeCashEntries = empty($selectedCategories) || ! empty($selectedCashCategories);

        $transactionQuery = $this->applyFilters(
            Transaction::query()->notCanceled()
                ->with(['cashier:id,name', 'customer:id,name']),
            $filters
        )->orderByDesc('created_at');

        $cashEntryQuery = $this->applyCashEntryFilters(
            CashEntry::query()->with(['cashier:id,name']),
            $filters
        )->orderByDesc('created_at');
        $membershipQuery = $this->applyMembershipFilters(
            UserMembership::query()
                ->whereNotIn('status', ['pending', 'pending_payment', 'cancelled', 'expired'])
                ->with(['plan:id,price', 'user:id,name']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['customer:id,name']),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['user:id,name']),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'id' => 'transaction-' . $trx->id,
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->customer?->name ? ($trx->invoice . ' - ' . mb_strtoupper($trx->customer->name)) : $trx->invoice,
                'cash_in' => (int) $trx->grand_total,
                'cash_out' => 0,
                'created_at' => $trx->created_at,
            ])
            : collect();

        $cashEntryList = $includeCashEntries
            ? (clone $cashEntryQuery)->get()->map(fn ($entry) => [
                'id' => 'cash-entry-' . $entry->id,
                'category' => $entry->transaction_category ?: 'UANG LAIN LAIN',
                'description' => $entry->description,
                'cash_in' => $entry->category === 'in' ? (int) $entry->amount : 0,
                'cash_out' => $entry->category === 'out' ? (int) $entry->amount : 0,
                'created_at' => $entry->created_at,
            ])
            : collect();
        $membershipList = $includeMemberships
            ? (clone $membershipQuery)->get()->map(fn ($membership) => [
                'id' => 'membership-' . $membership->id,
                'category' => 'TRANSAKSI MEMBERSHIP',
                'description' => $membership->user?->name ? ($membership->invoice . ' - ' . mb_strtoupper($membership->user->name)) : $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
                'created_at' => $membership->created_at,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'id' => 'appointment-drop-in-' . $booking->id,
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->customer?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->customer->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'id' => 'timetable-drop-in-' . $booking->id,
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->user?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->user->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();

        $mergedRows = $transactionsList
            ->concat($cashEntryList)
            ->concat($membershipList)
            ->concat($appointmentDropInList)
            ->concat($timetableDropInList)
            ->sortByDesc('created_at')
            ->values();

        $transactions = $this->paginateRows($mergedRows, $request);

        $transactionTotals = $includeTransactions
            ? $this->applyFilters(Transaction::query()->notCanceled(), $filters)
                ->selectRaw('COALESCE(SUM(grand_total), 0) as cash_in_total')
                ->first()
            : (object) ['cash_in_total' => 0];

        $cashEntryTotals = $includeCashEntries
            ? $this->applyCashEntryFilters(CashEntry::query(), $filters)
                ->selectRaw("
                    COALESCE(SUM(CASE WHEN category = 'in' THEN amount ELSE 0 END), 0) as cash_in_total,
                    COALESCE(SUM(CASE WHEN category = 'out' THEN amount ELSE 0 END), 0) as cash_out_total
                ")
                ->first()
            : (object) ['cash_in_total' => 0, 'cash_out_total' => 0];
        $membershipTotals = $includeMemberships
            ? (clone $membershipQuery)->get()->sum(fn ($membership) => (float) ($membership->plan?->price ?? 0))
            : 0;
        $appointmentDropInTotals = $includeAppointmentDropIns
            ? (float) ((clone $appointmentDropInQuery)->sum('price_amount') ?? 0)
            : 0;
        $timetableDropInTotals = $includeTimetableDropIns
            ? (float) ((clone $timetableDropInQuery)->sum('price_amount') ?? 0)
            : 0;

        $cashInTotal = (int) ($transactionTotals->cash_in_total ?? 0)
            + (int) $membershipTotals
            + (int) $appointmentDropInTotals
            + (int) $timetableDropInTotals
            + (int) ($cashEntryTotals->cash_in_total ?? 0);
        $cashOutTotal = (int) ($cashEntryTotals->cash_out_total ?? 0);

        $summary = [
            'cash_in_total' => $cashInTotal,
            'cash_out_total' => $cashOutTotal,
            'net_total' => $cashInTotal - $cashOutTotal,
        ];

        return Inertia::render('Dashboard/Reports/Cash', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $filters,
            'cashiers' => User::query()->role('cashier')->select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Export cash flow report to Excel.
     */
    public function export(Request $request)
    {
        $defaultDate = Carbon::today()->toDateString();
        $filters = [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
            'shift' => $request->input('shift'),
            'transaction_category' => $request->input('transaction_category'),
        ];

        $selectedCategories = $this->parseCategoryFilter($filters['transaction_category'] ?? null);

        $includeTransactions = empty($selectedCategories) || in_array(self::CATEGORY_SALES, $selectedCategories, true);
        $includeMemberships = empty($selectedCategories) || in_array(self::CATEGORY_MEMBERSHIP, $selectedCategories, true);
        $includeAppointmentDropIns = empty($selectedCategories) || in_array(self::CATEGORY_APPOINTMENT_DROP_IN, $selectedCategories, true);
        $includeTimetableDropIns = empty($selectedCategories) || in_array(self::CATEGORY_TIMETABLE_DROP_IN, $selectedCategories, true);
        $selectedCashCategories = empty($selectedCategories) ? [] : array_values(array_intersect($selectedCategories, self::CASH_ENTRY_CATEGORIES));
        $includeCashEntries = empty($selectedCategories) || ! empty($selectedCashCategories);

        $transactionQuery = $this->applyFilters(
            Transaction::query()->notCanceled()
                ->with(['cashier:id,name', 'customer:id,name']),
            $filters
        )->orderByDesc('created_at');

        $cashEntryQuery = $this->applyCashEntryFilters(
            CashEntry::query()->with(['cashier:id,name']),
            $filters
        )->orderByDesc('created_at');
        $membershipQuery = $this->applyMembershipFilters(
            UserMembership::query()
                ->whereNotIn('status', ['pending', 'pending_payment', 'cancelled', 'expired'])
                ->with(['plan:id,price', 'user:id,name']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['customer:id,name']),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['user:id,name']),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->customer?->name ? ($trx->invoice . ' - ' . mb_strtoupper($trx->customer->name)) : $trx->invoice,
                'cash_in' => (int) $trx->grand_total,
                'cash_out' => 0,
                'created_at' => $trx->created_at,
            ])
            : collect();

        $cashEntryList = $includeCashEntries
            ? (clone $cashEntryQuery)->get()->map(fn ($entry) => [
                'category' => $entry->transaction_category ?: 'UANG LAIN LAIN',
                'description' => $entry->description,
                'cash_in' => $entry->category === 'in' ? (int) $entry->amount : 0,
                'cash_out' => $entry->category === 'out' ? (int) $entry->amount : 0,
                'created_at' => $entry->created_at,
            ])
            : collect();
        $membershipList = $includeMemberships
            ? (clone $membershipQuery)->get()->map(fn ($membership) => [
                'category' => 'TRANSAKSI MEMBERSHIP',
                'description' => $membership->user?->name ? ($membership->invoice . ' - ' . mb_strtoupper($membership->user->name)) : $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
                'created_at' => $membership->created_at,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->customer?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->customer->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->user?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->user->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();

        $mergedRows = $transactionsList
            ->concat($cashEntryList)
            ->concat($membershipList)
            ->concat($appointmentDropInList)
            ->concat($timetableDropInList)
            ->sortByDesc('created_at')
            ->values();

        $rekapPerKategori = $mergedRows->groupBy('category')->map(function ($items, $catName) {
            return [
                'category' => $catName,
                'cash_in' => (int) $items->sum('cash_in'),
                'cash_out' => (int) $items->sum('cash_out'),
            ];
        })->values();

        return $this->downloadExcel('laporan-keuangan-cash.xls', $mergedRows, $rekapPerKategori);
    }

    /**
     * Export cash flow report to PDF.
     */
    public function exportPdf(Request $request)
    {
        $defaultDate = Carbon::today()->toDateString();
        $filters = [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
            'shift' => $request->input('shift'),
            'transaction_category' => $request->input('transaction_category'),
        ];

        $selectedCategories = $this->parseCategoryFilter($filters['transaction_category'] ?? null);

        $includeTransactions = empty($selectedCategories) || in_array(self::CATEGORY_SALES, $selectedCategories, true);
        $includeMemberships = empty($selectedCategories) || in_array(self::CATEGORY_MEMBERSHIP, $selectedCategories, true);
        $includeAppointmentDropIns = empty($selectedCategories) || in_array(self::CATEGORY_APPOINTMENT_DROP_IN, $selectedCategories, true);
        $includeTimetableDropIns = empty($selectedCategories) || in_array(self::CATEGORY_TIMETABLE_DROP_IN, $selectedCategories, true);
        $selectedCashCategories = empty($selectedCategories) ? [] : array_values(array_intersect($selectedCategories, self::CASH_ENTRY_CATEGORIES));
        $includeCashEntries = empty($selectedCategories) || ! empty($selectedCashCategories);

        $transactionQuery = $this->applyFilters(
            Transaction::query()->notCanceled()
                ->with(['cashier:id,name', 'customer:id,name']),
            $filters
        )->orderByDesc('created_at');

        $cashEntryQuery = $this->applyCashEntryFilters(
            CashEntry::query()->with(['cashier:id,name']),
            $filters
        )->orderByDesc('created_at');
        $membershipQuery = $this->applyMembershipFilters(
            UserMembership::query()
                ->whereNotIn('status', ['pending', 'pending_payment', 'cancelled', 'expired'])
                ->with(['plan:id,price', 'user:id,name']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['customer:id,name']),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in')
                ->with(['user:id,name']),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->customer?->name ? ($trx->invoice . ' - ' . mb_strtoupper($trx->customer->name)) : $trx->invoice,
                'cash_in' => (int) $trx->grand_total,
                'cash_out' => 0,
            ])
            : collect();

        $cashEntryList = $includeCashEntries
            ? (clone $cashEntryQuery)->get()->map(fn ($entry) => [
                'category' => $entry->transaction_category ?: 'UANG LAIN LAIN',
                'description' => $entry->description,
                'cash_in' => $entry->category === 'in' ? (int) $entry->amount : 0,
                'cash_out' => $entry->category === 'out' ? (int) $entry->amount : 0,
            ])
            : collect();
        $membershipList = $includeMemberships
            ? (clone $membershipQuery)->get()->map(fn ($membership) => [
                'category' => 'TRANSAKSI MEMBERSHIP',
                'description' => $membership->user?->name ? ($membership->invoice . ' - ' . mb_strtoupper($membership->user->name)) : $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->customer?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->customer->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->user?->name ? ($booking->invoice . ' - ' . mb_strtoupper($booking->user->name)) : $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
            ])
            : collect();

        $mergedRows = $transactionsList
            ->concat($cashEntryList)
            ->concat($membershipList)
            ->concat($appointmentDropInList)
            ->concat($timetableDropInList)
            ->values();

        $rekapPerKategori = $mergedRows->groupBy('category')->map(function ($items, $catName) {
            return [
                'category' => $catName,
                'cash_in' => (int) $items->sum('cash_in'),
                'cash_out' => (int) $items->sum('cash_out'),
            ];
        })->values();

        $totalCashIn = (int) $rekapPerKategori->sum('cash_in');
        $totalCashOut = (int) $rekapPerKategori->sum('cash_out');
        $saldoAkhir = $totalCashIn - $totalCashOut;

        $headers = ['Kategori', 'Deskripsi', 'Uang Masuk', 'Uang Keluar'];
        $pdfRows = $mergedRows->map(function ($row) {
            return [
                $row['category'],
                $row['description'],
                $this->formatCurrency((int) ($row['cash_in'] ?? 0)),
                $this->formatCurrency((int) ($row['cash_out'] ?? 0)),
            ];
        })->all();

        $columnWidths = [
            4.5, // Kategori
            10, // Deskripsi
            1.7, // Uang Masuk
            1.7, // Uang Keluar
        ];

        $section1 = [
            'title' => '',
            'headers' => $headers,
            'rows' => $pdfRows,
            'footer_lines' => [],
            'column_widths' => $columnWidths,
        ];

        $rekapPdfRows = $rekapPerKategori->map(function ($catRow) {
            return [
                $catRow['category'],
                $this->formatCurrency($catRow['cash_in']),
                $this->formatCurrency($catRow['cash_out']),
            ];
        })->all();

        $rekapPdfRows[] = [
            'TOTAL KESELURUHAN (GRAND TOTAL)',
            $this->formatCurrency($totalCashIn),
            $this->formatCurrency($totalCashOut),
        ];

        $rekapPdfRows[] = [
            '',
            'SALDO AKHIR',
            $this->formatCurrency($saldoAkhir),
            
        ];

        $section2 = [
            'title' => 'RINGKASAN / REKAPITULASI PER KATEGORI',
            'headers' => ['Kategori', 'Uang Masuk', 'Uang Keluar'],
            'rows' => $rekapPdfRows,
            'footer_lines' => [
                'Total Uang Masuk  : ' . $this->formatCurrency($totalCashIn),
                'Total Uang Keluar : ' . $this->formatCurrency($totalCashOut),
                'Saldo Akhir       : ' . $this->formatCurrency($saldoAkhir),
            ],
            'column_widths' => [8, 4, 4],
            'page_break_before' => true,
        ];

        return $this->downloadPdf(
            'laporan-keuangan-cash.pdf',
            'Laporan Keuangan Cash',
            $this->buildPeriodLabel($filters),
            [$section1, $section2]
        );
    }

    /**
     * Apply table filters.
     */
    protected function applyFilters($query, array $filters)
    {
        $query = $query
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $q->where(function ($builder) use ($search) {
                $builder->where('invoice', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', '%' . $search . '%'));
            }))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['customer_id'] ?? null, fn ($q, $customer) => $q->where('customer_id', $customer))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('created_at', '<=', $end));


        if (($filters['shift'] ?? null) === 'pagi') {
            $query->whereTime('created_at', '>=', '06:00:00')
                ->whereTime('created_at', '<', '15:00:00');
        }

        if (($filters['shift'] ?? null) === 'malam') {
            $query->whereTime('created_at', '>=', '15:00:00')
                ->whereTime('created_at', '<=', '23:59:59');
        }

        return $query;
    }

    /**
     * Apply table filters for cash entries.
     */
    protected function applyCashEntryFilters($query, array $filters)
    {
        $query = $query
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('created_at', '<=', $end));

        $selectedCategories = $this->parseCategoryFilter($filters['transaction_category'] ?? null);

        if (! empty($selectedCategories)) {
            $cashCats = array_values(array_intersect($selectedCategories, self::CASH_ENTRY_CATEGORIES));
            if (! empty($cashCats)) {
                $query->whereIn('transaction_category', $cashCats);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if (($filters['shift'] ?? null) === 'pagi') {
            $query->whereTime('created_at', '>=', '06:00:00')
                ->whereTime('created_at', '<', '15:00:00');
        }

        if (($filters['shift'] ?? null) === 'malam') {
            $query->whereTime('created_at', '>=', '15:00:00')
                ->whereTime('created_at', '<=', '23:59:59');
        }

        $query->when($filters['invoice'] ?? null, fn ($q, $search) => $q->where('description', 'like', '%' . $search . '%'));

        if (! empty($filters['customer_id'])) {
            $query->whereRaw('1 = 0');
        }

        return $query;
    }

    protected function applyMembershipFilters($query, array $filters)
    {
        return $query
            ->where(function ($q) {
                $q->whereNull('payment_method')
                  ->orWhere('payment_method', '!=', 'transfer_credits');
            })
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $q->where(function ($builder) use ($search) {
                $builder->where('invoice', 'like', '%' . $search . '%')
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', '%' . $search . '%'));
            }))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['customer_id'] ?? null, fn ($q, $customer) => $q->whereHas('user', fn ($uq) => $uq->whereHas('customer', fn ($cq) => $cq->where('id', $customer))))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('created_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('created_at', '>=', '06:00:00')->whereTime('created_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('created_at', '>=', '15:00:00')->whereTime('created_at', '<=', '23:59:59'));
    }

    protected function applyAppointmentDropInFilters($query, array $filters)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $q->where(function ($builder) use ($search) {
                $builder->where('invoice', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', '%' . $search . '%'));
            }))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['customer_id'] ?? null, fn ($q, $customer) => $q->where('customer_id', $customer))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('booked_at', '>=', '06:00:00')->whereTime('booked_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('booked_at', '>=', '15:00:00')->whereTime('booked_at', '<=', '23:59:59'));
    }

    protected function applyTimetableDropInFilters($query, array $filters)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $q->where(function ($builder) use ($search) {
                $builder->where('invoice', 'like', '%' . $search . '%')
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', '%' . $search . '%'));
            }))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['customer_id'] ?? null, fn ($q, $customer) => $q->whereHas('user', fn ($uq) => $uq->whereHas('customer', fn ($cq) => $cq->where('id', $customer))))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('booked_at', '>=', '06:00:00')->whereTime('booked_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('booked_at', '>=', '15:00:00')->whereTime('booked_at', '<=', '23:59:59'));
    }

    /**
     * Paginate merged report rows.
     */
    protected function paginateRows(Collection $rows, Request $request, int $perPage = 10)
    {
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $pageItems = $rows->forPage($currentPage, $perPage)->values();

        return new LengthAwarePaginator($pageItems, $rows->count(), $perPage, $currentPage, [
            'path' => LengthAwarePaginator::resolveCurrentPath(),
            'query' => $request->query(),
        ]);
    }

    protected function formatCurrency(int $value): string
    {
        return 'Rp ' . number_format($value, 0, ',', '.');
    }

    protected function buildPeriodLabel(array $filters): string
    {
        $startDate = $filters['start_date'] ?? '-';
        $endDate = $filters['end_date'] ?? '-';

        return 'PERIODE : ' . $startDate . ' s/d ' . $endDate;
    }

    protected function downloadExcel(string $filename, Collection $mergedRows, Collection $rekapPerKategori)
    {
        return response()->streamDownload(function () use ($mergedRows, $rekapPerKategori) {
            $mainCount = $mergedRows->count();

            // Baris 1: Header Tabel Utama
            // Baris 2 s/d mainTableLastRow: Data Transaksi
            $mainTableLastRow = $mainCount > 0 ? ($mainCount + 1) : 2;

            $rekapTitleRow = $mainTableLastRow + 4;
            $rekapHeaderRow = $rekapTitleRow + 1;

            $rekapCount = $rekapPerKategori->count();
            $rekapStartRow = $rekapHeaderRow + 1;
            $rekapEndRow = $rekapCount > 0 ? ($rekapStartRow + $rekapCount - 1) : $rekapStartRow;

            $totalRow = $rekapEndRow + 1;

            echo '<!DOCTYPE html><html><head><meta charset="utf-8">';
            echo '<style>';
            echo 'body { font-family: Arial, sans-serif; font-size: 10pt; }';
            echo 'table { border-collapse: collapse; width: 100%; }';
            echo 'th, td { border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: middle; }';
            echo '.header-col { background-color: #f1f5f9; color: #0f172a; font-weight: bold; text-align: center; }';
            echo '.header-rekap { background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 11pt; text-align: left; }';
            echo '.num { text-align: right; mso-number-format: \'"Rp "#,##0;[Red]"Rp "-#,##0;"Rp "0\'; }';
            echo '.total-row { background-color: #f8fafc; font-weight: bold; }';
            echo '.saldo-row { background-color: #e2e8f0; font-weight: bold; font-size: 11pt; }';
            echo '</style></head><body>';
            echo '<table>';

            // Main Table Header
            echo '<thead><tr class="header-col">';
            echo '<th>Kategori</th><th>Deskripsi</th><th>Uang Masuk</th><th>Uang Keluar</th>';
            echo '</tr></thead><tbody>';

            // Main Table Rows
            if ($mainCount > 0) {
                foreach ($mergedRows as $row) {
                    echo '<tr>';
                    echo '<td>' . e($row['category']) . '</td>';
                    echo '<td>' . e($row['description']) . '</td>';
                    echo '<td class="num">' . (int) ($row['cash_in'] ?? 0) . '</td>';
                    echo '<td class="num">' . (int) ($row['cash_out'] ?? 0) . '</td>';
                    echo '</tr>';
                }
            } else {
                echo '<tr><td colspan="4" style="text-align:center;">Tidak ada data.</td></tr>';
            }

            // Main Table Total Row
            echo '<tr>';
            echo '<td colspan="2" class="total-row" style="text-align:right;">TOTAL TRANSAKSI</td>';
            echo '<td class="num total-row">=SUM(C2:C' . $mainTableLastRow . ')</td>';
            echo '<td class="num total-row">=SUM(D2:D' . $mainTableLastRow . ')</td>';
            echo '</tr>';

            // 2 Empty Rows as Separator
            echo '<tr><td colspan="4" style="border:none;">&nbsp;</td></tr>';
            echo '<tr><td colspan="4" style="border:none;">&nbsp;</td></tr>';

            // Section Header: "RINGKASAN / REKAPITULASI PER KATEGORI"
            // 1. Baris Judul Rekap (Hanya colspan 4: Kolom A, B, C, D)
            echo '<tr>';
            echo '<th colspan="4" class="header-rekap">RINGKASAN / REKAPITULASI PER KATEGORI</th>';
            echo '</tr>';

            // Rekap Table Column Headers
            echo '<tr>';
            echo '<th colspan="2" class="header-col">Kategori</th>';
            echo '<th class="header-col">Uang Masuk</th>';
            echo '<th class="header-col">Uang Keluar</th>';
            echo '</tr>';

            // Rekap Rows
            if ($rekapCount > 0) {
                foreach ($rekapPerKategori as $catRow) {
                    echo '<tr>';
                    echo '<td colspan="2">' . e($catRow['category']) . '</td>';
                    echo '<td class="num">' . (int) $catRow['cash_in'] . '</td>';
                    echo '<td class="num">' . (int) $catRow['cash_out'] . '</td>';
                    echo '</tr>';
                }
            } else {
                echo '<tr>';
                echo '<td>Tidak ada data</td><td></td>';
                echo '<td class="num">0</td>';
                echo '<td class="num">0</td>';
                echo '</tr>';
            }

            // Total Keseluruhan Row (with Excel SUM formulas)
            echo '<tr>';
            echo '<td colspan="2" class="total-row" style="text-align:left;">TOTAL KESELURUHAN (GRAND TOTAL)</td>';
            echo '<td class="num total-row">=SUM(C' . $rekapStartRow . ':C' . $rekapEndRow . ')</td>';
            echo '<td class="num total-row">=SUM(D' . $rekapStartRow . ':D' . $rekapEndRow . ')</td>';
            echo '</tr>';

            // Saldo Akhir Row (with Excel subtraction formula)
            echo '<tr>';
            echo '<td colspan="2" class="saldo-row" style="text-align:left;">SALDO AKHIR</td>';
            echo '<td colspan="2" class="num saldo-row">=C' . $totalRow . '-D' . $totalRow . '</td>';
            echo '</tr>';

            echo '</tbody></table></body></html>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    private function downloadPdf(
        string $filename,
        string $title,
        string $period,
        array $sections
    ) {
        $pdfBinary = SimplePdfExport::make(
            $title,
            $period,
            [],
            [],
            $sections,
            'landscape'
        );

        return response($pdfBinary)
            ->header('Content-Type', 'application/pdf')
            ->header(
                'Content-Disposition',
                'attachment; filename="'.$filename.'"'
            );
    }

    private function parseCategoryFilter($categoryInput): array
    {
        if (empty($categoryInput)) {
            return [];
        }

        if (is_array($categoryInput)) {
            return array_values(array_filter($categoryInput));
        }

        return array_values(array_filter(explode(',', (string) $categoryInput)));
    }
}
