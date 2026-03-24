<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\StockMutation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMutationReportController extends Controller
{
    public function index(Request $request)
    {
        $defaultDate = Carbon::today()->toDateString();

        $filters = [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
        ];

        $query = StockMutation::query()
            ->with(['product:id,title', 'user:id,name'])
            ->when($filters['start_date'], fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'], fn ($q, $end) => $q->whereDate('created_at', '<=', $end))
            ->orderByDesc('created_at');

        $mutations = (clone $query)->paginate(10)->withQueryString();

        $totals = (clone $query)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'in' THEN qty ELSE 0 END), 0) as total_in")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'out' THEN qty ELSE 0 END), 0) as total_out")
            ->first();

        return Inertia::render('Dashboard/Reports/StockMutations', [
            'mutations' => $mutations,
            'filters' => $filters,
            'summary' => [
                'total_in' => (int) ($totals->total_in ?? 0),
                'total_out' => (int) ($totals->total_out ?? 0),
            ],
        ]);
    }
}
