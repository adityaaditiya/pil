import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconClock,
    IconCreditCard,
    IconMapPin,
    IconStar,
    IconUser,
    IconUsers,
    IconYoga,
} from "@tabler/icons-react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);
const menuHref = (key) => (key === "home" ? route("welcome") : route("welcome.page", key));

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDateTime = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date))
        : "-";

export default function WelcomeScheduleDetail({ schedule, menuItems = [] }) {
    const { auth } = usePage().props;
    const paymentLabel = schedule.allow_drop_in ? "Credit atau Drop-In" : "Credit";

    const scheduleRows = [
        { label: "ID Schedule", value: schedule.id },
        { label: "Nama Kelas", value: schedule.pilates_class?.name || "-" },
        { label: "Kategori", value: schedule.pilates_class?.class_category?.name || "-" },
        { label: "Trainer", value: schedule.trainer?.name || "-" },
        { label: "Jadwal", value: `${formatDateTime(schedule.start_at)} WIB` },
        { label: "Durasi", value: `${schedule.duration_minutes || 0} menit` },
        { label: "Kapasitas", value: `${schedule.capacity || 0} peserta` },
        { label: "Status", value: schedule.status || "-" },
        { label: "Metode Pembayaran", value: paymentLabel },
        { label: "Harga Drop-In", value: formatRupiah(schedule.price_override) },
        { label: "Kredit per Sesi", value: Number(schedule.credit_override || 0) },
    ];

    return (
        <>
            <Head title={`${schedule.pilates_class?.name || "Schedule"} | Detail Schedule`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                        <Link href={route("welcome")} className="flex items-center gap-2 font-semibold text-primary-700">
                            <IconYoga size={20} /> ORO Pilates Studio
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-wellness-muted">
                            {[{ name: "Home", key: "home" }, ...menuItems.filter((item) => item.key !== "home")].map((item) => (
                                <Link key={item.key} href={menuHref(item.key)} className="px-2 py-1 hover:text-primary-600">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <Link href={route("welcome.page", "schedule")} className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Daftar Schedule
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                        <article className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                            {schedule.pilates_class?.image ? (
                                <img src={imageUrl("classes", schedule.pilates_class.image)} alt={schedule.pilates_class?.name} className="h-72 w-full object-cover md:h-96" />
                            ) : (
                                <div className="flex h-72 items-center justify-center bg-primary-50 text-primary-700 md:h-96">Gambar kelas belum tersedia.</div>
                            )}
                            <div className="space-y-4 p-6 md:p-8">
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                    <IconStar size={14} /> {schedule.pilates_class?.difficulty_level || "Open to all"}
                                </p>
                                <h1 className="text-3xl font-bold md:text-4xl">{schedule.pilates_class?.name || "Detail Schedule"}</h1>
                                <p className="text-wellness-muted">{schedule.pilates_class?.about || "Pilih jadwal terbaik dan lanjutkan ke proses pembayaran booking Anda."}</p>
                                <div className="grid gap-3 text-sm text-wellness-muted sm:grid-cols-2">
                                    <p className="inline-flex items-center gap-2"><IconCalendarEvent size={16} /> {formatDateTime(schedule.start_at)} WIB</p>
                                    <p className="inline-flex items-center gap-2"><IconClock size={16} /> Durasi {schedule.duration_minutes} menit</p>
                                    <p className="inline-flex items-center gap-2"><IconUsers size={16} /> Kapasitas {schedule.capacity} peserta</p>
                                    <p className="inline-flex items-center gap-2"><IconCreditCard size={16} /> {paymentLabel}</p>
                                </div>
                                <Link
                                    href={auth?.user ? route("welcome.schedule-payment", schedule.id) : route("login")}
                                    className="inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </article>

                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Data Detail Schedule</h2>
                                <p className="mt-1 text-sm text-wellness-muted">Semua data schedule ditampilkan dalam tabel berikut.</p>
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {scheduleRows.map((row) => (
                                                <tr key={row.label} className="border-b border-slate-100 last:border-none">
                                                    <td className="w-44 bg-slate-50 px-4 py-3 font-medium text-slate-700">{row.label}</td>
                                                    <td className="px-4 py-3 text-slate-700">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Data Trainer</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                    <p className="inline-flex items-center gap-2 font-semibold"><IconUser size={16} /> {schedule.trainer?.name || "-"}</p>
                                    <p className="mt-2 text-sm text-wellness-muted">{schedule.trainer?.gender || "-"}, {schedule.trainer?.age || "-"} tahun</p>
                                    <p className="mt-1 inline-flex items-start gap-2 text-sm text-wellness-muted"><IconMapPin size={14} className="mt-0.5" /> {schedule.trainer?.address || "-"}</p>
                                    <p className="mt-2 text-sm text-wellness-muted">{schedule.trainer?.biodata || "Biodata trainer belum diisi."}</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}
