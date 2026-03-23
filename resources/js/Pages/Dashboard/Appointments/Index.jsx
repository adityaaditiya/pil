import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import { IconCalendarEvent, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function Index({ appointments = [], selectedStartDate, selectedEndDate }) {
    const [startDate, setStartDate] = useState(selectedStartDate);
    const [endDate, setEndDate] = useState(selectedEndDate);

    const hasAppointments = useMemo(() => appointments.length > 0, [appointments]);

    const applyFilter = (nextStartDate, nextEndDate) => {
        router.get(route("appointments.index"), { start_date: nextStartDate, end_date: nextEndDate }, { preserveState: true, replace: true });
    };

    const handleDelete = (appointmentId) => {
        if (!window.confirm("Yakin ingin menghapus appointment ini?")) {
            return;
        }

        router.delete(route("appointments.destroy", appointmentId), {
            data: { start_date: startDate, end_date: endDate },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Appointment" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                <IconCalendarEvent size={28} className="text-primary-500" /> Appointment
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">Kelola jadwal appointment Pelanggan.</p>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tanggal Mulai</label>
                                <input type="date" value={startDate} onChange={(event) => {
                                    setStartDate(event.target.value);
                                    applyFilter(event.target.value, endDate);
                                }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tanggal Akhir</label>
                                <input type="date" value={endDate} onChange={(event) => {
                                    setEndDate(event.target.value);
                                    applyFilter(startDate, event.target.value);
                                }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800" />
                            </div>
                            <Link href={route("appointments.create")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 md:self-end">
                                <IconPlus size={16} /> Tambah Appointment
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {hasAppointments ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Sesi</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Kelas</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Trainer</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Durasi</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Harga</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Catatan Admin</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appointment.start_at_label} - {appointment.end_at_label}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-800 dark:text-white">{appointment.session_name}</p>
                                                <p className="text-xs text-slate-500">{appointment.description || "-"}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appointment.pilates_class?.name || "-"}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appointment.trainers?.join(", ") || "-"}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appointment.duration_minutes} menit</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatRupiah(appointment.price)}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appointment.admin_notes || "-"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route("appointments.edit", appointment.id)} className="inline-flex items-center gap-1 rounded-xl border border-sky-200 px-3 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50">
                                                        <IconEdit size={15} /> Ubah
                                                    </Link>
                                                    <button type="button" onClick={() => handleDelete(appointment.id)} className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                                                        <IconTrash size={15} /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-sm text-slate-500">Belum ada appointment pada rentang tanggal yang dipilih.</div>
                    )}
                </section>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
