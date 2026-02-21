import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Dashboard/Modal";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { IconCalendarEvent, IconClock, IconPencil, IconPlus, IconTrash, IconUser, IconUsers } from "@tabler/icons-react";

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
                            <p className="mt-1 text-sm text-slate-500">Pilih rentang tanggal lalu reservasi sesi pilates favorit Anda.</p>
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
                    <section className="grid gap-4 lg:grid-cols-2">
                        {sessions.map((session) => {
                            const disabled = session.status !== "scheduled" || session.remaining_slots <= 0;

                            return (
                                <div
                                    key={session.id}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{session.class?.name || "Pilates Session"}</p>
                                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                                <IconUser size={16} /> {session.trainer?.name || "TBA"}
                                            </p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClasses[session.status] || statusClasses.closed}`}>
                                            {session.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                                        <p className="flex items-center gap-2"><IconClock size={16} /> {session.start_at_label} - {session.end_at_label}</p>
                                        <p className="flex items-center gap-2"><IconUsers size={16} /> {session.remaining_slots}/{session.capacity} slots</p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openSession(session)}
                                            className="rounded-xl border border-primary-200 px-3 py-2 text-sm font-medium text-primary-600 transition hover:bg-primary-50"
                                        >
                                            {disabled ? "Sesi tidak tersedia" : "View Details"}
                                        </button>

                                        {canManageTimetable && (
                                            <>
                                                <Link
                                                    href={route("timetable.edit", session.id)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    <IconPencil size={15} /> Ubah
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(session.id)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                                >
                                                    <IconTrash size={15} /> Hapus
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ) : (
                    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-lg font-semibold text-slate-800 dark:text-white">Belum ada sesi pada rentang tanggal ini.</p>
                        <p className="mt-2 text-sm text-slate-500">Coba pilih rentang tanggal lain untuk melihat jadwal yang tersedia.</p>
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
                            <p>Remaining slots: {selectedSession.remaining_slots}</p>
                            <p>Level: {selectedSession.class?.level || "-"}</p>
                            <p>Durasi: {selectedSession.duration_minutes || selectedSession.class?.duration || 0} menit</p>
                            <p>Equipment: {selectedSession.class?.equipment || "-"}</p>
                            <p>Drop-in Price: Rp {Number(selectedSession.price_drop_in || 0).toLocaleString("id-ID")}</p>
                            <p>Membership Credit: {selectedSession.credit_membership || 0}</p>
                        </div>

                        {selectedSession.class?.about && (
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">About Class</p>
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
