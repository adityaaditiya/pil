import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Dashboard/Modal";
import { Head, Link, router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
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
    const [participantSession, setParticipantSession] = useState(null);

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

    const openParticipantsModal = (session) => {
        setParticipantSession(session);
    };

    const closeParticipantsModal = () => {
        setParticipantSession(null);
    };

    const updateAttendanceStatus = (bookingId, attendanceStatus) => {
        router.patch(
            route("timetable.bookings.attendance", bookingId),
            { attendance_status: attendanceStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Data kehadiran peserta berhasil di ubah.");
                    closeParticipantsModal();
                },
                onError: () => toast.error("Data kehadiran peserta gagal di ubah."),
            },
        );
    };

    const updateTimetableStatus = (session) => {
        const nextStatus = session.status === "closed" ? "scheduled" : "closed";

        router.patch(
            route("timetable.status", session.id),
            { status: nextStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success(`Status timetable berhasil diubah menjadi ${nextStatus === "closed" ? "closed" : "schedule"}.`),
                onError: () => toast.error("Status timetable gagal diubah."),
            },
        );
    };

    const handleDelete = (session) => {
        if (Number(session.confirmed_bookings_count || 0) > 0) {
            toast.error("Sesi tidak dapat dihapus karena sudah memiliki booking pelanggan berstatus confirmed.");
            return;
        }

        if (!window.confirm("Yakin ingin menghapus session ini?")) {
            return;
        }

        router.delete(route("timetable.destroy", session.id), {
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
                                <IconCalendarEvent className="text-primary-500" size={28} /> Schedule a Booking
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
            const hasConfirmedBooking = Number(session.confirmed_bookings_count || 0) > 0;
            
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
                        {/* <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClasses[session.status] || statusClasses.closed}`}>
                            {session.status}
                        </span> */}
                        {canManageTimetable && (
                            <button
                                type="button"
                                role="switch"
                                aria-checked={session.status === "closed"}
                                onClick={() => updateTimetableStatus(session)}
                                className={`relative inline-flex h-8 w-24 shrink-0 items-center rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-inner ${
                                    session.status === "closed" 
                                        ? "bg-slate-400" 
                                        : session.status === "scheduled" 
                                            ? "bg-primary-600" /* Warna coklat premium / earth tone */
                                            : "bg-slate-300"
                                }`}
                                title={session.status === "closed" ? "Ubah ke schedule" : "Ubah ke closed"}
                            >
                                {/* Teks "CLOSED" */}
                                <span
                                    className={`absolute left-3 text-[10px] font-bold uppercase tracking-wider text-white transition-opacity duration-300 ${
                                        session.status === "closed" ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    Closed
                                </span>

                                {/* Teks "SCHEDULE" */}
                                <span
                                    className={`absolute right-3 text-[9px] font-bold uppercase tracking-wider text-white transition-opacity duration-300 ${ 
                                        session.status === "scheduled" ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    Schedule
                                </span>

                                {/* Knob / Bundaran Putih */}
                                <span
                                    className={`z-10 inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                                        session.status === "closed" ? "translate-x-16" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        )}
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
                            {/* Latar Belakang Bar (Track) */}
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 shadow-inner ring-1 ring-black/5 dark:bg-slate-800/80 dark:ring-white/5">
                                
                                {/* Bar Pengisi (Progress) */}
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#967259] to-[#634832] transition-all duration-1000 ease-out relative" 
                                    style={{ width: `${(session.remaining_slots / session.capacity) * 100}%` }}
                                >
                                    {/* (Opsional) Efek kilauan/pantulan cahaya lembut di ujung bar */}
                                    <div className="absolute top-0 right-0 bottom-0 w-3 bg-gradient-to-l from-white/20 to-transparent rounded-full"></div>
                                </div>

                            </div>
                        </div>

                        {/* {canManageTimetable && (
                            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Status Timetable</p>
                                        <p className="text-xs text-slate-500">
                                            {session.status === "closed" ? "Closed untuk booking pelanggan" : session.status === "scheduled" ? "Schedule dan bisa dibooking" : `Status saat ini: ${session.status}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={session.status === "closed"}
                                        onClick={() => updateTimetableStatus(session)}
                                        className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                                            session.status === "closed" ? "bg-rose-500" : session.status === "scheduled" ? "bg-emerald-500" : "bg-slate-400"
                                        }`}
                                        title={session.status === "closed" ? "Ubah ke schedule" : "Ubah ke closed"}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                                session.status === "closed" ? "translate-x-8" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Schedule</span>
                                    <span>Closed</span>
                                </div>
                            </div>
                        )} */}

                        <div className="flex flex-col dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                    {session.admin_notes && (
                                        <div className="flex items-start gap-2 text-xs italic text-slate-500">
                                            <IconInfoCircle size={16} className="mt-0.5 shrink-0" />
                                            <span>{session.admin_notes}</span>
                                        </div>
                                    )}    
                            </div>
                        </div>  
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
                                <button
                                    type="button"
                                    onClick={() => openParticipantsModal(session)}
                                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-primary-100 px-3 text-primary-600 transition hover:bg-primary-50"
                                    title="Data Peserta"
                                >
                                    <IconUsers size={16} />
                                    <span className="text-xs font-semibold">Peserta</span>
                                </button>
                                <Link
                                    href={route("timetable.edit", session.id)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-primary-600 dark:border-slate-700"
                                    title="Edit Sesi"
                                >
                                    <IconPencil size={18} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(session)}
                                    disabled={hasConfirmedBooking}
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition dark:border-rose-900/30 ${
                                        hasConfirmedBooking
                                            ? "cursor-not-allowed border-slate-200 text-slate-300"
                                            : "border-rose-100 text-rose-500 hover:bg-rose-50"
                                    }`}
                                    title={hasConfirmedBooking ? "Tidak dapat dihapus karena ada booking confirmed" : "Hapus Sesi"}
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

            <Modal 
                title="Data Peserta" 
                show={Boolean(participantSession)} 
                onClose={closeParticipantsModal} 
                maxWidth="2xl" // Diperkecil dari 3xl agar lebih proporsional di tengah
                >
                    
                {participantSession && (
                    <div className="space-y-6 p-2">
                        {/* Header Info Sesi - Premium Card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                                        {participantSession.class?.name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {participantSession.start_at_label} — {participantSession.end_at_label} 
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                        {participantSession.participants?.length || 0} Peserta
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* List Peserta */}
                        <div className="space-y-4">
                            {/* <h5 className="px-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Daftar Absensi
                            </h5> */}
                            <h5 className="px-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Daftar Peserta
                            </h5>

                            {(participantSession.participants?.length || 0) > 0 ? (
                                <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {participantSession.participants.map((participant, index) => (
                                        <div 
                                            key={participant.id} 
                                            className="group relative rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-primary-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex gap-4">
                                                    {/* Avatar Placeholder / Index */}
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-slate-800">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">
                                                            {participant.name}
                                                        </p>
                                                        <div className="mt-1 space-y-0.5">
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <span className="font-medium">Invoice:</span> {participant.invoice || "-"}
                                                            </p>
                                                            {/* <p className="text-xs text-slate-500">
                                                                {participant.participants_count} Peserta didaftarkan
                                                            </p> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-2">
                                                    {participant.customer_id ? (
                                                        <Link
                                                            href={route("customers.questionnaire.edit", participant.customer_id)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-slate-600 transition hover:bg-slate-50 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                        >
                                                            Kuesioner
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-slate-400 italic">Data tidak tersedia</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Attendance Actions */}
                                            {/* <div className="mt-5 flex items-center gap-2 border-t border-slate-50 pt-4 dark:border-slate-800">
                                                {[
                                                    { label: "Belum Absen", value: "pending", color: "hover:bg-amber-50 hover:text-amber-600" },
                                                    { label: "Hadir", value: "present", color: "hover:bg-emerald-50 hover:text-emerald-600" },
                                                    { label: "Tidak Hadir", value: "absent", color: "hover:bg-red-50 hover:text-red-600" },
                                                ].map((statusOption) => (
                                                    <button
                                                        key={statusOption.value}
                                                        type="button"
                                                        onClick={() => updateAttendanceStatus(participant.id, statusOption.value)}
                                                        className={`flex-1 rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                                                            participant.attendance_status === statusOption.value
                                                                ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                                                                : `bg-slate-50 text-slate-500 dark:bg-slate-800 ${statusOption.color}`
                                                        }`}
                                                    >
                                                        {statusOption.label}
                                                    </button>
                                                ))}
                                            </div> */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 py-12 dark:border-slate-800">
                                    <div className="rounded-full bg-slate-50 p-4 dark:bg-slate-800">
                                        <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-slate-400">Belum ada booking pada sesi ini</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
