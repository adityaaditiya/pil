import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import Swal from "sweetalert2";
import { IconBan, IconFilter, IconHistory, IconPrinter, IconSearch, IconUsers, IconX } from "@tabler/icons-react";

const defaultFilters = {
    invoice: "",
    start_date: "",
    end_date: "",
};

const statusClass = {
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
};

const paymentTypeLabel = {
    drop_in: "Drop In",
    credit: "Membership Credit",
};

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

export default function History({ bookings, filters = {} }) {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...filters,
    });

    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...filters,
        });
    }, [filters]);

    const rows = bookings?.data ?? [];
    const links = bookings?.links ?? [];

    const hasActiveFilters =
        Boolean(filterData.invoice) ||
        Boolean(filterData.start_date) ||
        Boolean(filterData.end_date);

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(route("appointments.history"), filterData, {
            preserveScroll: true,
            preserveState: true,
        });

        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);

        router.get(route("appointments.history"), defaultFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleChange = (field, value) => {
        setFilterData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleCancel = (booking) => {
        Swal.fire({
            title: "Batalkan transaksi appointment?",
            text: "Credit customer (jika ada) dan slot appointment akan dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Lanjutkan",
            cancelButtonText: "Batal",
        }).then((confirmResult) => {
            if (!confirmResult.isConfirmed) return;

            Swal.fire({
                title: "Otorisasi",
                html: `
                    <input id="super-admin-authorization-note" type="text" class="swal2-input" placeholder="Keterangan otorisasi">
                    <input id="super-admin-email" type="email" class="swal2-input" placeholder="Username / Email">
                    <input id="super-admin-password" type="password" class="swal2-input" placeholder="Password">
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Validasi",
                cancelButtonText: "Batal",
                preConfirm: () => {
                    const authorizationNote = document
                        .getElementById("super-admin-authorization-note")
                        ?.value?.trim();
                    const email = document
                        .getElementById("super-admin-email")
                        ?.value?.trim();
                    const password = document.getElementById(
                        "super-admin-password",
                    )?.value;

                    if (!email || !password) {
                        Swal.showValidationMessage(
                            "Email dan password super-admin wajib diisi.",
                        );
                        return null;
                    }

                    return { authorizationNote, email, password };
                },
            }).then((authResult) => {
                if (!authResult.isConfirmed) return;

                router.delete(route("appointments.cancel", booking.id), {
                    data: {
                        authorization_note:
                            authResult.value.authorizationNote || "",
                        super_admin_email: authResult.value.email,
                        super_admin_password: authResult.value.password,
                    },
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Transaksi appointment berhasil dibatalkan.",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    },
                    onError: (errors) => {
                        Swal.fire({
                            title: "Gagal!",
                            text:
                                errors?.message ||
                                "Transaksi appointment gagal dibatalkan.",
                            icon: "error",
                        });
                    },
                });
            });
        });
    };

    return (
        <>
            <Head title="Riwayat Appointment" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconHistory size={28} className="text-primary-500" />
                            Riwayat Appointment
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {bookings?.total || 0} appointment customer tercatat
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters((prev) => !prev)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                            showFilters || hasActiveFilters
                                ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-400"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                        <IconFilter size={18} />
                        Filter
                        {hasActiveFilters && (
                            <span className="h-2 w-2 rounded-full bg-primary-500"></span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Nomor Invoice
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="APT-..."
                                        value={filterData.invoice}
                                        onChange={(event) =>
                                            handleChange("invoice", event.target.value)
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(event) =>
                                            handleChange("start_date", event.target.value)
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tanggal Akhir
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(event) =>
                                            handleChange("end_date", event.target.value)
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 font-medium text-white transition-colors hover:bg-primary-600"
                                    >
                                        <IconSearch size={18} />
                                        Cari
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal Booking</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pelanggan</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kelas & Trainer</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pembayaran</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Nominal</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.length > 0 ? (
                                    rows.map((booking, index) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {(bookings.current_page - 1) * bookings.per_page + index + 1}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {booking.invoice || "-"}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{booking.booked_at || "-"}</td>
                                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{booking.customer || "-"}</td>
                                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                                <p className="font-medium">{booking.class_name || "-"}</p>
                                                <p className="text-xs text-slate-500">{booking.session_name || "Sesi belum ditentukan"}</p>
                                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                                                    <IconUsers size={13} />
                                                    {(booking.trainer_names || []).join(", ") || "Trainer belum ditentukan"}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{booking.schedule_at || "-"}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                <p>{paymentTypeLabel[booking.payment_type] || "-"}</p>
                                                <p className="text-xs text-slate-500">{booking.payment_method || "-"}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {formatCurrency(booking.price_amount || 0)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[booking.status] || "bg-slate-100 text-slate-700"}`}>
                                                    {booking.status || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route("appointments.print", booking.invoice)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50"
                                                        title="Print Appointment"
                                                    >
                                                        <IconPrinter size={18} />
                                                    </Link>
                                                    {booking.status === "cancelled" ? (
                                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            Dibatalkan
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancel(booking)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-950/50"
                                                            title="Batalkan Transaksi"
                                                        >
                                                            <IconBan size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                            Belum ada data riwayat appointment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {links.length > 3 && <Pagination links={links} />}
            </div>
        </>
    );
}

History.layout = (page) => <DashboardLayout children={page} />;
