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

        $includeTransactions = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_SALES;
        $includeMemberships = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_MEMBERSHIP;
        $includeAppointmentDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_APPOINTMENT_DROP_IN;
        $includeTimetableDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_TIMETABLE_DROP_IN;
        $includeCashEntries = empty($filters['transaction_category']) || in_array($filters['transaction_category'], self::CASH_ENTRY_CATEGORIES, true);

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
                ->with(['plan:id,price']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'id' => 'transaction-' . $trx->id,
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->invoice,
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
                'description' => $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
                'created_at' => $membership->created_at,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'id' => 'appointment-drop-in-' . $booking->id,
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'id' => 'timetable-drop-in-' . $booking->id,
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->invoice,
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
            'cashiers' => $this->getCashierOptions(),
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

        $includeTransactions = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_SALES;
        $includeMemberships = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_MEMBERSHIP;
        $includeAppointmentDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_APPOINTMENT_DROP_IN;
        $includeTimetableDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_TIMETABLE_DROP_IN;
        $includeCashEntries = empty($filters['transaction_category']) || in_array($filters['transaction_category'], self::CASH_ENTRY_CATEGORIES, true);

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
                ->with(['plan:id,price']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->invoice,
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
                'description' => $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
                'created_at' => $membership->created_at,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
                'created_at' => $booking->booked_at ?? $booking->created_at,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->invoice,
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

        $headers = ['Kategori', 'Deskripsi', 'Uang Masuk', 'Uang Keluar'];
        $rows = $mergedRows->map(function ($row) {
            return [
                $row['category'],
                $row['description'],
                $this->formatCurrency((int) ($row['cash_in'] ?? 0)),
                $this->formatCurrency((int) ($row['cash_out'] ?? 0)),
            ];
        })->all();

        return $this->downloadExcel('laporan-keuangan-cash.xls', $headers, $rows);
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

        $includeTransactions = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_SALES;
        $includeMemberships = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_MEMBERSHIP;
        $includeAppointmentDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_APPOINTMENT_DROP_IN;
        $includeTimetableDropIns = empty($filters['transaction_category']) || $filters['transaction_category'] === self::CATEGORY_TIMETABLE_DROP_IN;
        $includeCashEntries = empty($filters['transaction_category']) || in_array($filters['transaction_category'], self::CASH_ENTRY_CATEGORIES, true);

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
                ->with(['plan:id,price']),
            $filters
        )->orderByDesc('created_at');
        $appointmentDropInQuery = $this->applyAppointmentDropInFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');
        $timetableDropInQuery = $this->applyTimetableDropInFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->where('payment_type', 'drop_in'),
            $filters
        )->orderByDesc('booked_at');

        $transactionsList = $includeTransactions
            ? (clone $transactionQuery)->get()->map(fn ($trx) => [
                'category' => 'TRANSAKSI PENJUALAN PRODUK',
                'description' => $trx->invoice,
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
                'description' => $membership->invoice,
                'cash_in' => (int) ($membership->plan?->price ?? 0),
                'cash_out' => 0,
            ])
            : collect();
        $appointmentDropInList = $includeAppointmentDropIns
            ? (clone $appointmentDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI APPOINTMENT',
                'description' => $booking->invoice,
                'cash_in' => (int) $booking->price_amount,
                'cash_out' => 0,
            ])
            : collect();
        $timetableDropInList = $includeTimetableDropIns
            ? (clone $timetableDropInQuery)->get()->map(fn ($booking) => [
                'category' => 'TRANSAKSI BOOKING SCHEDULE',
                'description' => $booking->invoice,
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

        $headers = ['Kategori', 'Deskripsi', 'Uang Masuk', 'Uang Keluar'];
        $rows = $mergedRows->map(function ($row) {
            return [
                $row['category'],
                $row['description'],
                $this->formatCurrency((int) ($row['cash_in'] ?? 0)),
                $this->formatCurrency((int) ($row['cash_out'] ?? 0)),
            ];
        })->all();

        return $this->downloadPdf('laporan-keuangan-cash.pdf', 'Laporan Keuangan Cash', $this->buildPeriodLabel($filters), $headers, $rows);
    }

    /**
     * Apply table filters.
     */
    protected function applyFilters($query, array $filters)
    {
        $query = $query
            ->when($filters['invoice'] ?? null, fn ($q, $invoice) => $q->where('invoice', 'like', '%' . $invoice . '%'))
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

        if (! empty($filters['transaction_category']) && $filters['transaction_category'] !== 'transaksi_penjualan') {
            $query->where('transaction_category', $filters['transaction_category']);
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
            ->when($filters['invoice'] ?? null, fn ($q, $invoice) => $q->where('invoice', 'like', '%' . $invoice . '%'))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('created_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('created_at', '>=', '06:00:00')->whereTime('created_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('created_at', '>=', '15:00:00')->whereTime('created_at', '<=', '23:59:59'));
    }

    protected function applyAppointmentDropInFilters($query, array $filters)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $invoice) => $q->where('invoice', 'like', '%' . $invoice . '%'))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('booked_at', '>=', '06:00:00')->whereTime('booked_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('booked_at', '>=', '15:00:00')->whereTime('booked_at', '<=', '23:59:59'));
    }

    protected function applyTimetableDropInFilters($query, array $filters)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $invoice) => $q->where('invoice', 'like', '%' . $invoice . '%'))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->when(($filters['shift'] ?? null) === 'pagi', fn ($q) => $q->whereTime('booked_at', '>=', '06:00:00')->whereTime('booked_at', '<', '15:00:00'))
            ->when(($filters['shift'] ?? null) === 'malam', fn ($q) => $q->whereTime('booked_at', '>=', '15:00:00')->whereTime('booked_at', '<=', '23:59:59'));
    }


    protected function getCashierOptions()
    {
        return User::query()
            ->role('cashier')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
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

    protected function downloadExcel(string $filename, array $headers, array $rows)
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            echo '<table border="1"><thead><tr>';
            foreach ($headers as $header) {
                echo '<th>' . e($header) . '</th>';
            }
            echo '</tr></thead><tbody>';
            foreach ($rows as $row) {
                echo '<tr>';
                foreach ($row as $cell) {
                    echo '<td>' . e((string) $cell) . '</td>';
                }
                echo '</tr>';
            }
            echo '</tbody></table>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    protected function downloadPdf(string $filename, string $title, string $period, array $headers, array $rows)
    {
        $pdfBinary = SimplePdfExport::make($title, $period, $headers, $rows);

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
