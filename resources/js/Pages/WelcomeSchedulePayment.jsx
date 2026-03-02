import { Head, Link } from "@inertiajs/react";
import { IconArrowLeft, IconCheck, IconCreditCard, IconWallet } from "@tabler/icons-react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function WelcomeSchedulePayment({ schedule, paymentGateways = [] }) {
    const availableMethods = [
        {
            key: "credit",
            title: "Credit Membership",
            description: "Gunakan saldo credit membership aktif Anda untuk menyelesaikan booking kelas ini.",
            hint: `${Number(schedule.credit_override || 0)} credit / sesi`,
            icon: IconWallet,
        },
        ...(schedule.allow_drop_in
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
                                <p className="mt-2 text-wellness-muted">{schedule.pilates_class?.name} bersama {schedule.trainer?.name || "trainer"}.</p>

                                <div className="mt-6 grid gap-3">
                                    {availableMethods.map((method) => {
                                        const Icon = method.icon;

                                        return (
                                            <div key={method.key} className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                                                <p className="inline-flex items-center gap-2 text-lg font-semibold text-primary-700"><Icon size={18} /> {method.title}</p>
                                                <p className="mt-1 text-sm text-wellness-muted">{method.description}</p>
                                                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary-700"><IconCheck size={16} /> {method.hint}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-wellness-muted">
                                    <p className="font-semibold text-slate-800">Metode payment gateway aktif untuk Drop-In:</p>
                                    <p className="mt-1">{paymentGateways.length > 0 ? paymentGateways.map((item) => item.label).join(", ") : "Belum ada gateway aktif."}</p>
                                </div>

                                <Link
                                    href={route("bookings.create", { timetable_id: schedule.id })}
                                    className="mt-6 inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
