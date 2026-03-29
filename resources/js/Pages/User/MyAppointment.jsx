import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconCalendarEvent,
    IconClock,
    IconCreditCard,
    IconCurrencyDollar,
    IconUser,
    IconYoga,
} from "@tabler/icons-react";

const imageUrl = (folder, file) => {
    if (!file) return null;

    return folder ? `/storage/${folder}/${file}` : `/storage/${file}`;
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

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const statusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (value === "cancelled") return "bg-rose-50 text-rose-700";
    if (value === "expired") return "bg-slate-100 text-slate-700";

    return "bg-amber-50 text-amber-700";
};

const handleCancelTransaction = (bookingId) => {
    if (!window.confirm("Batalkan transaksi ini?")) return;

    router.delete(route("welcome.appointment-payment.cancel-transaction", bookingId), {
        preserveScroll: true,
    });
};

const applyFilters = (filters) => {
    router.get(route("user.my-appointment"), filters, {
        preserveState: true,
        replace: true,
    });
};

export default function MyAppointment({ bookings = [], filters = {} }) {
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
            status: "",
        });
    };

    return (
        <>
            <Head title="My Appointment" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold md:text-4xl">My Appointment</h1>
                            <p className="mt-2 text-sm text-wellness-muted">Riwayat booking appointment Anda.</p>
                        </div>

                        <Link
                            href={route("welcome.page", "appointment")}
                            className="inline-flex rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Book New Appointment
                        </Link>
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
                                <span className="mb-1 block font-medium text-slate-700">Status</span>
                                <select
                                    value={filters.status || ""}
                                    onChange={(event) => handleFilterChange("status", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="pending_payment">Pending Payment</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
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

                    {bookings.length === 0 ? (
                        <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada booking appointment.</p>
                            <p className="mt-2 text-sm text-wellness-muted">Mulai booking appointment pertama Anda dari halaman appointment.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {bookings.map((booking) => {
                                const appointment = booking.appointment || {};
                                const classItem = appointment.class || {};
                                const isPendingPayment = ["pending", "pending_payment"].includes(
                                    String(booking.status || "").toLowerCase(),
                                );

                                return (
                                    <article
                                        key={booking.id}
                                        className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm"
                                    >
                                        <div className="grid gap-5 p-5 md:grid-cols-[180px,1fr] md:p-6">
                                            <div className="overflow-hidden rounded-2xl bg-primary-50">
                                                {classItem.image ? (
                                                    <img
                                                        src={imageUrl("classes", classItem.image)}
                                                        alt={classItem.name || "Appointment class image"}
                                                        className="h-40 w-full object-cover md:h-full"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center text-primary-700">
                                                        <IconYoga size={26} />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                                        {booking.invoice || "-"}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(booking.status)}`}
                                                    >
                                                        {booking.status || "pending"}
                                                    </span>
                                                </div>

                                                <h2 className="text-xl font-semibold text-slate-800">{classItem.name || "Private Appointment"}</h2>

                                                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconCalendarEvent size={16} />
                                                        {formatDate(appointment.start_at)}
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconClock size={16} />
                                                        {formatTime(appointment.start_at)} - {formatTime(appointment.end_at)} WIB
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconUser size={16} />
                                                        Trainer: {appointment.trainer_name || "-"}
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconCreditCard size={16} />
                                                        Payment: {booking.payment_type || "-"}
                                                    </p>
                                                    <p className="inline-flex items-center gap-2">
                                                        <IconCurrencyDollar size={16} />
                                                        {booking.payment_type === "credit"
                                                            ? `${booking.credit_used || 0} credits`
                                                            : formatRupiah(booking.price_amount)}
                                                    </p>
                                                    <p>Booked at: {formatDate(booking.booked_at)}</p>
                                                    <p>Session: {booking.session_name || "-"}</p>
                                                    <p>Method: {booking.payment_method || "-"}</p>
                                                </div>

                                                {isPendingPayment &&
                                                    booking.payment_type === "drop_in" &&
                                                    !booking.payment_proof_image &&
                                                    booking.payment_due_at && (
                                                        <p className="mt-4 text-sm text-slate-500">
                                                            Batas upload bukti pembayaran:{" "}
                                                            <span className="font-semibold">
                                                                {formatDate(booking.payment_due_at)}
                                                            </span>
                                                        </p>
                                                    )}

                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    {isPendingPayment &&
                                                        booking.payment_type === "drop_in" &&
                                                        !booking.payment_proof_image &&
                                                        appointment.id && (
                                                            <Link
                                                                href={route("welcome.appointment-payment.drop-in-checkout", {
                                                                    appointment: appointment.id,
                                                                    booking_id: booking.id,
                                                                })}
                                                                className="inline-flex rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                                                            >
                                                                Upload Foto Bukti Pembayaran
                                                            </Link>
                                                        )}
                                                    {booking.payment_proof_image && (
                                                        <a
                                                            href={imageUrl("", booking.payment_proof_image)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex rounded-full border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                        >
                                                            Lihat Foto Bukti Pembayaran
                                                        </a>
                                                    )}
                                                    {isPendingPayment &&
                                                        booking.payment_type === "drop_in" &&
                                                        !booking.payment_proof_image && (
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
