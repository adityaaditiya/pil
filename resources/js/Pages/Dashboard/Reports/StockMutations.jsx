import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconArrowDown,
    IconArrowUp,
    IconFilter,
    IconPackage,
    IconSearch,
} from "@tabler/icons-react";

const StockMutations = ({ mutations, filters, summary }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        start_date: filters?.start_date || "",
        end_date: filters?.end_date || "",
    });

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route("reports.stock-mutations.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilters(false);
    };

    const rows = mutations?.data || [];

    return (
        <>
            <Head title="Laporan Kelola Stok" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconPackage size={28} className="text-primary-500" />
                            Laporan Kelola Stok
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Mutasi stok dari tambah stok dan kurang stok produk
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                    >
                        <IconFilter size={18} />
                        Filter
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-success-500 to-success-700 text-white shadow-lg">
                        <div className="flex items-center gap-2">
                            <IconArrowUp size={20} />
                            <p className="text-sm">Total Tambah Barang</p>
                        </div>
                        <p className="text-3xl font-bold mt-2">{summary?.total_in || 0}</p>
                    </div>
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-danger-500 to-danger-700 text-white shadow-lg">
                        <div className="flex items-center gap-2">
                            <IconArrowDown size={20} />
                            <p className="text-sm">Total Ambil Barang</p>
                        </div>
                        <p className="text-3xl font-bold mt-2">{summary?.total_out || 0}</p>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(e) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                start_date: e.target.value,
                                            }))
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
                                        Tanggal Akhir
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(e) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                end_date: e.target.value,
                                            }))
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
                                    >
                                        <IconSearch size={18} />
                                        Terapkan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Produk</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tipe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Jumlah</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Catatan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="px-4 py-3 text-sm">{new Date(item.created_at).toLocaleString("id-ID")}</td>
                                            <td className="px-4 py-3 text-sm">{item.product?.title || "-"}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 text-xs rounded ${item.type === "in" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                                                    {item.type === "in" ? "Tambah" : "Kurang"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">{item.qty}</td>
                                            <td className="px-4 py-3 text-sm">{item.note || "-"}</td>
                                            <td className="px-4 py-3 text-sm">{item.user?.name || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Belum ada mutasi stok.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {mutations?.last_page > 1 && <Pagination links={mutations.links} />}
            </div>
        </>
    );
};

StockMutations.layout = (page) => <DashboardLayout children={page} />;

export default StockMutations;
