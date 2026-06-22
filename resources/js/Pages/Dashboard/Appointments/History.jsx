import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import Swal from "sweetalert2";
import { IconArrowsShuffle, IconBan, IconEye, IconFilter, IconHistory, IconListDetails, IconPrinter, IconSearch, IconUsers, IconX } from "@tabler/icons-react";

const defaultFilters = {
    search: "",
    start_date: "",
    end_date: "",
    status: "",
};

const statusClass = {
    pending: "bg-amber-100 text-amber-700",
    pending_payment: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-rose-100 text-rose-700",
};

const paymentTypeLabel = {
    drop_in: "Drop-In",
    credit: "Membership",
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
        Boolean(filterData.search) ||
        Boolean(filterData.start_date) ||
        Boolean(filterData.end_date) ||
        Boolean(filterData.status);

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

    const handlePaymentAction = (bookingId, action) => {
        router.post(
            route(
                action === "confirm"
                    ? "appointments.confirm-payment"
                    : "appointments.reject-payment",
                bookingId,
            ),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        title: "Berhasil!",
                        text:
                            action === "confirm"
                                ? "Pembayaran appointment berhasil dikonfirmasi."
                                : "Pembayaran appointment berhasil ditolak.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
                onError: (errors) => {
                    Swal.fire({
                        title: "Gagal!",
                        text:
                            errors?.message ||
                            "Aksi pembayaran appointment gagal diproses.",
                        icon: "error",
                    });
                },
            },
        );
    };

    const handleViewPaymentProof = (booking) => {
        if (!booking.payment_proof_image) {
            Swal.fire({
                title: "Bukti pembayaran belum tersedia",
                text: "Customer belum mengunggah foto bukti pembayaran.",
                icon: "info",
            });

            return;
        }

        Swal.fire({
            title: "Foto Bukti Pembayaran",
            html: `
                <div class="space-y-4">
                    <img src="/storage/${booking.payment_proof_image}" alt="Bukti Pembayaran" class="mx-auto max-h-[60vh] rounded-lg border border-slate-200" />
                    <div class="flex items-center justify-center gap-3">
                        <button id="confirm-payment-btn" class="swal2-confirm swal2-styled" style="background:#16a34a;">Confirm Payment</button>
                        <button id="reject-payment-btn" class="swal2-deny swal2-styled" style="background:#dc2626;">Reject Payment</button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 640,
            didOpen: () => {
                const confirmBtn = document.getElementById(
                    "confirm-payment-btn",
                );
                const rejectBtn = document.getElementById("reject-payment-btn");

                confirmBtn?.addEventListener("click", () => {
                    Swal.close();
                    handlePaymentAction(booking.id, "confirm");
                });

                rejectBtn?.addEventListener("click", () => {
                    Swal.close();
                    handlePaymentAction(booking.id, "reject");
                });
            },
        });
    };



    const handleReschedule = (booking) => {
        const targets = (booking.reschedule_targets || []).filter((target) => target.is_available);

        if (targets.length === 0) {
            Swal.fire({
                title: "Jadwal tujuan tidak tersedia",
                text: "Tidak ada jadwal appointment dengan kategori kelas yang sama yang masih tersedia.",
                icon: "info",
            });

            return;
        }

        const currentClassName = booking.class_name || "Kelas tidak diketahui";
        const currentSchedule = booking.schedule_at || "Jadwal tidak tersedia";
        const currentSessionName = booking.session_name || "Sesi belum ditentukan";
        const comboboxItems = targets.map((target) => ({
            id: target.id,
            label: `${target.schedule_at} • ${target.class_name || "-"} • ${target.session_name || "Sesi"}`,
            searchKey: `${target.schedule_at} ${target.class_name || ""} ${target.session_name || ""}`.toLowerCase(),
        }));

        Swal.fire({
            title: "Reschedule Appointment",
            html: `
    <div class="space-y-5 px-1">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Jadwal Saat Ini</p>
            <p class="mt-1.5 text-base font-bold text-slate-900">${currentClassName}</p>
            
            <div class="mt-1 flex flex-col space-y-0.5">
                <p class="text-sm font-medium text-slate-700">${currentSessionName}</p>
                <p class="text-sm text-slate-500">${currentSchedule}</p>
            </div>
        </div>

        <div class="text-left">
            <label for="reschedule-search" class="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Pilih Jadwal Baru
            </label>
            <div class="relative">
                <svg class="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                
                <input 
                    id="reschedule-search" 
                    type="text" 
                    placeholder="Ketik tanggal / nama kelas..." 
                    class="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" 
                />
            </div>
        </div>

        <div class="text-left">
            <input id="reschedule-target" type="hidden" />
            
            <div id="reschedule-dropdown" class="mt-1 max-h-[200px] w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-lg scrollbar-hide empty:hidden"></div>
            
            <p id="reschedule-selected-label" class="mt-5 text-xs font-medium text-slate-500">
                Belum ada jadwal terpilih.
            </p>
        </div>
    </div>
`,
            width: 640,
            showCancelButton: true,
            confirmButtonText: "Reschedule",
            cancelButtonText: "Batal",
            customClass: {
                popup: "!rounded-3xl !p-6",
                confirmButton: "!rounded-xl !bg-violet-600 !px-5 !py-2.5 !font-semibold",
                cancelButton: "!rounded-xl !bg-slate-200 !px-5 !py-2.5 !font-semibold !text-slate-700",
            },
            didOpen: () => {
                const searchInput = document.getElementById("reschedule-search");
                const hiddenInput = document.getElementById("reschedule-target");
                const dropdown = document.getElementById("reschedule-dropdown");
                const selectedLabel = document.getElementById("reschedule-selected-label");
                const maxVisibleItems = 14;

                const renderItems = (query = "") => {
                    if (!dropdown) return;
                    const normalizedQuery = query.trim().toLowerCase();
                    const filtered = comboboxItems
                        .filter((item) => item.searchKey.includes(normalizedQuery))
                        .slice(0, maxVisibleItems);

                    if (filtered.length === 0) {
                        dropdown.innerHTML = `<p class="px-3 py-2 text-sm text-slate-500">Jadwal tidak ditemukan.</p>`;
                        return;
                    }

                    dropdown.innerHTML = filtered
                        .map(
                            (item) => `<button type="button" data-id="${item.id}" data-label="${item.label}" class="reschedule-option block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700">${item.label}</button>`,
                        )
                        .join("");

                    dropdown.querySelectorAll(".reschedule-option").forEach((button) => {
                        button.addEventListener("click", () => {
                            const value = button.getAttribute("data-id");
                            const label = button.getAttribute("data-label");
                            if (hiddenInput) hiddenInput.value = value || "";
                            if (selectedLabel) selectedLabel.textContent = `Terpilih: ${label || "-"}`;
                        });
                    });
                };

                renderItems();
                searchInput?.addEventListener("input", (event) => renderItems(event.target.value));
            },
            preConfirm: () => {
                const value = document.getElementById("reschedule-target")?.value;

                if (!value) {
                    Swal.showValidationMessage("Pilih jadwal tujuan terlebih dahulu.");
                    return null;
                }

                return Number(value);
            },
        }).then((result) => {
            if (!result.isConfirmed || !result.value) return;

            router.post(
                route("appointments.reschedule", booking.id),
                { target_session_id: result.value },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Appointment berhasil dipindahkan ke jadwal baru.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                    onError: (errors) => {
                        Swal.fire({
                            title: "Gagal!",
                            text: errors?.message || "Reschedule appointment gagal diproses.",
                            icon: "error",
                        });
                    },
                },
            );
        });
    };

    const showRescheduleLogs = (booking) => {
        const logs = booking.reschedule_logs || [];

        if (logs.length === 0) {
            Swal.fire({
                title: "Belum ada log",
                text: "Belum ada data riwayat reschedule untuk appointment ini.",
                icon: "info",
            });

            return;
        }

        const rows = logs
            .map((log) => `<tr><td class="px-2 py-1 border">${log.moved_at || "-"}</td><td class="px-2 py-1 border">${log.from_session || "-"}</td><td class="px-2 py-1 border">${log.to_session || "-"}</td><td class="px-2 py-1 border">${log.moved_by || "-"}</td></tr>`)
            .join("");

        Swal.fire({
            title: "Reschedule Logs",
            html: `<div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead><tr><th class="px-2 py-1 border">Waktu</th><th class="px-2 py-1 border">Dari Jadwal</th><th class="px-2 py-1 border">Ke Jadwal</th><th class="px-2 py-1 border">Dipindahkan Oleh</th></tr></thead><tbody>${rows}</tbody></table></div>`,
            width: 760,
            confirmButtonText: "Tutup",
        });
    };

    const canReschedule = (booking) => booking.status === "confirmed";

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
                                        Pencarian
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Invoice / Nama pelanggan / Nominal"
                                        value={filterData.search}
                                        onChange={(event) =>
                                            handleChange("search", event.target.value)
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

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Status Transaksi
                                    </label>
                                    <select
                                        value={filterData.status}
                                        onChange={(event) => handleChange("status", event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        {/* <option value="pending_payment">Pending Payment</option> */}
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="expired">Expired</option>
                                    </select>
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
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kasir</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Nominal</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Credit</th>
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
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{booking.cashier_name || "-"}</td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {formatCurrency(booking.price_amount || 0)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm text-slate-700 dark:text-slate-300">
                                                {booking.credit_used || 0} credit
                                                {/* Cek apakah menggunakan trainer_names (array) atau trainer (string) */}
                                                {/* {booking.trainer || (booking.trainer_names && booking.trainer_names.join(", ")) || "-"} */}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[booking.status] || "bg-slate-100 text-slate-700"}`}>
                                                    {booking.status || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewPaymentProof(booking)
                                                        }
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50"
                                                        title="Lihat Bukti Pembayaran"
                                                    >
                                                        <IconEye size={18} />
                                                    </button>
                                                    <Link
                                                        href={route("appointments.print", booking.invoice)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50"
                                                        title="Print Appointment"
                                                    >
                                                        <IconPrinter size={18} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => showRescheduleLogs(booking)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                                        title="Reschedule Logs"
                                                    >
                                                        <IconListDetails size={18} />
                                                    </button>
                                                    {canReschedule(booking) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReschedule(booking)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
                                                            title="Reschedule"
                                                        >
                                                            <IconArrowsShuffle size={18} />
                                                        </button>
                                                    )}
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
                                        <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
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
