import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Dashboard/Modal";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { IconCalendarEvent, IconClock, IconPencil, IconPlus, IconTrash, IconUser, IconUsers, IconInfoCircle, IconCalendar, IconCalendarOff } from "@tabler/icons-react";

const statusClasses = {
    scheduled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function Index({ sessions = [], selectedStartDate, selectedEndDate, canBook }) {
    const { auth } = usePage().props;
    const canManageTimetable = Boolean(auth?.super || auth?.permissions?.["dashboard-access"]);
    const [startDate, setStartDate] = useState(selectedStartDate);
    const [endDate, setEndDate] = useState(selectedEndDate);
    const [selectedSession, setSelectedSession] = useState(null);

    const hasSessions = useMemo(() => sessions.length > 0, [sessions]);

    const applyDateFilter = (nextStartDate, nextEndDate) => {
        router.get(
            route("timetable.index"),
            { start_date: nextStartDate, end_date: nextEndDate },
            { preserveState: true, replace: true }
        );
    };

    const onStartDateChange = (value) => {
        setStartDate(value);
        applyDateFilter(value, endDate);
    };

    const onEndDateChange = (value) => {
        setEndDate(value);
        applyDateFilter(startDate, value);
    };

    const openSession = (session) => {
        setSelectedSession(session);
    };

    const closeModal = () => {
        setSelectedSession(null);
    };

    const handleDelete = (sessionId) => {
        if (!window.confirm("Yakin ingin menghapus session ini?")) {
            return;
        }

        router.delete(route("timetable.destroy", sessionId), {
            data: { start_date: startDate, end_date: endDate },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Schedule Booking" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                <IconCalendarEvent className="text-primary-500" size={28} /> Schedule Booking
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">Pilih rentang tanggal lalu reservasi sesi pilates.</p>
                        </div>
                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end md:gap-4">
                            <div className="w-full md:w-auto">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => onStartDateChange(event.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                                />
                            </div>

                            <div className="w-full md:w-auto">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tanggal Akhir</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) => onEndDateChange(event.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                                />
                            </div>

                            {canManageTimetable && (
                                <Link
                                    href={route("timetable.create")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    <IconPlus size={16} /> Tambah Session
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {hasSessions ? (
    <section className="grid gap-6 lg:grid-cols-2">
        {sessions.map((session) => {
            const disabled = session.status !== "scheduled" || session.remaining_slots <= 0;
            
            // Asumsi: session.start_at adalah format tanggal yang valid (ISO string atau Date)
            // Jika tidak ada, kamu bisa menyesuaikan pengambilan tanggalnya
            const sessionDate = new Date(session.start_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            return (
                <div
                    key={session.id}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                    {/* Header: Judul & Status */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {session.class?.name || "Pilates Session"}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="flex -space-x-1">
                                    <IconUser size={18} className="text-primary-500" />
                                </div>
                                <span className="font-medium">{session.trainer?.name || "TBA"}</span>
                            </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClasses[session.status] || statusClasses.closed}`}>
                            {session.status}
                        </span>
                    </div>

                    {/* Body: Waktu & Info */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Box Tanggal */}
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                            <div className="rounded-lg bg-white p-2 text-primary-600 shadow-sm dark:bg-slate-700">
                                <IconCalendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tanggal</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{sessionDate}</p>
                            </div>
                        </div>

                        {/* Box Jam */}
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                            <div className="rounded-lg bg-white p-2 text-orange-500 shadow-sm dark:bg-slate-700">
                                <IconClock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Waktu</p>
                                {/* Logika untuk mengambil jam saja jika ada koma */}
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {session.start_at_label?.includes(',') 
                                    ? session.start_at_label.split(',')[1].trim() 
                                    : session.start_at_label} 
                                {" - "}
                                {session.end_at_label?.includes(',') 
                                    ? session.end_at_label.split(',')[1].trim() 
                                    : session.end_at_label}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Slot & Notes */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <IconUsers size={18} />
                                <span>Ketersediaan: <span className="font-bold text-slate-900 dark:text-white">{session.remaining_slots} / {session.capacity}</span></span>
                            </div>
                            {/* Bar Kapasitas Sederhana */}
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div 
                                    className="h-full bg-primary-500" 
                                    style={{ width: `${(session.remaining_slots / session.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {session.admin_notes && (
                            <div className="flex items-start gap-2 text-xs italic text-slate-500">
                                <IconInfoCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{session.admin_notes}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => openSession(session)}
                            disabled={disabled}
                            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                                disabled 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200 dark:shadow-none"
                            }`}
                        >
                            {disabled ? "Sesi Tidak Tersedia" : "Booking Sekarang"}
                        </button>

                        {canManageTimetable && (
                            <div className="flex gap-2">
                                <Link
                                    href={route("timetable.edit", session.id)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-primary-600 dark:border-slate-700"
                                    title="Edit Sesi"
                                >
                                    <IconPencil size={18} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(session.id)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-500 transition hover:bg-rose-50 dark:border-rose-900/30"
                                    title="Hapus Sesi"
                                >
                                    <IconTrash size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </section>
) : (
    <section className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="rounded-full bg-white p-4 shadow-sm dark:bg-slate-800">
            <IconCalendarOff size={48} className="text-slate-300" />
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">Jadwal Kosong</h3>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
            Tidak ada sesi yang ditemukan untuk tanggal ini. Silakan pilih tanggal lain.
        </p>
    </section>
)}
            </div>

            <Modal title="Session Details" show={Boolean(selectedSession)} onClose={closeModal} maxWidth="2xl">
                {selectedSession && (
                    <div className="space-y-4 p-1">
                        <div>
                            <p className="text-xl font-semibold text-slate-900 dark:text-white">{selectedSession.class?.name}</p>
                            <p className="mt-1 text-sm text-slate-500">Trainer: {selectedSession.trainer?.name || "TBA"}</p>
                        </div>

                        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
                            <p>Waktu: {selectedSession.start_at_label} - {selectedSession.end_at_label} WIB</p>
                            <p>Kapasitas: {selectedSession.capacity} peserta</p>
                            <p>Sisa Slot: {selectedSession.remaining_slots}</p>
                            <p>Level: {selectedSession.class?.level || "-"}</p>
                            <p>Durasi: {selectedSession.duration_minutes || selectedSession.class?.duration || 0} menit</p>
                            <p>Equipment: {selectedSession.class?.equipment || "-"}</p>
                            <p>Metode Pembayaran: {selectedSession.allow_drop_in ? "Credit atau Drop-in" : "Hanya Credit"}</p>
                            <p>Membership Credit: {selectedSession.credit_membership || 0}</p>
                            <p>Drop-in Price: {selectedSession.allow_drop_in ? `Rp ${Number(selectedSession.price_drop_in || 0).toLocaleString("id-ID")}` : "Tidak tersedia"}</p>
                        </div>

                        {selectedSession.class?.about && (
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Tentang Classes</p>
                                <p className="mt-1 text-sm text-slate-500">{selectedSession.class.about}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => router.get(route("bookings.create"), { timetable_id: selectedSession.id })}
                            disabled={!canBook || selectedSession.status !== "scheduled" || selectedSession.remaining_slots <= 0}
                            className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {!canBook
                                ? "Login Required"
                                : "Book Now"}
                        </button>
                    </div>
                )}
            </Modal>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
