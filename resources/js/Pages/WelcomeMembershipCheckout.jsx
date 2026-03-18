import { Head, Link } from "@inertiajs/react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeMembershipCheckout({
    plan,
    selectedGateway,
    paymentInstructions = {},
}) {
    return (
        <>
            <Head title="Selesaikan Transaksi Drop-In" />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white px-4 py-10 text-wellness-text">
                <div className="mx-auto max-w-3xl rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                    <h1 className="text-2xl font-bold text-primary-700">
                        Selesaikan Transaksi Drop-In
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Lanjutkan pembayaran membership <span className="font-semibold">{plan?.name}</span> menggunakan metode <span className="font-semibold">{selectedGateway?.label}</span>.
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

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={route("welcome.membership-detail", plan.id)}
                            className="rounded-full border border-primary-300 px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                        >
                            Kembali ke Detail Membership
                        </Link>
                        <Link
                            href={route("user.my-memberships")}
                            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Lihat Membership Saya
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
