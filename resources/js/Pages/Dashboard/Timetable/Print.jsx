import React, { useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconFileInvoice, IconPrinter, IconReceipt } from "@tabler/icons-react";
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

    const durationMinutes = useMemo(() => {
        return Number(
            booking?.timetable?.duration_minutes || booking?.timetable?.pilates_class?.duration || 0
        );
    }, [booking]);

    const endSchedule = useMemo(() => {
        const start = booking?.timetable?.start_at;
        if (!start || !durationMinutes) return null;
        const date = new Date(start);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return date.toISOString();
    }, [booking, durationMinutes]);

    const handlePrint = () => window.print();

    return (
        <>
            <Head title="Print Booking" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link
                            href={route("bookings.history")}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <IconArrowLeft size={18} />
                            Kembali ke Riwayat Booking
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
                                <button
                                    onClick={() => setPrintMode("invoice")}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === "invoice"
                                            ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <IconFileInvoice size={16} className="mr-1 inline" />
                                    Invoice
                                </button>
                                <button
                                    onClick={() => setPrintMode("thermal80")}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === "thermal80"
                                            ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" />
                                    Struk 80mm
                                </button>
                                <button
                                    onClick={() => setPrintMode("thermal58")}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === "thermal58"
                                            ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" />
                                    Struk 58mm
                                </button>
                            </div>

                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                            >
                                <IconPrinter size={18} />
                                Cetak
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow dark:border-slate-800 dark:bg-slate-900">
                        <div
                            className={
                                printMode === "thermal58"
                                    ? "mx-auto w-[58mm] p-2"
                                    : printMode === "thermal80"
                                    ? "mx-auto w-[80mm] p-3"
                                    : "p-6"
                            }
                        >
                            <div className="mb-4 border-b border-dashed border-slate-300 pb-3 text-center">
                                {studioLogoImage && (
                                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center">
                                        <img src={studioLogoImage} alt="Logo Studio" className="max-h-14 max-w-14 object-contain" />
                                    </div>
                                )}
                                <p className="text-sm font-semibold">ORO Wellness & Movement</p>
                                <p className="text-xs text-slate-500">{studioAddress}</p>
                                <p className="text-xs text-slate-500">Telp: {studioPhone}</p>
                                <p className="text-xs text-slate-500">Booking {printMode === "invoice" ? "Invoice" : "Receipt"}</p>
                            </div>

                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-500">Invoice:</span> {booking.invoice}
                                </p>
                                <p>
                                    <span className="text-slate-500">Tanggal Booking:</span> {formatDateTime(booking.booked_at)}
                                </p>
                                <p>
                                    <span className="text-slate-500">Pelanggan:</span> {booking.user?.name || "-"}
                                </p>
                                <p>
                                    <span className="text-slate-500">Kelas:</span> {booking.timetable?.pilates_class?.name || "-"}
                                </p>
                                <p>
                                    <span className="text-slate-500">Trainer:</span> {booking.timetable?.trainer?.name || "-"}
                                </p>
                                {/* <p>
                                    <span className="text-slate-500">Jadwal:</span> {formatDateTime(booking.timetable?.start_at)} - {formatDateTime(endSchedule)}
                                </p> */}
                                <p>
                                    <span className="text-slate-500">Jadwal:</span> {formatDateTime(booking.timetable?.start_at)}
                                </p>
                                <p>
                                    <span className="text-slate-500">Peserta:</span> {booking.participants || 0}
                                </p>
                                {/* <p>
                                    <span className="text-slate-500">Pembayaran:</span> {booking.payment_type || "-"} / {booking.payment_method || "-"}
                                </p> */}
                                <p>
                                    <span className="text-slate-500">Pembayaran:</span> {booking.payment_method || "-"}
                                </p>
                                <p>
                                    <span className="text-slate-500">Status:</span> {booking.status || "-"}
                                </p>
                            </div>

                            <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-sm font-semibold">
                                Total: {formatCurrency(booking.price_amount || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
