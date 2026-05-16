import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconCalendarEvent,
    IconChecklist,
    IconClock,
    IconNotes,
    IconPlayerPlay,
    IconUser,
    IconX,
} from "@tabler/icons-react";

const applyFilters = (filters) => {
    router.get(route("user.my-flow"), filters, {
        preserveState: true,
        replace: true,
    });
};

const formatDate = (date) => {
    if (!date) return "-";
    // Tambahkan pengecekan agar JS tidak menganggap ini UTC
    const d = new Date(date.replace(' ', 'T')); 
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(d);
};

const formatTime = (date) => {
    if (!date) return "-";
    const d = new Date(date.replace(' ', 'T'));
    return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false // Opsional: paksa format 24 jam
    }).format(d);
};

const sessionStatusStyle = {
    upcoming: "bg-sky-50 text-sky-700",
    ongoing: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
};

const indicatorStyle = {
    class: "bg-violet-50 text-violet-700",
    appointment: "bg-rose-50 text-rose-700",
};

const attendanceStyle = {
    pending: "border-slate-200 text-slate-600",
    present: "border-emerald-300 bg-emerald-50 text-emerald-700",
    absent: "border-rose-300 bg-rose-50 text-rose-700",
};

const sessionStatusText = {
    upcoming: "Akan Datang",
    ongoing: "Sedang Berlangsung",
    completed: "Selesai",
};

const attendanceText = {
    pending: "Belum Ditandai",
    present: "Hadir",
    absent: "Tidak Hadir",
};

const updateAttendance = (bookingType, bookingId, attendanceStatus) => {
    router.patch(
        route("user.my-flow.attendance"),
        {
            booking_type: bookingType,
            booking_id: bookingId,
            attendance_status: attendanceStatus,
        },
        {
            preserveScroll: true,
        },
    );
};

export default function MyFlow({ sessions = [], stats = {}, filters = {}, classTypeOptions = {} }) {
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);

    const handleFilterChange = (key, value) => {
        applyFilters({
            ...filters,
            [key]: value,
        });
    };

    const resetFilters = () => {
        applyFilters({
            start_date: "",
            end_date: "",
            class_type: "",
            upcoming_only: false,
        });
    };

    const openQuestionnaire = (client) => {
        setSelectedQuestionnaire({
            clientName: client.name || "-",
            answers: client.questionnaire_answers || [],
        });
    };

    return (
        <>
            <Head title="My Flow" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold md:text-4xl">My Flow</h1>
                        <p className="mt-2 text-sm text-wellness-muted">
                            Jadwal Personal Trainer beserta Absensi Peserta
                        </p>
                    </div>

                    <div className="mb-8 grid gap-4 md:grid-cols-3">
                        <article className="rounded-3xl border border-primary-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Total Jam Mengajar (Minggu Ini)</p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">{stats.week_hours || 0} jam</p>
                        </article>
                        <article className="rounded-3xl border border-primary-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Total Jam Mengajar (Bulan Ini)</p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">{stats.month_hours || 0} jam</p>
                        </article>
                        <article className="rounded-3xl border border-primary-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Sisa Sesi Trainer</p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">{stats.remaining_today_sessions || 0} sesi</p>
                        </article>
                    </div>

                                    <div className="p-6 mb-6 bg-white border shadow-sm border-slate-200/60 rounded-2xl ring-1 ring-slate-900/5">
                    {/* Bagian Atas: Form Input */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-7">
                        
                        {/* Input Tanggal Mulai */}
                        <div>
                            <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={filters.start_date || ""}
                                onChange={(event) => handleFilterChange("start_date", event.target.value)}
                                className="w-full px-4 py-2.5 text-sm transition-all duration-200 border outline-none text-slate-700 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-slate-300"
                            />
                        </div>

                        {/* Input Tanggal Akhir */}
                        <div>
                            <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={filters.end_date || ""}
                                onChange={(event) => handleFilterChange("end_date", event.target.value)}
                                className="w-full px-4 py-2.5 text-sm transition-all duration-200 border outline-none text-slate-700 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-slate-300"
                            />
                        </div>

                        {/* Pilihan Jenis Kelas */}
                        <div>
                            <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500">
                                Jenis Kelas
                            </label>
                            <select
                                value={filters.class_type || ""}
                                onChange={(event) => handleFilterChange("class_type", event.target.value)}
                                disabled={Boolean(filters.upcoming_only)}
                                className="w-full px-4 py-2.5 text-sm transition-all duration-200 border outline-none text-slate-700 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                <option value="">Semua Jenis</option>
                                {classTypeOptions.appointment && <option value="appointment">Appointment</option>}
                                {classTypeOptions.timetable && <option value="timetable">Fixed Timetable</option>}
                            </select>
                        </div>
                        
                    </div>

                    {/* Bagian Bawah: Aksi & Toggle (Garis Pembatas) */}
                    <div className="flex flex-col items-center justify-between pt-5 border-t sm:flex-row border-slate-100 gap-4">
                        
                        {/* Checkbox Sesi Akan Datang */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={Boolean(filters.upcoming_only)}
                                    onChange={(event) => handleFilterChange("upcoming_only", event.target.checked)}
                                    className="w-5 h-5 transition-all bg-white rounded cursor-pointer border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                />
                            </div>
                            <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900">
                                Tampilkan hanya Sesi Akan Datang
                            </span>
                        </label>

                        {/* Tombol Reset */}
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 bg-white border shadow-sm sm:w-auto text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Reset Filter
                        </button>
                        
                    </div>
                </div>

                    {sessions.length === 0 ? (
                        <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada jadwal.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {sessions.map((session) => (
                                <article key={`${session.session_type}-${session.id}`} className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${indicatorStyle[session.indicator] || indicatorStyle.class}`}>
                                            {session.indicator === "appointment" ? "Appointment" : "Timetable"}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sessionStatusStyle[session.session_status] || sessionStatusStyle.upcoming}`}>
                                            {sessionStatusText[session.session_status] || "Akan Datang"}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-semibold text-slate-800">{session.title}</h2>

                                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                                        <p className="inline-flex items-center gap-2">
                                            <IconCalendarEvent size={16} />
                                            {formatDate(session.start_at)}
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <IconClock size={16} />
                                            {formatTime(session.start_at)} - {formatTime(session.end_at)} WIB
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <IconPlayerPlay size={16} />
                                            Durasi: {session.duration_minutes || 0} menit
                                        </p>
                                        {session.session_type === "timetable" && (
                                            <p className="inline-flex items-center gap-2">
                                                <IconChecklist size={16} />
                                                Peserta: {(session.clients || []).length}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Daftar Peserta</h3>
                                        {session.clients?.length ? (
                                            <div className="space-y-3">
                                                {session.clients.map((client) => (
                                                    <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                                        <div className="grid grid-cols-1 gap-1">
                                                            <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                                                                <IconUser size={16} />
                                                                {client.name}
                                                            
                                                            {/* Status Kehadiran */}
                                                            {/* <span className={`rounded-full border px-3 py-0.9 text-xs font-semibold ${attendanceStyle[client.attendance_status] || attendanceStyle.pending}`}>
                                                                {attendanceText[client.attendance_status] || attendanceText.pending}
                                                            </span> */}

                                                            </p>
                                                            <span className="text-xs text-slate-500">Status Booking: {client.booking_status || "-"}</span>
                                                        </div>

                                                        {/* Status Kehadiran */}
                                                        {/* <div className="flex flex-wrap items-center gap-2"> */}
                                                            {/* <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${attendanceStyle[client.attendance_status] || attendanceStyle.pending}`}>
                                                                {attendanceText[client.attendance_status] || attendanceText.pending}
                                                            </span> */}
                                                            {/* ============================== */}
                                                            {/* <button
                                                                type="button"
                                                                onClick={() => openQuestionnaire(client)}
                                                                className="rounded-full border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                                                            >
                                                                <span className="inline-flex items-center gap-1">
                                                                    <IconNotes size={14} />
                                                                    Kuesioner
                                                                </span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateAttendance(session.session_type, client.id, "present")}
                                                                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                Check-in
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateAttendance(session.session_type, client.id, "absent")}
                                                                className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                            >
                                                                Tidak Hadir
                                                            </button>
                                                        </div> */}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">Belum ada peserta pada sesi ini.</p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            {selectedQuestionnaire && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Kuesioner Peserta - {selectedQuestionnaire.clientName}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedQuestionnaire(null)}
                                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                                <IconX size={18} />
                            </button>
                        </div>

                        {selectedQuestionnaire.answers.length ? (
                            <div className="space-y-3">
                                {selectedQuestionnaire.answers.map((item, index) => (
                                    <div
                                        key={`${item.question}-${index}`}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <p className="text-sm font-semibold text-slate-700">
                                            {index + 1}. {item.question}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {item.answer || "-"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Peserta ini belum mengisi data kuesioner.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
