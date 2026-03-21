import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconCalendarEvent,
    IconClockHour4,
    IconCreditCard,
    IconReceipt2,
    IconSparkles,
} from "@tabler/icons-react";

const formatDate = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date))
        : "-";

const statusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "active") return "bg-emerald-50 text-emerald-700";
    if (value === "expired") return "bg-slate-100 text-slate-700";
    if (value === "pending_payment") return "bg-blue-50 text-blue-700";
    if (value === "pending") return "bg-amber-50 text-amber-700";
    if (value === "cancelled") return "bg-rose-50 text-rose-700";

    return "bg-amber-50 text-amber-700";
};

const applyFilters = (filters) => {
    router.get(route("user.my-memberships"), filters, {
        preserveState: true,
        replace: true,
    });
};

export default function MyMemberships({ memberships = [], filters = {} }) {
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

    const cancelTransaction = (membershipId) => {
        if (!window.confirm("Batalkan transaksi membership ini?")) return;

        router.delete(route("welcome.membership-checkout.cancel-transaction", membershipId), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="My Memberships" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold md:text-4xl">My Memberships</h1>
                            <p className="mt-2 text-sm text-wellness-muted">Riwayat langganan membership Anda.</p>
                        </div>

                        <Link href={route("welcome.page", "pricing")} className="inline-flex rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                            Lihat Paket Membership
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
                                    <option value="active">Active</option>
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

                    {memberships.length === 0 ? (
                        <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada membership aktif/riwayat.</p>
                            <p className="mt-2 text-sm text-wellness-muted">Silakan pilih paket membership yang sesuai kebutuhan Anda.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {memberships.map((item) => (
                                <article key={item.id} className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                            <IconSparkles size={14} /> Membership #{item.id}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                            <IconReceipt2 size={14} /> {item.invoice || "-"}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(item.status)}`}>
                                            {item.status || "pending"}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-semibold text-slate-800">{item.plan_name || "Membership Plan"}</h2>

                                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                                        <p>
                                            Credits: <span className="font-semibold">{item.credits_remaining}</span> / {item.credits_total}
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <IconCreditCard size={16} />
                                            Payment: {item.payment_method || "-"}
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <IconCalendarEvent size={16} />
                                            Start From: {formatDate(item.starts_at)}
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <IconClockHour4 size={16} />
                                            Expire: {item.expires_at ? formatDate(item.expires_at) : "Tidak ada"}
                                        </p>
                                    </div>

                                    {item.payment_due_at &&
                                        !item.payment_proof_image_url &&
                                        ["pending", "pending_payment"].includes(item.status) && (
                                            <p className="mt-4 text-sm text-slate-500">
                                                Batas upload bukti pembayaran:{" "}
                                                <span className="font-semibold">{formatDate(item.payment_due_at)}</span>
                                            </p>
                                        )}

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {["pending", "pending_payment"].includes(item.status) && item.membership_plan_id && !item.payment_proof_image_url && (
                                            <Link
                                                href={route("welcome.membership-checkout", {
                                                    membershipPlan: item.membership_plan_id,
                                                    membership_id: item.id,
                                                })}
                                                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                            >
                                                Upload Bukti Pembayaran
                                            </Link>
                                        )}
                                        {item.payment_proof_image_url && (
                                            <a
                                                href={item.payment_proof_image_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                            >
                                                Lihat Foto Bukti Pembayaran
                                            </a>
                                        )}
                                        {["pending", "pending_payment"].includes(item.status) && (
                                            <button
                                                type="button"
                                                onClick={() => cancelTransaction(item.id)}
                                                className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Batalkan Transaksi
                                            </button>
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
