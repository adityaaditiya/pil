<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\MembershipPlan;
use App\Models\PilatesBooking;
use App\Models\User;
use App\Models\UserMembership;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
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
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId));

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
                'qty' => $booking->payment_type === 'credit' ? (float) ($booking->credit_used ?? 0) : '-',
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
            'cashiers' => $this->getCashierOptions(),
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
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId));

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
                'qty' => $booking->payment_type === 'credit' ? (int) ($booking->credit_used ?? 0) : '-',
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
            'cashiers' => $this->getCashierOptions(),
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
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId));

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
                'amount' => $membership->payment_method === 'transfer_credits' ? 0 : (float) ($membership->plan?->price ?? 0),
            ]);

        $summary = [
            'transactions_count' => (clone $baseQuery)->count(),
            'total_amount' => (float) ((clone $baseQuery)->get()->sum(fn ($item) => $item->payment_method === 'transfer_credits' ? 0 : (float) ($item->plan?->price ?? 0))),
            'total_qty' => (int) ((clone $baseQuery)->sum('credits_total') ?? 0),
            'qty_label' => 'Kredit',
        ];

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Transaksi Membership',
                'description' => 'Modul data transaksi membership',
                'route' => 'reports.membership.index',
            ],
            'filters' => $filters,
            'rows' => $memberships,
            'summary' => $summary,
            'paymentMethods' => $this->extractPaymentMethods(
                UserMembership::query()->whereNotIn('status', $excludedStatus)
            ),
            'cashiers' => $this->getCashierOptions(),
            'membershipPlans' => MembershipPlan::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function membershipTransfer(Request $request)
    {
        $filters = $this->buildFilters($request);

        $baseQuery = DB::table('membership_credit_transfers as mct')
            ->leftJoin('users as sender', 'sender.id', '=', 'mct.from_user_id')
            ->leftJoin('users as receiver', 'receiver.id', '=', 'mct.to_user_id')
            ->leftJoin('membership_plans as mp', 'mp.id', '=', 'mct.membership_plan_id')
            ->leftJoin('user_memberships as um', 'um.id', '=', 'mct.receiver_membership_id')
            ->leftJoin('users as cashier', 'cashier.id', '=', 'mct.cashier_id')
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('mct.created_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('mct.created_at', '<=', $end))
            ->when($filters['membership_plan_id'] ?? null, fn ($q, $planId) => $q->where('mct.membership_plan_id', $planId))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('mct.cashier_id', $cashierId));

        $rows = (clone $baseQuery)
            ->select([
                'mct.id',
                'mct.created_at',
                'sender.name as sender_name',
                'receiver.name as receiver_name',
                'mp.name as plan_name',
                'mct.credits_transferred',
                'mct.notes',
                'um.expires_at',
                'cashier.name as cashier_name',
            ])
            ->orderByDesc('mct.created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($item) => [
                'id' => $item->id,
                'created_at' => $item->created_at ? Carbon::parse($item->created_at)->timezone('Asia/Jakarta')->format('d M Y, H:i') : '-',
                'sender_name' => $item->sender_name ?? '-',
                'receiver_name' => $item->receiver_name ?? '-',
                'plan_name' => $item->plan_name ?? '-',
                'credits_transferred' => (int) ($item->credits_transferred ?? 0),
                'notes' => $item->notes ?? '-',
                'expires_at' => $item->expires_at ? Carbon::parse($item->expires_at)->timezone('Asia/Jakarta')->format('d M Y, H:i') : '-',
                'cashier_name' => $item->cashier_name ?? '-',
            ]);

        $summary = [
            'transactions_count' => (clone $baseQuery)->count(),
            'total_amount' => 0,
            'total_qty' => (int) ((clone $baseQuery)->sum('mct.credits_transferred') ?? 0),
            'qty_label' => 'Kredit Transfer',
        ];

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Transfer Membership',
                'description' => 'Laporan riwayat transfer credit membership',
                'route' => 'reports.membership-transfer.index',
                'columns' => [
                    ['key' => 'created_at', 'label' => 'Tanggal'],
                    ['key' => 'sender_name', 'label' => 'Nama Pengirim'],
                    ['key' => 'receiver_name', 'label' => 'Nama Penerima'],
                    ['key' => 'plan_name', 'label' => 'Membership Plan'],
                    ['key' => 'credits_transferred', 'label' => 'Jumlah Credit', 'type' => 'number'],
                    ['key' => 'notes', 'label' => 'Catatan'],
                    ['key' => 'expires_at', 'label' => 'Masa Expired Membership'],
                    ['key' => 'cashier_name', 'label' => 'Kasir'],
                ],
                'show_payment_filter' => false,
                'show_invoice_filter' => false,
            ],
            'filters' => $filters,
            'rows' => $rows,
            'summary' => $summary,
            'paymentMethods' => [],
            'cashiers' => $this->getCashierOptions(),
            'membershipPlans' => MembershipPlan::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function membershipValidity(Request $request)
    {
        $filters = $this->buildFilters($request);

        $baseQuery = UserMembership::query()
            ->where('status', 'active')
            ->whereDate('expires_at', '>=', Carbon::today()->toDateString())
            ->with(['user:id,name', 'plan:id,name'])
            ->when($filters['membership_plan_id'] ?? null, fn ($q, $planId) => $q->where('membership_plan_id', $planId))
            ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId))
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $this->applyGlobalSearchFilter($q, $search));

        $memberships = (clone $baseQuery)
            ->orderBy('expires_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (UserMembership $membership) => [
                'id' => $membership->id,
                'customer_name' => $membership->user?->name ?? '-',
                'plan_name' => $membership->plan?->name ?? '-',
                'invoice' => $membership->invoice ?? '-',
                'credits_total' => (int) ($membership->credits_total ?? 0),
                'credits_remaining' => (int) ($membership->credits_remaining ?? 0),
                'purchased_at' => $membership->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'starts_at' => $membership->starts_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'expires_at' => $membership->expires_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                'payment_method' => $membership->payment_method ?? '-',
            ]);

        return Inertia::render('Dashboard/Reports/StudioTransactionReport', [
            'report' => [
                'title' => 'Laporan Validity Membership',
                'description' => 'Laporan membership aktif berdasarkan masa berlaku terdekat',
                'route' => 'reports.membership-validity.index',
                'columns' => [
                    ['key' => 'customer_name', 'label' => 'Pelanggan'],
                    ['key' => 'plan_name', 'label' => 'Membership Plan'],
                    ['key' => 'invoice', 'label' => 'Invoice'],
                    ['key' => 'credits_total', 'label' => 'Total Credits', 'type' => 'number'],
                    ['key' => 'credits_remaining', 'label' => 'Sisa Credits', 'type' => 'number'],
                    ['key' => 'purchased_at', 'label' => 'Tanggal Pembelian Credits'],
                    ['key' => 'starts_at', 'label' => 'Tanggal Mulai Pakai Credits'],
                    ['key' => 'expires_at', 'label' => 'Tanggal Expired Credits'],
                    ['key' => 'payment_method', 'label' => 'Metode Pembayaran'],
                ],
                'show_date_filter' => false,
            ],
            'filters' => $filters,
            'rows' => $memberships,
            'summary' => [
                'transactions_count' => (clone $baseQuery)->count(),
                'total_amount' => 0,
                'total_qty' => (int) ((clone $baseQuery)->sum('credits_remaining') ?? 0),
                'qty_label' => 'Sisa Kredit Aktif',
            ],
            'paymentMethods' => $this->extractPaymentMethods(
                UserMembership::query()->where('status', 'active')
            ),
            'cashiers' => $this->getCashierOptions(),
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
            'cashier_id' => $request->input('cashier_id'),
        ];
    }

    private function applyDateAndInvoiceFilters($query, array $filters, string $dateColumn)
    {
        return $query
            ->when($filters['invoice'] ?? null, fn ($q, $search) => $this->applyGlobalSearchFilter($q, $search))
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate($dateColumn, '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate($dateColumn, '<=', $end));
    }

    private function applyGlobalSearchFilter(Builder $query, string $search): Builder
    {
        $term = trim($search);

        if ($term === '') {
            return $query;
        }

        $upperTerm = strtoupper($term);
        $numericSearch = preg_replace('/[^0-9]/', '', $term);
        $modelClass = get_class($query->getModel());

        return $query->where(function (Builder $builder) use ($modelClass, $term, $upperTerm, $numericSearch) {
            $builder->where('invoice', 'like', '%' . $upperTerm . '%')
                ->orWhere('payment_method', 'like', '%' . $term . '%');

            if ($modelClass === PilatesBooking::class) {
                $builder->orWhereHas('user', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'))
                    ->orWhereHas('timetable.pilatesClass', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'));

                if ($numericSearch !== '') {
                    $builder->orWhere('price_amount', 'like', '%' . $numericSearch . '%')
                        ->orWhere('participants', 'like', '%' . $numericSearch . '%');
                }
            }

            if ($modelClass === AppointmentBooking::class) {
                $builder->orWhereHas('customer', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'))
                    ->orWhereHas('appointment.pilatesClass', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'))
                    ->orWhere('session_name', 'like', '%' . $term . '%');

                if ($numericSearch !== '') {
                    $builder->orWhere('price_amount', 'like', '%' . $numericSearch . '%')
                        ->orWhere('credit_used', 'like', '%' . $numericSearch . '%');
                }
            }

            if ($modelClass === UserMembership::class) {
                $builder->orWhereHas('user', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'))
                    ->orWhereHas('plan', fn (Builder $q) => $q->where('name', 'like', '%' . $term . '%'));

                if ($numericSearch !== '') {
                    $builder->orWhere('credits_total', 'like', '%' . $numericSearch . '%')
                        ->orWhere('credits_remaining', 'like', '%' . $numericSearch . '%');
                }
            }
        });
    }

    private function getCashierOptions()
    {
        return User::query()
            ->role('cashier')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
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
        
        // 1. Ambil data mentah (Eloquent Collection) yang sudah dikelompokkan
        [$title, $groupedData] = $this->buildGroupedExportData($type, $filters);
        $headers = ['No', 'Tanggal', 'Invoice', 'Pelanggan', 'Item', 'Metode Pembayaran', 'Credits', 'Total'];

        // Jika export Excel (.xls), kita gabungkan kembali agar tidak merusak format spreadsheet tunggal
        if (! $asPdf) {
            $flatRows = [];
            foreach ($groupedData as $paymentMethod => $items) {
                foreach ($items['rows'] as $row) {
                    $flatRows[] = $row;
                }
                // Tambahkan baris subtotal untuk Excel
                $flatRows[] = ['Subtotal (' . $paymentMethod . ')', '', '', '', $items['subtotal_qty'], '', '', $items['subtotal_amount']];
            }
            return $this->downloadExcel('laporan-' . $type . '.xls', $headers, $flatRows);
        }

        // 2. Format menjadi array struktur Sections khusus untuk komponen PDF
        $pdfSections = [];
        $overallGrandTotal = 0;

        foreach ($groupedData as $paymentMethod => $data) {
            $overallGrandTotal += $data['subtotal_amount'];
            
            // Siapkan baris data untuk dimasukkan ke tabel penampang PDF saat ini
            $currentRows = $data['rows'];
            
            // Tambahkan baris penjumlahan (Subtotal) di bagian bawah masing-masing tabel
            $currentRows[] = [
                '', // Kolom No diisi teks 'Total'
                '',      // Tanggal kosong
                '',      // Invoice kosong
                '',      // Pelanggan kosong
                '',      // Item kosong
                'Total',      // Metode Pembayaran kosong
                $data['subtotal_qty'] > 0 ? $data['subtotal_qty'] : '-',
                $data['subtotal_amount'],
            ];

            $pdfSections[] = [
                'title' => 'Metode Pembayaran: ' . strtoupper($paymentMethod),
                'headers' => $headers,
                'rows' => $currentRows,
                'column_widths' => [0.45, 1.55, 1.30, 1.25, 1.35, 1.25, 0.85, 1.0],
                'footer_lines' => [],
            ];
        }

        if (count($pdfSections) === 0) {
            $pdfSections[] = [
                'title' => 'Tidak Ada Data',
                'headers' => $headers,
                'rows' => [],
                'footer_lines' => [],
            ];
        }

        // Tambahkan ringkasan akrual keseluruhan di halaman terakhir (paling bawah)
        $lastSectionIndex = count($pdfSections) - 1;
        $pdfSections[$lastSectionIndex]['footer_lines'] = [
            'Total Keseluruhan Transaksi Terkonfirmasi',
            'Total Pendapatan Akhir: Rp ' . number_format($overallGrandTotal, 0, ',', '.'),
        ];

        $pdfBinary = SimplePdfExport::make(
            $title,
            'PERIODE : ' . ($filters['start_date'] ?? '-') . ' s/d ' . ($filters['end_date'] ?? '-'),
            $headers,
            [], // Kosongkan baris global karena sudah di-handle oleh parameter $pdfSections di bawah
            $pdfSections,
            'landscape'
        );

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="laporan-' . $type . '.pdf"',
        ]);
    }

    /**
     * Membangun data export yang ter-Group berdasarkan Metode Pembayaran beserta kalkulasi subtotalnya.
     */
    private function buildGroupedExportData(string $type, array $filters): array
    {
        if ($type === 'booking') {
            $items = $this->applyDateAndInvoiceFilters(
                PilatesBooking::query()->where('status', 'confirmed')->with(['user:id,name', 'timetable:id,pilates_class_id', 'timetable.pilatesClass:id,name']),
                $filters,
                'booked_at'
            )->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
                ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId))
                ->latest('booked_at')->get();

            $title = 'Laporan Booking Schedule';
            $grouped = $items->groupBy(fn ($item) => $item->payment_method ?: 'Tanpa Metode Pembayaran')
                ->map(function ($group) {
                    $subtotalQty = $group->sum(fn ($b) => $b->payment_type === 'credit' ? (int) $b->credit_used : 0);
                    $subtotalAmount = $group->sum(fn ($b) => (float) $b->price_amount);

                    return [
                        'subtotal_qty' => $subtotalQty,
                        'subtotal_amount' => $subtotalAmount,
                        'rows' => $group->values()->map(fn ($booking, $index) => [
                            $index + 1,
                            $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                            $booking->invoice ?? '-',
                            $booking->user?->name ?? '-',
                            $booking->timetable?->pilatesClass?->name ?? '-',
                            $booking->payment_method ?? '-',
                            $booking->payment_type === 'credit' ? (float) ($booking->credit_used ?? 0) : '-',
                            (float) ($booking->price_amount ?? 0),
                        ])->all()
                    ];
                });

            return [$title, $grouped];
        }

        if ($type === 'membership') {
            $excludedStatus = ['pending', 'pending_payment', 'cancelled', 'expired'];
            $items = $this->applyDateAndInvoiceFilters(
                UserMembership::query()->whereNotIn('status', $excludedStatus)->with(['user:id,name', 'plan:id,name,price']),
                $filters,
                'created_at'
            )->when($filters['membership_plan_id'] ?? null, fn ($q, $planId) => $q->where('membership_plan_id', $planId))
                ->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
                ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId))
                ->latest('created_at')->get();

            $title = 'Laporan Membership';
            $grouped = $items->groupBy(fn ($item) => $item->payment_method ?: 'Tanpa Metode Pembayaran')
                ->map(function ($group) {
                    $subtotalQty = $group->sum(fn ($m) => (int) $m->credits_total);
                    $subtotalAmount = $group->sum(fn ($m) => $m->payment_method === 'transfer_credits' ? 0 : (float) ($m->plan?->price ?? 0));

                    return [
                        'subtotal_qty' => $subtotalQty,
                        'subtotal_amount' => $subtotalAmount,
                        'rows' => $group->values()->map(fn ($membership, $index) => [
                            $index + 1,
                            $membership->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                            $membership->invoice ?? '-',
                            $membership->user?->name ?? '-',
                            $membership->plan?->name ?? '-',
                            $membership->payment_method ?? '-',
                            (int) ($membership->credits_total ?? 0),
                            ($membership->payment_method === 'transfer_credits' ? 0 : (float) ($membership->plan?->price ?? 0)),
                        ])->all()
                    ];
                });

            return [$title, $grouped];
        }

        // Default / Appointment Type
        $items = $this->applyDateAndInvoiceFilters(
            AppointmentBooking::query()->where('status', 'confirmed')->with(['customer:id,name', 'appointment:id,pilates_class_id', 'appointment.pilatesClass:id,name']),
            $filters,
            'booked_at'
        )->when($filters['payment_method'] ?? null, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashierId) => $q->where('cashier_id', $cashierId))
            ->latest('booked_at')->get();

        $title = 'Laporan Appointment';
        $grouped = $items->groupBy(fn ($item) => $item->payment_method ?: 'Tanpa Metode Pembayaran')
            ->map(function ($group) {
                $subtotalQty = $group->sum(fn ($b) => $b->payment_type === 'credit' ? (int) $b->credit_used : 0);
                $subtotalAmount = $group->sum(fn ($b) => (float) $b->price_amount);

                return [
                    'subtotal_qty' => $subtotalQty,
                    'subtotal_amount' => $subtotalAmount,
                    'rows' => $group->values()->map(fn ($booking, $index) => [
                        $index + 1,
                        $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                        $booking->invoice ?? '-',
                        $booking->customer?->name ?? '-',
                        $booking->appointment?->pilatesClass?->name ?? ($booking->session_name ?? '-'),
                        $booking->payment_method ?? '-',
                        $booking->payment_type === 'credit' ? (int) ($booking->credit_used ?? 0) : '-',
                        (float) ($booking->price_amount ?? 0),
                    ])->all()
                ];
            });

        return [$title, $grouped];
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
