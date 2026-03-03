import React, { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Dashboard/Input";
import Checkbox from "@/Components/Dashboard/Checkbox";
import {
    IconCreditCard,
    IconDeviceFloppy,
    IconBrandStripe,
    IconCash,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function Payment({ setting, supportedGateways = [] }) {
    const { flash } = usePage().props;

    const { data, setData, put, errors, processing } = useForm({
        default_gateway: setting?.default_gateway ?? "cash",
        qris_enabled: setting?.qris_enabled ?? false,
        qris_image: null,
        qris_image_existing: setting?.qris_image ?? "",
        bank_transfer_enabled: setting?.bank_transfer_enabled ?? false,
        bank_name: setting?.bank_name ?? "",
        bank_account_name: setting?.bank_account_name ?? "",
        bank_account_number: setting?.bank_account_number ?? "",
        ayo_enabled: setting?.ayo_enabled ?? false,
        credit_card_enabled: setting?.credit_card_enabled ?? false,
        midtrans_enabled: setting?.midtrans_enabled ?? false,
        midtrans_server_key: setting?.midtrans_server_key ?? "",
        midtrans_client_key: setting?.midtrans_client_key ?? "",
        midtrans_production: setting?.midtrans_production ?? false,
        xendit_enabled: setting?.xendit_enabled ?? false,
        xendit_secret_key: setting?.xendit_secret_key ?? "",
        xendit_public_key: setting?.xendit_public_key ?? "",
        xendit_production: setting?.xendit_production ?? false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.payments.update"), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const isGatewaySelectable = (gateway) => {
        if (gateway === "cash") return true;
        if (gateway === "qris") return data.qris_enabled;
        if (gateway === "bank_transfer") return data.bank_transfer_enabled;
        if (gateway === "ayo") return data.ayo_enabled;
        if (gateway === "credit_card") return data.credit_card_enabled;
        if (gateway === "midtrans") return data.midtrans_enabled;
        if (gateway === "xendit") return data.xendit_enabled;
        return false;
    };

    return (
        <>
            <Head title="Pengaturan Payment" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconCreditCard size={28} className="text-primary-500" />
                    Pengaturan Payment Gateway
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Konfigurasi metode pembayaran dan gateway
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {/* Default Gateway */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <IconCash size={18} />
                        Gateway Default
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Gateway pembayaran default yang digunakan kasir saat
                        membuka halaman transaksi.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Pilih Gateway
                        </label>
                        <select
                            value={data.default_gateway}
                            onChange={(e) =>
                                setData("default_gateway", e.target.value)
                            }
                            className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        >
                            {supportedGateways.map((gw) => (
                                <option
                                    key={gw.value}
                                    value={gw.value}
                                    disabled={!isGatewaySelectable(gw.value)}
                                >
                                    {gw.label}
                                    {!isGatewaySelectable(gw.value) &&
                                        " (nonaktif)"}
                                </option>
                            ))}
                        </select>
                        {errors?.default_gateway && (
                            <small className="text-xs text-danger-500 mt-1">
                                {errors.default_gateway}
                            </small>
                        )}
                    </div>
                </div>

                {/* Manual Payment Methods */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <IconCreditCard size={18} />
                        Metode Pembayaran Manual
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aktifkan metode manual yang tersedia pada menu
                        transaksi.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    QRIS
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pembayaran QRIS dengan konfirmasi manual.
                                </p>
                            </div>
                            <label
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                    data.qris_enabled
                                        ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                            >
                                <Checkbox
                                    checked={data.qris_enabled}
                                    onChange={(e) =>
                                        setData(
                                            "qris_enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                {data.qris_enabled ? "Aktif" : "Nonaktif"}
                            </label>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 md:col-span-2">
                            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Upload Gambar QRIS
                            </p>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={(e) =>
                                    setData("qris_image", e.target.files?.[0] ?? null)
                                }
                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                            />
                            {data.qris_image_existing && !data.qris_image && (
                                <img
                                    src={`/storage/payment-gateways/${data.qris_image_existing}`}
                                    alt="QRIS"
                                    className="mt-3 h-40 rounded-lg border border-slate-200 object-contain p-2"
                                />
                            )}
                            {data.qris_image && (
                                <p className="mt-2 text-xs text-slate-500">
                                    File dipilih: {data.qris_image.name}
                                </p>
                            )}
                            {errors?.qris_image && (
                                <small className="mt-1 block text-xs text-danger-500">
                                    {errors.qris_image}
                                </small>
                            )}
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Transfer Bank
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pembayaran transfer bank yang dicatat
                                    manual.
                                </p>
                            </div>
                            <label
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                    data.bank_transfer_enabled
                                        ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                            >
                                <Checkbox
                                    checked={data.bank_transfer_enabled}
                                    onChange={(e) =>
                                        setData(
                                            "bank_transfer_enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                {data.bank_transfer_enabled
                                    ? "Aktif"
                                    : "Nonaktif"}
                            </label>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 md:col-span-2">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Input
                                    label="Nama Bank"
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData("bank_name", e.target.value)}
                                    errors={errors?.bank_name}
                                    placeholder="Contoh: BCA"
                                />
                                <Input
                                    label="Nama Lengkap"
                                    type="text"
                                    value={data.bank_account_name}
                                    onChange={(e) =>
                                        setData("bank_account_name", e.target.value)
                                    }
                                    errors={errors?.bank_account_name}
                                    placeholder="Nama pemilik rekening"
                                />
                                <Input
                                    label="Nomor Rekening"
                                    type="text"
                                    value={data.bank_account_number}
                                    onChange={(e) =>
                                        setData("bank_account_number", e.target.value)
                                    }
                                    errors={errors?.bank_account_number}
                                    placeholder="Contoh: 1234567890"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    AYO
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pembayaran AYO dengan konfirmasi manual.
                                </p>
                            </div>
                            <label
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                    data.ayo_enabled
                                        ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                            >
                                <Checkbox
                                    checked={data.ayo_enabled}
                                    onChange={(e) =>
                                        setData("ayo_enabled", e.target.checked)
                                    }
                                />
                                {data.ayo_enabled ? "Aktif" : "Nonaktif"}
                            </label>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Credit Card
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pembayaran kartu kredit yang dicatat
                                    manual.
                                </p>
                            </div>
                            <label
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                    data.credit_card_enabled
                                        ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                            >
                                <Checkbox
                                    checked={data.credit_card_enabled}
                                    onChange={(e) =>
                                        setData(
                                            "credit_card_enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                {data.credit_card_enabled
                                    ? "Aktif"
                                    : "Nonaktif"}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Midtrans */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconBrandStripe size={18} />
                            Midtrans Snap
                        </h3>
                        <label
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                data.midtrans_enabled
                                    ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                            <Checkbox
                                checked={data.midtrans_enabled}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_enabled",
                                        e.target.checked
                                    )
                                }
                            />
                            {data.midtrans_enabled ? "Aktif" : "Nonaktif"}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.midtrans_enabled
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Server Key"
                                type="text"
                                value={data.midtrans_server_key}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_server_key",
                                        e.target.value
                                    )
                                }
                                errors={errors?.midtrans_server_key}
                                placeholder="SB-Mid-server-xxx"
                            />
                            <Input
                                label="Client Key"
                                type="text"
                                value={data.midtrans_client_key}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_client_key",
                                        e.target.value
                                    )
                                }
                                errors={errors?.midtrans_client_key}
                                placeholder="SB-Mid-client-xxx"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={data.midtrans_production}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_production",
                                        e.target.checked
                                    )
                                }
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Xendit */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconCreditCard size={18} />
                            Xendit Invoice
                        </h3>
                        <label
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                data.xendit_enabled
                                    ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                            <Checkbox
                                checked={data.xendit_enabled}
                                onChange={(e) =>
                                    setData("xendit_enabled", e.target.checked)
                                }
                            />
                            {data.xendit_enabled ? "Aktif" : "Nonaktif"}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.xendit_enabled
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Secret Key"
                                type="text"
                                value={data.xendit_secret_key}
                                onChange={(e) =>
                                    setData("xendit_secret_key", e.target.value)
                                }
                                errors={errors?.xendit_secret_key}
                                placeholder="xnd_development_xxx"
                            />
                            <Input
                                label="Public Key"
                                type="text"
                                value={data.xendit_public_key}
                                onChange={(e) =>
                                    setData("xendit_public_key", e.target.value)
                                }
                                errors={errors?.xendit_public_key}
                                placeholder="xnd_public_development_xxx"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={data.xendit_production}
                                onChange={(e) =>
                                    setData(
                                        "xendit_production",
                                        e.target.checked
                                    )
                                }
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={18} />
                        {processing ? "Menyimpan..." : "Simpan Konfigurasi"}
                    </button>
                </div>
            </form>
        </>
    );
}

Payment.layout = (page) => <DashboardLayout children={page} />;
