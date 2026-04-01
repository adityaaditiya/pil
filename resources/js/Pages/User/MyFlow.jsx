import { Head, router } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconCalendarEvent,
    IconChecklist,
    IconClock,
    IconPlayerPlay,
    IconUser,
} from "@tabler/icons-react";

const applyFilters = (filters) => {
    router.get(route("user.my-flow"), filters, {
        preserveState: true,
        replace: true,
    });
};

const formatDate = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
          }).format(new Date(date))
        : "-";

const formatTime = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date))
        : "-";

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
                            Jadwal personal trainer untuk hari ini. Anda hanya bisa melihat jadwal milik Anda sendiri.
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
                            <p className="text-sm text-slate-500">Sisa Sesi Hari Ini</p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">{stats.remaining_today_sessions || 0} sesi</p>
                        </article>
                    </div>

                    <div className="mb-6 rounded-3xl border border-primary-100 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <label className="text-sm text-slate-600">
                                <span className="mb-1 block font-medium text-slate-700">Tanggal Mulai</span>
                                <input
                                    type="date"
                                    value={filters.start_date || ""}
                                    onChange={(event) => handleFilterChange("start_date", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                />
                            </label>
                            <label className="text-sm text-slate-600">
                                <span className="mb-1 block font-medium text-slate-700">Tanggal Akhir</span>
                                <input
                                    type="date"
                                    value={filters.end_date || ""}
                                    onChange={(event) => handleFilterChange("end_date", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                />
                            </label>
                            <label className="text-sm text-slate-600">
                                <span className="mb-1 block font-medium text-slate-700">Jenis Kelas</span>
                                <select
                                    value={filters.class_type || ""}
                                    onChange={(event) => handleFilterChange("class_type", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                >
                                    <option value="">Semua Jenis</option>
                                    {classTypeOptions.appointment && <option value="appointment">Appointment</option>}
                                    {classTypeOptions.timetable && <option value="timetable">Fixed Timetable</option>}
                                </select>
                            </label>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada jadwal hari ini.</p>
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
                                        <p className="inline-flex items-center gap-2">
                                            <IconChecklist size={16} />
                                            Peserta: {(session.clients || []).length}
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Daftar Peserta</h3>
                                        {session.clients?.length ? (
                                            <div className="space-y-3">
                                                {session.clients.map((client) => (
                                                    <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                                        <div>
                                                            <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                                                                <IconUser size={16} />
                                                                {client.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">Status Booking: {client.booking_status || "-"}</p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${attendanceStyle[client.attendance_status] || attendanceStyle.pending}`}>
                                                                {attendanceText[client.attendance_status] || attendanceText.pending}
                                                            </span>
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
                                                        </div>
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
        </>
    );
}
