import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconChevronDown,
    IconClock,
    IconCreditCard,
    IconMapPin,
    IconMenu2,
    IconStar,
    IconTagStarred,
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const paymentLabel = schedule.allow_drop_in ? "Credit atau Drop-In" : "Credit";

    const navigationItems = menuItems.length
        ? [{ name: "Home", key: "home" }, ...menuItems.filter((item) => item.key !== "home")]
        : [
              { name: "Home", key: "home" },
              { name: "About", key: "about" },
              { name: "Classes", key: "classes" },
              { name: "Schedule", key: "schedule" },
              { name: "Pricing", key: "pricing" },
              { name: "Trainer", key: "trainer" },
              { name: "Testimonials", key: "testimonials" },
              { name: "Contact", key: "contact" },
          ];

    const userMenuItems = [
        { name: "My profile", href: route("profile.edit") },
        { name: "My schedule", href: route("welcome.page", "schedule") },
        { name: "My memberships", href: route("memberships.my") },
    ];

    const scheduleRows = [
        // { label: "ID Schedule", value: schedule.id },
        { label: "Class Name", value: schedule.pilates_class?.name || "-" },
        { label: "Category", value: schedule.pilates_class?.class_category?.name || "-" },
        // { label: "Trainer", value: schedule.trainer?.name || "-" },
        { label: "Date & Time", value: `${formatDateTime(schedule.start_at)} WIB` },
        { label: "Duration", value: `${schedule.pilates_class?.duration || schedule.duration_minutes || 0} menit` },
        { label: "Equipment", value: schedule.pilates_class?.equipment || "-" },
        { label: "Capacity", value: `${schedule.capacity || 0} peserta` },
        // { label: "Status", value: schedule.status || "-" },
        // { label: "Metode Pembayaran", value: paymentLabel },
        // { label: "Harga Drop-In", value: formatRupiah(schedule.price_override) },
        // { label: "Kredit per Sesi", value: `${Number(schedule.credit_override || 0)} Credit`},
    ];

    return (
        <>
            <Head title={`${schedule.pilates_class?.name || "Schedule"} | Detail Schedule`} />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                        <Link href={route("welcome")} className="flex items-center gap-2 font-semibold text-primary-700">
                            <IconYoga size={20} /> ORO Pilates Studio
                        </Link>

                        <div className="hidden md:flex flex-wrap items-center gap-3 text-sm text-wellness-muted">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={menuHref(item.key)}
                                    className={
                                        item.key === "schedule"
                                            ? "rounded-full bg-primary-100 px-3 py-1.5 font-medium text-primary-700"
                                            : "px-2 py-1 hover:text-primary-600"
                                    }
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {auth?.user ? (
                                <div className="relative hidden md:flex">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                        className="flex items-center gap-2 rounded-full border border-primary-100 bg-white px-2 py-1"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold uppercase text-white">
                                            {(auth.user.name || "U").charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{auth.user.name}</span>
                                        <IconChevronDown size={16} className="text-slate-500" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-primary-100 bg-white p-2 shadow-lg">
                                            {userMenuItems.map((item) => (
                                                <Link key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50">
                                                    {item.name}
                                                </Link>
                                            ))}
                                            <Link href={route("logout")} method="post" as="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">
                                                Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href={route("login")} className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
                                    Login / Register
                                </Link>
                            )}
                        </div>

                        <button
                            className="rounded-xl border border-primary-200 p-2.5 text-wellness-text md:hidden"
                            type="button"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            aria-label="Toggle mobile menu"
                        >
                            <IconMenu2 size={20} />
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="border-t border-primary-100 bg-white/90 px-4 py-4 md:hidden">
                            <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-wellness-muted">
                                {auth?.user ? (
                                    <div className="rounded-2xl border border-primary-100 bg-white p-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                            className="flex w-full items-center gap-2 rounded-xl px-1 py-1"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold uppercase text-white">
                                                {(auth.user.name || "U").charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{auth.user.name}</span>
                                            <IconChevronDown size={16} className="ml-auto text-slate-500" />
                                        </button>

                                        {isUserMenuOpen && (
                                            <div className="mt-2 space-y-1">
                                                {userMenuItems.map((item) => (
                                                    <Link key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50">
                                                        {item.name}
                                                    </Link>
                                                ))}
                                                <Link href={route("logout")} method="post" as="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">
                                                    Logout
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link href={route("login")} className="rounded-full bg-primary-600 px-4 py-2 text-center font-medium text-white hover:bg-primary-700">
                                        Login / Register
                                    </Link>
                                )}

                                <div className="flex flex-col gap-2">
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.key}
                                            href={menuHref(item.key)}
                                            className={
                                                item.key === "schedule"
                                                    ? "rounded-full bg-primary-100 px-3 py-1.5 font-medium text-primary-700"
                                                    : "px-2 py-1 hover:text-primary-600"
                                            }
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <br />
                    <Link href={route("welcome.page", "schedule")} className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Schedule
                    </Link>
                    <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
                        
                        {/* ================= LEFT SIDE (DETAIL DATA) ================= */}
                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Book this class</h2>
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {scheduleRows.map((row) => (
                                                <tr key={row.label} className="border-b border-slate-100 last:border-none">
                                                    <td className="w-44 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                                                        {row.label}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {row.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Instructor</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                    <p className="inline-flex items-center gap-2 font-semibold">
                                        <IconUser size={16} /> {schedule.trainer?.name || "-"}
                                    </p> <br />
                                    {/* <p className="mt-2 text-sm text-wellness-muted">
                                        {schedule.trainer?.gender || "-"}, {schedule.trainer?.age || "-"} tahun
                                    </p> */}
                                    <p className="mt-1 inline-flex items-start gap-2 text-sm text-wellness-muted">
                                        <IconMapPin size={14} className="mt-0.5" />
                                        {schedule.trainer?.address || "-"}
                                    </p>
                                    <p className="mt-2 text-sm text-wellness-muted">
                                        {schedule.trainer?.biodata || "Biodata trainer belum diisi."}
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* ================= RIGHT SIDE (IMAGE CARD) ================= */}
                        <article className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                            {schedule.pilates_class?.image ? (
                                <img
                                    src={imageUrl("classes", schedule.pilates_class.image)}
                                    alt={schedule.pilates_class?.name}
                                    className="h-72 w-full object-cover md:h-96"
                                />
                            ) : (
                                <div className="flex h-72 items-center justify-center bg-primary-50 text-primary-700 md:h-96">
                                    Gambar kelas belum tersedia.
                                </div>
                            )}

                            <div className="space-y-4 p-6 md:p-8">
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                    <IconStar size={14} />
                                    {schedule.pilates_class?.difficulty_level || "Open to all"}
                                </p> &nbsp;
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"> 
                                    <IconYoga size={14} /> {schedule.pilates_class?.class_category?.name || "-"}
                                </p> &nbsp;
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        <IconClock size={16} />
                                        Durasi {schedule.duration_minutes} menit
                                    </p>
                                &nbsp;
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        <IconUser size={16} />
                                        {schedule.capacity}  peserta
                                    </p>

                                <h1 className="text-3xl font-bold md:text-4xl">
                                    {schedule.pilates_class?.name || "Detail Schedule"}
                                </h1>

                                <p className="text-wellness-muted">
                                    {schedule.pilates_class?.about ||
                                        "Pilih jadwal terbaik dan lanjutkan ke proses pembayaran booking Anda."}
                                </p>

                                {/* <div className="grid gap-3 text-sm text-wellness-muted sm:grid-cols-2">
                                    <p className="inline-flex items-center gap-2">
                                        <IconCalendarEvent size={16} />
                                        {formatDateTime(schedule.start_at)} WIB
                                    </p>
                                    <p className="inline-flex items-center gap-2">
                                        <IconClock size={16} />
                                        Durasi {schedule.duration_minutes} menit
                                    </p>
                                    <p className="inline-flex items-center gap-2">
                                        <IconUsers size={16} />
                                        Kapasitas {schedule.capacity} peserta
                                    </p>
                                    <p className="inline-flex items-center gap-2">
                                        <IconCreditCard size={16} />
                                        {paymentLabel}
                                    </p>
                                </div> */}

                                <Link
                                    href={
                                        auth?.user
                                            ? route("welcome.schedule-payment", schedule.id)
                                            : route("login", {
                                                  redirect: route("welcome.schedule-detail", schedule.id, false),
                                              })
                                    }
                                    className="inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Confirm Booking
                                </Link>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        </>
    );
}