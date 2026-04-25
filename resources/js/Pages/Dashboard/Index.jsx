import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import {
    IconUserStar,
    IconCoin,
    IconUsers,
    IconBuildingCommunity,
    IconShoppingCart,
    IconChartBar,
    IconChartPie3,
    IconCalendarTime,
    IconUserCheck,
} from "@tabler/icons-react";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, gradient, trend }) {
    return (
        <div
            className={`
            relative overflow-hidden rounded-2xl p-5
            bg-gradient-to-br ${gradient}
            text-white shadow-lg
        `}
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <Icon
                    size={128}
                    strokeWidth={0.5}
                    className="transform translate-x-8 -translate-y-8"
                />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-white/20">
                        <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium opacity-90">
                        {title}
                    </span>
                </div>

                <p className="text-3xl font-bold">{value}</p>

                {subtitle && (
                    <p className="mt-2 text-sm opacity-80 flex items-center gap-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

// List Card Component
function ListCard({ title, subtitle, icon: Icon, children, emptyMessage }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <Icon
                            size={18}
                            className="text-primary-600 dark:text-primary-400"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-5">
                {children || (
                    <div className="flex h-32 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({
    revenueTrend,
    totalRevenue,
    todayTransactions,
    activeMembers,
    todayClassOccupancyRate,
    todayAttendanceCount,
    todayConfirmedBookingCount,
    membershipDistribution = [],
    expiringMemberships = [],
    topTrainers = [],
    classFillRates = [],
}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const pieChartRef = useRef(null);
    const pieChartInstance = useRef(null);

    const chartData = useMemo(() => revenueTrend ?? [], [revenueTrend]);

    // Setup chart
    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }

        if (!chartData.length) return;

        const labels = chartData.map((item) => item.label);
        const totals = chartData.map((item) => item.total);

        const ctx = chartRef.current.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, "rgba(217, 119, 6, 0.35)");
        gradient.addColorStop(1, "rgba(245, 158, 11, 0.03)");

        chartInstance.current = new Chart(chartRef.current, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Pendapatan",
                        data: totals,
                        borderColor: "#b45309",
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: "#b45309",
                        pointHoverBorderColor: "#fff",
                        pointHoverBorderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index",
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#1f2937",
                        titleColor: "#fef3c7",
                        bodyColor: "#fef3c7",
                        padding: 12,
                        borderRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => formatCurrency(ctx.raw),
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value),
                            color: "#64748b",
                            font: { size: 11 },
                        },
                        grid: {
                            color: "rgba(100, 116, 139, 0.12)",
                            drawBorder: false,
                        },
                        border: { display: false },
                    },
                    x: {
                        ticks: {
                            color: "#64748b",
                            font: { size: 11 },
                        },
                        grid: { display: false },
                        border: { display: false },
                    },
                },
            },
        });

        return () => chartInstance.current?.destroy();
    }, [chartData]);

    useEffect(() => {
        if (!pieChartRef.current) return;

        if (pieChartInstance.current) {
            pieChartInstance.current.destroy();
            pieChartInstance.current = null;
        }

        if (!membershipDistribution.length) return;

        pieChartInstance.current = new Chart(pieChartRef.current, {
            type: "doughnut",
            data: {
                labels: membershipDistribution.map((item) => item.name),
                datasets: [
                    {
                        data: membershipDistribution.map((item) => item.total),
                        backgroundColor: [
                            "#d97706",
                            "#ca8a04",
                            "#92400e",
                            "#475569",
                            "#64748b",
                            "#bfa174",
                        ],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { usePointStyle: true, boxWidth: 8 },
                    },
                },
            },
        });

        return () => pieChartInstance.current?.destroy();
    }, [membershipDistribution]);

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Dashboard
                        </h1>
                        <p className="text-sm text-slate-500">
                            Insight strategis studio Anda dengan tampilan premium
                        </p>
                    </div>
                    <Link
                        href={route("transactions.index")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors shadow-lg shadow-amber-700/20"
                    >
                        <IconShoppingCart size={18} />
                        <span>Transaksi Baru</span>
                    </Link>
                </div>

                {/* Main Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Pendapatan"
                        value={formatCurrency(totalRevenue)}
                        subtitle="Produk + Membership + Appointment + Timetable"
                        icon={IconCoin}
                        gradient="from-amber-500 to-amber-700"
                    />
                    <StatCard
                        title="Member Aktif"
                        value={activeMembers}
                        subtitle="Membership aktif saat ini"
                        icon={IconUserStar}
                        gradient="from-slate-600 to-slate-800"
                    />
                    <StatCard
                        title="Okupansi Kelas Hari Ini"
                        value={`${todayClassOccupancyRate}%`}
                        subtitle={`${todayAttendanceCount}/${todayConfirmedBookingCount} hadir/tercatat`}
                        icon={IconBuildingCommunity}
                        gradient="from-stone-500 to-stone-700"
                    />
                    <StatCard
                        title="Transaksi Hari Ini"
                        value={todayTransactions}
                        subtitle="Transaksi produk kasir"
                        icon={IconShoppingCart}
                        gradient="from-amber-400 to-amber-600"
                    />
                </div>

                {/* Charts and Lists Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <ListCard
                        title="Tren Pendapatan"
                        subtitle="Gabungan produk, membership, appointment, timetable"
                        icon={IconChartBar}
                        emptyMessage="Belum ada data pendapatan"
                    >
                        {chartData.length > 0 && (
                            <div className="h-64">
                                <canvas ref={chartRef} />
                            </div>
                        )}
                    </ListCard>

                    {/* Membership Distribution */}
                    <ListCard
                        title="Distribusi Membership"
                        subtitle="Jenis membership paling diminati"
                        icon={IconChartPie3}
                        emptyMessage="Belum ada data membership"
                    >
                        {membershipDistribution.length > 0 && (
                            <div className="h-64">
                                <canvas ref={pieChartRef} />
                            </div>
                        )}
                    </ListCard>
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ListCard
                        title="Membership Insight"
                        subtitle="Member yang segera berakhir"
                        icon={IconCalendarTime}
                        emptyMessage="Tidak ada membership yang akan berakhir"
                    >
                        {expiringMemberships.length > 0 && (
                            <div className="space-y-3">
                                {expiringMemberships.map((member, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-xl bg-amber-50"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {member.member}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {member.plan}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Berakhir: {member.expires_at}
                                            </p>
                                        </div>
                                        <p className="text-xs font-semibold text-amber-700">
                                            {member.days_left} hari lagi
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ListCard>
                    <ListCard
                        title="Trainer Insight"
                        subtitle="Jam mengajar terbanyak"
                        icon={IconUserCheck}
                        emptyMessage="Belum ada data performa trainer"
                    >
                        {topTrainers.length > 0 && (
                            <ul className="space-y-3">
                                {topTrainers.map((trainer, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-sm font-bold">
                                                {trainer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {trainer.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {trainer.sessions} sesi
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {trainer.hours} jam
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </ListCard>

                    <ListCard
                        title="Class Insight"
                        subtitle="Fill rate tiap jenis kelas"
                        icon={IconUsers}
                        emptyMessage="Belum ada data keterisian kelas"
                    >
                        {classFillRates.length > 0 && (
                            <ul className="space-y-3">
                                {classFillRates.map((item, index) => (
                                    <li
                                        key={index}
                                        className="rounded-lg bg-slate-50 p-3"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-700">
                                                {item.name}
                                            </p>
                                            <p className="text-sm font-bold text-amber-700">
                                                {item.fill_rate}%
                                            </p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-200">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-700"
                                                style={{
                                                    width: `${Math.min(item.fill_rate, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {item.booked_slots}/{item.total_slots} slot terisi
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </ListCard>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <DashboardLayout children={page} />;
