import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import { IconArrowLeft } from "@tabler/icons-react";

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function Booking({ appointment, customers = [], paymentMethods = [], availableMemberships = [] }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedOption, setSelectedOption] = useState(appointment?.session_options?.[0] || null);
    const [discountInput, setDiscountInput] = useState("");
    const [cashInput, setCashInput] = useState("");

    const mappedPaymentMethods = useMemo(() => {
        const options = paymentMethods.map((method) => ({
            value: method.value,
            label: method.label,
        }));

        if (!options.find((option) => option.value === "cash")) {
            options.unshift({ value: "cash", label: "Tunai" });
        }

        return options;
    }, [paymentMethods]);

    const selectedPaymentMethodType = selectedOption?.payment_method || "allow_drop_in";
    const allowDropIn = selectedPaymentMethodType === "allow_drop_in";

    const { data, setData, post, processing, errors } = useForm({
        customer_id: "",
        payment_type: allowDropIn ? "drop_in" : "credit",
        payment_method: allowDropIn ? (mappedPaymentMethods[0]?.value || "cash") : "credits",
        appointment_session_id: selectedOption?.appointment_session_id || "",
        user_membership_id: "",
    });

    const dropInPrice = Number(selectedOption?.price_drop_in ?? selectedOption?.price ?? appointment?.total_price ?? 0);
    const creditPerSession = Number(selectedOption?.price_credit ?? 0);
    const customerCredit = Number(selectedCustomer?.credit || 0);

    const customerMemberships = useMemo(() => {
        if (!selectedCustomer?.user_id) return [];
        return availableMemberships.filter((item) => item.user_id === selectedCustomer.user_id);
    }, [availableMemberships, selectedCustomer]);

    const selectedMembership = useMemo(() => {
        return customerMemberships.find((item) => Number(item.id) === Number(data.user_membership_id));
    }, [customerMemberships, data.user_membership_id]);

    const neededCredits = Number(selectedMembership?.credit_cost ?? creditPerSession);
    const discount = Math.min(Number(discountInput || 0), dropInPrice);
    const payable = Math.max(0, dropInPrice - discount);
    const cash = Number(cashInput || 0);
    const change = Math.max(0, cash - payable);

    const handleSessionChange = (value) => {
        const option = (appointment?.session_options || []).find(
            (item) => Number(item.appointment_session_id) === Number(value)
        );

        setSelectedOption(option || null);
        setData("appointment_session_id", value);
        const nextPaymentMethodType = option?.payment_method || "allow_drop_in";
        if (nextPaymentMethodType === "credit_only") {
            setData("payment_type", "credit");
            setData("payment_method", "credits");
        } else if (data.payment_type === "credit") {
            setData("payment_type", "drop_in");
            setData("payment_method", mappedPaymentMethods[0]?.value || "cash");
        }
        setData("user_membership_id", "");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("appointments.booking.store", appointment.id));
    };

    return (
        <>
            <Head title="Booking Appointment" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Booking Appointment</h1>
                        <p className="text-sm text-slate-500">{appointment?.class_name} • {appointment?.start_at_label} - {appointment?.end_at_label}</p>
                    </div>
                    <Link href={route("appointments.index")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm">
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
                        
                        {(appointment?.session_options || []).length > 0 && (
                            <div>
                                <label className="mb-2 block text-sm font-medium">Pilih Sesi Appointment</label>
                                <select
                                    value={data.appointment_session_id}
                                    onChange={(event) => handleSessionChange(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                                >
                                    {(appointment.session_options || []).map((option) => (
                                        <option key={option.appointment_session_id} value={option.appointment_session_id}>
                                            {/* {option.session_name} - Drop-in: {formatCurrency(option.price_drop_in ?? option.price)} - Credits: {creditPerSession} pts */}
                                            {option.session_name} 
                                        </option>
                                    ))}
                                </select>
                                {errors.appointment_session_id && <p className="mt-1 text-xs text-red-500">{errors.appointment_session_id}</p>}
                            </div>
                        )} 

                        <div>
                            <p className="mb-2 text-sm font-medium">Jenis Pembayaran</p>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 rounded-xl border p-3">
                                    <input
                                        type="radio"
                                        checked={data.payment_type === "credit"}
                                        onChange={() => {
                                            setData("payment_type", "credit");
                                            setData("payment_method", "credits");
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">Credits Pelanggan</p>
                                        {/* <p className="text-xs text-slate-500">Sisa credit lama: {customerCredit}</p> */}
                                    </div>
                                </label>

                                {data.payment_type === "credit" && (
                                    <select
                                        value={data.user_membership_id}
                                        onChange={(event) => setData("user_membership_id", event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                                    >
                                        <option value="">Pilih membership pelanggan</option>
                                        {customerMemberships.map((membership) => (
                                            <option key={membership.id} value={membership.id}>
                                                {membership.plan_name} - sisa {membership.credits_remaining} credits (biaya {creditPerSession} /sesi)
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {allowDropIn ? (
                                    <>
                                        <label className="flex items-center gap-3 rounded-xl border p-3">
                                            <input
                                                type="radio"
                                                checked={data.payment_type === "drop_in"}
                                                onChange={() => {
                                                    setData("payment_type", "drop_in");
                                                    setData("user_membership_id", "");
                                                    if (data.payment_method === "credits") {
                                                        setData("payment_method", mappedPaymentMethods[0]?.value || "cash");
                                                    }
                                                }}
                                            />
                                            <span className="text-sm font-semibold">Drop-in</span>
                                        </label>
                                        {data.payment_type === "drop_in" && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Metode Pembayaran</label>
                                                <select
                                                    value={data.payment_method}
                                                    onChange={(event) => setData("payment_method", event.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                                                >
                                                    {mappedPaymentMethods.map((method) => (
                                                        <option key={method.value} value={method.value}>{method.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-500">Sesi ini hanya menerima pembayaran credit.</p>
                                )}
                            </div>
                            {errors.payment_type && <p className="mt-1 text-xs text-red-500">{errors.payment_type}</p>}
                            {errors.payment_method && <p className="mt-1 text-xs text-red-500">{errors.payment_method}</p>}
                            {errors.user_membership_id && <p className="mt-1 text-xs text-red-500">{errors.user_membership_id}</p>}
                        </div>

                        
                    </div>

                    <div className="space-y-3 rounded-2xl border bg-white p-5 h-fit">
                        <p className="font-semibold ">Ringkasan Booking Appointment</p>
                        <p className="text-sm">Tanggal: <span className="font-medium">{appointment?.start_date_label} | Jam: {appointment?.start_at_label} - {appointment?.end_at_label}</span></p>
                        {/* <p className="text-sm">Jam: <span className="font-medium">{appointment?.start_at_label} - {appointment?.end_at_label}</span></p> */}
                        <p className="text-sm">Sesi Dipilih: <span className="font-medium">{selectedOption?.session_name || appointment?.session_name || "-"}</span></p>
                        <p className="text-sm">Trainer: <span className="font-medium">{appointment?.trainers?.join(", ") || "-"}</span></p>
                        <p className="text-sm">Harga Drop-in: <span className="font-medium">{formatCurrency(dropInPrice)}</span></p>
                        <p className="text-sm">Harga Credit / sesi: <span className="font-medium">{creditPerSession}</span></p>
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
                                            onChange={(event) => setDiscountInput(event.target.value.replace(/[^\d]/g, ""))}
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
                                                onChange={(event) => setCashInput(event.target.value.replace(/[^\d]/g, ""))}
                                                placeholder="0"
                                                className="h-10 w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(dropInPrice)}</span>
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
                            <p className="text-sm">Credit Dipakai: <span className="font-semibold text-primary-600">{creditPerSession}</span></p>
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
