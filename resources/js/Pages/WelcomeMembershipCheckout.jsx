import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    TicketIcon,
    ArrowLeftIcon,
    XMarkIcon,
    EyeIcon
} from "@heroicons/react/24/outline";

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
    const [preview, setPreview] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!membership?.expired_at) return 0;
        const diff = Math.floor((new Date(membership.expired_at).getTime() - Date.now()) / 1000);
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
            const diff = Math.floor((new Date(membership.expired_at).getTime() - Date.now()) / 1000);
            setSecondsLeft(Math.max(diff, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [membership?.expired_at]);

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("payment_proof", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadPaymentProof = (event) => {
        event.preventDefault();
        post(route("welcome.membership-checkout.upload-proof", membership.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const cancelTransaction = () => {
        if (confirm("Apakah Anda yakin ingin membatalkan transaksi paket membership ini?")) {
            router.delete(route("welcome.membership-checkout.cancel-transaction", membership.id));
        }
    };

    return (
        <>
            <Head title="Selesaikan Transaksi Membership" />
            <div className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#2D2D2D] font-sans">
                <div className="mx-auto max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F1E9DA]">
                    
                    {/* Header Premium */}
                    <div className="bg-[#FAF7F0] p-8 text-center border-b border-[#F1E9DA]">
                        {/* <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8475] bg-white px-3 py-1 rounded-full border border-[#EBE3D5]">
                            Checkout Paket Membership
                        </span> */}
                        <h1 className="mt-3 text-2xl font-serif font-bold text-[#4A4439]">Selesaikan Pembayaran</h1>
                        <p className="mt-1.5 text-xs text-slate-500 font-mono">Invoice: {membership?.invoice}</p>
                    </div>

                    <div className="p-8">
                        {/* Summary Block */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="rounded-2xl bg-[#F9F9F9] p-4 border border-slate-100">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Pembayaran</p>
                                <p className="text-xl font-bold text-[#4A4439]">{formatRupiah(plan?.price)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F9F9F9] p-4 border border-slate-100">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sisa Waktu</p>
                                <div className="flex items-center gap-1.5 text-amber-600">
                                    <ClockIcon className="h-4 w-4 shrink-0" />
                                    <p className="text-xl font-mono font-bold">{minutes}:{seconds}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rincian Paket - Menggantikan Table Kaku */}
                        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 space-y-3 shadow-sm">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                                <span className="text-sm text-slate-500">Nama Paket</span>
                                <span className="text-sm font-bold text-[#4A4439]">{plan?.name || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                                <span className="text-sm text-slate-500">Jumlah Credits</span>
                                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">{plan?.credits || 0} Credits</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                                <span className="text-sm text-slate-500">Masa Aktif</span>
                                <span className="text-sm text-slate-700 font-medium">{plan?.valid_days ? `${plan.valid_days} Hari` : "Tanpa Batas Waktu"}</span>
                            </div>
                            <div className="pt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Akses Kelas:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {plan?.classes?.map((item, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600 border border-slate-100">
                                            <TicketIcon className="h-3.5 w-3.5 text-slate-400" />
                                            {item.name}
                                        </span>
                                    )) || <span className="text-xs text-slate-400 italic">-</span>}
                                </div>
                            </div>
                        </div>

                        {/* Instruksi Gateway (QRIS / Transfer) */}
                        <div className="mb-8 rounded-2xl bg-[#4A4439] p-6 text-white shadow-md">
                            <div className="mb-3 flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Metode Pembayaran</span>
                                <span className="text-xs font-bold tracking-wide px-2 py-0.5 bg-white/10 rounded-md">{selectedGateway?.label}</span>
                            </div>

                            {selectedGateway?.value === "qris" ? (
                                <div className="flex flex-col items-center pt-2">
                                    <div className="rounded-2xl bg-white p-3 shadow-inner">
                                        {paymentInstructions?.qris_image && (
                                            <img
                                                src={imageUrl("payment-settings", paymentInstructions.qris_image)}
                                                alt="QRIS"
                                                className="h-44 w-44 object-contain"
                                            />
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm font-medium">
                                        Merchant: <span className="text-wellness-beige font-semibold">{paymentInstructions?.qris_full_name || "-"}</span>
                                    </p>
                                    <p className="mt-1 text-[11px] opacity-60 text-center">*Mohon pastikan nama merchant sesuai saat memindai.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 text-sm pt-1">
                                    <div className="flex justify-between">
                                        <span className="opacity-60">Nama Bank</span>
                                        <span className="font-bold">{paymentInstructions?.bank_name || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-60">Nomor Rekening</span>
                                        <span className="font-mono font-bold tracking-wider text-base text-wellness-beige">{paymentInstructions?.bank_account_number || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-60">Atas Nama</span>
                                        <span className="font-bold">{paymentInstructions?.bank_account_name || "-"}</span>
                                    </div>
                                    <p className="pt-2 text-xs text-[#8C8475]">* masukan kode invoice {membership?.invoice} kedalam referensi untuk mempercepat verifikasi</p>
                                </div>
                            )}
                        </div>

                        {/* Alerts & Errors */}
                        {flash?.success && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-100">
                                <CheckCircleIcon className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">{flash.success}</p>
                            </div>
                        )}
                        {secondsLeft === 0 && !membership?.payment_proof_image && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                Waktu pembayaran habis. Silakan ulangi proses pemesanan transaksi kembali.
                            </div>
                        )}
                        {errors.payment_proof && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 font-medium">
                                {errors.payment_proof}
                            </div>
                        )}

                        {/* Dropzone Render Control */}
                        {membership?.payment_proof_image ? (
                            <div className="text-center py-4">
                                <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">Bukti Pembayaran Terkirim</h3>
                                <p className="text-sm text-slate-500 mb-6 mt-1">Admin kami akan segera melakukan verifikasi pembayaran membership Anda.</p>
                                
                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`/storage/${membership.payment_proof_image}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                                    >
                                        <EyeIcon className="h-4 w-4" /> Lihat Foto Bukti Pembayaran
                                    </a>
                                    <Link
                                        href={route("user.my-memberships")}
                                        className="flex w-full items-center justify-center rounded-2xl bg-[#4A4439] py-4 text-sm font-bold text-white transition-all hover:bg-[#3d382f] shadow-md"
                                    >
                                        Buka Membership Saya
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={uploadPaymentProof} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#4A4439] ml-1">Unggah Bukti Transfer Resmi</label>
                                    <div className="relative">
                                        {!preview ? (
                                            <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#F1E9DA] bg-[#FAF7F0]/20 transition-all hover:bg-[#FAF7F0] hover:border-primary-300 group">
                                                <div className="text-center px-4">
                                                    <div className="mx-auto mb-3 w-fit rounded-full bg-white p-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                                        <CloudArrowUpIcon className="h-6 w-6 text-primary-600" />
                                                    </div>
                                                    <p className="text-sm font-bold text-[#4A4439]">Ketuk untuk memilih foto bukti</p>
                                                    <p className="text-xs text-[#8C8475] mt-0.5">Mendukung format PNG, JPG, JPEG, atau WEBP</p>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        ) : (
                                            <div className="relative h-60 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-inner">
                                                <img src={preview} className="h-full w-full object-contain" alt="Preview Bukti" />
                                                <button 
                                                    type="button"
                                                    onClick={() => { setPreview(null); setData("payment_proof", null); }}
                                                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-red-500 shadow-md backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#8C8475]">* Upload Foto Bukti Pembayaran sebelum habis batas waktu untuk menghindari otomatis pembatalan transaksi</p>
                                </div>

                                {/* Form Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing || secondsLeft === 0 || !preview}
                                        className="flex w-full items-center justify-center rounded-2xl bg-[#4A4439] py-4 text-sm font-bold text-white transition-all hover:bg-[#3d382f] disabled:cursor-not-allowed disabled:bg-slate-300 shadow-md"
                                    >
                                        {processing ? "Mengunggah..." : "Konfirmasi Pembayaran"}
                                    </button>
                                    
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route("user.my-memberships"))}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                                        >
                                            <ArrowLeftIcon className="h-4 w-4" /> Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelTransaction}
                                            className="flex flex-1 items-center justify-center rounded-2xl border border-red-100 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                                        >
                                            Batalkan
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}