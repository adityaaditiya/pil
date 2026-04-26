import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { IconArrowLeft, IconFileInvoice, IconPrinter, IconReceipt } from "@tabler/icons-react";

export default function Print({ membership }) {
    const [printMode, setPrintMode] = useState("invoice");
    const formatDateTime = (value) => value ? new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
    const formatCurrency = (value = 0) => Number(value || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
    const handlePrint = () => window.print();

    return (
        <>
            <Head title="Print Membership" />
            <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link href={route("memberships.history")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <IconArrowLeft size={18} />Kembali ke Riwayat Membership
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
                                <button onClick={() => setPrintMode("invoice")} className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${printMode === "invoice" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}><IconFileInvoice size={16} className="mr-1 inline" />Invoice</button>
                                <button onClick={() => setPrintMode("thermal80")} className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${printMode === "thermal80" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}><IconReceipt size={16} className="mr-1 inline" />Struk 80mm</button>
                                <button onClick={() => setPrintMode("thermal58")} className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${printMode === "thermal58" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}><IconReceipt size={16} className="mr-1 inline" />Struk 58mm</button>
                            </div>
                            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"><IconPrinter size={18} />Cetak</button>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white shadow dark:border-slate-800 dark:bg-slate-900">
                        <div className={printMode === "thermal58" ? "mx-auto w-[58mm] p-2" : printMode === "thermal80" ? "mx-auto w-[80mm] p-3" : "p-6"}>
                            <div className="mb-4 border-b border-dashed border-slate-300 pb-3 text-center"><p className="text-sm font-semibold">ORO Wellness & Movement</p><p className="text-xs text-slate-500">Membership {printMode === "invoice" ? "Invoice" : "Receipt"}</p></div>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-slate-500">Invoice:</span> {membership.invoice}</p>
                                <p><span className="text-slate-500">Tanggal:</span> {formatDateTime(membership.created_at)}</p>
                                <p><span className="text-slate-500">Pelanggan:</span> {membership.user?.name || "-"}</p>
                                <p><span className="text-slate-500">Email:</span> {membership.user?.email || "-"}</p>
                                <p><span className="text-slate-500">Membership:</span> {membership.plan?.name || "-"}</p>
                                <p><span className="text-slate-500">Credits:</span> {membership.credits_remaining || 0}/{membership.credits_total || 0}</p>
                                <p><span className="text-slate-500">Masa Aktif:</span> {membership.plan?.valid_days ? `${membership.plan.valid_days} hari` : "Tanpa batas waktu"}</p>
                                <p><span className="text-slate-500">Pembayaran:</span> {membership.payment_method || "-"}</p>
                                <p><span className="text-slate-500">Status:</span> {membership.status || "-"}</p>
                                <p><span className="text-slate-500">Start:</span> {formatDateTime(membership.starts_at)}</p>
                                <p><span className="text-slate-500">Expire:</span> {formatDateTime(membership.expires_at)}</p>
                            </div>
                            <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-sm font-semibold">Total: {formatCurrency(membership.plan?.price || 0)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
