import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import Swal from "sweetalert2";
import {
    IconBan,
    IconEye,
    IconFilter,
    IconHistory,
    IconPrinter,
    IconSearch,
    IconSparkles,
    IconX,
} from "@tabler/icons-react";

const defaultFilters = { invoice: "", start_date: "", end_date: "" };
const statusClass = {
    pending: "bg-amber-100 text-amber-700",
    pending_payment: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    expired: "bg-slate-100 text-slate-700",
};
const formatCurrency = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export default function History({ memberships, filters = {} }) {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({ ...defaultFilters, ...filters });
    useEffect(() => setFilterData({ ...defaultFilters, ...filters }), [filters]);
    const rows = memberships?.data ?? [];
    const links = memberships?.links ?? [];
    const hasActiveFilters = Boolean(filterData.invoice) || Boolean(filterData.start_date) || Boolean(filterData.end_date);
    const handleChange = (field, value) => setFilterData((prev) => ({ ...prev, [field]: value }));
    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route("memberships.history"), filterData, { preserveScroll: true, preserveState: true });
        setShowFilters(false);
    };
    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route("memberships.history"), defaultFilters, { preserveScroll: true, preserveState: true, replace: true });
    };

    const handlePaymentAction = (membershipId, action) => {
        router.post(route(action === "confirm" ? "memberships.confirm-payment" : "memberships.reject-payment", membershipId), {}, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ title: "Berhasil!", text: action === "confirm" ? "Pembayaran membership berhasil dikonfirmasi." : "Pembayaran membership berhasil ditolak.", icon: "success", timer: 1500, showConfirmButton: false }),
            onError: (errors) => Swal.fire({ title: "Gagal!", text: errors?.message || "Aksi pembayaran membership gagal diproses.", icon: "error" }),
        });
    };

    const handleViewPaymentProof = (membership) => {
        if (!membership.payment_proof_image) {
            Swal.fire({ title: "Bukti pembayaran belum tersedia", text: "Customer belum mengunggah foto bukti pembayaran.", icon: "info" });
            return;
        }
        Swal.fire({
            title: "Foto Bukti Pembayaran",
            html: `
                <div class="space-y-4">
                    <img src="/storage/${membership.payment_proof_image}" alt="Bukti Pembayaran" class="mx-auto max-h-[60vh] rounded-lg border border-slate-200" />
                    <div class="flex items-center justify-center gap-3">
                        <button id="confirm-payment-btn" class="swal2-confirm swal2-styled" style="background:#16a34a;">Confirm Payment</button>
                        <button id="reject-payment-btn" class="swal2-deny swal2-styled" style="background:#dc2626;">Reject Payment</button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 640,
            didOpen: () => {
                document.getElementById("confirm-payment-btn")?.addEventListener("click", () => {
                    Swal.close();
                    handlePaymentAction(membership.id, "confirm");
                });
                document.getElementById("reject-payment-btn")?.addEventListener("click", () => {
                    Swal.close();
                    handlePaymentAction(membership.id, "reject");
                });
            },
        });
    };

    const handleCancel = (membership) => {
        Swal.fire({
            title: "Batalkan transaksi membership?",
            text: "Status transaksi akan dibatalkan dan credit customer dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Lanjutkan",
            cancelButtonText: "Batal",
        }).then((confirmResult) => {
            if (!confirmResult.isConfirmed) return;
            Swal.fire({
                title: "Otorisasi",
                html: `
                    <input id="super-admin-authorization-note" type="text" class="swal2-input" placeholder="Keterangan otorisasi">
                    <input id="super-admin-email" type="email" class="swal2-input" placeholder="Username / Email">
                    <input id="super-admin-password" type="password" class="swal2-input" placeholder="Password">
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Validasi",
                cancelButtonText: "Batal",
                preConfirm: () => {
                    const authorizationNote = document.getElementById("super-admin-authorization-note")?.value?.trim();
                    const email = document.getElementById("super-admin-email")?.value?.trim();
                    const password = document.getElementById("super-admin-password")?.value;
                    if (!email || !password) {
                        Swal.showValidationMessage("Email dan password super-admin wajib diisi.");
                        return null;
                    }
                    return { authorizationNote, email, password };
                },
            }).then((authResult) => {
                if (!authResult.isConfirmed) return;
                router.delete(route("memberships.cancel", membership.id), {
                    data: {
                        authorization_note: authResult.value.authorizationNote || "",
                        super_admin_email: authResult.value.email,
                        super_admin_password: authResult.value.password,
                    },
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({ title: "Berhasil!", text: "Transaksi membership berhasil dibatalkan.", icon: "success", showConfirmButton: false, timer: 1500 }),
                    onError: (errors) => Swal.fire({ title: "Gagal!", text: errors?.message || "Transaksi membership gagal dibatalkan.", icon: "error" }),
                });
            });
        });
    };

    return (
        <>
            <Head title="Riwayat Membership" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><IconHistory size={28} className="text-primary-500" />Riwayat Membership</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{memberships?.total || 0} transaksi membership customer tercatat</p>
                    </div>
                    <button type="button" onClick={() => setShowFilters((prev) => !prev)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-400" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
                        <IconFilter size={18} />Filter{hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary-500"></span>}
                    </button>
                </div>
                {showFilters && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Invoice</label><input type="text" placeholder="MEM-..." value={filterData.invoice} onChange={(event) => handleChange("invoice", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></div>
                                <div><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Mulai</label><input type="date" value={filterData.start_date} onChange={(event) => handleChange("start_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></div>
                                <div><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Akhir</label><input type="date" value={filterData.end_date} onChange={(event) => handleChange("end_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></div>
                                <div className="flex items-end gap-2"><button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 font-medium text-white transition-colors hover:bg-primary-600"><IconSearch size={18} />Cari</button>{hasActiveFilters && <button type="button" onClick={resetFilters} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"><IconX size={18} /></button>}</div>
                            </div>
                        </form>
                    </div>
                )}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-100 dark:border-slate-800"><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">No</th><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</th><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal</th><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pelanggan</th><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Membership</th><th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pembayaran</th><th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Credits</th><th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Nominal</th><th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th><th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"></th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.length > 0 ? rows.map((membership, index) => (
                                    <tr key={membership.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{(memberships.current_page - 1) * memberships.per_page + index + 1}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{membership.invoice}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{membership.created_at || "-"}</td>
                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300"><p className="font-medium">{membership.customer || "-"}</p><p className="text-xs text-slate-500">{membership.customer_email || "-"}</p></td>
                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300"><p className="font-medium">{membership.plan_name || "-"}</p><p className="text-xs text-slate-500">Mulai {membership.starts_at || "-"}</p><p className="text-xs text-slate-500">Expired {membership.expires_at || "-"}</p></td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{membership.payment_method || "-"}</td>
                                        <td className="px-4 py-4 text-center text-sm"><span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-primary-700"><IconSparkles size={14} />{membership.credits_remaining || 0}/{membership.credits_total || 0}</span></td>
                                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(membership.price || 0)}</td>
                                        <td className="px-4 py-4 text-center"><span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[membership.status] || "bg-slate-100 text-slate-700"}`}>{membership.status || "-"}</span></td>
                                        <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-2"><button type="button" onClick={() => handleViewPaymentProof(membership)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50" title="Lihat Bukti Pembayaran"><IconEye size={18} /></button><Link href={route("memberships.print", membership.invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50" title="Print Membership"><IconPrinter size={18} /></Link>{membership.status === "cancelled" ? <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">Dibatalkan</span> : <button type="button" onClick={() => handleCancel(membership)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-950/50" title="Batalkan Transaksi"><IconBan size={18} /></button>}</div></td>
                                    </tr>
                                )) : <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada data riwayat membership.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                {links.length > 3 && <Pagination links={links} />}
            </div>
        </>
    );
}
History.layout = (page) => <DashboardLayout children={page} />;
