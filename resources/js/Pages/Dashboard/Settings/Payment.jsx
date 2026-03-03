import React, { useEffect, useMemo } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Dashboard/Input";
import Checkbox from "@/Components/Dashboard/Checkbox";
import { getImageUrl } from "@/Utils/imageUrl";
import {
    IconCreditCard,
    IconDeviceFloppy,
    IconBrandStripe,
    IconCash,
    IconPhoto,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function Payment({ setting, supportedGateways = [] }) {
    const { flash } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        default_gateway: setting?.default_gateway ?? "cash",
        qris_enabled: setting?.qris_enabled ?? false,
        qris_full_name: setting?.qris_full_name ?? "",
        qris_image: null,
        bank_transfer_enabled: setting?.bank_transfer_enabled ?? false,
        bank_name: setting?.bank_name ?? "",
        bank_account_name: setting?.bank_account_name ?? "",
        bank_account_number: setting?.bank_account_number ?? "",
        debit_enabled: setting?.debit_enabled ?? false,
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
        _method: "PUT",
    });

    const currentQrisImage = useMemo(() => {
        if (data.qris_image instanceof File) {
            return URL.createObjectURL(data.qris_image);
        }

        return getImageUrl(setting?.qris_image, "payment-settings");
    }, [data.qris_image, setting?.qris_image]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("settings.payments.update"), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const isGatewaySelectable = (gateway) => {
        if (gateway === "cash") return true;
        if (gateway === "qris") return data.qris_enabled;
        if (gateway === "bank_transfer") return data.bank_transfer_enabled;
        if (gateway === "debit") return data.debit_enabled;
        if (gateway === "ayo") return data.ayo_enabled;
        if (gateway === "credit_card") return data.credit_card_enabled;
        if (gateway === "midtrans") return data.midtrans_enabled;
        if (gateway === "xendit") return data.xendit_enabled;
        return false;
    };

    const methodCardClass =
        "flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3";

    return (
        <>
            <Head title="Pengaturan Payment" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconCreditCard size={28} className="text-primary-500" />
                    Pengaturan Payment Gateway
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <IconCash size={18} />
                        Gateway Default
                    </h3>
                    <select
                        value={data.default_gateway}
                        onChange={(e) => setData("default_gateway", e.target.value)}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                        {supportedGateways.map((gw) => (
                            <option
                                key={gw.value}
                                value={gw.value}
                                disabled={!isGatewaySelectable(gw.value)}
                            >
                                {gw.label}
                                {!isGatewaySelectable(gw.value) && " (nonaktif)"}
                            </option>
                        ))}
                    </select>
                    {errors?.default_gateway && (
                        <small className="text-xs text-danger-500 mt-1 block">
                            {errors.default_gateway}
                        </small>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">QRIS</p>
                            <Checkbox
                                checked={data.qris_enabled}
                                onChange={(e) => setData("qris_enabled", e.target.checked)}
                            />
                        </div>
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">Transfer Bank</p>
                            <Checkbox
                                checked={data.bank_transfer_enabled}
                                onChange={(e) =>
                                    setData("bank_transfer_enabled", e.target.checked)
                                }
                            />
                        </div>
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">Debit</p>
                            <Checkbox
                                checked={data.debit_enabled}
                                onChange={(e) => setData("debit_enabled", e.target.checked)}
                            />
                        </div>
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">AYO</p>
                            <Checkbox
                                checked={data.ayo_enabled}
                                onChange={(e) => setData("ayo_enabled", e.target.checked)}
                            />
                        </div>
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">Credit Card</p>
                            <Checkbox
                                checked={data.credit_card_enabled}
                                onChange={(e) =>
                                    setData("credit_card_enabled", e.target.checked)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold">Detail QRIS</h3>
                    <Input
                        label="Nama Lengkap"
                        type="text"
                        value={data.qris_full_name}
                        onChange={(e) => setData("qris_full_name", e.target.value)}
                        errors={errors?.qris_full_name}
                    />
                    <div>
                        <p className="text-sm font-medium mb-2">Upload Gambar QRIS</p>
                        <div className="w-44 h-44 border rounded-xl overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
                            {currentQrisImage ? (
                                <img
                                    src={currentQrisImage}
                                    alt="QRIS"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <IconPhoto className="text-slate-400" size={36} />
                            )}
                        </div>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData("qris_image", e.target.files[0])}
                            errors={errors?.qris_image}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold">Detail Transfer Bank</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Nama Bank"
                            type="text"
                            value={data.bank_name}
                            onChange={(e) => setData("bank_name", e.target.value)}
                            errors={errors?.bank_name}
                        />
                        <Input
                            label="Nama Lengkap"
                            type="text"
                            value={data.bank_account_name}
                            onChange={(e) =>
                                setData("bank_account_name", e.target.value)
                            }
                            errors={errors?.bank_account_name}
                        />
                    </div>
                    <Input
                        label="Nomor Rekening"
                        type="text"
                        value={data.bank_account_number}
                        onChange={(e) =>
                            setData("bank_account_number", e.target.value)
                        }
                        errors={errors?.bank_account_number}
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <IconBrandStripe size={18} /> Midtrans Snap
                        </h3>
                        <Checkbox
                            checked={data.midtrans_enabled}
                            onChange={(e) => setData("midtrans_enabled", e.target.checked)}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Server Key"
                            type="text"
                            value={data.midtrans_server_key}
                            onChange={(e) =>
                                setData("midtrans_server_key", e.target.value)
                            }
                            errors={errors?.midtrans_server_key}
                        />
                        <Input
                            label="Client Key"
                            type="text"
                            value={data.midtrans_client_key}
                            onChange={(e) =>
                                setData("midtrans_client_key", e.target.value)
                            }
                            errors={errors?.midtrans_client_key}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold">Xendit Invoice</h3>
                    <Checkbox
                        checked={data.xendit_enabled}
                        onChange={(e) => setData("xendit_enabled", e.target.checked)}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Secret Key"
                            type="text"
                            value={data.xendit_secret_key}
                            onChange={(e) =>
                                setData("xendit_secret_key", e.target.value)
                            }
                            errors={errors?.xendit_secret_key}
                        />
                        <Input
                            label="Public Key"
                            type="text"
                            value={data.xendit_public_key}
                            onChange={(e) =>
                                setData("xendit_public_key", e.target.value)
                            }
                            errors={errors?.xendit_public_key}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
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
