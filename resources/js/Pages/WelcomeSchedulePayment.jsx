import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconCheck, IconCreditCard, IconWallet } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeSchedulePayment({ schedule, paymentGateways = [], customerCredit = 0, availableMemberships = [], remainingSlots = 0 }) {
    const { flash } = usePage().props;
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const allowDropIn = schedule.allow_drop_in && paymentGateways.length > 0;
    const bestMembership = useMemo(() => {
        if (!availableMemberships.length) {
            return null;
        }

        return [...availableMemberships].sort((a, b) => Number(b.credits_remaining || 0) - Number(a.credits_remaining || 0))[0];
    }, [availableMemberships]);

    const { data, setData, post, processing, errors } = useForm({
        payment_type: allowDropIn ? "drop_in" : "credit",
        payment_method: paymentGateways[0]?.value ?? "",
    });

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessModal(true);
        }
    }, [flash?.success]);

    const availableMethods = [
        {
            key: "credit",
            title: "Credit Membership",
            description: "Gunakan saldo credit membership aktif Anda untuk menyelesaikan booking kelas ini.",
            hint: `${Number(bestMembership?.credit_cost ?? schedule.credit_override ?? 0)} credit / sesi`,
            icon: IconWallet,
        },
        ...(allowDropIn
            ? [
                  {
                      key: "drop_in",
                      title: "Drop-In Payment",
                      description: "Bayar per sesi secara langsung dengan metode payment gateway yang tersedia.",
                      hint: formatRupiah(schedule.price_override),
                      icon: IconCreditCard,
                  },
              ]
            : []),
    ];

    const submitBooking = (event) => {
        event.preventDefault();

        post(route("welcome.schedule-payment.process", schedule.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Pembayaran Schedule" />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white px-4 py-10 text-wellness-text">
                <div className="mx-auto max-w-4xl">
                    <Link href={route("welcome.schedule-detail", schedule.id)} className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Detail Schedule
                    </Link>

                    <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                        <div className="grid gap-6 p-6 md:grid-cols-[220px,1fr] md:p-8">
                            {schedule.pilates_class?.image ? (
                                <img src={imageUrl("classes", schedule.pilates_class.image)} alt={schedule.pilates_class?.name} className="h-48 w-full rounded-2xl object-cover md:h-full" />
                            ) : (
                                <div className="flex h-48 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">Tanpa Gambar</div>
                            )}

                            <div>
                                <h1 className="text-3xl font-bold">Pembayaran Booking</h1>
                                {/* <p className="mt-2 text-wellness-muted">{schedule.pilates_class?.name} bersama {schedule.trainer?.name || "trainer"}.</p> */}
                                <p className="mt-2 text-wellness-muted">{schedule.pilates_class?.name}</p>

                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="border-b border-slate-100">
                                                <td className="w-48 bg-slate-50 px-4 py-3 font-medium text-slate-700">Sisa Credit</td>
                                                <td className="px-4 py-3 text-slate-700">{customerCredit}</td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Slot Peserta</td>
                                                <td className="px-4 py-3 text-slate-700">{schedule.capacity || 0} peserta</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Sisa Slot Peserta</td>
                                                <td className="px-4 py-3 text-slate-700">{remainingSlots} peserta</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <form onSubmit={submitBooking} className="mt-6 space-y-4">
                                    <div className="grid gap-3">
                                        {availableMethods.map((method) => {
                                            const Icon = method.icon;

                                            return (
                                                <label key={method.key} className="block cursor-pointer rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            className="mt-1"
                                                            name="payment_type"
                                                            checked={data.payment_type === method.key}
                                                            onChange={() => setData("payment_type", method.key)}
                                                        />
                                                        <div>
                                                            <p className="inline-flex items-center gap-2 text-lg font-semibold text-primary-700"><Icon size={18} /> {method.title}</p>
                                                            <p className="mt-1 text-sm text-wellness-muted">{method.description}</p>
                                                            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary-700"><IconCheck size={16} /> {method.hint}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {data.payment_type === "drop_in" && allowDropIn && (
                                        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-wellness-muted">
                                            <p className="font-semibold text-slate-800">Pilih Metode Payment Gateway:</p>
                                            <select
                                                value={data.payment_method}
                                                onChange={(event) => setData("payment_method", event.target.value)}
                                                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
                                            >
                                                {paymentGateways.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {!allowDropIn && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                            Sesi ini hanya bisa dibayarkan menggunakan credits membership.
                                        </div>
                                    )}

                                    {errors.payment_type && <p className="text-sm text-red-500">{errors.payment_type}</p>}

                                    <button
                                        type="submit"
                                        disabled={processing || remainingSlots < 1}
                                        className="inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        Selesaikan Pembayaran
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
                        <h2 className="text-2xl font-bold text-primary-700">Transaksi Selesai</h2>
                        <p className="mt-2 text-sm text-slate-600">{flash?.success}</p>
                        <Link
                            href={route("welcome.page", "schedule")}
                            className="mt-6 inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Kembali ke Jadwal
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
