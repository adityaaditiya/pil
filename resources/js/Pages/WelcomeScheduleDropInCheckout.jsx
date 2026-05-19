import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    CreditCardIcon, 
    ArrowLeftIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeScheduleDropInCheckout({
    schedule,
    booking,
    selectedGateway,
    participants = 1,
    paymentInstructions = {},
    remainingSlots = 0,
}) {
    const { flash } = usePage().props;
    const [preview, setPreview] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!booking?.expired_at) return 0;
        const diff = Math.floor((new Date(booking.expired_at).getTime() - Date.now()) / 1000);
        return Math.max(diff, 0);
    });

    const { setData, post, processing, errors } = useForm({
        payment_proof: null,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (!booking?.expired_at) { setSecondsLeft(0); return; }
            const diff = Math.floor((new Date(booking.expired_at).getTime() - Date.now()) / 1000);
            setSecondsLeft(Math.max(diff, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [booking?.expired_at]);

    const totalPrice = useMemo(
        () => Number(schedule.price_override || 0) * Number(participants || 1),
        [participants, schedule.price_override],
    );

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("payment_proof", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadPaymentProof = (e) => {
        e.preventDefault();
        post(route("welcome.schedule-payment.upload-proof", booking.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Checkout Drop-In" />
            <div className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#2D2D2D] font-sans">
                <div className="mx-auto max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F1E9DA]">
                    
                    {/* Header Section */}
                    <div className="bg-[#FAF7F0] p-8 text-center border-b border-[#F1E9DA]">
                        <h1 className="text-2xl font-serif font-bold text-[#4A4439]">Konfirmasi Pembayaran</h1>
                        <div className="mt-4 flex items-center justify-center gap-2 text-[#8C8475]">
                            <CreditCardIcon className="h-5 w-5" />
                            <span className="text-sm font-medium tracking-wide uppercase">{selectedGateway?.label}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-[#8C8475]">
                        <span className="text-sm font-medium tracking-wide uppercase">{booking?.invoice}</span>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="rounded-2xl bg-[#F9F9F9] p-4 border border-slate-100">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Tagihan</p>
                                <p className="text-lg font-bold text-[#4A4439]">{formatRupiah(totalPrice)}</p>
                            </div>
                            <div className="rounded-2xl bg-[#F9F9F9] p-4 border border-slate-100">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Batas Waktu</p>
                                <div className="flex items-center gap-1.5 text-amber-600">
                                    <ClockIcon className="h-4 w-4" />
                                    <p className="text-lg font-mono font-bold">{minutes}:{seconds}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Instructions Section */}
                        <div className="mb-8 rounded-2xl bg-[#4A4439] p-6 text-white shadow-lg">
                            <h3 className="mb-4 text-sm font-semibold opacity-80 italic">Instruksi Pembayaran</h3>
                            
                            {selectedGateway?.value === "qris" ? (
                                <div className="flex flex-col items-center">
                                    <div className="rounded-xl bg-white p-3 shadow-inner">
                                        {paymentInstructions?.qris_image && (
                                            <img
                                                src={imageUrl("payment-settings", paymentInstructions.qris_image)}
                                                alt="QRIS"
                                                className="h-48 w-48 object-contain"
                                            />
                                        )}
                                    </div>
                                    <p className="mt-4 text-center text-sm font-medium">
                                        Merchant: <span className="text-wellness-beige">{paymentInstructions?.qris_full_name || "-"}</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="opacity-60">Bank</span>
                                        <span className="font-bold">{paymentInstructions?.bank_name || "-"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="opacity-60">No. Rekening</span>
                                        <span className="font-mono font-bold tracking-wider">{paymentInstructions?.bank_account_number || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-60">Atas Nama</span>
                                        <span className="font-bold">{paymentInstructions?.bank_account_name || "-"}</span>
                                    </div>
                                    <p className="pt-2 text-xs text-[#8C8475]">* masukan kode invoice {booking?.invoice} kedalam referensi untuk mempercepat verifikasi</p>
                                </div>
                            )}
                        </div>

                        {/* Status Messages */}
                        {flash?.success && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-100">
                                <CheckCircleIcon className="h-6 w-6 shrink-0" />
                                <p className="text-sm font-medium">{flash.success}</p>
                            </div>
                        )}

                        {/* Main Interaction Area */}
                        {booking?.payment_proof_image ? (
                            <div className="text-center py-6">
                                <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">Bukti Terkirim</h3>
                                <p className="text-slate-500 mb-8 mt-2">Mohon tunggu sebentar, admin sedang memverifikasi pembayaran Anda.</p>
                                <Link
                                    href={route("user.my-schedule")}
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[#4A4439] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#3d382f] shadow-md"
                                >
                                    Lihat Jadwal Saya
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={uploadPaymentProof} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#4A4439] ml-1">Upload Bukti Transfer</label>
                                    <div className="relative">
                                        {!preview ? (
                                            <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#F1E9DA] bg-[#FAF7F0]/30 transition-all hover:bg-[#FAF7F0] hover:border-primary-300 group">
                                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                    <div className="mb-3 rounded-full bg-white p-3 shadow-sm group-hover:scale-110 transition-transform">
                                                        <CloudArrowUpIcon className="h-7 w-7 text-primary-600" />
                                                    </div>
                                                    <p className="mb-1 text-sm font-bold text-[#4A4439]">Ketuk untuk upload</p>
                                                    <p className="text-xs text-[#8C8475]">PNG, JPG atau WEBP (Maks. 2MB)</p>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        ) : (
                                            <div className="relative h-64 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-inner">
                                                <img src={preview} className="h-full w-full object-contain" alt="Preview" />
                                                <button 
                                                    type="button"
                                                    onClick={() => { setPreview(null); setData("payment_proof", null); }}
                                                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-red-500 shadow-lg backdrop-blur-sm transition-hover hover:bg-red-500 hover:text-white"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {errors.payment_proof && <p className="text-xs font-medium text-red-500 ml-1">{errors.payment_proof}</p>}
                                </div>
                                <p className="text-xs text-[#8C8475]">* Upload Foto Bukti Pembayaran sebelum habis batas waktu untuk menghindari pembatalan transaksi</p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing || secondsLeft === 0 || !preview}
                                        className="flex w-full items-center justify-center rounded-2xl bg-[#4A4439] py-4 text-sm font-bold text-white transition-all hover:bg-[#3d382f] disabled:cursor-not-allowed disabled:bg-slate-300 shadow-md active:scale-[0.98]"
                                    >
                                        {processing ? "Mengirim..." : "Konfirmasi & Kirim Bukti"}
                                    </button>
                                    
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route("user.my-schedule"))}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                                        >
                                            <ArrowLeftIcon className="h-4 w-4" /> Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { if(confirm('Batalkan transaksi ini?')) router.delete(route("welcome.schedule-payment.cancel-transaction", booking.id)) }}
                                            className="flex flex-1 items-center justify-center rounded-2xl border border-red-100 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                                        >
                                            Batal Transaksi
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
