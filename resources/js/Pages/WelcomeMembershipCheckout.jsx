import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeMembershipCheckout({
    plan,
    membership,
    selectedGateway,
    paymentInstructions = {},
}) {
    
    const { flash } = usePage().props;
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!membership?.expired_at) return 0;

        const diff = Math.floor(
            (new Date(membership.expired_at).getTime() - Date.now()) / 1000,
        );

        return Math.max(diff, 0);
    });

    const { setData, post, processing, errors } = useForm({
        payment_proof: null,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (!membership?.expired_at) {
                setSecondsLeft(0);
                return;
            }

            const diff = Math.floor(
                (new Date(membership.expired_at).getTime() - Date.now()) / 1000,
            );
            setSecondsLeft(Math.max(diff, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [membership?.expired_at]);

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");

    const uploadPaymentProof = (event) => {
        event.preventDefault();

        post(route("welcome.membership-checkout.upload-proof", membership.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const cancelTransaction = () => {
        router.delete(
            route("welcome.membership-checkout.cancel-transaction", membership.id),
        );
    };

    return (
        <>
            <Head title="Selesaikan Transaksi Membership" />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white px-4 py-10 text-wellness-text">
                <div className="mx-auto max-w-3xl rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                    <h1 className="text-2xl font-bold text-primary-700">
                        Selesaikan Transaksi Membership
                    </h1>
                    <p className="text-sm text-slate-600">
                        Invoice: <span className="font-semibold">{membership?.invoice}</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Lanjutkan pembayaran membership <span className="font-semibold">{plan?.name}</span> menggunakan metode <span className="font-semibold">{selectedGateway?.label}</span>.
                    </p>
                    

                    {!membership?.payment_proof_image && (
                        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                            Selesaikan transaksi dalam {minutes}:{seconds}. Otomatis batal jika transaksi tidak diselesaikan.
                        </p>
                    )}

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
                                    <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Invoice</td>
                                    <td className="px-4 py-3 text-slate-700">{membership?.invoice || "-"}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Masa Aktif</td>
                                    <td className="px-4 py-3 text-slate-700">{plan?.valid_days ? `${plan.valid_days} hari` : "Tanpa batas waktu"}</td>
                                </tr>
                                <tr>
                                    <td className="bg-slate-50 px-4 py-3 font-medium text-slate-700">Rule Class yang Diizinkan</td>
                                    <td className="px-4 py-3 text-slate-700">{plan?.classes?.map((item) => item.name).join(", ") || "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {selectedGateway?.value === "qris" && (
                        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-800">Scan QRIS berikut:</p>
                            {paymentInstructions?.qris_image && (
                                <img
                                    src={imageUrl("payment-settings", paymentInstructions.qris_image)}
                                    alt="QRIS"
                                    className="mt-3 h-60 w-60 rounded-xl object-cover"
                                />
                            )}
                            <p className="mt-3 text-sm text-slate-700">
                                Nama Merchant: <span className="font-semibold">{paymentInstructions?.qris_full_name || "-"}</span>
                            </p>
                            <p className="mt-3 text-sm text-slate-700">
                                *Pastikan QRIS sesuai dengan yang tertera pada Nama Merchant
                            </p>
                        </div>
                    )}

                    {selectedGateway?.value === "bank_transfer" && (
                        <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                            <p><span className="font-semibold">Nama Bank:</span> {paymentInstructions?.bank_name || "-"}</p>
                            <p><span className="font-semibold">Nama Pemilik Rekening:</span> {paymentInstructions?.bank_account_name || "-"}</p>
                            <p><span className="font-semibold">Nomor Rekening:</span> {paymentInstructions?.bank_account_number || "-"}</p>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {membership?.payment_proof_image && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            Bukti pembayaran sudah diupload. Menunggu konfirmasi admin.
                        </div>
                    )}

                    {secondsLeft === 0 && !membership?.payment_proof_image && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Waktu pembayaran habis. Silakan ulangi proses pembayaran membership.
                        </div>
                    )}

                    {errors.payment_proof && (
                        <p className="mt-4 text-sm text-red-500">{errors.payment_proof}</p>
                    )}

                    {membership?.payment_proof_image ? (
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href={imageUrl("membership-payment-proofs", membership.payment_proof_image)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex rounded-full border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                                Lihat Foto Bukti Pembayaran
                            </a>
                            <Link
                                href={route("user.my-memberships")}
                                className="inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                                Lihat Membership Saya
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={uploadPaymentProof} className="mt-6 space-y-3">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={(event) =>
                                    setData(
                                        "payment_proof",
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                            />
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={processing || secondsLeft === 0}
                                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    Upload Foto Bukti Pembayaran
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelTransaction}
                                    className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700"
                                >
                                    Batalkan Transaksi
                                </button>
                                <button
                                        type="button"
                                        onClick={() => router.visit(route("user.my-memberships"))}
                                        className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                                > 
                                Kembali
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
