import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconFileInvoice, IconPrinter, IconReceipt, IconCheck } from "@tabler/icons-react";
import { getImageUrl } from "@/Utils/imageUrl";

export default function Print({ booking }) {
    const { landingPageSetting = {} } = usePage().props;
    const [printMode, setPrintMode] = useState("invoice");
    
    const studioLogoImage = getImageUrl(landingPageSetting?.studio_logo_image, "landing-page");
    const studioAddress = landingPageSetting?.studio_address || "Jl. Layur No. 08, Tegalsari, Kec. Tegal Barat, Kota Tegal";
    const studioPhone = landingPageSetting?.studio_phone || "08123456789";

    const formatDateTime = (value) =>
        value
            ? new Date(value).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "-";

    const formatCurrency = (value = 0) =>
        Number(value || 0).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        });

    const handlePrint = () => window.print();

    return (
        <>
            <Head title={`Print ${booking.invoice}`} />
            <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl space-y-6">
                    
                    {/* --- NAVIGATION & CONTROLS (Hidden on Print) --- */}
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link 
                            href={route("appointments.history")} 
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <IconArrowLeft size={18} />Kembali ke Riwayat
                        </Link>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800 shadow-inner">
                                <button 
                                    onClick={() => setPrintMode("invoice")} 
                                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${printMode === "invoice" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <IconFileInvoice size={16} className="mr-1 inline" /> Invoice
                                </button>
                                <button 
                                    onClick={() => setPrintMode("thermal80")} 
                                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${printMode === "thermal80" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" /> 80mm
                                </button>
                                <button 
                                    onClick={() => setPrintMode("thermal58")} 
                                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${printMode === "thermal58" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" /> 58mm
                                </button>
                            </div>
                            <button 
                                onClick={handlePrint} 
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
                            >
                                <IconPrinter size={18} /> Cetak
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN DOCUMENT CARD --- */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                        
                        <div className={
                            printMode === "thermal58" ? "mx-auto w-[58mm] p-2" : 
                            printMode === "thermal80" ? "mx-auto w-[80mm] p-3" : 
                            "p-10 md:p-16" // Padding Premium untuk mode Invoice
                        }>
                            
                            {/* HEADER SECTION */}
                            <div className={`mb-10 border-b border-dashed border-slate-300 pb-8 ${printMode === 'invoice' ? 'flex flex-col md:flex-row justify-between items-start text-left border-solid border-slate-100' : 'text-center'}`}>
                                <div>
                                    {studioLogoImage && (
                                        <div className={`flex items-center ${printMode === 'invoice' ? 'justify-start' : 'justify-center'} mb-4`}>
                                            <img src={studioLogoImage} alt="Logo" className="h-14 w-auto object-contain" />
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">ORO Studio</h2>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{studioAddress}</p>
                                    <p className="text-xs text-slate-500 font-medium">Telp: {studioPhone}</p>
                                </div>

                                {printMode === 'invoice' && (
                                    <div className="text-right mt-8 md:mt-0">
                                        <h1 className="text-4xl font-extralight tracking-[0.3em] text-slate-200 uppercase leading-none mb-2">Invoice</h1>
                                        <p className="text-sm font-bold text-slate-900">NO. {booking.invoice}</p>
                                        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
                                            <IconCheck size={12} /> {booking.status || "Paid"}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CONTENT / DETAIL SECTION */}
                            <div className={printMode === 'invoice' ? 'grid md:grid-cols-2 gap-x-16 gap-y-10 mb-12' : 'space-y-1 text-sm'}>
                                
                                {/* Info Group 1 */}
                                <div className="space-y-2">
                                    {printMode === 'invoice' && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2">Detail Pelanggan</h3>}
                                    <div className={printMode === 'invoice' ? 'pt-2' : ''}>
                                        <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Pelanggan:</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{booking.customer?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Tanggal Booking:</p>
                                        <p className="font-medium text-slate-700">{formatDateTime(booking.booked_at || booking.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Pembayaran:</p>
                                        <p className="font-medium text-slate-700">{booking.payment_method || "-"}</p>
                                    </div>
                                </div>

                                {/* Info Group 2 */}
                                <div className="space-y-4">
                                    {printMode === 'invoice' && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2">Detail Sesi</h3>}
                                    <div className={printMode === 'invoice' ? 'pt-2' : ''}>
                                        <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Kelas & Sesi:</p>
                                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{booking.appointment?.pilates_class?.name || "-"} ({booking.session_name || "-"})</p>
                                    </div>
                                    <div>
                                        <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Trainer:</p>
                                        <p className="font-medium text-slate-700">{booking.trainer?.name || "-"}</p>
                                    </div>
                                    <div className="flex gap-10">
                                        <div>
                                            <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Jadwal Sesi:</p>
                                            <p className="font-medium text-slate-700">{formatDateTime(booking.appointment?.start_at)}</p>
                                        </div>
                                        <div>
                                            <p className={printMode === 'invoice' ? "text-[10px] text-slate-400 uppercase font-bold mb-1" : "text-slate-500"}>Durasi:</p>
                                            <p className="font-medium text-slate-700">{booking.appointment?.duration_minutes || 0} menit</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PRICE SUMMARY SECTION */}
                            <div className={`mt-4 pt-8 ${printMode === 'invoice' ? 'border-t-2 border-slate-900' : 'border-t border-dashed border-slate-300'}`}>
                                <div className={`flex items-center justify-between ${printMode === 'invoice' ? 'bg-slate-50 p-8 rounded-2xl dark:bg-slate-800' : 'text-sm font-semibold'}`}>
                                    <div className={printMode === 'invoice' ? 'space-y-1' : ''}>
                                        <p className={printMode === 'invoice' ? 'text-sm font-bold uppercase tracking-widest text-slate-500' : ''}>Total Pembayaran</p>
                                        {printMode === 'invoice' && <p className="text-[10px] text-slate-400 italic font-normal">Harga sudah termasuk pajak studio</p>}
                                    </div>
                                    <span className={printMode === 'invoice' ? 'text-4xl font-black text-slate-900 dark:text-white tracking-tighter' : ''}>
                                        {formatCurrency(booking.price_amount || 0)}
                                    </span>
                                </div>
                            </div>

                            {/* FOOTER - INVOICE ONLY */}
                            {printMode === 'invoice' && (
                                <div className="mt-24 text-center border-t border-slate-100 pt-10">
                                    <p className="text-sm italic text-slate-400 mb-6">"Investasi terbaik adalah kesehatan tubuh dan pikiran."</p>
                                    <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">
                                        <span>Mindfulness</span>
                                        <span>Movement</span>
                                        <span>Wellness</span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}