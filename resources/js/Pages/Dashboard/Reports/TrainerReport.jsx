import React, { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconCalendar,
    IconDatabaseOff,
    IconDownload,
    IconFilter,
    IconSearch,
    IconUsers,
    IconUser,
    IconX,
    IconClockHour4,
    IconPercentage,
    IconFileTypePdf,
    IconFileSpreadsheet,
} from "@tabler/icons-react";

const defaultFilterState = {
    start_date: "",
    end_date: "",
    class_type: "",
    trainer_id: "",
    search: "",
};

const castString = (value) => (typeof value === "number" ? String(value) : value ?? "");

const SummaryCard = ({ icon, title, value, description, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            {React.cloneElement(icon, {
                size: 96,
                strokeWidth: 0.5,
                className: "transform translate-x-4 -translate-y-4",
            })}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-white/20">{React.cloneElement(icon, { size: 18 })}</div>
                <span className="text-sm font-medium opacity-90">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-80 mt-1">{description}</p>
        </div>
    </div>
);

const TrainerReport = ({ filters, rows, summary, trainerOptions, classTypeOptions }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        ...defaultFilterState,
        start_date: castString(filters?.start_date),
        end_date: castString(filters?.end_date),
        class_type: castString(filters?.class_type),
        trainer_id: castString(filters?.trainer_id),
        search: castString(filters?.search),
    });

    useEffect(() => {
        setFilterData({
            ...defaultFilterState,
            start_date: castString(filters?.start_date),
            end_date: castString(filters?.end_date),
            class_type: castString(filters?.class_type),
            trainer_id: castString(filters?.trainer_id),
            search: castString(filters?.search),
        });
    }, [filters]);

    const handleChange = (field, value) => setFilterData((prev) => ({ ...prev, [field]: value }));

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route("reports.trainers.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilterState);
        router.get(route("reports.trainers.index"), defaultFilterState, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const tableRows = rows?.data ?? [];
    const paginationLinks = rows?.links ?? [];
    const currentPage = rows?.current_page ?? 1;
    const perPage = rows?.per_page ? Number(rows?.per_page) : tableRows.length || 1;

    const hasActiveFilters = useMemo(
        () => Object.values(filterData).some((value) => castString(value).trim() !== ""),
        [filterData]
    );

    const exportQuery = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filterData).forEach(([key, value]) => {
            if (castString(value).trim() !== "") {
                params.append(key, value);
            }
        });

        return params.toString();
    }, [filterData]);

    const exportExcelHref = `${route("reports.trainers.export")}${exportQuery ? `?${exportQuery}` : ""}`;
    const exportPdfHref = `${route("reports.trainers.export-pdf")}${exportQuery ? `?${exportQuery}` : ""}`;

    const safeSummary = {
        total_hours: summary?.total_hours ?? 0,
        total_participants: summary?.total_participants ?? 0,
        attendance_occupancy: summary?.attendance_occupancy ?? 0,
        attendance_count: summary?.attendance_count ?? 0,
    };

    return (
        <>
            <Head title="Laporan Trainer" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconUsers size={28} className="text-primary-500" />
                            Laporan Trainer
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Laporan aktivitas trainer untuk appointment dan booking schedule.</p>
                    </div>
                    <button
                        onClick={() => setShowFilters((prev) => !prev)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                            showFilters || hasActiveFilters
                                ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800 dark:text-primary-400"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                        <IconFilter size={18} /> Filter
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        icon={<IconClockHour4 />}
                        title="Total Jam Mengajar"
                        value={`${safeSummary.total_hours} jam`}
                        description="Akumulasi durasi kelas"
                        gradient="from-primary-500 to-primary-700"
                    />
                    <SummaryCard
                        icon={<IconUser />}
                        title="Jumlah Peserta"
                        value={safeSummary.total_participants.toLocaleString("id-ID")}
                        description="Total peserta terdaftar"
                        gradient="from-accent-500 to-accent-700"
                    />
                    {/* <SummaryCard
                        icon={<IconPercentage />}
                        title="Okupansi Kehadiran"
                        value={`${safeSummary.attendance_occupancy}%`}
                        description={`${safeSummary.attendance_count} peserta hadir`}
                        gradient="from-warning-500 to-warning-700"
                    /> */}
                </div>

                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal Mulai</label>
                                    <input type="date" value={filterData.start_date} onChange={(e) => handleChange("start_date", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal Akhir</label>
                                    <input type="date" value={filterData.end_date} onChange={(e) => handleChange("end_date", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Kelas</label>
                                    <select value={filterData.class_type} onChange={(e) => handleChange("class_type", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        {(classTypeOptions ?? []).map((item) => (
                                            <option key={item.value || "all"} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Trainer</label>
                                    <select value={filterData.trainer_id} onChange={(e) => handleChange("trainer_id", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        <option value="">Semua Trainer</option>
                                        {(trainerOptions ?? []).map((trainer) => (
                                            <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pencarian</label>
                                    <input type="text" placeholder="Cari semua data..." value={filterData.search} onChange={(e) => handleChange("search", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                {hasActiveFilters && (
                                    <button type="button" onClick={resetFilters} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <IconX size={18} />
                                    </button>
                                )}
                                <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium">
                                    <IconSearch size={18} /> Terapkan
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
                                        <tr className="border-b border-slate-100 dark:border-slate-800 dark:text-slate-400">
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">No</th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Tanggal Sesi</th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Jenis Kelas</th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Nama Kelas</th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Trainer</th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Peserta</th>
                                            {/* <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Status Kehadiran</th> */}
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Durasi</th>
                                            {/* <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Okupansi</th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-400">
                                        {tableRows.map((item, i) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-4 text-sm">{i + 1 + (currentPage - 1) * perPage}</td>
                                                <td className="px-4 py-4 text-sm">{item.date}</td>
                                                <td className="px-4 py-4 text-sm">{item.class_type_label}</td>
                                                <td className="px-4 py-4 text-sm">{item.class_name}</td>
                                                <td className="px-4 py-4 text-sm">{item.trainer_name}</td>
                                                <td className="px-4 py-4 text-sm">{item.participant_name ?? "-"}</td>
                                                {/* <td className="px-4 py-4 text-sm">{item.attendance_status_label ?? "Belum Ditandai"}</td> */}
                                                <td className="px-4 py-4 text-sm">{item.duration_minutes} Menit</td>
                                                {/* <td className="px-4 py-4 text-sm">{item.occupancy_rate}%</td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            <a href={exportPdfHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                                <IconFileTypePdf size={16} /> Ekspor PDF
                            </a>
                            <a href={exportExcelHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                                <IconFileSpreadsheet size={16} /> Ekspor Excel
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Tidak Ada Data</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada data trainer sesuai filter.</p>
                    </div>
                )}

                {paginationLinks.length > 3 && <Pagination links={paginationLinks} />}
            </div>
        </>
    );
};

TrainerReport.layout = (page) => <DashboardLayout children={page} />;

export default TrainerReport;
