<?php
namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MembershipPlan;
use App\Models\PilatesAppointment;
use App\Models\PilatesBooking;
use App\Models\PilatesTimetable;
use App\Models\AppointmentBooking;
use App\Models\Customer;
use App\Models\Trainer;
use App\Models\Profit;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\UserMembership;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $totalCategories   = Category::count();
        $totalProducts     = Product::count();
        $totalTransactions = Transaction::notCanceled()->count();
        $totalUsers        = User::count();
        $totalProfit       = Profit::whereHas('transaction', fn ($query) => $query->notCanceled())
            ->sum('total');
        $todayQuery        = Transaction::notCanceled()->whereDate('created_at', $today);
        $todayTransactions = (clone $todayQuery)->count();
        $productRevenueToday = (clone $todayQuery)->sum('grand_total');
        $membershipRevenueToday = UserMembership::query()
            ->join('membership_plans', 'membership_plans.id', '=', 'user_memberships.membership_plan_id')
            ->whereDate('user_memberships.created_at', $today)
            ->whereIn('user_memberships.status', ['active', 'expired'])
            ->sum('membership_plans.price');
        $appointmentRevenueToday = AppointmentBooking::query()
            ->whereDate('created_at', $today)
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->sum('price_amount');
        $timetableRevenueToday = PilatesBooking::query()
            ->whereDate('created_at', $today)
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->sum('price_amount');
        $totalRevenue = $productRevenueToday + $membershipRevenueToday + $appointmentRevenueToday + $timetableRevenueToday;
        $averageOrder      = (clone $todayQuery)->avg('grand_total') ?? 0;

        $productRevenueTrend = Transaction::notCanceled()
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->pluck('total', 'date');
        $membershipRevenueTrend = UserMembership::query()
            ->join('membership_plans', 'membership_plans.id', '=', 'user_memberships.membership_plan_id')
            ->selectRaw('DATE(user_memberships.created_at) as date, SUM(membership_plans.price) as total')
            ->whereIn('user_memberships.status', ['active', 'expired'])
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->pluck('total', 'date');
        $appointmentRevenueTrend = AppointmentBooking::query()
            ->selectRaw('DATE(created_at) as date, SUM(price_amount) as total')
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->pluck('total', 'date');
        $timetableRevenueTrend = PilatesBooking::query()
            ->selectRaw('DATE(created_at) as date, SUM(price_amount) as total')
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->pluck('total', 'date');

        $combinedRevenueByDate = collect()
            ->merge($productRevenueTrend->keys())
            ->merge($membershipRevenueTrend->keys())
            ->merge($appointmentRevenueTrend->keys())
            ->merge($timetableRevenueTrend->keys())
            ->unique()
            ->sort()
            ->values()
            ->map(function ($date) use ($productRevenueTrend, $membershipRevenueTrend, $appointmentRevenueTrend, $timetableRevenueTrend) {
                return [
                    'date'  => $date,
                    'label' => Carbon::parse($date)->format('d M'),
                    'total' => (int) round(
                        (float) ($productRevenueTrend[$date] ?? 0)
                        + (float) ($membershipRevenueTrend[$date] ?? 0)
                        + (float) ($appointmentRevenueTrend[$date] ?? 0)
                        + (float) ($timetableRevenueTrend[$date] ?? 0)
                    ),
                ];
            });
        $revenueTrend = $combinedRevenueByDate->take(-12)->values();

        $activeMembers = UserMembership::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhereDate('expires_at', '>=', Carbon::today());
            })
            ->count();

        $todayAttendanceCount = PilatesBooking::query()
            ->whereDate('created_at', $today)
            ->whereIn('attendance_status', ['present', 'absent'])
            ->count()
            + AppointmentBooking::query()
                ->whereDate('created_at', $today)
                ->whereIn('attendance_status', ['present', 'absent'])
                ->count();
        $todayConfirmedBookingCount = PilatesBooking::query()
            ->whereDate('created_at', $today)
            ->where('status', 'confirmed')
            ->count()
            + AppointmentBooking::query()
                ->whereDate('created_at', $today)
                ->where('status', 'confirmed')
                ->count();
        $todayClassOccupancyRate = $todayConfirmedBookingCount > 0
            ? round(($todayAttendanceCount / $todayConfirmedBookingCount) * 100, 1)
            : 0;

        $membershipDistribution = MembershipPlan::query()
            ->leftJoin('user_memberships', 'membership_plans.id', '=', 'user_memberships.membership_plan_id')
            ->select(
                'membership_plans.id',
                'membership_plans.name',
                DB::raw("SUM(CASE WHEN user_memberships.status IN ('active', 'expired') THEN 1 ELSE 0 END) as total")
            )
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->havingRaw('total > 0')
            ->orderByDesc('total')
            ->take(6)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'total' => (int) $row->total,
            ]);

        $expiringMemberships = UserMembership::query()
            ->with(['user:id,name', 'plan:id,name'])
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '>=', $today)
            ->whereDate('expires_at', '<=', $today->copy()->addDays(7))
            ->orderBy('expires_at')
            ->take(5)
            ->get()
            ->map(fn (UserMembership $membership) => [
                'member' => $membership->user?->name ?? '-',
                'plan' => $membership->plan?->name ?? '-',
                'expires_at' => $membership->expires_at?->format('d M Y'),
                'days_left' => max($today->diffInDays($membership->expires_at, false), 0),
            ]);

        $topTrainers = Trainer::query()
            ->with('user:id,name')
            ->withSum(['timetables as timetable_minutes' => function ($query) {
                $query->whereHas('bookings', fn ($bookingQuery) => $bookingQuery->where('status', 'confirmed'));
            }], 'duration_minutes')
            ->withSum(['appointments as appointment_minutes' => function ($query) {
                $query->whereHas('bookings', fn ($bookingQuery) => $bookingQuery->where('status', 'confirmed'));
            }], 'duration_minutes')
            ->get()
            ->map(function (Trainer $trainer) {
                $totalMinutes = (int) ($trainer->timetable_minutes ?? 0) + (int) ($trainer->appointment_minutes ?? 0);

                return [
                    'name' => $trainer->name ?? $trainer->user?->name ?? 'Trainer',
                    'hours' => round($totalMinutes / 60, 1),
                    'sessions' => PilatesTimetable::query()->where('trainer_id', $trainer->id)->whereHas('bookings', fn ($q) => $q->where('status', 'confirmed'))->count()
                        + PilatesAppointment::query()->where('trainer_id', $trainer->id)->whereHas('bookings', fn ($q) => $q->where('status', 'confirmed'))->count(),
                ];
            })
            ->sortByDesc('hours')
            ->take(5)
            ->values();

        $classFillRates = PilatesTimetable::query()
            ->join('pilates_classes', 'pilates_classes.id', '=', 'pilates_timetables.pilates_class_id')
            ->leftJoin('pilates_bookings', function ($join) {
                $join->on('pilates_bookings.timetable_id', '=', 'pilates_timetables.id')
                    ->where('pilates_bookings.status', '=', 'confirmed');
            })
            ->select(
                'pilates_classes.name',
                DB::raw('COALESCE(SUM(pilates_bookings.participants), 0) as booked_slots'),
                DB::raw('COALESCE(SUM(pilates_timetables.capacity), 0) as total_slots')
            )
            ->groupBy('pilates_classes.id', 'pilates_classes.name')
            ->havingRaw('total_slots > 0')
            ->get()
            ->map(function ($row) {
                $fillRate = (float) $row->total_slots > 0
                    ? round(((float) $row->booked_slots / (float) $row->total_slots) * 100, 1)
                    : 0;

                return [
                    'name' => $row->name,
                    'booked_slots' => (int) $row->booked_slots,
                    'total_slots' => (int) $row->total_slots,
                    'fill_rate' => $fillRate,
                ];
            })
            ->sortByDesc('fill_rate')
            ->take(6)
            ->values();

        $topProducts = TransactionDetail::select('product_id', DB::raw('SUM(qty) as qty'), DB::raw('SUM(price) as total'))
            ->with('product:id,title')
            ->whereHas('transaction', fn ($query) => $query->notCanceled())
            ->groupBy('product_id')
            ->orderByDesc('qty')
            ->take(5)
            ->get()
            ->map(function ($detail) {
                return [
                    'name'  => $detail->product?->title ?? 'Produk terhapus',
                    'qty'   => (int) $detail->qty,
                    'total' => (int) $detail->total,
                ];
            });

        $recentTransactions = Transaction::notCanceled()
            ->with('cashier:id,name', 'customer:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'invoice'  => $transaction->invoice,
                    'date'     => Carbon::parse($transaction->created_at)->format('d M Y'),
                    'customer' => $transaction->customer?->name ?? '-',
                    'cashier'  => $transaction->cashier?->name ?? '-',
                    'total'    => (int) $transaction->grand_total,
                ];
            });

        $topCustomers = Transaction::notCanceled()
            ->select('customer_id', DB::raw('COUNT(*) as orders'), DB::raw('SUM(grand_total) as total'))
            ->with('customer:id,name')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($row) {
                return [
                    'name'   => $row->customer?->name ?? 'Pelanggan',
                    'orders' => (int) $row->orders,
                    'total'  => (int) $row->total,
                ];
            });

        return Inertia::render('Dashboard/Index', [
            'totalCategories'   => $totalCategories,
            'totalProducts'     => $totalProducts,
            'totalTransactions' => $totalTransactions,
            'totalUsers'        => $totalUsers,
            'revenueTrend'      => $revenueTrend,
            'totalRevenue'      => (int) $totalRevenue,
            'totalProfit'       => (int) $totalProfit,
            'averageOrder'      => (int) round($averageOrder),
            'todayTransactions' => (int) $todayTransactions,
            'topProducts'       => $topProducts,
            'recentTransactions'=> $recentTransactions,
            'topCustomers'      => $topCustomers,
            'activeMembers'     => (int) $activeMembers,
            'todayClassOccupancyRate' => $todayClassOccupancyRate,
            'todayAttendanceCount' => (int) $todayAttendanceCount,
            'todayConfirmedBookingCount' => (int) $todayConfirmedBookingCount,
            'membershipDistribution' => $membershipDistribution,
            'expiringMemberships' => $expiringMemberships,
            'topTrainers' => $topTrainers,
            'classFillRates' => $classFillRates,
        ]);
    }
}
