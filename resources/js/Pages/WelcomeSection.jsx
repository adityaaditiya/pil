import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    IconArrowLeft,
    IconCalendarEvent,
    IconClock,
    IconChevronDown,
    IconCurrencyDollar,
    IconFilter,
    IconMapPin,
    IconMenu2,
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
    initialFilters = {},
}) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [classNameFilter, setClassNameFilter] = useState(initialFilters.className || "");
    const [difficultyFilter, setDifficultyFilter] = useState(initialFilters.difficulty || "");
    const [trainerFilter, setTrainerFilter] = useState(initialFilters.trainer || "");
    const [classCategoryFilter, setClassCategoryFilter] = useState(initialFilters.classCategory || "");

    const meta = page || fallbackMeta[pageKey] || {
        name: "Welcome",
        title: "ORO Pilates Studio",
        content: "Selamat datang di ORO Pilates Studio.",
    };

    const shouldShowFilter = pageKey === "classes" || pageKey === "schedule";

    useEffect(() => {
        if (shouldShowFilter && (initialFilters.className || initialFilters.difficulty || initialFilters.trainer || initialFilters.classCategory)) {
            setShowFilters(true);
        }
    }, [shouldShowFilter, initialFilters.className, initialFilters.difficulty, initialFilters.trainer, initialFilters.classCategory]);

    const difficultyOptions = useMemo(() => {
        const source = pageKey === "classes" ? classes : schedules;
        return [...new Set(
            source
                .map((item) =>
                    pageKey === "classes"
                        ? item.difficulty_level
                        : item.pilates_class?.difficulty_level
                )
                .filter(Boolean)
        )];
    }, [pageKey, classes, schedules]);

    const classNameOptions = useMemo(() => {
        const source = pageKey === "classes" ? classes : schedules;
        return [...new Set(
            source
                .map((item) => (pageKey === "classes" ? item.name : item.pilates_class?.name))
                .filter(Boolean)
        )];
    }, [pageKey, classes, schedules]);

    const trainerOptions = useMemo(
        () => [...new Set(schedules.map((item) => item.trainer?.name).filter(Boolean))],
        [schedules]
    );

    const classCategoryOptions = useMemo(
        () => [...new Set(schedules.map((item) => item.pilates_class?.class_category?.name).filter(Boolean))],
        [schedules]
    );

    const hasActiveFilters = Boolean(classNameFilter || difficultyFilter || trainerFilter || classCategoryFilter);

    const userMenuItems = [
        { name: "My profile", href: route("profile.edit") },
        { name: "My schedule", href: route("welcome.page", "schedule") },
        { name: "My memberships", href: route("memberships.my") },
    ];

    const filteredClasses = useMemo(() => {
        return classes.filter((classItem) => {
            const matchClassName = !classNameFilter || classItem.name === classNameFilter;
            const matchDifficulty = !difficultyFilter || classItem.difficulty_level === difficultyFilter;

            return matchClassName && matchDifficulty;
        });
    }, [classes, classNameFilter, difficultyFilter]);

    const filteredSchedules = useMemo(() => {
        return schedules.filter((item) => {
            const className = item.pilates_class?.name || "";
            const difficultyLevel = item.pilates_class?.difficulty_level || "";
            const trainerName = item.trainer?.name || "";
            const classCategory = item.pilates_class?.class_category?.name || "";
            const matchClassName = !classNameFilter || className === classNameFilter;
            const matchDifficulty = !difficultyFilter || difficultyLevel === difficultyFilter;
            const matchTrainer = !trainerFilter || trainerName === trainerFilter;
            const matchClassCategory = !classCategoryFilter || classCategory === classCategoryFilter;

            return matchClassName && matchDifficulty && matchTrainer && matchClassCategory;
        });
    }, [schedules, classNameFilter, difficultyFilter, trainerFilter, classCategoryFilter]);

    return (
        <>
            <Head title={`${meta.name} | ORO Pilates Studio`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                        <Link
                            href={route("welcome")}
                            className="flex items-center gap-2 font-semibold text-primary-700"
                        >
                            <IconYoga size={20} /> ORO Pilates Studio
                        </Link>

                        <div className="hidden md:flex flex-wrap items-center gap-3 text-sm text-wellness-muted">
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
                                <Link
                                    href={route("login")}
                                    className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
                                >
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
                                    <Link
                                        href={route("login")}
                                        className="rounded-full bg-primary-600 px-4 py-2 text-center font-medium text-white hover:bg-primary-700"
                                    >
                                        Login / Register
                                    </Link>
                                )}

                                <div className="flex flex-col gap-2">
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
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                <section className="mx-auto max-w-6xl px-4 py-12">
                    <Link href={route("welcome")} className="mb-8 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                    <div className="rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">ORO Pilates Studio</p>
                                <h1 className="mt-4 text-3xl font-bold md:text-4xl">{meta.title}</h1>
                                <p className="mt-4 max-w-3xl text-wellness-muted">{meta.content}</p>
                            </div>

                            {shouldShowFilter && (
                                <button
                                    type="button"
                                    onClick={() => setShowFilters((prev) => !prev)}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                                        showFilters || hasActiveFilters
                                            ? "border-primary-200 bg-primary-50 text-primary-700"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <IconFilter size={18} />
                                    <span>Filter</span>
                                    {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                                </button>
                            )}
                        </div>

                        {shouldShowFilter && showFilters && (
                            <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                                <div className={`grid gap-4 ${pageKey === "schedule" ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Nama Kelas</label>
                                        <select
                                            value={classNameFilter}
                                            onChange={(event) => setClassNameFilter(event.target.value)}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="">Semua kelas</option>
                                            {classNameOptions.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty Level</label>
                                        <select
                                            value={difficultyFilter}
                                            onChange={(event) => setDifficultyFilter(event.target.value)}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="">Semua level</option>
                                            {difficultyOptions.map((level) => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {pageKey === "schedule" && (
                                        <>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">Trainer</label>
                                                <select
                                                    value={trainerFilter}
                                                    onChange={(event) => setTrainerFilter(event.target.value)}
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                                >
                                                    <option value="">Semua trainer</option>
                                                    {trainerOptions.map((trainer) => (
                                                        <option key={trainer} value={trainer}>
                                                            {trainer}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">Kategori Kelas</label>
                                                <select
                                                    value={classCategoryFilter}
                                                    onChange={(event) => setClassCategoryFilter(event.target.value)}
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                                >
                                                    <option value="">Semua kategori</option>
                                                    {classCategoryOptions.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {pageKey === "classes" && (
                    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                        {filteredClasses.length === 0 && <p className="text-wellness-muted">Tidak ada data classes sesuai filter.</p>}
                        {filteredClasses.map((classItem) => (
                            <article key={classItem.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                                {classItem.image && (
                                    <img src={imageUrl("classes", classItem.image)} alt={classItem.name} className="h-52 w-full object-cover" />
                                )}
                                <div className="flex h-full flex-col p-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold">{classItem.name}</h3>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.duration} menit</span>
                                            <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.difficulty_level}</span>
                                        </div>
                                        {/* <p className="text-sm text-wellness-muted">Trainer: {classItem.trainers.map((trainer) => trainer.name).join(", ") || "-"}</p> */}
                                        {/* <p className="font-semibold text-primary-600">{formatRupiah(classItem.price)}</p> */}
                                        <p className="overflow-hidden text-ellipsis text-sm text-wellness-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{classItem.about}</p>
                                    </div>

                                    <div className="mt-auto pt-5">
                                        <Link
                                            href={route("welcome.class-detail", classItem.id)}
                                            className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                                        >
                                            Lihat Selengkapnya
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {pageKey === "schedule" && (
                    <section className="mx-auto max-w-6xl px-4 pb-16">
                        <div className="grid gap-4">
                            {filteredSchedules.length === 0 && <p className="text-wellness-muted">Tidak ada data schedule sesuai filter.</p>}
                            {filteredSchedules.map((item) => (
                                <article key={item.id} className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-lg font-semibold">{item.pilates_class?.name || "Kelas"}</h3>
                                        {/* <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                                            {item.allow_drop_in ? "Drop In" : "Membership"}
                                        </span> */}
                                    </div>
                                    <div className="mt-3 grid gap-2 text-sm text-wellness-muted md:grid-cols-2">
                                        <p className="inline-flex items-center gap-2"><IconCalendarEvent size={16} /> {formatDateTime(item.start_at)} WIB</p>
                                        <p className="inline-flex items-center gap-2"><IconUser size={16} /> {item.trainer?.name || "Trainer"}</p>
                                        <p className="inline-flex items-center gap-2"><IconClock size={16} /> Durasi {item.duration_minutes} menit</p>
                                        <p className="inline-flex items-center gap-2"><IconUsers size={16} /> Kapasitas {item.capacity} peserta</p>
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            href={auth?.user ? route("welcome.schedule-detail", item.id) : route("login", { redirect: route("welcome.schedule-detail", item.id, false) })}
                                            className="inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                        >
                                            Book Now
                                        </Link>
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
