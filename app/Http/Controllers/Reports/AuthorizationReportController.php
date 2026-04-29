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
use Illuminate\Support\Collection;
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

        $transactions = $this->buildAuthorizationRows($filters, $request);

        return Inertia::render('Dashboard/Reports/Authorization', [
            'transactions' => $transactions,
            'filters' => $filters,
        ]);
    }

    protected function buildAuthorizationRows(array $filters, Request $request): LengthAwarePaginator
    {
        $posTransactions = $this->applyFilters(
            Transaction::query()
                ->whereNotNull('canceled_at')
                ->with(['cashier:id,name', 'customer:id,name']),
            $filters
        )
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => 'transaction-'.$transaction->id,
                'invoice' => $transaction->invoice,
                'cashier' => ['name' => $transaction->cashier?->name],
                'cancellation_note' => $transaction->cancellation_note,
                'canceled_by_email' => $transaction->canceled_by_email,
                'canceled_at' => $transaction->canceled_at,
            ]);

        $scheduleBookings = $this->applyCancelledStatusFilters(
            PilatesBooking::query()
                ->where('status', 'cancelled')
                ->with(['user:id,name,email']),
            $filters
        )
            ->get()
            ->map(fn (PilatesBooking $booking) => [
                'id' => 'schedule-'.$booking->id,
                'invoice' => $booking->invoice,
                'cashier' => ['name' => $booking->user?->name],
                'cancellation_note' => 'Pembatalan dari Riwayat Booking Schedule.',
                'canceled_by_email' => $booking->user?->email,
                'canceled_at' => optional($booking->updated_at)->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        $appointmentBookings = $this->applyCancelledStatusFilters(
            AppointmentBooking::query()
                ->where('status', 'cancelled')
                ->with(['user:id,name,email']),
            $filters
        )
            ->get()
            ->map(fn (AppointmentBooking $booking) => [
                'id' => 'appointment-'.$booking->id,
                'invoice' => $booking->invoice,
                'cashier' => ['name' => $booking->user?->name],
                'cancellation_note' => 'Pembatalan dari Riwayat Appointment.',
                'canceled_by_email' => $booking->user?->email,
                'canceled_at' => optional($booking->updated_at)->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        $memberships = $this->applyCancelledStatusFilters(
            UserMembership::query()
                ->where('status', 'cancelled')
                ->with(['user:id,name,email']),
            $filters
        )
            ->get()
            ->map(fn (UserMembership $membership) => [
                'id' => 'membership-'.$membership->id,
                'invoice' => $membership->invoice,
                'cashier' => ['name' => $membership->user?->name],
                'cancellation_note' => 'Pembatalan dari Riwayat Membership.',
                'canceled_by_email' => $membership->user?->email,
                'canceled_at' => optional($membership->updated_at)->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        $rows = Collection::make()
            ->concat($posTransactions)
            ->concat($scheduleBookings)
            ->concat($appointmentBookings)
            ->concat($memberships)
            ->sortByDesc('canceled_at')
            ->values();

        $page = max((int) $request->integer('page', 1), 1);
        $perPage = 10;
        $items = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $rows->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
    }

    protected function applyFilters($query, array $filters)
    {
        return $query
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('canceled_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('canceled_at', '<=', $end));
    }

    protected function applyCancelledStatusFilters($query, array $filters)
    {
        return $query
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('updated_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('updated_at', '<=', $end));
    }
}
