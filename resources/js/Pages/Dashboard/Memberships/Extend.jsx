import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    IconAlertTriangle,
    IconCalendarPlus,
    IconChevronDown,
    IconCreditCard,
    IconGift,
    IconInfoCircle,
    IconSearch,
    IconSend,
    IconUser,
} from "@tabler/icons-react";

export default function Extend({ customers = [], paymentGateways = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        user_membership_id: "",
        duration_days: "",
        new_expires_at: "",
        extension_fee: "",
        payment_method: "complimentary",
        notes: "",
    });

    const [customerSearch, setCustomerSearch] = useState("");
    const [openCustomerDropdown, setOpenCustomerDropdown] = useState(false);
    const [durationMode, setDurationMode] = useState("days");

    const selectedCustomer = useMemo(
        () => customers.find((customer) => String(customer.id) === String(data.customer_id)) || null,
        [customers, data.customer_id]
    );

    const selectedMembership = selectedCustomer?.membership || null;
    const feeAmount = Number(data.extension_fee || 0);
    const isPaid = feeAmount > 0;

    const filteredCustomers = useMemo(() => {
        const search = customerSearch.trim().toLowerCase();

        if (!search) {
            return customers.slice(0, 8);
        }

        return customers
            .filter((customer) => {
                return [customer.name, customer.email, customer.phone]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(search));
            })
            .slice(0, 8);
    }, [customers, customerSearch]);

    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const addDays = (value, days) => {
        const date = value ? new Date(`${value}T00:00:00`) : new Date();
        date.setDate(date.getDate() + Number(days || 0));
        return date;
    };

    const preview = useMemo(() => {
        if (!selectedMembership) return null;

        const oldDate = selectedMembership.expires_at;
        let newDate = null;

        if (durationMode === "days" && Number(data.duration_days || 0) > 0) {
            newDate = addDays(oldDate, Number(data.duration_days));
        }

        if (durationMode === "date" && data.new_expires_at) {
            newDate = new Date(`${data.new_expires_at}T00:00:00`);
        }

        return {
            oldDate,
            newDate,
            isValid: Boolean(newDate) && (!oldDate || newDate > new Date(`${oldDate}T00:00:00`)),
        };
    }, [selectedMembership, durationMode, data.duration_days, data.new_expires_at]);

    useEffect(() => {
        if (!selectedMembership) {
            setData("user_membership_id", "");
            return;
        }

        setData("user_membership_id", selectedMembership.id);
    }, [selectedMembership?.id]);

    useEffect(() => {
        if (isPaid) {
            if (!paymentGateways.some((gateway) => gateway.value === data.payment_method)) {
                setData("payment_method", paymentGateways[0]?.value || "");
            }
            return;
        }

        if (data.payment_method !== "complimentary") {
            setData("payment_method", "complimentary");
        }
    }, [isPaid, paymentGateways]);

    const selectCustomer = (customer) => {
        setData((current) => ({
            ...current,
            customer_id: customer.id,
            user_membership_id: customer.membership?.id || "",
        }));
        setCustomerSearch(customer.name);
        setOpenCustomerDropdown(false);
    };

    const changeDurationMode = (mode) => {
        setDurationMode(mode);
        if (mode === "days") {
            setData("new_expires_at", "");
        } else {
            setData("duration_days", "");
        }
    };

    const submit = (event) => {
        event.preventDefault();
        post(route("memberships.extend.store"), {
            onSuccess: () => {
                reset("duration_days", "new_expires_at", "extension_fee", "notes");
            },
        });
    };

    const disabledSubmit =
        processing ||
        !data.customer_id ||
        !data.user_membership_id ||
        !data.notes.trim() ||
        (durationMode === "days" ? !data.duration_days : !data.new_expires_at) ||
        (isPaid && !data.payment_method) ||
        (preview && preview.newDate && !preview.isValid);

    return (
        <DashboardLayout>
            <Head title="Perpanjang Membership" />

            <div className="py-5 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Perpanjang Membership</h1>
                        <p className="text-sm text-slate-500 mt-1">Tambah masa aktif membership pelanggan tanpa mengubah sisa credits.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6">
                            <div className="relative">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Nama Pelanggan</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                        <IconSearch size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                        placeholder="Cari nama, email, atau telepon pelanggan..."
                                        value={customerSearch}
                                        onFocus={() => setOpenCustomerDropdown(true)}
                                        onBlur={() => setTimeout(() => setOpenCustomerDropdown(false), 200)}
                                        onChange={(event) => {
                                            setCustomerSearch(event.target.value);
                                            setData((current) => ({ ...current, customer_id: "", user_membership_id: "" }));
                                        }}
                                    />
                                    <IconChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>

                                {openCustomerDropdown && (
                                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/60">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map((customer) => (
                                                <button
                                                    type="button"
                                                    key={customer.id}
                                                    onClick={() => selectCustomer(customer)}
                                                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                                                >
                                                    <span className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-500">
                                                        <IconUser size={16} />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-bold text-slate-800">{customer.name}</span>
                                                        <span className="block truncate text-xs text-slate-500">{customer.email || "-"} • {customer.phone || "-"}</span>
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-400 italic">Pelanggan tidak ditemukan</div>
                                        )}
                                    </div>
                                )}
                                {errors.customer_id && <p className="mt-2 text-xs font-semibold text-red-600">{errors.customer_id}</p>}
                            </div>

                            {selectedMembership && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600/80">Paket Saat Ini</p>
                                        <p className="mt-1 text-sm font-extrabold text-slate-900">{selectedMembership.plan_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600/80">Sisa Credits</p>
                                        <p className="mt-1 text-sm font-extrabold text-slate-900">{selectedMembership.credits_remaining} credits</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600/80">Expired Sekarang</p>
                                        <p className="mt-1 text-sm font-extrabold text-slate-900">{formatDate(selectedMembership.expires_at)}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Durasi Perpanjangan</label>
                                <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                    <button type="button" onClick={() => changeDurationMode("days")} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${durationMode === "days" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                                        Jumlah Hari
                                    </button>
                                    <button type="button" onClick={() => changeDurationMode("date")} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${durationMode === "date" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                                        Tanggal Kalender
                                    </button>
                                </div>

                                {durationMode === "days" ? (
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                        placeholder="Contoh: 30"
                                        value={data.duration_days}
                                        onChange={(event) => setData("duration_days", event.target.value)}
                                    />
                                ) : (
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                        value={data.new_expires_at}
                                        onChange={(event) => setData("new_expires_at", event.target.value)}
                                    />
                                )}

                                {preview?.newDate && (
                                    <div className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${preview.isValid ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                                        {preview.isValid ? <IconInfoCircle size={18} className="mt-0.5" /> : <IconAlertTriangle size={18} className="mt-0.5" />}
                                        <p className="font-semibold">
                                            Preview: expired berubah dari {formatDate(preview.oldDate)} menjadi {formatDate(preview.newDate)}.
                                            {!preview.isValid && " Tanggal baru harus lebih besar dari expired lama."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Biaya Perpanjangan</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                    placeholder="Isi 0 jika gratis / kompensasi"
                                    value={data.extension_fee}
                                    onChange={(event) => setData("extension_fee", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Metode Pembayaran</label>
                                {isPaid ? (
                                    <div>
                                        <div className="relative">
                                            <IconCreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <select
                                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                                value={data.payment_method}
                                                onChange={(event) => setData("payment_method", event.target.value)}
                                            >
                                                <option value="">Pilih metode pembayaran aktif...</option>
                                                {paymentGateways.map((gateway) => (
                                                    <option key={gateway.value} value={gateway.value}>{gateway.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {paymentGateways.length === 0 && (
                                            <p className="mt-2 text-xs font-semibold text-red-600">Belum ada Payment Gateway aktif. Aktifkan metode pembayaran di menu Setting Payment Gateway.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700 shadow-sm shadow-emerald-100/70">
                                        <IconGift size={16} />
                                        ✨ Complimentary (Kompensasi / Sistem Gratis)
                                    </div>
                                )}
                                {errors.payment_method && <p className="mt-2 text-xs font-semibold text-red-600">{errors.payment_method}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Alasan Perpanjangan</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                    rows={4}
                                    placeholder="Keterangan wajib diisi, contoh: kompensasi jadwal libur / promo / koreksi sistem..."
                                    value={data.notes}
                                    onChange={(event) => setData("notes", event.target.value)}
                                />
                                {errors.notes && <p className="mt-2 text-xs font-semibold text-red-600">{errors.notes}</p>}
                            </div>

                            <div className="pt-2">
                                <button disabled={disabledSubmit} className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none">
                                    <IconSend size={16} />
                                    {processing ? "Memproses Perpanjangan..." : "Tambah Masa Aktif Membership"}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3 mb-4">Ringkasan Perpanjangan</h3>
                                {selectedMembership ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Pelanggan</p>
                                            <p className="font-bold text-slate-800 text-base mt-0.5">{selectedCustomer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Paket</p>
                                            <p className="font-bold text-slate-800 text-base mt-0.5">{selectedMembership.plan_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Expired Lama</p>
                                                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{formatDate(selectedMembership.expires_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Expired Baru</p>
                                                <p className={`font-extrabold text-sm mt-0.5 ${preview?.newDate && preview.isValid ? "text-emerald-600" : "text-slate-400"}`}>
                                                    {preview?.newDate ? formatDate(preview.newDate) : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-2">
                                        <IconCalendarPlus size={28} className="text-slate-300" />
                                        <p className="text-xs max-w-[220px] leading-relaxed">Pilih pelanggan untuk melihat membership aktif dan preview tanggal expired baru.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
