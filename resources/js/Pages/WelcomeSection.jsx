import { Head, Link } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconClock,
    IconCurrencyDollar,
    IconMapPin,
    IconSparkles,
    IconStar,
    IconUser,
    IconUsers,
    IconYoga,
} from "@tabler/icons-react";

const fallbackMeta = {
    classes: {
        name: "Classes",
        title: "Pilates Classes",
        content: "Temukan kelas pilates terbaik sesuai tujuan latihan Anda.",
    },
    schedule: {
        name: "Schedule",
        title: "Jadwal Kelas",
        content: "Lihat jadwal terbaru dan pilih sesi yang paling cocok.",
    },
    pricing: {
        name: "Pricing",
        title: "Membership Plans",
        content: "Pilih paket membership terbaik untuk kebutuhan Anda.",
    },
    trainers: {
        name: "Trainer",
        title: "Our Trainers",
        content: "Kenali trainer profesional yang siap membimbing Anda.",
    },
};

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDateTime = (date) =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const menuHref = (key) => (key === "home" ? route("welcome") : route("welcome.page", key));

export default function WelcomeSection({
    page,
    pageKey,
    menuItems,
    classes = [],
    schedules = [],
    memberships = [],
    trainers = [],
}) {
    const meta = page || fallbackMeta[pageKey] || {
        name: "Welcome",
        title: "ORO Pilates Studio",
        content: "Selamat datang di ORO Pilates Studio.",
    };

    return (
        <>
            <Head title={`${meta.name} | ORO Pilates Studio`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
            href={route("welcome")}
            className="flex items-center gap-2 font-semibold text-primary-700"
        >
            <IconYoga size={20} /> ORO Pilates Studio
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm text-wellness-muted">

            {[
                { name: "Home", key: "home" },
                ...menuItems.filter((item) => item.key !== "home"),
            ].map((item) => (
                <Link
                    key={item.key}
                    href={menuHref(item.key)}
                    className={
                        item.key === pageKey
                            ? "rounded-full bg-primary-100 px-3 py-1.5 font-medium text-primary-700"
                            : "px-2 py-1 hover:text-primary-600"
                    }
                >
                    {item.name}
                </Link>
            ))}

            <Link
                href={route("login")}
                className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
                Login
            </Link>
        </div>
    </div>
</nav>

                <section className="mx-auto max-w-6xl px-4 py-12">
                    <Link href={route("welcome")} className="mb-8 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                    <div className="rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">ORO Pilates Studio</p>
                        <h1 className="mt-4 text-3xl font-bold md:text-4xl">{meta.title}</h1>
                        <p className="mt-4 max-w-3xl text-wellness-muted">{meta.content}</p>
                    </div>
                </section>

                {pageKey === "classes" && (
                    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                        {classes.length === 0 && <p className="text-wellness-muted">Belum ada data classes.</p>}
                        {classes.map((classItem) => (
                            <article key={classItem.id} className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                                {classItem.image && (
                                    <img src={imageUrl("classes", classItem.image)} alt={classItem.name} className="h-52 w-full object-cover" />
                                )}
                                <div className="space-y-3 p-6">
                                    <h3 className="text-xl font-semibold">{classItem.name}</h3>
                                    <p className="text-sm text-wellness-muted">{classItem.about}</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.duration} menit</span>
                                        <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.difficulty_level}</span>
                                    </div>
                                    <p className="text-sm text-wellness-muted">Trainer: {classItem.trainers.map((trainer) => trainer.name).join(", ") || "-"}</p>
                                    <p className="font-semibold text-primary-600">{formatRupiah(classItem.price)}</p>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {pageKey === "schedule" && (
                    <section className="mx-auto max-w-6xl px-4 pb-16">
                        <div className="grid gap-4">
                            {schedules.length === 0 && <p className="text-wellness-muted">Belum ada data schedule.</p>}
                            {schedules.map((item) => (
                                <article key={item.id} className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-lg font-semibold">{item.pilates_class?.name || "Kelas"}</h3>
                                        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                                            {item.allow_drop_in ? "Drop In" : "Membership"}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid gap-2 text-sm text-wellness-muted md:grid-cols-2">
                                        <p className="inline-flex items-center gap-2"><IconCalendarEvent size={16} /> {formatDateTime(item.start_at)} WIB</p>
                                        <p className="inline-flex items-center gap-2"><IconUser size={16} /> {item.trainer?.name || "Trainer"}</p>
                                        <p className="inline-flex items-center gap-2"><IconClock size={16} /> Durasi {item.duration_minutes} menit</p>
                                        <p className="inline-flex items-center gap-2"><IconUsers size={16} /> Kapasitas {item.capacity} peserta</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {pageKey === "pricing" && (
                    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                        {memberships.length === 0 && <p className="text-wellness-muted">Belum ada data membership.</p>}
                        {memberships.map((membership) => (
                            <article key={membership.id} className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                    <IconSparkles size={14} /> Membership
                                </div>
                                <h3 className="mt-4 text-xl font-semibold">{membership.name}</h3>
                                <p className="mt-2 text-3xl font-bold text-primary-600">{formatRupiah(membership.price)}</p>
                                <div className="mt-4 space-y-2 text-sm text-wellness-muted">
                                    <p className="inline-flex items-center gap-2"><IconStar size={16} /> {membership.credits} kredit kelas</p>
                                    <br/><p className="inline-flex items-center gap-2"><IconClock size={16} /> Berlaku {membership.valid_days || "-"} hari</p>
                                    <br /><p className="inline-flex items-center gap-2"><IconCurrencyDollar size={16} /> Aktivasi cepat & fleksibel</p>
                                </div>
                                <p className="mt-4 text-sm text-wellness-muted">{membership.description || "Paket membership untuk latihan konsisten."}</p>
                            </article>
                        ))}
                    </section>
                )}

                {pageKey === "trainers" && (
                    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                        {trainers.length === 0 && <p className="text-wellness-muted">Belum ada data trainer.</p>}
                        {trainers.map((trainer) => (
                            <article key={trainer.id} className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                                {trainer.photo && <img src={imageUrl("trainers", trainer.photo)} alt={trainer.name} className="h-64 w-full object-cover" />}
                                <div className="space-y-2 p-6">
                                    <h3 className="text-xl font-semibold">{trainer.name}</h3>
                                    {/* <p className="text-sm text-wellness-muted">{trainer.gender}, {trainer.age} tahun</p> */}
                                    <p className="inline-flex items-start gap-2 text-sm text-wellness-muted">
                                        <IconMapPin size={16} className="mt-0.5" /> {trainer.address}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </>
    );
}
