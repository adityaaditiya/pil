<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\StockMutation;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMutationReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->buildFilters($request);

        $query = $this->buildBaseQuery($filters)
            ->orderByDesc('created_at');

        $mutations = (clone $query)->paginate(10)->withQueryString();


        // 🔥 query totals (JANGAN pakai orderBy)
        $totals = StockMutation::query()
            ->when($filters['start_date'], fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'], fn ($q, $end) => $q->whereDate('created_at', '<=', $end))
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

    public function export(Request $request)
    {
        $filters = $this->buildFilters($request);
        $rows = $this->buildBaseQuery($filters)->get();

        $headers = ['No', 'Tanggal', 'Produk', 'Tipe', 'Jumlah', 'Catatan', 'User'];
        $excelRows = $rows->values()->map(fn ($item, $index) => [
            $index + 1,
            optional($item->created_at)?->timezone('Asia/Jakarta')?->format('d M Y, H:i') ?? '-',
            $item->product?->title ?? '-',
            $item->type === 'in' ? 'Tambah' : 'Kurang',
            (int) ($item->qty ?? 0),
            $item->note ?? '-',
            $item->user?->name ?? '-',
        ])->all();

        return $this->downloadExcel('laporan-kelola-stok.xls', $headers, $excelRows);
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->buildFilters($request);
        $rows = $this->buildBaseQuery($filters)->get();

        $headers = ['No', 'Tanggal', 'Produk', 'Tipe', 'Jumlah', 'Catatan', 'User'];
        $pdfRows = $rows->values()->map(fn ($item, $index) => [
            $index + 1,
            optional($item->created_at)?->timezone('Asia/Jakarta')?->format('d M Y, H:i') ?? '-',
            $item->product?->title ?? '-',
            $item->type === 'in' ? 'Tambah' : 'Kurang',
            (int) ($item->qty ?? 0),
            $item->note ?? '-',
            $item->user?->name ?? '-',
        ])->all();

        $pdfBinary = SimplePdfExport::make(
            'Laporan Kelola Stok',
            'PERIODE : ' . ($filters['start_date'] ?? '-') . ' s/d ' . ($filters['end_date'] ?? '-'),
            $headers,
            $pdfRows,
            [],
            'landscape'
        );

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="laporan-kelola-stok.pdf"',
        ]);
    }

    private function buildFilters(Request $request): array
    {
        $defaultDate = Carbon::today()->toDateString();

        return [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
        ];
    }

    private function buildBaseQuery(array $filters)
    {
        return StockMutation::query()
            ->with(['product:id,title', 'user:id,name'])
            ->when($filters['start_date'], fn ($q, $start) => $q->whereDate('created_at', '>=', $start))
            ->when($filters['end_date'], fn ($q, $end) => $q->whereDate('created_at', '<=', $end));
    }

    private function downloadExcel(string $filename, array $headers, array $rows)
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

}
