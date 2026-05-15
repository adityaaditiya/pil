import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconFileInvoice, IconPrinter, IconReceipt } from "@tabler/icons-react";
import { getImageUrl } from "@/Utils/imageUrl";

export default function Print({ booking }) {
    const { landingPageSetting = {} } = usePage().props;
    const [printMode, setPrintMode] = useState("invoice");
    
    const studioLogoImage = getImageUrl(landingPageSetting?.studio_logo_image, "landing-page");
    const studioAddress = landingPageSetting?.studio_address || "Jl. Layur No. 08, Tegalsari, Kec. Tegal Barat, Kota Tegal";
    const studioPhone = landingPageSetting?.studio_phone || "08213003567";

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

    const isThermal = printMode === "thermal58" || printMode === "thermal80";

    return (
        <>
            <Head title={`Print ${booking.invoice}`} />
            <div className="min-h-screen bg-slate-50 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl space-y-6">
                    
                    {/* --- NAVIGATION & CONTROLS (Hidden on Print) --- */}
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link 
                            href={route("appointments.history")} 
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <IconArrowLeft size={18} />Kembali
                        </Link>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800 shadow-inner">
                                <button onClick={() => setPrintMode("invoice")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "invoice" ? "bg-white shadow" : "text-slate-500"}`}>Invoice</button>
                                <button onClick={() => setPrintMode("thermal80")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "thermal80" ? "bg-white shadow" : "text-slate-500"}`}>80mm</button>
                                <button onClick={() => setPrintMode("thermal58")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "thermal58" ? "bg-white shadow" : "text-slate-500"}`}>58mm</button>
                            </div>
                            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all">
                                <IconPrinter size={18} /> Cetak
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN DOCUMENT --- */}
                    <div className={`mx-auto bg-white dark:bg-slate-900 ${
                        isThermal ? (printMode === "thermal58" ? "w-[58mm]" : "w-[80mm]") : "max-w-4xl rounded-3xl border border-slate-100 shadow-2xl"
                    }`}>
                        
                        <div className={isThermal ? "p-4" : "p-10 md:p-16"}>
                            
                            {/* HEADER */}
                            <div className={`mb-8 border-b border-dashed border-slate-200 pb-6 text-center ${!isThermal ? 'md:flex md:justify-between md:text-left md:items-start md:border-solid border-slate-100' : ''}`}>
                                <div>
                                    {studioLogoImage && (
                                        <div className={`flex mb-3 ${!isThermal ? 'justify-start' : 'justify-center'}`}>
                                            <img src={studioLogoImage} alt="Logo" className="h-12 w-auto object-contain" />
                                        </div>
                                    )}
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">ORO STUDIO</h2>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-1">{studioAddress}</p>
                                    <p className="text-[10px] text-slate-500">Telp. {studioPhone}</p>
                                </div>
                                
                                {!isThermal && (
                                    <div className="text-right hidden md:block">
                                        <h1 className="text-4xl font-thin tracking-[0.2em] text-slate-200 uppercase mb-2">INVOICE</h1>
                                        <p className="text-sm font-bold text-slate-800 leading-none">#{booking.invoice}</p>
                                    </div>
                                )}
                            </div>

                            {/* DETAILS (Clean Style) */}
                            <div className={`space-y-3 ${isThermal ? 'text-[11px]' : 'text-sm'}`}>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Pelanggan</span>
                                    <span className="font-bold text-slate-900 text-right">{booking.customer?.name || "-"}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Tgl Booking</span>
                                    <span className="text-slate-700 text-right">{formatDateTime(booking.booked_at || booking.created_at)}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Pembayaran</span>
                                    <span className="text-slate-700 text-right uppercase font-semibold">{booking.payment_method || "-"}</span>
                                </div>
                                
                                <div className="pt-2 border-t border-slate-50 mt-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Kelas & Sesi</span>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 uppercase leading-tight">{booking.appointment?.pilates_class?.name || "-"}</p>
                                            <p className="text-[10px] text-slate-500 italic mt-0.5">{booking.session_name || "Private Session"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Trainer</span>
                                    <span className="text-slate-700 text-right">{booking.trainer?.name || "-"}</span>
                                </div>

                                {/* Jadwal Sesi */}
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Jadwal Sesi</span>
                                    <span className="text-slate-700 text-right">{formatDateTime(booking.appointment?.start_at || booking.timetable?.start_at)}</span>
                                </div>

                                {/* Durasi */}
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-400 shrink-0 uppercase tracking-tighter font-medium">Durasi</span>
                                    <span className="text-slate-700 text-right">
                                        {booking.appointment?.duration_minutes || booking.timetable?.duration_minutes || 0} menit
                                    </span>
                                </div>
                            </div>

                            {/* TOTAL SECTION */}
                            <div className={`mt-8 pt-4 border-t ${isThermal ? 'border-dashed border-slate-300' : 'border-slate-900 border-t-2'}`}>
                                <div className={`flex justify-between items-center ${!isThermal ? 'bg-slate-50 p-6 rounded-2xl' : ''}`}>
                                    <span className={`font-bold text-slate-900 tracking-widest ${isThermal ? 'text-[11px]' : 'text-sm'}`}>TOTAL PEMBAYARAN
                                        {printMode === 'invoice' && <p className="text-[10px] text-slate-400 italic font-normal">Harga sudah termasuk pajak studio</p>}
                                    </span>
                                    <span className={`font-black text-slate-900 ${isThermal ? 'text-sm' : 'text-3xl'}`}>
                                        {formatCurrency(booking.price_amount || 0)}
                                    </span>
                                </div>
                                {isThermal && (
                                    <div className="mt-4 text-center">
                                        <p className="text-[10px] text-slate-400 italic">Terima kasih atas kunjungan Anda</p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER - INVOICE ONLY */}
                            {!isThermal && (
                                <div className="mt-16 text-center border-t border-slate-100 pt-10">
                                     <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-200">ORO WELLNESS & MOVEMENT</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* CSS KHUSUS PRINT UNTUK THERMAL AGAR FULL HALAMAN KOSONG MENGIKUTI KERTAS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                    .print\\:hidden { display: none !important; }
                    ${isThermal ? `
                        .mx-auto { width: 100% !important; max-width: none !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
                        body { width: ${printMode === "thermal58" ? "58mm" : "80mm"}; }
                    ` : ""}
                }
            `}} />
        </>
    );
}