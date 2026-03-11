import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import { IconCalendarEvent, IconClock, IconUser, IconYoga } from "@tabler/icons-react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

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

const statusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (value === "cancelled") return "bg-rose-50 text-rose-700";

    return "bg-amber-50 text-amber-700";
};



const handleCancelTransaction = (bookingId) => {
    if (!window.confirm("Batalkan transaksi ini?")) return;

    router.delete(route("welcome.schedule-payment.cancel-transaction", bookingId), {
        preserveScroll: true,
    });
};

export default function MySchedule({ bookings = [] }) {
    return (
        <>
            <Head title="My Schedule" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            {/* <p className="text-sm font-medium text-primary-600">User</p> */}
                            <h1 className="text-3xl font-bold md:text-4xl">My Schedule</h1>
                            <p className="mt-2 text-sm text-wellness-muted">Riwayat booking schedule kelas pilates Anda.</p>
                        </div>

                        <Link href={route("welcome.page", "schedule")} className="inline-flex rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                            Book New Schedule
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada booking schedule.</p>
                            <p className="mt-2 text-sm text-wellness-muted">Mulai booking kelas pertama Anda dari halaman schedule.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {bookings.map((booking) => {
                                const schedule = booking.schedule || {};
                                const classItem = schedule.class || {};

                                return (
                                    <article key={booking.id} className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                                        <div className="grid gap-5 p-5 md:grid-cols-[180px,1fr] md:p-6">
                                            <div className="overflow-hidden rounded-2xl bg-primary-50">
                                                {classItem.image ? (
                                                    <img src={imageUrl("classes", classItem.image)} alt={classItem.name || "Class image"} className="h-40 w-full object-cover md:h-full" />
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center text-primary-700">
                                                        <IconYoga size={26} />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">{booking.invoice || "-"}</span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(booking.status)}`}>
                                                        {booking.status || "pending"}
                                                    </span>
                                                </div>

                                                <h2 className="text-xl font-semibold text-slate-800">{classItem.name || "Pilates Class"}</h2>

                                                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconCalendarEvent size={16} />
                                                        {formatDate(schedule.start_at)}
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconClock size={16} />
                                                        {formatTime(schedule.start_at)} WIB
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconUser size={16} />
                                                        Trainer: {schedule.trainer_name || "-"}
                                                    </p>
                                                    <p>Participants: {booking.participants || 0}</p>
                                                    <p>Payment: {booking.payment_type || "-"}</p>
                                                    <p>Booked at: {formatDate(booking.booked_at)}</p>
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    {schedule.id && (
                                                        <Link href={route("welcome.schedule-detail", schedule.id)} className="inline-flex rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                                                            Lihat detail schedule
                                                        </Link>
                                                    )}
                                                    {booking.status === "pending" && booking.payment_type === "drop_in" && !booking.payment_proof_image && schedule.id && (
                                                        <Link
                                                            href={route("welcome.schedule-payment.drop-in-checkout", {
                                                                pilatesTimetable: schedule.id,
                                                                booking_id: booking.id,
                                                            })}
                                                            className="inline-flex rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                                                        >
                                                            Upload Foto Bukti Pembayaran
                                                        </Link>
                                                    )}
                                                    {booking.status === "pending" && booking.payment_type === "drop_in" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelTransaction(booking.id)}
                                                            className="inline-flex rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                                        >
                                                            Batalkan transaksi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
