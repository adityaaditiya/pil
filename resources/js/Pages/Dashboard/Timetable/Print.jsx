import React, { useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconFileInvoice, IconPrinter, IconReceipt, IconCheck } from "@tabler/icons-react";
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
                  month: "short",
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

    // Helper untuk styling dinamis berdasarkan mode
    const isThermal = printMode === "thermal58" || printMode === "thermal80";

    return (
        <>
            <Head title={`Print ${booking.invoice}`} />

            <div className="min-h-screen bg-slate-50 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl space-y-6">
                    
                    {/* --- KONTROL NAVIGASI (Hidden on Print) --- */}
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link
                            href={route("bookings.history")}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <IconArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            Kembali
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex rounded-xl bg-slate-200/50 p-1 dark:bg-slate-800 shadow-inner">
                                <button onClick={() => setPrintMode("invoice")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "invoice" ? "bg-white shadow-sm" : "text-slate-500"}`}>Invoice</button>
                                <button onClick={() => setPrintMode("thermal80")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "thermal80" ? "bg-white shadow-sm" : "text-slate-500"}`}>80mm</button>
                                <button onClick={() => setPrintMode("thermal58")} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${printMode === "thermal58" ? "bg-white shadow-sm" : "text-slate-500"}`}>58mm</button>
                            </div>
                            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all">
                                <IconPrinter size={18} /> Cetak
                            </button>
                        </div>
                    </div>

                    {/* --- KERTAS NOTA --- */}
                    <div className={`mx-auto bg-white dark:bg-slate-900 ${
                        printMode === "thermal58" ? "w-[58mm]" : 
                        printMode === "thermal80" ? "w-[80mm]" : 
                        "w-full rounded-3xl border border-slate-100 shadow-2xl"
                    }`}>
                        
                        <div className={isThermal ? "p-4" : "p-12 md:p-16"}>
                            
                            {/* HEADER */}
                            <div className={`mb-6 border-b border-dashed border-slate-200 pb-6 text-center ${printMode === 'invoice' ? 'md:flex md:justify-between md:text-left md:items-start md:border-solid' : ''}`}>
                                <div>
                                    {studioLogoImage && (
                                        <div className={`flex mb-3 ${printMode === 'invoice' ? 'justify-start' : 'justify-center'}`}>
                                            <img src={studioLogoImage} alt="Logo" className="h-12 w-auto object-contain" />
                                        </div>
                                    )}
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">ORO STUDIO</h2>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-1">{studioAddress}</p>
                                    <p className="text-[10px] text-slate-500">Telp. {studioPhone}</p>
                                </div>
                                
                                {printMode === 'invoice' && (
                                    <div className="text-right hidden md:block">
                                        <h1 className="text-3xl font-light tracking-[0.2em] text-slate-300 uppercase mb-1">INVOICE</h1>
                                        <p className="text-xs font-bold text-slate-800">#{booking.invoice}</p>
                                    </div>
                                )}
                            </div>

                            {/* DETAIL TRANSAKSI (Gaya Foto 2: Bersih & Minimalis) */}
                            <div className={`space-y-3 ${isThermal ? 'text-[11px]' : 'text-sm'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Pelanggan:</span>
                                    <span className="font-bold text-slate-900 text-right">{booking.user?.name || "-"}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Tanggal Booking:</span>
                                    <span className="text-slate-700 text-right">{formatDateTime(booking.booked_at)}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Pembayaran:</span>
                                    <span className="text-slate-700 text-right uppercase">{booking.payment_method || "-"}</span>
                                </div>
                                <div className="flex justify-between items-start pt-2 border-t border-slate-50">
                                    <span className="text-slate-400">Kelas & Sesi:</span>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 uppercase tracking-tighter">{booking.timetable?.pilates_class?.name || "-"}</p>
                                        <p className="text-[10px] text-slate-500 italic">{booking.session_name || ""}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Trainer:</span>
                                    <span className="text-slate-700 text-right">{booking.timetable?.trainer?.name || "-"}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Jadwal Sesi:</span>
                                    <span className="text-slate-700 text-right">{formatDateTime(booking.timetable?.start_at)}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400">Durasi:</span>
                                    <span className="text-slate-700 text-right">{booking.timetable?.duration_minutes || 60} menit</span>
                                </div>
                            </div>

                            {/* TOTAL PEMBAYARAN */}
                            <div className={`mt-6 pt-6 border-t ${isThermal ? 'border-dashed border-slate-300' : 'border-solid border-slate-900'}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`font-bold text-slate-900 ${isThermal ? 'text-[11px]' : 'text-base'}`}>TOTAL PEMBAYARAN
                                        {printMode === 'invoice' && <p className="text-[10px] text-slate-400 italic font-normal">Harga sudah termasuk pajak studio</p>}
                                    </span>
                                    
                                    <span className={`font-black text-slate-900 ${isThermal ? 'text-sm' : 'text-2xl'}`}>
                                        {formatCurrency(booking.price_amount || 0)}
                                    </span>
                                </div>
                                {isThermal && (
                                    <div className="mt-4 text-center">
                                        <p className="text-[10px] text-slate-400 italic">Terima kasih atas kunjungan Anda</p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER KHUSUS INVOICE */}
                            {printMode === 'invoice' && (
                                <div className="mt-16 text-center border-t border-slate-50 pt-8">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-200">ORO WELLNESS & MOVEMENT</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* CSS KHUSUS PRINT UNTUK THERMAL */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                    .print\\:hidden { display: none !important; }
                    ${printMode === "thermal58" ? `
                        body { width: 58mm; }
                        .mx-auto { width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
                    ` : printMode === "thermal80" ? `
                        body { width: 80mm; }
                        .mx-auto { width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
                    ` : ""}
                }
            `}} />
        </>
    );
}