import React, { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PaymentActivationCard from "@/Components/Dashboard/PaymentActivationCard";
import { IconCreditCard, IconDeviceFloppy } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function PaymentActivation({ setting }) {
    const { flash } = usePage().props;

    const { data, setData, put, errors, processing } = useForm({
        qris_enabled: setting?.qris_enabled ?? false,
        bank_transfer_enabled: setting?.bank_transfer_enabled ?? false,
        debit_enabled: setting?.debit_enabled ?? false,
        ayo_enabled: setting?.ayo_enabled ?? false,
        credit_card_enabled: setting?.credit_card_enabled ?? false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.payment-activation.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Aktivasi Payment" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconCreditCard size={28} className="text-primary-500" />
                    Aktivasi Payment
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Aktifkan atau nonaktifkan metode pembayaran manual yang tersedia untuk transaksi.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                <PaymentActivationCard
                    data={data}
                    setData={setData}
                    errors={errors}
                />

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
                    >
                        <IconDeviceFloppy size={18} />
                        {processing ? "Menyimpan..." : "Simpan Aktivasi"}
                    </button>
                </div>
            </form>
        </>
    );
}

PaymentActivation.layout = (page) => <DashboardLayout children={page} />;
