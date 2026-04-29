<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\PilatesBooking;
use App\Models\Transaction;
use App\Models\UserMembership;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class AuthorizationReportController extends Controller
{
    /**
     * Display authorization report.
     */
    public function index(Request $request)
    {
        $defaultDate = Carbon::today()->toDateString();
        $filters = [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
        ];

        $items = collect()
            ->merge($this->formatTransactions($this->applyFilters(
                Transaction::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                PilatesBooking::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                AppointmentBooking::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                UserMembership::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->sortByDesc('canceled_at')
            ->values();

        $perPage = 10;
        $page = LengthAwarePaginator::resolveCurrentPage();
        $transactions = new LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(),
            $items->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Dashboard/Reports/Authorization', [
            'transactions' => $transactions,
            'filters' => $filters,
        ]);
    }

    protected function applyFilters($query, array $filters)
    {
        return $query
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('canceled_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('canceled_at', '<=', $end));
    }

    protected function formatTransactions($rows)
    {
        return $rows->map(fn ($row) => [
            'id' => $row->id,
            'invoice' => $row->invoice,
            'cashier' => [
                'name' => $row->cashier?->name ?? 'System',
            ],
            'cancellation_note' => $row->cancellation_note,
            'canceled_by_email' => $row->canceled_by_email,
            // PERBAIKAN DI SINI: Format Carbon ke String dengan Timezone Jakarta
            'canceled_at' => $row->canceled_at 
                ? Carbon::parse($row->canceled_at)->timezone('Asia/Jakarta')->format('Y-m-d H:i:s') 
                : null,
        ]);
    }

    public function export(Request $request)
    {
        $filters = $this->getFilters($request);
        $rows = $this->getFilteredItems($filters)->values()->map(fn ($transaction, $index) => [
            $index + 1,
            $transaction['invoice'] ?? '-',
            $transaction['cashier']['name'] ?? '-',
            $transaction['cancellation_note'] ?? '-',
            $transaction['canceled_by_email'] ?? '-',
            $transaction['canceled_at'] ?? '-',
        ])->all();

        return response()->streamDownload(function () use ($rows) {
            echo '<html><head><style>@page { size: landscape; } table { width: 100%; border-collapse: collapse; } th, td { padding: 6px; }</style></head><body>';
            echo '<table border="1"><thead><tr><th>No</th><th>Invoice</th><th>Kasir</th><th>Keterangan</th><th>Username / Email</th><th>Waktu</th></tr></thead><tbody>';
            foreach ($rows as $row) {
                echo '<tr>';
                foreach ($row as $cell) {
                    echo '<td>' . e((string) $cell) . '</td>';
                }
                echo '</tr>';
            }
            echo '</tbody></table></body></html>';
        }, 'laporan-otorisasi.xls', [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->getFilters($request);
        $rows = $this->getFilteredItems($filters)->values()->map(fn ($transaction, $index) => [
            $index + 1,
            $transaction['invoice'] ?? '-',
            $transaction['cashier']['name'] ?? '-',
            $transaction['cancellation_note'] ?? '-',
            $transaction['canceled_by_email'] ?? '-',
            $transaction['canceled_at'] ?? '-',
        ])->all();

        $pdfBinary = SimplePdfExport::make(
            'Laporan Otorisasi',
            'PERIODE : ' . ($filters['start_date'] ?? '-') . ' s/d ' . ($filters['end_date'] ?? '-'),
            ['No', 'Invoice', 'Kasir', 'Keterangan', 'Username / Email', 'Waktu'],
            $rows,
            [],
            'landscape'
        );

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="laporan-otorisasi.pdf"',
        ]);
    }

    private function getFilters(Request $request): array
    {
        $defaultDate = Carbon::today()->toDateString();

        return [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
        ];
    }

    private function getFilteredItems(array $filters)
    {
        return collect()
            ->merge($this->formatTransactions($this->applyFilters(
                Transaction::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                PilatesBooking::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                AppointmentBooking::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->merge($this->formatTransactions($this->applyFilters(
                UserMembership::query()->whereNotNull('canceled_at')->with(['cashier:id,name']),
                $filters
            )->get()))
            ->sortByDesc('canceled_at')
            ->values();
    }
}
