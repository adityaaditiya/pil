import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Dashboard/Modal";
import { Head, Link, router } from "@inertiajs/react";
import { IconCalendarEvent, IconClock, IconEdit, IconPlus, IconTrash, IconUser, IconBookmark, IconCalendar, IconUserCheck, IconInfoCircle, IconPencil, IconCalendarOff  } from "@tabler/icons-react";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function Index({ appointments = [], selectedStartDate, selectedEndDate }) {
    const [startDate, setStartDate] = useState(selectedStartDate);
    const [endDate, setEndDate] = useState(selectedEndDate);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

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

    const openAppointmentDetail = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const closeAppointmentDetail = () => {
        setSelectedAppointment(null);
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

                {hasAppointments ? (
    <section className="grid gap-6 lg:grid-cols-2">
        {appointments.map((appointment) => {
            // Logika pemisahan Tanggal dan Jam
            const startLabel = appointment.start_at_label || "";
            const endLabel = appointment.end_at_label || "";
            
            const datePart = startLabel.includes(',') ? startLabel.split(',')[0] : startLabel;
            const startTime = startLabel.includes(',') ? startLabel.split(',')[1].trim() : startLabel;
            const endTime = endLabel.includes(',') ? endLabel.split(',')[1].trim() : endLabel;

            return (
                <div
                    key={appointment.id}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-sky-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                    {/* Header: Nama Sesi & Badge Durasi */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {appointment.session_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <IconBookmark size={16} className="text-sky-500" />
                                <span className="font-medium">{appointment.pilates_class?.name || "Kelas Umum"}</span>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {appointment.duration_minutes} Menit
                        </span>
                    </div>

                    {/* Body: Tanggal & Jam (Pemisahan Visual) */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Box Tanggal */}
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                            <div className="rounded-lg bg-white p-2 text-sky-600 shadow-sm dark:bg-slate-700">
                                <IconCalendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tanggal</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{datePart}</p>
                            </div>
                        </div>

                        {/* Box Jam */}
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                            <div className="rounded-lg bg-white p-2 text-orange-500 shadow-sm dark:bg-slate-700">
                                <IconClock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Waktu</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{startTime} - {endTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Trainer & Catatan */}
                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <IconUserCheck size={18} className="text-slate-400" />
                            <span>Trainer: <span className="font-bold text-slate-900 dark:text-white">{appointment.trainers?.join(", ") || "TBA"}</span></span>
                        </div>

                        {appointment.admin_notes && (
                            <div className="flex items-start gap-2 rounded-xl bg-amber-50/50 p-3 text-xs italic text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
                                <IconInfoCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{appointment.admin_notes}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openAppointmentDetail(appointment)}
                            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
                        >
                            View Details
                        </button>

                        <div className="flex gap-2">
                            <Link
                                href={route("appointments.edit", appointment.id)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700"
                                title="Ubah Appointment"
                            >
                                <IconPencil size={18} />
                            </Link>
                            <button
                                type="button"
                                onClick={() => handleDelete(appointment.id)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-500 transition hover:bg-rose-50 dark:border-rose-900/30"
                                title="Hapus"
                            >
                                <IconTrash size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
    </section>
) : (
    <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <IconCalendarOff size={48} className="text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">Tidak ada appointment</h3>
        <p className="text-sm text-slate-500">Coba pilih rentang tanggal lain atau buat jadwal baru.</p>
    </div>
)}
            </div>

            <Modal title="Detail Appointment" show={Boolean(selectedAppointment)} onClose={closeAppointmentDetail} maxWidth="2xl">
                {selectedAppointment && (
                    <div className="space-y-4 p-1">
                        <div>
                            <p className="text-xl font-semibold text-slate-900 dark:text-white">{selectedAppointment.pilates_class?.name || "Appointment"}</p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <IconUser size={16} /> {selectedAppointment.trainers?.join(", ") || "-"}
                            </p>
                        </div>

                        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
                            <p className="flex items-center gap-2"><IconClock size={15} /> {selectedAppointment.start_at_label} - {selectedAppointment.end_at_label} WIB</p>
                            <p>Sesi: {selectedAppointment.session_name || "-"}</p>
                            <p>Durasi: {selectedAppointment.duration_minutes} menit</p>
                            {/* <p>Total Harga: {formatRupiah(selectedAppointment.total_price)}</p> */}
                            <p>Catatan Admin: {selectedAppointment.admin_notes || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Rincian Sesi</p>
                            <div className="mt-2 space-y-2">
                                {(selectedAppointment.session_options || []).length > 0 ? selectedAppointment.session_options.map((option, index) => (
                                    <div key={`${selectedAppointment.id}-detail-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                                        <span>{option.session_name}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {(option.payment_method || "allow_drop_in") === "credit_only" ? (
                                                <span>Credit: {option.price_credit} pts</span>
                                            ) : (
                                                <>
                                                    <span>{formatRupiah(option.price_drop_in ?? option.price)} / </span>
                                                    <span>Credit: {option.price_credit} pts</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500">Belum ada rincian sesi.</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.get(route("appointments.booking.create", selectedAppointment.id))}
                            className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Book Now
                        </button>
                    </div>
                )}
            </Modal>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
