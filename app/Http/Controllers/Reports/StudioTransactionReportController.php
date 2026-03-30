<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\PilatesBooking;
use App\Models\UserMembership;
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
                'title' => 'Laporan Booking',
                'description' => 'Laporan transaksi booking dengan status confirmed.',
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
                'description' => 'Laporan transaksi appointment dengan status confirmed.',
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
                'description' => 'Laporan transaksi membership yang sudah diinput (bukan menunggu pembayaran, cancelled, atau expired).',
                'route' => 'reports.membership.index',
            ],
            'filters' => $filters,
            'rows' => $memberships,
            'summary' => $summary,
            'paymentMethods' => $this->extractPaymentMethods(
                UserMembership::query()->whereNotIn('status', $excludedStatus)
            ),
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
}
