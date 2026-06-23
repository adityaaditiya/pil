import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    IconAlertTriangle,
    IconCalendarPlus,
    IconCash,
    IconChevronDown,
    IconCreditCard,
    IconInfoCircle,
    IconSearch,
    IconSparkles,
    IconUser,
} from "@tabler/icons-react";

const formatDate = (value) => {
    if (!value) return "-";

    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const addDays = (dateString, days) => {
    if (!dateString || !days) return null;

    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + Number(days));

    return date.toISOString().slice(0, 10);
};

export default function Extend({ customers = [], activeMemberships = [], paymentMethods = [] }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        user_id: "",
        user_membership_id: "",
        duration_days: "",
        extension_date: "",
        fee_amount: "",
        payment_method: "complimentary",
        notes: "",
    });

    const [customerSearch, setCustomerSearch] = useState("");
    const [openCustomerDropdown, setOpenCustomerDropdown] = useState(false);

    const feeAmount = Number(data.fee_amount || 0);
    const isComplimentary = feeAmount <= 0;

    const filteredCustomers = useMemo(() => {
        const keyword = customerSearch.trim().toLowerCase();

        if (!keyword) return customers.slice(0, 8);

        return customers
            .filter((customer) => [customer.name, customer.email, customer.phone]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword)))
            .slice(0, 8);
    }, [customers, customerSearch]);

    const membershipOptions = useMemo(() => activeMemberships.filter(
        (membership) => String(membership.user_id) === String(data.user_id)
    ), [activeMemberships, data.user_id]);

    const selectedMembership = useMemo(() => membershipOptions.find(
        (membership) => String(membership.id) === String(data.user_membership_id)
    ) || null, [membershipOptions, data.user_membership_id]);

    const previewNewDate = useMemo(() => {
        if (!selectedMembership?.expires_at) return null;
        if (data.extension_date) return data.extension_date;
        if (Number(data.duration_days || 0) > 0) {
            return addDays(selectedMembership.expires_at, data.duration_days);
        }

        return null;
    }, [selectedMembership, data.duration_days, data.extension_date]);

    const extensionDateIsInvalid = selectedMembership?.expires_at
        && previewNewDate
        && new Date(`${previewNewDate}T00:00:00`) <= new Date(`${selectedMembership.expires_at}T00:00:00`);

    const disabledSubmit = processing
        || !data.user_id
        || !data.user_membership_id
        || (!data.duration_days && !data.extension_date)
        || !data.notes.trim()
        || extensionDateIsInvalid
        || (!isComplimentary && !data.payment_method);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        if (isComplimentary && data.payment_method !== "complimentary") {
            setData("payment_method", "complimentary");
        }

        if (!isComplimentary && data.payment_method === "complimentary") {
            setData("payment_method", paymentMethods[0]?.value || "");
        }
    }, [isComplimentary, paymentMethods]);

    const selectCustomer = (customer) => {
        setCustomerSearch(customer.name);
        setData((current) => ({
            ...current,
            user_id: String(customer.user_id),
            user_membership_id: "",
        }));
        setOpenCustomerDropdown(false);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route("memberships.extensions.store"));
    };

    return (
        <DashboardLayout>
            <Head title="Perpanjang Membership" />

            <div className="py-5 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Perpanjang Membership</h1>
                        <p className="text-sm text-slate-500 mt-1">Tambah masa aktif membership.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6">
                            <div className="relative">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Pilih Pelanggan</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                        <IconSearch size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                        placeholder="Cari nama, email, atau telepon member..."
                                        value={customerSearch}
                                        onFocus={() => setOpenCustomerDropdown(true)}
                                        onBlur={() => setTimeout(() => setOpenCustomerDropdown(false), 200)}
                                        onChange={(event) => {
                                            setCustomerSearch(event.target.value);
                                            setData((current) => ({ ...current, user_id: "", user_membership_id: "" }));
                                        }}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
                                        <IconChevronDown size={16} />
                                    </span>
                                </div>

                                {openCustomerDropdown && (
                                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-xl max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                            <button
                                                type="button"
                                                key={customer.user_id}
                                                onClick={() => selectCustomer(customer)}
                                                className="w-full text-left flex items-start gap-3 px-3 py-2.5 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <span className="mt-0.5 rounded-full bg-slate-100 p-1.5 text-slate-500">
                                                    <IconUser size={14} />
                                                </span>
                                                <span>
                                                    <span className="block font-bold">{customer.name}</span>
                                                    <span className="block text-xs text-slate-400">{customer.email || "Email tidak tersedia"} · {customer.phone || "No. telepon tidak tersedia"}</span>
                                                </span>
                                            </button>
                                        )) : (
                                            <div className="px-3 py-2 text-xs text-slate-400 italic">Member tidak ditemukan</div>
                                        )}
                                    </div>
                                )}
                                {errors?.user_id && <small className="text-xs text-red-500 mt-1 block">{errors.user_id}</small>}
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Pilih Membership Aktif</label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400"
                                    value={data.user_membership_id}
                                    onChange={(event) => setData("user_membership_id", event.target.value)}
                                    disabled={!data.user_id}
                                >
                                    <option value="">{data.user_id ? "Pilih paket membership aktif..." : "Silakan pilih pelanggan terlebih dahulu"}</option>
                                    {membershipOptions.map((membership) => (
                                        <option key={membership.id} value={membership.id}>
                                            {membership.membership_plan_name} — Sisa {membership.credits_remaining} Credits (Exp: {formatDate(membership.expires_at)})
                                        </option>
                                    ))}
                                </select>
                                {data.user_id && membershipOptions.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">Pelanggan ini belum memiliki membership aktif dengan tanggal expired.</p>
                                )}
                                {errors?.user_membership_id && <small className="text-xs text-red-500 mt-1 block">{errors.user_membership_id}</small>}
                            </div>

                            {selectedMembership && (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Sisa Credits Saat Ini</p>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{selectedMembership.credits_remaining} <span className="text-xs font-normal text-slate-400">credits</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Expired Saat ini</p>
                                        <p className="text-lg font-extrabold text-slate-900 mt-1">{formatDate(selectedMembership.expires_at)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Durasi Perpanjangan (Hari)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50"
                                        value={data.duration_days}
                                        onChange={(event) => setData((current) => ({ ...current, duration_days: event.target.value, extension_date: "" }))}
                                        placeholder="Contoh: 30 atau 60"
                                        disabled={!selectedMembership}
                                    />
                                    {errors?.duration_days && <small className="text-xs text-red-500 mt-1 block">{errors.duration_days}</small>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Atau Pilih Tanggal Baru</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50"
                                        value={data.extension_date}
                                        min={selectedMembership?.expires_at || undefined}
                                        onChange={(event) => setData((current) => ({ ...current, extension_date: event.target.value, duration_days: "" }))}
                                        disabled={!selectedMembership}
                                    />
                                    {errors?.extension_date && <small className="text-xs text-red-500 mt-1 block">{errors.extension_date}</small>}
                                </div>
                            </div>

                            {selectedMembership && previewNewDate && (
                                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${extensionDateIsInvalid ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                                    Expired dari {formatDate(selectedMembership.expires_at)} menjadi {formatDate(previewNewDate)}.
                                    {extensionDateIsInvalid && " Tanggal baru harus lebih besar dari expired saat ini."}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Biaya Perpanjangan</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                            <IconCash size={17} />
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                            value={data.fee_amount}
                                            onChange={(event) => setData("fee_amount", event.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors?.fee_amount && <small className="text-xs text-red-500 mt-1 block">{errors.fee_amount}</small>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Metode Pembayaran</label>
                                    {isComplimentary ? (
                                        <div className="min-h-[46px] inline-flex w-full items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                            <IconSparkles size={17} />
                                            Complimentary (Kompensasi)
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                            value={data.payment_method}
                                            onChange={(event) => setData("payment_method", event.target.value)}
                                        >
                                            <option value="">Pilih metode pembayaran aktif...</option>
                                            {paymentMethods.map((method) => (
                                                <option key={method.value} value={method.value}>{method.label}</option>
                                            ))}
                                        </select>
                                    )}
                                    {errors?.payment_method && <small className="text-xs text-red-500 mt-1 block">{errors.payment_method}</small>}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Keterangan / Alasan <span className="text-red-500">*</span></label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(event) => setData("notes", event.target.value)}
                                    placeholder="Wajib diisi, contoh: kompensasi membership, promo renewal, dll."
                                />
                                {errors?.notes && <small className="text-xs text-red-500 mt-1 block">{errors.notes}</small>}
                            </div>

                            <button
                                disabled={disabledSubmit}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <IconCalendarPlus size={16} />
                                {processing ? "Memproses Perpanjangan..." : "Tambah Masa Aktif Membership"}
                            </button>
                        </form>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3 mb-4">Ringkasan</h3>

                                {selectedMembership ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Membership Plan Terpilih</p>
                                            <p className="font-bold text-slate-800 text-base mt-0.5">{selectedMembership.membership_plan_name}</p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-50">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Perubahan Expired</p>
                                            <p className="text-sm font-semibold text-slate-600 mt-1">{formatDate(selectedMembership.expires_at)} → {previewNewDate ? formatDate(previewNewDate) : "Pilih durasi/tanggal"}</p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-50">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Pembayaran</p>
                                            <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-2">
                                                <IconCreditCard size={15} />
                                                {isComplimentary ? "Complimentary" : paymentMethods.find((method) => method.value === data.payment_method)?.label || "Belum dipilih"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-2">
                                        <IconInfoCircle size={28} className="text-slate-300" />
                                        <p className="text-xs max-w-[220px] leading-relaxed">Pilih pelanggan dan membership aktif untuk melihat sisa credits, expired saat ini, serta preview expired baru.</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-amber-800">
                                {/* <div className="flex items-start gap-2">
                                    <IconAlertTriangle size={36} className="mt-0.5" />
                                    <p className="text-xs leading-relaxed">Perpanjangan membership disimpan sebagai transaksi baru pada laporan. Sistem hanya memperbarui tanggal expired membership aktif yang dipilih.</p>
                                </div> */}
                                 <div className="flex items-start gap-2">
                                    <IconAlertTriangle size={36} className="mt-0.5" />
                                    <p className="text-xs leading-relaxed">Sebelum simpan transaksi harap perhatikan tanggal expired saat ini.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}