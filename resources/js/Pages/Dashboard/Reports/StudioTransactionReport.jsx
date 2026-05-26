import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconDatabaseOff,
    IconFilter,
    IconReceipt2,
    IconShoppingBag,
    IconTrendingUp,
    IconX,
    IconSearch,
    IconCalendar,
    IconFileSpreadsheet,
    IconFileTypePdf,
} from "@tabler/icons-react";

const SummaryCard = ({ icon, title, value, description, gradient }) => (
    <div
        className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}
    >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            {React.cloneElement(icon, {
                size: 96,
                strokeWidth: 0.5,
                className: "transform translate-x-4 -translate-y-4",
            })}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-white/20">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <span className="text-sm font-medium opacity-90">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-80 mt-1">{description}</p>
        </div>
    </div>
);

const defaultFilterState = {
    start_date: "",
    end_date: "",
    invoice: "",
    payment_method: "",
    membership_plan_id: "",
    cashier_id: "",
};

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const castFilterString = (value) => (typeof value === "number" ? String(value) : value ?? "");

const StudioTransactionReport = ({ report, filters, rows, summary, paymentMethods, membershipPlans = [], cashiers = [] }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        ...defaultFilterState,
        start_date: castFilterString(filters?.start_date),
        end_date: castFilterString(filters?.end_date),
        invoice: castFilterString(filters?.invoice),
        payment_method: castFilterString(filters?.payment_method),
        membership_plan_id: castFilterString(filters?.membership_plan_id),
        cashier_id: castFilterString(filters?.cashier_id),
    });

    useEffect(() => {
        setFilterData({
            ...defaultFilterState,
            start_date: castFilterString(filters?.start_date),
            end_date: castFilterString(filters?.end_date),
            invoice: castFilterString(filters?.invoice),
            payment_method: castFilterString(filters?.payment_method),
            membership_plan_id: castFilterString(filters?.membership_plan_id),
            cashier_id: castFilterString(filters?.cashier_id),
        });
    }, [filters]);

    const handleChange = (field, value) => setFilterData((prev) => ({ ...prev, [field]: value }));

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route(report.route), filterData, {
            preserveScroll: true,
            preserveState: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilterState);
        router.get(route(report.route), defaultFilterState, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const tableRows = rows?.data ?? [];
    const paginationLinks = rows?.links ?? [];
    const currentPage = rows?.current_page ?? 1;
    const perPage = rows?.per_page ? Number(rows?.per_page) : tableRows.length || 1;

    const showInvoiceFilter = report?.show_invoice_filter !== false;
    const showPaymentFilter = report?.show_payment_filter !== false;
    const showDateFilter = report?.show_date_filter !== false;
    const showMembershipPlanFilter = ["reports.membership.index", "reports.membership-transfer.index", "reports.membership-validity.index"].includes(report.route);
    const hasActiveFilters = (showInvoiceFilter && filterData.invoice) || (showDateFilter && (filterData.start_date || filterData.end_date)) || (showPaymentFilter && filterData.payment_method) || (showMembershipPlanFilter && filterData.membership_plan_id) || filterData.cashier_id;

    const exportBaseRoute = report.route === "reports.booking.index"
        ? "reports.booking"
        : report.route === "reports.appointment.index"
            ? "reports.appointment"
            : report.route === "reports.membership.index"
                ? "reports.membership"
            : null;


    const safeSummary = {
        transactions_count: summary?.transactions_count ?? 0,
        total_amount: summary?.total_amount ?? 0,
        total_qty: summary?.total_qty ?? 0,
        qty_label: summary?.qty_label ?? "Jumlah",
    };

    const columns = report?.columns ?? [
        { key: "created_at", label: "Tanggal" },
        { key: "invoice", label: "Invoice" },
        { key: "customer_name", label: "Pelanggan" },
        { key: "item_name", label: "Item" },
        { key: "payment_method", label: "Metode Pembayaran" },
        { key: "qty", label: "Credits", type: "number" },
        { key: "amount", label: "Total", type: "currency" },
    ];

    const summaryCards = [
        {
            title: "Total Pendapatan",
            value: formatCurrency(safeSummary.total_amount),
            description: `${safeSummary.transactions_count} transaksi`,
            icon: <IconReceipt2 />,
            gradient: "from-primary-500 to-primary-700",
        },
        {
            title: safeSummary.qty_label,
            value: safeSummary.total_qty.toLocaleString("id-ID"),
            description: "Akumulasi dari transaksi",
            icon: <IconShoppingBag />,
            gradient: "from-accent-500 to-accent-700",
        },
        {
            title: "Rata-rata Transaksi",
            value: formatCurrency(
                safeSummary.transactions_count > 0
                    ? safeSummary.total_amount / safeSummary.transactions_count
                    : 0
            ),
            description: "Nilai rata-rata per transaksi",
            icon: <IconCalendar />,
            gradient: "from-warning-500 to-warning-600",
        },
    ];

    return (
        <>
            <Head title={report.title} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconTrendingUp size={28} className="text-primary-500" />
                            {report.title}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                            showFilters || hasActiveFilters
                                ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800 dark:text-primary-400"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                        <IconFilter size={18} />
                        <span>Filter</span>
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                    </button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {summaryCards.map((card) => (
                        <SummaryCard key={card.title} {...card} />
                    ))}
                </div>

                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                                {showDateFilter && <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(e) => handleChange("start_date", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>}
                                {showDateFilter && <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal Akhir</label>
                                    <input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(e) => handleChange("end_date", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>}
                                {showInvoiceFilter && <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pencarian Global</label>
                                    <input
                                        type="text"
                                        placeholder="Cari invoice, nama pelanggan, nominal, item, dll..."
                                        value={filterData.invoice}
                                        onChange={(e) => handleChange("invoice", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>}
                                {showPaymentFilter && <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Metode Pembayaran</label>
                                    <select
                                        value={filterData.payment_method}
                                        onChange={(e) => handleChange("payment_method", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value="">Semua Metode Pembayaran</option>
                                        {(paymentMethods ?? []).map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                </div>}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kasir</label>
                                    <select
                                        value={filterData.cashier_id}
                                        onChange={(e) => handleChange("cashier_id", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value="">Semua Kasir</option>
                                        {(cashiers ?? []).map((cashier) => (
                                            <option key={cashier.id} value={cashier.id}>
                                                {cashier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {showMembershipPlanFilter && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Membership Plan</label>
                                        <select
                                            value={filterData.membership_plan_id}
                                            onChange={(e) => handleChange("membership_plan_id", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        >
                                            <option value="">Semua membership plan</option>
                                            {membershipPlans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <IconX size={18} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                                >
                                    <IconSearch size={18} />
                                    Terapkan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {tableRows.length > 0 ? (
                    <>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">No</th>
                                        {columns.map((column) => (
                                            <th key={column.key} className={`px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${column.type === "currency" ? "text-right" : column.type === "number" ? "text-center" : "text-left"}`}>{column.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {tableRows.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{i + 1 + (currentPage - 1) * perPage}</td>
                                            {columns.map((column) => (
                                                <td key={`${item.id}-${column.key}`} className={`px-4 py-4 text-sm text-slate-600 dark:text-slate-400 ${column.type === "currency" ? "text-right font-semibold text-slate-900 dark:text-white" : column.type === "number" ? "text-center" : ""}`}>
                                                    {column.type === "currency" ? formatCurrency(item[column.key] ?? 0) : item[column.key] ?? "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Tidak Ada Data</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada transaksi sesuai filter.</p>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    {exportBaseRoute && (<>
                        <a href={route(`${exportBaseRoute}.export-pdf`, filterData)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                            <IconFileTypePdf size={18} />
                            Export PDF
                        </a>
                        <a href={route(`${exportBaseRoute}.export`, filterData)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                            <IconFileSpreadsheet size={18} />
                            Export Excel
                        </a>
                    </>)}
                </div>
                {paginationLinks.length > 3 && <Pagination links={paginationLinks} />}
            </div>
        </>
    );
};

StudioTransactionReport.layout = (page) => <DashboardLayout children={page} />;

export default StudioTransactionReport;
