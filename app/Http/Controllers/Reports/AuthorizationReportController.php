<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\PilatesBooking;
use App\Models\Transaction;
use App\Models\UserMembership;
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
}