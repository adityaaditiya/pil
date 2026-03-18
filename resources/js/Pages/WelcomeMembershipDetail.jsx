import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCheck,
    IconClock,
    IconCreditCard,
    IconSparkles,
    IconStar,
} from "@tabler/icons-react";
import { useMemo } from "react";

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeMembershipDetail({ plan, paymentGateways = [] }) {
    const { auth } = usePage().props;
    const { data, setData, get, processing } = useForm({
        payment_method: paymentGateways[0]?.value ?? "",
    });

    const allowedClasses = useMemo(() => plan?.classes ?? [], [plan?.classes]);

    const handleCheckout = (event) => {
        event.preventDefault();
        get(route("welcome.membership-checkout", plan.id), {
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
                        </div>

                        <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                            <h2 className="text-xl font-semibold text-slate-900">Metode Pembayaran Drop-In</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Pilih metode pembayaran seperti pada menu welcome schedule payment untuk melanjutkan pembelian membership ini.
                            </p>

                            <div className="mt-6 space-y-3">
                                <div className="rounded-2xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
                                    <p className="inline-flex items-center gap-2"><IconStar size={16} /> {plan?.credits || 0} total credits</p>
                                    <p className="mt-2 inline-flex items-center gap-2"><IconClock size={16} /> Masa aktif {plan?.valid_days ? `${plan.valid_days} hari` : "tanpa batas waktu"}</p>
                                    <p className="mt-2 inline-flex items-center gap-2"><IconCreditCard size={16} /> Total bayar {formatRupiah(plan?.price)}</p>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-3">
                                    {paymentGateways.length ? (
                                        paymentGateways.map((gateway) => {
                                            const checked = data.payment_method === gateway.value;

                                            return (
                                                <label
                                                    key={gateway.value}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${checked ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-primary-300"}`}
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
                                                        <p className="text-sm text-slate-500">Pembayaran manual sesuai instruksi pada halaman selanjutnya.</p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                            Metode pembayaran belum tersedia. Silakan hubungi admin.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!auth?.user || !paymentGateways.length || processing}
                                        className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        Selesaikan Pembayaran
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
