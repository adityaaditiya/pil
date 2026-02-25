import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import { Head, useForm } from "@inertiajs/react";

const formatRupiah = (value = 0) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(Number(value) || 0)}`;

export default function Checkout({ plan, customers = [], paymentGateways = [] }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: "",
        payment_method: "cash",
        cash_amount: "",
        discount: "0",
    });

    const paymentOptions = useMemo(() => {
        const nonCash = Array.isArray(paymentGateways)
            ? paymentGateways.filter(
                  (gateway) =>
                      gateway?.value && gateway.value.toLowerCase() !== "cash"
              )
            : [];

        return [
            {
                value: "cash",
                label: "Tunai",
                description: "Pembayaran tunai langsung di kasir.",
            },
            ...nonCash,
        ];
    }, [paymentGateways]);

    const subtotal = Number(plan?.price || 0);
    const discount = Math.max(0, Number(data.discount) || 0);
    const appliedDiscount = Math.min(discount, subtotal);
    const total = Math.max(subtotal - appliedDiscount, 0);
    const isCashPayment = data.payment_method === "cash";
    const cashAmount = Math.max(0, Number(data.cash_amount) || 0);
    const change = isCashPayment ? Math.max(cashAmount - total, 0) : 0;

    const submit = (e) => {
        e.preventDefault();

        post(route("memberships.activate", plan.id));
    };

    return (
        <>
            <Head title={`Pembayaran ${plan.name}`} />

            <div className="mx-auto max-w-5xl space-y-5">
                <h1 className="text-2xl font-bold">Pembayaran Membership</h1>

                <div className="rounded-xl border bg-white p-4">
                    <h2 className="font-semibold text-slate-800">{plan.name}</h2>
                    <p className="text-sm text-slate-500">
                        {plan.credits} credits • {formatRupiah(plan.price)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Class: {plan.classes?.map((item) => item.name).join(", ") || "-"}
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-2">
                    <div className="space-y-4 rounded-xl border bg-white p-4">
                        <CustomerSelect
                            customers={customers}
                            selected={selectedCustomer}
                            label="Pilih Pelanggan"
                            searchRoute="memberships.customers.search"
                            error={errors.customer_id}
                            onSelect={(customer) => {
                                setSelectedCustomer(customer);
                                setData("customer_id", customer.id);
                            }}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Metode Pembayaran
                            </label>
                            <div className="space-y-2">
                                {paymentOptions.map((method) => (
                                    <button
                                        type="button"
                                        key={method.value}
                                        onClick={() => setData("payment_method", method.value)}
                                        className={`w-full rounded-lg border p-3 text-left transition ${
                                            data.payment_method === method.value
                                                ? "border-primary-500 bg-primary-50"
                                                : "border-slate-200 hover:border-primary-300"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold">{method.label}</p>
                                        <p className="text-xs text-slate-500">{method.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                    </div>

                    <div className="rounded-xl border bg-white p-4">
                        <h3 className="mb-3 font-semibold">Ringkasan Pembayaran</h3>
                        {isCashPayment && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Jumlah Bayar (Rp)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.cash_amount}
                                        onChange={(e) =>
                                            setData(
                                                "cash_amount",
                                                e.target.value.replace(/[^\d]/g, "")
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        placeholder="0"
                                    />
                                    {errors.cash_amount && (
                                        <p className="mt-1 text-xs text-danger-500">{errors.cash_amount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Diskon (Rp)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.discount}
                                        onChange={(e) =>
                                            setData(
                                                "discount",
                                                e.target.value.replace(/[^\d]/g, "")
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        placeholder="0"
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span>{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Diskon</span>
                                <span>{formatRupiah(appliedDiscount)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                                <span>Total</span>
                                <span>{formatRupiah(total)}</span>
                            </div>
                            {isCashPayment && (
                                <div className="flex items-center justify-between text-base font-semibold text-success-600">
                                    <span>Kembalian</span>
                                    <span>{formatRupiah(change)}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.customer_id}
                            className="mt-5 w-full rounded-lg bg-primary-500 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {processing ? "Memproses..." : "Bayar & Aktifkan Membership"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Checkout.layout = (page) => <DashboardLayout children={page} />;
