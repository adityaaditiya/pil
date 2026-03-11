import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeScheduleDropInCheckout({ schedule, booking, selectedGateway, participants = 1, paymentInstructions = {}, remainingSlots = 0 }) {
    const { flash } = usePage().props;
    const [secondsLeft, setSecondsLeft] = useState(15 * 60);

    const { setData, post, processing, errors } = useForm({
        payment_proof: null,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const totalPrice = useMemo(() => Number(schedule.price_override || 0) * Number(participants || 1), [participants, schedule.price_override]);

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");

    const uploadPaymentProof = (event) => {
        event.preventDefault();

        post(route("welcome.schedule-payment.upload-proof", booking.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const cancelTransaction = () => {
        router.delete(route("welcome.schedule-payment.cancel-transaction", booking.id));
    };

    return (
        <>
            <Head title="Selesaikan Transaksi Drop-In" />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white px-4 py-10 text-wellness-text">
                <div className="mx-auto max-w-3xl rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                    <h1 className="text-2xl font-bold text-primary-700">Selesaikan Transaksi Drop-In</h1>
                    <p className="mt-2 text-sm text-slate-600">Invoice: <span className="font-semibold">{booking?.invoice}</span></p>
                    <p className="text-sm text-slate-600">Metode pembayaran: <span className="font-semibold">{selectedGateway?.label}</span></p>
                    <p className="text-sm text-slate-600">Jumlah peserta: <span className="font-semibold">{participants}</span> orang</p>
                    <p className="text-sm text-slate-600">Total pembayaran: <span className="font-semibold">{formatRupiah(totalPrice)}</span></p>
                    {!booking?.payment_proof_image && (
                        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">Selesaikan transaksi dalam {minutes}:{seconds}. Otomatis batal jika transaksi tidak diselesaikan</p>
                    )}
                    {selectedGateway?.value === "qris" && (
                        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-800">Scan QRIS berikut:</p>
                            {paymentInstructions?.qris_image && (
                                <img src={imageUrl("payment-settings", paymentInstructions.qris_image)} alt="QRIS" className="mt-3 h-60 w-60 rounded-xl object-cover" />
                            )}
                            <p className="mt-3 text-sm text-slate-700">Nama Merchant: <span className="font-semibold">{paymentInstructions?.qris_full_name || "-"}</span></p>
                            <p className="mt-3 text-sm text-slate-700">*Pastikan QRIS sesuai dengan yang tertera pada Nama Merchant</p>
                        </div>
                    )}

                    {selectedGateway?.value === "bank_transfer" && (
                        <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                            <p><span className="font-semibold">Nama Bank:</span> {paymentInstructions?.bank_name || "-"}</p>
                            <p><span className="font-semibold">Nama Pemilik Rekening:</span> {paymentInstructions?.bank_account_name || "-"}</p>
                            <p><span className="font-semibold">Nomor Rekening:</span> {paymentInstructions?.bank_account_number || "-"}</p>
                        </div>
                    )}

                    {flash?.success && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{flash.success}</div>}

                    {booking?.payment_proof_image && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            Bukti pembayaran sudah diupload. Menunggu konfirmasi admin.
                        </div>
                    )}

                    {secondsLeft === 0 && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Waktu pembayaran habis. Silakan ulangi proses pembayaran.</div>
                    )}

                    {(errors.payment_proof || errors.payment_type || errors.participants) && <p className="mt-4 text-sm text-red-500">{errors.payment_proof || errors.payment_type || errors.participants}</p>}

                    {booking?.payment_proof_image ? (
                        <div className="mt-6">
                            <Link
                                href={route("user.my-schedule")}
                                className="inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                                Lihat booking saya
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={uploadPaymentProof} className="mt-6 space-y-3">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={(event) => setData("payment_proof", event.target.files?.[0] ?? null)}
                                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                            />
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={processing || secondsLeft === 0 || remainingSlots < 1}
                                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    Upload Foto Bukti Pembayaran
                                </button>
                                <button type="button" onClick={cancelTransaction} className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700">
                                    Batalkan Transaksi
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
