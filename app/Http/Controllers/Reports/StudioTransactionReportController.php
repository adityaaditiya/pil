<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\MembershipPlan;
use App\Models\PilatesBooking;
use App\Models\UserMembership;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudioTransactionReportController extends Controller
{
    public function booking(Request $request)
    {
        $filters = $this->buildFilters($request);

        $baseQuery = $this->applyDateAndInvoiceFilters(
            PilatesBooking::query()
                ->where('status', 'confirmed')
                ->with(['user:id,name', 'timetable:id,pilates_class_id', 'timetable.pilatesClass:id,name']),
            $filters,
            'booked_at'
        )
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method));

        $bookings = (clone $baseQuery)
            ->latest('booked_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (PilatesBooking $booking) => [
                'id' => $booking->id,
                'created_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'invoice' => $booking->invoice,
                'customer_name' => $booking->user?->name ?? '-',
                'item_name' => $booking->timetable?->pilatesClass?->name ?? '-',
                'payment_method' => $booking->payment_method ?? '-',
                'qty' => (int) ($booking->participants ?? 0),
                'amount' => (float) ($booking->price_amount ?? 0),
            ]);

        $summary = [
            'transactions_count' => (clone $baseQuery)->count(),
            'total_amount' => (float) ((clone $baseQuery)->sum('price_amount') ?? 0),
            'total_qty' => (int) ((clone $baseQuery)->sum('participants') ?? 0),
            'qty_label' => 'Peserta',
        ];

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Booking Schedule',
                'description' => 'Laporan transaksi booking schedule',
                'route' => 'reports.booking.index',
            ],
            'filters' => $filters,
            'rows' => $bookings,
            'summary' => $summary,
            'paymentMethods' => $this->extractPaymentMethods(
                PilatesBooking::query()->where('status', 'confirmed')
            ),
        ]);
    }

    public function appointment(Request $request)
    {
        $filters = $this->buildFilters($request);

        $baseQuery = $this->applyDateAndInvoiceFilters(
            AppointmentBooking::query()
                ->where('status', 'confirmed')
                ->with(['customer:id,name', 'appointment:id,pilates_class_id', 'appointment.pilatesClass:id,name']),
            $filters,
            'booked_at'
        )
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method));

        $appointments = (clone $baseQuery)
            ->latest('booked_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (AppointmentBooking $booking) => [
                'id' => $booking->id,
                'created_at' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'invoice' => $booking->invoice,
                'customer_name' => $booking->customer?->name ?? '-',
                'item_name' => $booking->appointment?->pilatesClass?->name ?? ($booking->session_name ?? '-'),
                'payment_method' => $booking->payment_method ?? '-',
                'qty' => 1,
                'amount' => (float) ($booking->price_amount ?? 0),
            ]);

        $summary = [
            'transactions_count' => (clone $baseQuery)->count(),
            'total_amount' => (float) ((clone $baseQuery)->sum('price_amount') ?? 0),
            'total_qty' => (int) ((clone $baseQuery)->count() ?? 0),
            'qty_label' => 'Sesi',
        ];

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Appointment',
                'description' => 'Laporan transaksi appointment',
                'route' => 'reports.appointment.index',
            ],
            'filters' => $filters,
            'rows' => $appointments,
            'summary' => $summary,
            'paymentMethods' => $this->extractPaymentMethods(
                AppointmentBooking::query()->where('status', 'confirmed')
            ),
        ]);
    }

    public function membership(Request $request)
    {
        $filters = $this->buildFilters($request);

        $excludedStatus = ['pending', 'pending_payment', 'cancelled', 'expired'];

        $baseQuery = $this->applyDateAndInvoiceFilters(
            UserMembership::query()
                ->whereNotIn('status', $excludedStatus)
                ->with(['user:id,name', 'plan:id,name,price']),
            $filters,
            'created_at'
        )
            ->when($filters['membership_plan_id'] ?? null, fn ($q, $planId) => $q->where('membership_plan_id', $planId))
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method));

        $memberships = (clone $baseQuery)
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (UserMembership $membership) => [
                'id' => $membership->id,
                'created_at' => $membership->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'invoice' => $membership->invoice,
                'customer_name' => $membership->user?->name ?? '-',
                'item_name' => $membership->plan?->name ?? '-',
                'payment_method' => $membership->payment_method ?? '-',
                'qty' => (int) ($membership->credits_total ?? 0),
                'amount' => (float) ($membership->plan?->price ?? 0),
            ]);

        $summary = [
            'transactions_count' => (clone $baseQuery)->count(),
            'total_amount' => (float) ((clone $baseQuery)->get()->sum(fn ($item) => (float) ($item->plan?->price ?? 0))),
            'total_qty' => (int) ((clone $baseQuery)->sum('credits_total') ?? 0),
            'qty_label' => 'Kredit',
        ];

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Membership',
                'description' => 'Laporan transaksi membership',
                'route' => 'reports.membership.index',
            ],
            'filters' => $filters,
            'rows' => $memberships,
            'summary' => $summary,
            'paymentMethods' => $this->extractPaymentMethods(
                UserMembership::query()->whereNotIn('status', $excludedStatus)
            ),
            'membershipPlans' => MembershipPlan::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    private function buildFilters(Request $request): array
    {
        $defaultDate = Carbon::today()->toDateString();

        return [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
            'invoice' => trim((string) $request->input('invoice')),
            'payment_method' => $request->input('payment_method'),
            'membership_plan_id' => $request->input('membership_plan_id'),
        ];
    }

    private function applyDateAndInvoiceFilters($query, array $filters, string $dateColumn)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $invoice) => $q->where('invoice', 'like', '%' . strtoupper($invoice) . '%'))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate($dateColumn, '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate($dateColumn, '<=', $end));
    }

    private function extractPaymentMethods($query)
    {
        return $query
            ->whereNotNull('payment_method')
            ->where('payment_method', '!=', '')
            ->select('payment_method')
            ->distinct()
            ->orderBy('payment_method')
            ->pluck('payment_method');
    }

    public function bookingExport(Request $request)
    {
        return $this->exportStudioReport($request, 'booking', false);
    }

    public function bookingExportPdf(Request $request)
    {
        return $this->exportStudioReport($request, 'booking', true);
    }

    public function appointmentExport(Request $request)
    {
        return $this->exportStudioReport($request, 'appointment', false);
    }

    public function appointmentExportPdf(Request $request)
    {
        return $this->exportStudioReport($request, 'appointment', true);
    }

    public function membershipExport(Request $request)
    {
        return $this->exportStudioReport($request, 'membership', false);
    }

    public function membershipExportPdf(Request $request)
    {
        return $this->exportStudioReport($request, 'membership', true);
    }

    private function exportStudioReport(Request $request, string $type, bool $asPdf)
    {
        $filters = $this->buildFilters($request);
        [$title, $rows] = $this->buildExportRows($type, $filters);
        $headers = ['No', 'Tanggal', 'Invoice', 'Pelanggan', 'Item', 'Metode Pembayaran', 'Qty', 'Total'];

        if (! $asPdf) {
            return $this->downloadExcel('laporan-' . $type . '.xls', $headers, $rows);
        }

        $pdfBinary = SimplePdfExport::make(
            $title,
            'PERIODE : ' . ($filters['start_date'] ?? '-') . ' s/d ' . ($filters['end_date'] ?? '-'),
            $headers,
            $rows,
            [],
            'landscape'
        );

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="laporan-' . $type . '.pdf"',
        ]);
    }

    private function buildExportRows(string $type, array $filters): array
    {
        if ($type === 'booking') {
            $items = $this->applyDateAndInvoiceFilters(
                PilatesBooking::query()->where('status', 'confirmed')->with(['user:id,name', 'timetable:id,pilates_class_id', 'timetable.pilatesClass:id,name']),
                $filters,
                'booked_at'
            )->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
                ->latest('booked_at')->get();

            return ['Laporan Booking Schedule', $items->values()->map(fn ($booking, $index) => [
                $index + 1,
                $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                $booking->invoice ?? '-',
                $booking->user?->name ?? '-',
                $booking->timetable?->pilatesClass?->name ?? '-',
                $booking->payment_method ?? '-',
                (int) ($booking->participants ?? 0),
                (float) ($booking->price_amount ?? 0),
            ])->all()];
        }

        if ($type === 'membership') {
            $excludedStatus = ['pending', 'pending_payment', 'cancelled', 'expired'];
            $items = $this->applyDateAndInvoiceFilters(
                UserMembership::query()->whereNotIn('status', $excludedStatus)->with(['user:id,name', 'plan:id,name,price']),
                $filters,
                'created_at'
            )->when($filters['membership_plan_id'] ?? null, fn ($q, $planId) => $q->where('membership_plan_id', $planId))
                ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
                ->latest('created_at')->get();

            return ['Laporan Membership', $items->values()->map(fn ($membership, $index) => [
                $index + 1,
                $membership->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                $membership->invoice ?? '-',
                $membership->user?->name ?? '-',
                $membership->plan?->name ?? '-',
                $membership->payment_method ?? '-',
                (int) ($membership->credits_total ?? 0),
                (float) ($membership->plan?->price ?? 0),
            ])->all()];
        }

        $items = $this->applyDateAndInvoiceFilters(
            AppointmentBooking::query()->where('status', 'confirmed')->with(['customer:id,name', 'appointment:id,pilates_class_id', 'appointment.pilatesClass:id,name']),
            $filters,
            'booked_at'
        )->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->latest('booked_at')->get();

        return ['Laporan Appointment', $items->values()->map(fn ($booking, $index) => [
            $index + 1,
            $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
            $booking->invoice ?? '-',
            $booking->customer?->name ?? '-',
            $booking->appointment?->pilatesClass?->name ?? ($booking->session_name ?? '-'),
            $booking->payment_method ?? '-',
            1,
            (float) ($booking->price_amount ?? 0),
        ])->all()];
    }

    private function downloadExcel(string $filename, array $headers, array $rows)
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            echo '<html><head><style>@page { size: landscape; } table { width: 100%; border-collapse: collapse; } th, td { padding: 6px; }</style></head><body>';
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
            echo '</tbody></table></body></html>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

}
