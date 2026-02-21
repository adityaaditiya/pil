import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import { IconArrowLeft } from "@tabler/icons-react";

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function Booking({ session, customers = [], paymentGateways = [] }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [discountInput, setDiscountInput] = useState("");
    const [cashInput, setCashInput] = useState("");
    const gatewayOptions = useMemo(
        () => [{ value: "cash", label: "Tunai" }, ...paymentGateways],
        [paymentGateways]
    );

    const { data, setData, post, processing, errors } = useForm({
        timetable_id: session?.id,
        customer_id: "",
        participants: 1,
        payment_type: "drop_in",
        payment_method: "cash",
    });

    const pricePerClass = Number(session?.price || 0);
    const creditPerClass = Number(session?.credit || 0);
    const participants = Number(data.participants || 1);
    const totalPrice = pricePerClass * participants;
    const discount = Math.min(Number(discountInput || 0), totalPrice);
    const payable = Math.max(0, totalPrice - discount);
    const cash = Number(cashInput || 0);
    const change = Math.max(0, cash - payable);
    const neededCredits = creditPerClass * participants;
    const customerCredit = Number(selectedCustomer?.credit || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("bookings.store"));
    };

    return (
        <>
            <Head title="Booking Session" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Booking Session</h1>
                        <p className="text-sm text-slate-500">{session?.class_name} • {session?.start_at_label} - {session?.end_at_label}</p>
                    </div>
                    <Link href={route("timetable.index")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm">
                        <IconArrowLeft size={16} /> Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-5 rounded-2xl border bg-white p-5 lg:col-span-2">
                        <CustomerSelect
                            customers={customers}
                            selected={selectedCustomer}
                            onSelect={(customer) => {
                                setSelectedCustomer(customer);
                                setData("customer_id", customer.id);
                            }}
                            placeholder="Pilih pelanggan..."
                            error={errors.customer_id}
                            label="Pelanggan"
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium">Slot Peserta</label>
                            <input
                                type="number"
                                min={1}
                                max={session?.remaining_slots || 1}
                                value={data.participants}
                                onChange={(e) => setData("participants", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
                            />
                            {errors.participants && <p className="mt-1 text-xs text-red-500">{errors.participants}</p>}
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium">Pembayaran</p>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 rounded-xl border p-3">
                                    <input
                                        type="radio"
                                        checked={data.payment_type === "credit"}
                                        onChange={() => { setData("payment_type", "credit"); setData("payment_method", "credits"); }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">Credits Pelanggan</p>
                                        <p className="text-xs text-slate-500">Sisa credit: {customerCredit}</p>
                                    </div>
                                </label>

                                <br />                               
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={data.payment_type === "drop_in"}
                                            onChange={() => setData("payment_type", "drop_in")}
                                        />
                                        <p className="text-sm font-semibold">Drop-in</p>
                                    </div>
                                    {data.payment_type === "drop_in" && (
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData("payment_method", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        >
                                            {gatewayOptions.map((gateway) => (
                                                <option key={gateway.value} value={gateway.value}>{gateway.label}</option>
                                            ))}
                                        </select>
                                    )}
                                
                            </div>
                            {errors.payment_type && <p className="mt-1 text-xs text-red-500">{errors.payment_type}</p>}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border bg-white p-5 h-fit">
                        <p className="font-semibold">Ringkasan Kelas</p>
                        <p className="text-sm">Sisa Slot: <span className="font-medium">{session?.remaining_slots}</span></p>
                        <p className="text-sm">Harga Kelas: <span className="font-medium">{formatCurrency(pricePerClass)}</span></p>
                        <p className="text-sm">Credit / Kelas: <span className="font-medium">{creditPerClass}</span></p>
                        {data.payment_type === "drop_in" ? (
                            <>
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-600">Diskon (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={discountInput}
                                            onChange={(e) => setDiscountInput(e.target.value.replace(/[^\d]/g, ""))}
                                            placeholder="0"
                                            className="h-10 w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm"
                                        />
                                    </div>
                                </div>

                                {data.payment_method === "cash" && (
                                    <div>
                                        <label className="mb-2 block text-xs font-medium text-slate-600">Jumlah Bayar (Rp)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={cashInput}
                                                onChange={(e) => setCashInput(e.target.value.replace(/[^\d]/g, ""))}
                                                placeholder="0"
                                                className="h-10 w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(totalPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Diskon</span>
                                        <span className="font-medium text-danger-500">-{formatCurrency(discount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-semibold text-primary-600">{formatCurrency(payable)}</span>
                                    </div>
                                    {data.payment_method === "cash" && (
                                        <div className="flex items-center justify-between rounded-lg bg-success-50 px-2 py-1.5">
                                            <span className="font-medium text-success-700">Kembalian</span>
                                            <span className="font-semibold text-success-700">{formatCurrency(change)}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm">Credit Dipakai: <span className="font-semibold text-primary-600">{neededCredits}</span></p>
                        )}

                        <button type="submit" disabled={processing} className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white">
                            {processing ? "Menyimpan..." : "Simpan Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Booking.layout = (page) => <DashboardLayout children={page} />;
