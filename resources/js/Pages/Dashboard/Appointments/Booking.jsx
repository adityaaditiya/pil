import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import { IconArrowLeft } from "@tabler/icons-react";

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function Booking({ appointment, customers = [], paymentMethods = [] }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedOption, setSelectedOption] = useState(appointment?.session_options?.[0] || null);

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

    const { data, setData, post, processing, errors } = useForm({
        customer_id: "",
        payment_type: appointment?.default_payment_type || "drop_in",
        payment_method: appointment?.default_payment_type === "credit" ? "credits" : (mappedPaymentMethods[0]?.value || "cash"),
        appointment_session_id: selectedOption?.appointment_session_id || "",
    });

    const price = Number(selectedOption?.price ?? appointment?.total_price ?? 0);

    const handleSessionChange = (value) => {
        const option = (appointment?.session_options || []).find(
            (item) => Number(item.appointment_session_id) === Number(value)
        );

        setSelectedOption(option || null);
        setData("appointment_session_id", value);
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

                        <div>
                            <label className="mb-2 block text-sm font-medium">Jenis Pembayaran</label>
                            <select
                                value={data.payment_type}
                                onChange={(event) => {
                                    const paymentType = event.target.value;
                                    setData("payment_type", paymentType);
                                    if (paymentType === "credit") {
                                        setData("payment_method", "credits");
                                    } else if (data.payment_method === "credits") {
                                        setData("payment_method", mappedPaymentMethods[0]?.value || "cash");
                                    }
                                }}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                            >
                                <option value="drop_in">Drop-in</option>
                                <option value="credit">Credits</option>
                            </select>
                            {errors.payment_type && <p className="mt-1 text-xs text-red-500">{errors.payment_type}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Metode Pembayaran</label>
                            <select
                                value={data.payment_method}
                                onChange={(event) => setData("payment_method", event.target.value)}
                                disabled={data.payment_type === "credit"}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                            >
                                {(data.payment_type === "credit"
                                    ? [{ value: "credits", label: "Credits" }]
                                    : mappedPaymentMethods).map((method) => (
                                    <option key={method.value} value={method.value}>{method.label}</option>
                                ))}
                            </select>
                            {errors.payment_method && <p className="mt-1 text-xs text-red-500">{errors.payment_method}</p>}
                        </div>

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
                                            {option.session_name} - {formatCurrency(option.price)}
                                        </option>
                                    ))}
                                </select>
                                {errors.appointment_session_id && <p className="mt-1 text-xs text-red-500">{errors.appointment_session_id}</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 rounded-2xl border bg-white p-5 h-fit">
                        <p className="font-semibold">Ringkasan Booking Appointment</p>
                        <p className="text-sm">Tanggal: <span className="font-medium">{appointment?.start_date_label}</span></p>
                        <p className="text-sm">Jam: <span className="font-medium">{appointment?.start_at_label} - {appointment?.end_at_label}</span></p>
                        <p className="text-sm">Trainer: <span className="font-medium">{appointment?.trainers?.join(", ") || "-"}</span></p>
                        <p className="text-sm">Sesi Dipilih: <span className="font-medium">{selectedOption?.session_name || appointment?.session_name || "-"}</span></p>
                        <p className="text-sm">Total Bayar: <span className="font-semibold text-primary-600">{formatCurrency(price)}</span></p>

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
