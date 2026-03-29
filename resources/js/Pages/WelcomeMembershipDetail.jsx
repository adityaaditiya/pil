import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCheck,
    IconClock,
    IconCreditCard,
    IconSparkles,
    IconStar,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeMembershipDetail({ plan, paymentGateways = [] }) {
    const { auth } = usePage().props;
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { data, setData, post, processing } = useForm({
        payment_method: paymentGateways[0]?.value ?? "",
    });

    const allowedClasses = useMemo(() => plan?.classes ?? [], [plan?.classes]);
    const selectedGateway = paymentGateways.find(
        (gateway) => gateway.value === data.payment_method,
    );

    const showCashierOnlyNotice = ["debit", "credit_card"].includes(data.payment_method);

    const handleCheckout = (event) => {
        event.preventDefault();
        setShowConfirmation(true);
    };

    const submitCheckout = () => {
        post(route("welcome.membership-checkout.process", plan.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Detail Membership ${plan?.name ?? ""}`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white px-4 py-10 text-wellness-text">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={route("welcome.page", "pricing")}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600"
                    >
                        <IconArrowLeft size={16} /> Kembali ke Pricing
                    </Link>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                        <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                <IconSparkles size={14} /> Detail Membership Plans
                            </div>
                            <h1 className="mt-4 text-3xl font-bold text-slate-900">{plan?.name}</h1>
                            <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
                                {plan?.description || "Paket membership untuk mendukung rutinitas latihan Pilates Anda."}
                            </p>

                            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-slate-100">
                                            <td className="w-52 bg-slate-50 px-4 py-3 font-medium text-slate-700">Nama Paket</td>
                                            <td className="px-4 py-3 text-slate-700">{plan?.name || "-"}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Total Credits</td>
                                            <td className="px-4 py-3 text-slate-700">{plan?.credits || 0} credits</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Harga</td>
                                            <td className="px-4 py-3 text-slate-700">{formatRupiah(plan?.price)}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Masa Aktif</td>
                                            <td className="px-4 py-3 text-slate-700">{plan?.valid_days ? `${plan.valid_days} hari` : "Tanpa batas waktu"}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Rule Class yang Diizinkan</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {allowedClasses.length ? (
                                                    <ul className="space-y-2">
                                                        {allowedClasses.map((item) => (
                                                            <li key={item.id} className="flex items-start gap-2">
                                                                <IconCheck size={16} className="mt-0.5 text-primary-600" />
                                                                <span>{item.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            &nbsp;
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm whitespace-pre-line">
                                <h2 className="text-xl font-semibold">Ketentuan Pembatalan</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                    <p className="text-sm text-wellness-muted whitespace-pre-line text-justify">
                                        Demi kenyamanan bersama, kami sangat menghargai kerja sama Anda untuk tidak melakukan pembatalan mendadak.
                                    </p>
                                    <p className="mt-2 text-sm text-wellness-muted whitespace-pre-line text-justify">
                                        Catatan: Pengembalian kredit/saldo hanya berlaku untuk pembatalan yang dilakukan maksimal 24 jam. Pembatalan setelah melewati batas waktu tersebut akan dianggap hangus.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                            <h2 className="text-xl font-semibold text-slate-900">Pilih Metode Pembayaran</h2>

                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
                                    <p className="inline-flex items-center gap-2"><IconStar size={16} /> {plan?.credits || 0} total credits </p> &nbsp;&nbsp;
                                    <p className="mt-2 inline-flex items-center gap-1"><IconClock size={16} /> Masa aktif {plan?.valid_days ? `${plan.valid_days} hari` : "tanpa batas waktu"}</p>
                                    <p className="mt-2 inline-flex items-center gap-2"><IconCreditCard size={16} /> Total bayar {formatRupiah(plan?.price)}</p>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-3">
                                    {paymentGateways.length ? (
                                        paymentGateways.map((gateway) => {
                                            const checked = data.payment_method === gateway.value;

                                            return (
                                                <label
                                                    key={gateway.value}
                                                    className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${checked ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-primary-300"}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value={gateway.value}
                                                        checked={checked}
                                                        onChange={(event) => setData("payment_method", event.target.value)}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{gateway.label}</p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                            Metode pembayaran belum tersedia. Silakan hubungi admin.
                                        </div>
                                    )}
                                    {showCashierOnlyNotice && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                                            Pembayaran membership menggunakan metode DEBIT & CREDIT CARD hanya bisa dilakukan saat berada di kasir.
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={!auth?.user || !paymentGateways.length || processing || showCashierOnlyNotice}
                                        className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:bg-slate-400"
                                    >
                                        Selesaikan Pembayaran
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900">Konfirmasi Pembayaran</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Pastikan detail pembayaran membership sudah benar sebelum melanjutkan.
                        </p>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="w-40 bg-slate-50 px-4 py-3 font-medium text-slate-700">Nama Membership</td>
                                        <td className="px-4 py-3 text-slate-700">{plan?.name || "-"}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Metode Pembayaran</td>
                                        <td className="px-4 py-3 text-slate-700">{selectedGateway?.label || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Harga</td>
                                        <td className="px-4 py-3 font-semibold text-primary-700">{formatRupiah(plan?.price)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={submitCheckout}
                                disabled={processing}
                                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {processing ? "Memproses..." : "Konfirmasi Pembayaran"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
