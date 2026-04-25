<?php
namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\AppointmentBooking;
use App\Models\Customer;
use App\Models\PilatesBooking;
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
        $totalCategories   = Category::count();
        $totalProducts     = Product::count();
        $totalTransactions = Transaction::notCanceled()->count();
        $totalUsers        = User::count();
        $totalProfit       = Profit::whereHas('transaction', fn ($query) => $query->notCanceled())
            ->sum('total');
        $todayQuery        = Transaction::notCanceled()->whereDate('created_at', Carbon::today());
        $todayTransactions = (clone $todayQuery)->count();
        $posRevenue        = (clone $todayQuery)->sum('grand_total');
        $averageOrder      = (clone $todayQuery)->avg('grand_total') ?? 0;
        $membershipRevenue = UserMembership::query()
            ->whereDate('created_at', Carbon::today())
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->with('plan:id,price')
            ->get()
            ->sum(fn (UserMembership $membership) => (int) ($membership->plan?->price ?? 0));

        $appointmentDropInRevenue = (int) AppointmentBooking::query()
            ->whereDate('created_at', Carbon::today())
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->sum('price_amount');

        $timetableDropInRevenue = (int) PilatesBooking::query()
            ->whereDate('created_at', Carbon::today())
            ->where('status', 'confirmed')
            ->where('payment_type', 'drop_in')
            ->sum('price_amount');

        $totalRevenue = (int) $posRevenue + (int) $membershipRevenue + $appointmentDropInRevenue + $timetableDropInRevenue;

        $revenueTrend      = Transaction::notCanceled()
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->get()
            ->map(function ($row) {
                return [
                    'date'  => $row->date,
                    'label' => Carbon::parse($row->date)->format('d M'),
                    'total' => (int) $row->total,
                ];
            })
            ->reverse()
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

        $membershipHighlights = UserMembership::query()
            ->with('user:id,name', 'plan:id,name')
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (UserMembership $membership) {
                $creditsTotal = (int) ($membership->credits_total ?? 0);
                $creditsRemaining = (int) ($membership->credits_remaining ?? 0);
                $creditsUsed = max(0, $creditsTotal - $creditsRemaining);

                return [
                    'customer_name' => $membership->user?->name ?? '-',
                    'plan_name' => $membership->plan?->name ?? '-',
                    'status' => $membership->status,
                    'credits_total' => $creditsTotal,
                    'credits_remaining' => $creditsRemaining,
                    'credits_used' => $creditsUsed,
                ];
            });

        $appointmentHighlights = AppointmentBooking::query()
            ->with('customer:id,name', 'appointment:id,pilates_class_id', 'appointment.pilatesClass:id,name')
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (AppointmentBooking $booking) {
                return [
                    'customer_name' => $booking->customer?->name ?? '-',
                    'class_name' => $booking->appointment?->pilatesClass?->name ?? '-',
                    'session_name' => $booking->session_name ?? '-',
                    'payment_type' => $booking->payment_type ?? '-',
                    'price_amount' => (int) $booking->price_amount,
                    'credit_used' => (int) ($booking->credit_used ?? 0),
                ];
            });

        $timetableHighlights = PilatesBooking::query()
            ->with('user:id,name', 'timetable:id,pilates_class_id', 'timetable.pilatesClass:id,name')
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (PilatesBooking $booking) {
                return [
                    'customer_name' => $booking->user?->name ?? '-',
                    'class_name' => $booking->timetable?->pilatesClass?->name ?? '-',
                    'payment_type' => $booking->payment_type ?? '-',
                    'participants' => (int) ($booking->participants ?? 0),
                    'price_amount' => (int) $booking->price_amount,
                    'credit_used' => (int) ($booking->credit_used ?? 0),
                ];
            });

        return Inertia::render('Dashboard/Index', [
            'totalCategories'   => $totalCategories,
            'totalProducts'     => $totalProducts,
            'totalTransactions' => $totalTransactions,
            'totalUsers'        => $totalUsers,
            'revenueTrend'      => $revenueTrend,
            'totalRevenue'      => (int) $totalRevenue,
            'posRevenue'        => (int) $posRevenue,
            'membershipRevenue' => (int) $membershipRevenue,
            'appointmentDropInRevenue' => (int) $appointmentDropInRevenue,
            'timetableDropInRevenue' => (int) $timetableDropInRevenue,
            'totalProfit'       => (int) $totalProfit,
            'averageOrder'      => (int) round($averageOrder),
            'todayTransactions' => (int) $todayTransactions,
            'topProducts'       => $topProducts,
            'recentTransactions'=> $recentTransactions,
            'topCustomers'      => $topCustomers,
            'membershipHighlights' => $membershipHighlights,
            'appointmentHighlights' => $appointmentHighlights,
            'timetableHighlights' => $timetableHighlights,
        ]);
    }
}
