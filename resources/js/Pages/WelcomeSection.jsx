import { Head, Link, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    IconArrowLeft,
    IconArrowRight,
    IconCalendarMonth,
    IconClock,
    IconCurrencyDollar,
    IconFilter,
    IconMapPin,
    IconSparkles,
    IconStar,
    IconUser,
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

const formatMonthYear = (date) =>
    new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "numeric",
    }).format(date);

const formatDayName = (date) =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
    }).format(date);

const formatDayNumber = (date) =>
    new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
    }).format(date);

const formatSectionDate = (date) =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "short",
    }).format(date);

const getDateKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    // getMonth() dimulai dari 0 (Januari), jadi harus ditambah 1
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const getRemainingSlots = (item) => {
    if (typeof item.remaining_slots === "number") {
        return item.remaining_slots;
    }

    if (typeof item.slots_left === "number") {
        return item.slots_left;
    }

    if (typeof item.booked_count === "number") {
        return Math.max(0, Number(item.capacity || 0) - item.booked_count);
    }

    return Number(item.capacity || 0);
};

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

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
    const [showFilters, setShowFilters] = useState(false);
    const [classNameFilter, setClassNameFilter] = useState(initialFilters.className || "");
    const [difficultyFilter, setDifficultyFilter] = useState(initialFilters.difficulty || "");
    const [trainerFilter, setTrainerFilter] = useState(initialFilters.trainer || "");
    const [classCategoryFilter, setClassCategoryFilter] = useState(initialFilters.classCategory || "");
    const [activeDateKey, setActiveDateKey] = useState("");
    const [selectedMonthAnchor, setSelectedMonthAnchor] = useState(null);
    const dateStripRef = useRef(null);
    const { auth } = usePage().props;
    // Di dekat useRef lainnya
    const dateInputRef = useRef(null); // Tambahkan ini

    const handleCalendarChange = (e) => {
    const selectedDate = e.target.value; // Format: YYYY-MM-DD
    if (selectedDate) {
        handleDateClick(selectedDate);
    }
};

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

    const classCategoryOptions = useMemo(() => {
        if (pageKey === "classes") {
            return [...new Set(classes.map((item) => item.class_category?.name).filter(Boolean))];
        }

        return [...new Set(schedules.map((item) => item.pilates_class?.class_category?.name).filter(Boolean))];
    }, [pageKey, classes, schedules]);

    const hasActiveFilters = Boolean(classNameFilter || difficultyFilter || trainerFilter || classCategoryFilter);
    const navItems = [{ name: "Home", key: "home" }, ...menuItems.filter((item) => item.key !== "home")];

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

    const dateNavigatorDates = useMemo(() => {
    if (pageKey !== "schedule") {
        return [];
    }

    // Set "hari ini" sebagai titik mulai (jam 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buat array berisi 14 hari ke depan dari hari ini
    return Array.from({ length: 30 }, (_, index) => {
        const next = new Date(today);
        next.setDate(today.getDate() + index);
        return next;
    });
}, [pageKey]); // Hapus filteredSchedules dari dependency agar tidak berubah-ubah saat filter dipakai

    const schedulesByDate = useMemo(() => {
        if (pageKey !== "schedule") {
            return [];
        }

        const groupedMap = filteredSchedules.reduce((acc, item) => {
            const key = getDateKey(item.start_at);

            if (!acc.has(key)) {
                acc.set(key, []);
            }

            acc.get(key).push(item);
            return acc;
        }, new Map());

        return dateNavigatorDates.map((date) => {
            const key = getDateKey(date);
            const items = (groupedMap.get(key) || []).sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

            return {
                key,
                date,
                items,
            };
        });
    }, [pageKey, filteredSchedules, dateNavigatorDates]);

    useEffect(() => {
    if (pageKey !== "schedule" || dateNavigatorDates.length === 0) {
        return;
    }

    const todayKey = getDateKey(new Date());
    // Cek apakah hari ini ada dalam daftar (pasti ada karena kita set di urutan ke-0)
    setActiveDateKey(todayKey);
    setSelectedMonthAnchor(dateNavigatorDates[0]);
}, [pageKey, dateNavigatorDates]);

// Tambahkan useEffect ini untuk menggeser navigator secara otomatis
useEffect(() => {
    if (activeDateKey && dateStripRef.current) {
        // Cari elemen tombol yang sedang aktif berdasarkan data-key (kita perlu menambah atribut ini nanti)
        const activeElement = dateStripRef.current.querySelector(`[data-nav-key="${activeDateKey}"]`);
        
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center", // Ini yang membuat tombol aktif bergeser ke tengah
            });
        }
    }
}, [activeDateKey]);

    useEffect(() => {
        if (pageKey !== "schedule" || schedulesByDate.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visibleEntries.length === 0) {
                    return;
                }

                const nextKey = visibleEntries[0].target.getAttribute("data-date-key");

                if (nextKey) {
                    setActiveDateKey(nextKey);
                    const matchedDate = dateNavigatorDates.find((date) => getDateKey(date) === nextKey);
                    if (matchedDate) {
                        setSelectedMonthAnchor(matchedDate);
                    }
                }
            },
            {
                root: null,
                rootMargin: "-30% 0px -55% 0px",
                threshold: [0.2, 0.4, 0.65],
            }
        );

        const sections = Array.from(document.querySelectorAll("[data-schedule-day-section='true']"));
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [pageKey, schedulesByDate, dateNavigatorDates]);

    const scrollDateStrip = (direction) => {
        if (!dateStripRef.current) {
            return;
        }

        const amount = Math.max(220, dateStripRef.current.clientWidth * 0.5);
        dateStripRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    const handleDateClick = (dateKey) => {
        const section = document.getElementById(`schedule-day-${dateKey}`);

        if (!section) {
            return;
        }

        setActiveDateKey(dateKey);

        const matchedDate = dateNavigatorDates.find((date) => getDateKey(date) === dateKey);
        if (matchedDate) {
            setSelectedMonthAnchor(matchedDate);
        }

        const stickyHeaderOffset = 190;
        const targetY = section.getBoundingClientRect().top + window.scrollY - stickyHeaderOffset;
        window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    return (
        <>
            <Head title={`${meta.name} | ORO Pilates Studio`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar navItems={navItems} currentKey={pageKey} />

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
                                        <p className="overflow-hidden text-ellipsis text-justify text-sm text-wellness-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{classItem.about}</p>
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
                        {schedulesByDate.length === 0 && <p className="text-wellness-muted">Tidak ada data schedule sesuai filter.</p>}

                        {schedulesByDate.length > 0 && (
                            <div className="space-y-6">
                                <div className="sticky top-20 z-30 rounded-3xl border border-primary-100 bg-white/95 p-4 shadow-md backdrop-blur">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        {/* GANTI <p> MENJADI <div> */}
                                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                        <span>
                                            {formatMonthYear(selectedMonthAnchor || dateNavigatorDates[0])}
                                        </span>
                                        
                                        <div className="relative inline-flex">
                                            <button
                                                type="button"
                                                onClick={() => dateInputRef.current?.showPicker()}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-primary-50 hover:text-primary-700"
                                                aria-label="Open date picker"
                                            >
                                                <IconCalendarMonth size={20} />
                                            </button>

                                            <input
                                                ref={dateInputRef}
                                                type="date"
                                                // Batasi pilihan: Minimal hari ini, Maksimal 30 hari ke depan
                                                min={new Date().toISOString().split("T")[0]}
                                                max={new Date(new Date().setDate(new Date().getDate() + 29)).toISOString().split("T")[0]}
                                                onChange={handleCalendarChange}
                                                className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                        
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => scrollDateStrip("left")}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
                                            aria-label="Geser tanggal ke kiri"
                                        >
                                            <IconArrowLeft size={18} />
                                        </button>

                                        <div ref={dateStripRef} className="flex snap-x snap-mandatory gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {dateNavigatorDates.map((date) => {
                                                const key = getDateKey(date);
                                                const isActive = activeDateKey === key;

                                                return (
                                                    <button
                                                        key={key}
                                                        data-nav-key={key} // TAMBAHKAN BARIS INI
                                                        type="button"
                                                        onClick={() => handleDateClick(key)}
                                                        className={`min-w-24 snap-start rounded-2xl border px-3 py-2 text-center transition ${
                                                            isActive
                                                                ? "border-primary-200 bg-primary-600 text-white shadow"
                                                                : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50"
                                                        }`}
                                                    >
                                                        <p className={`text-xs capitalize ${isActive ? "text-primary-50" : "text-slate-500"}`}>
                                                            {formatDayName(date)}
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold">{formatDayNumber(date)}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => scrollDateStrip("right")}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
                                            aria-label="Geser tanggal ke kanan"
                                        >
                                            <IconArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {schedulesByDate.map((group) => (
                                        <section
                                            key={group.key}
                                            id={`schedule-day-${group.key}`}
                                            data-date-key={group.key}
                                            data-schedule-day-section="true"
                                            className="scroll-mt-52"
                                        >
                                            <h3 className="mb-4 text-base font-semibold text-slate-800 md:text-lg">
                                                {formatSectionDate(group.date)} — {group.items.length} classes
                                            </h3>

                                            <div className="space-y-4">
                                                {group.items.length === 0 && (
                                                    <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-wellness-muted">
                                                        Belum ada kelas pada tanggal ini.
                                                    </article>
                                                )}

                                                {group.items.map((item) => (
                                                    <article
                                                        key={item.id}
                                                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-6"
                                                    >
                                                        <div className="grid gap-4 md:grid-cols-[180px,1fr,160px] md:items-center">
                                                            <div>
                                                                <p className="text-lg font-semibold text-slate-900">
                                                                    Pukul {new Intl.DateTimeFormat("id-ID", { hour: "numeric", minute: "2-digit" }).format(new Date(item.start_at))} WIB
                                                                </p>
                                                                <p className="mt-1 text-sm text-slate-500">Durasi {item.duration_minutes} menit</p>
                                                            </div>

                                                            <div>
                                                                {/* Baris Pertama: Nama Kelas dan Detail Level/Kategori */}
                                                                <div className="flex flex-wrap items-baseline gap-2">
                                                                    <h4 className="text-base font-semibold text-slate-900 md:text-lg">
                                                                        {item.pilates_class?.name || "Kelas"}
                                                                    </h4>
                                                                    
                                                                </div>

                                                                {/* Baris Kedua: Trainer (Paragraf Baru) */}
                                                                <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                                                    <IconUser size={14} /> 
                                                                    <span>Trainer: {item.trainer?.name || "Instructor"} | </span>
                                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                                        {/* {item.pilates_class?.difficulty_level && (
                                                                            <span className="rounded-full bg-primary-50 px-3 py-1">
                                                                                {item.pilates_class.difficulty_level}
                                                                            </span>
                                                                        )} */}
                                                                        {item.pilates_class?.class_category?.name && (
                                                                            <span className="rounded-full bg-primary-50 px-3 py-1">
                                                                                {item.pilates_class.class_category.name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="md:text-right">
                                                                <p className="text-sm font-medium text-primary-700 text-right">{getRemainingSlots(item)} Slot tersisa</p>
                                                                <Link
                                                                    href={auth?.user ? route("welcome.schedule-detail", item.id) : route("login", { redirect: route("welcome.schedule-detail", item.id, false) })}
                                                                    className="mt-2 flex w-full items-center justify-center md:inline-flex md:w-auto rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                                                >
                                                                    Book Now
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                    <p className="inline-flex items-center gap-2"><IconStar size={16} /> {membership.credits} credits class</p>
                                    <br/><p className="inline-flex items-center gap-2"><IconClock size={16} /> Berlaku {membership.valid_days || "-"} hari</p>
                                    <br /><p className="inline-flex items-center gap-2"><IconCurrencyDollar size={16} /> Benefit Terbaik Setiap Sesi</p>
                                </div>
                                <p className="mt-4 text-sm text-wellness-muted whitespace-pre-line ">
                                    {membership.description || "Paket membership untuk latihan konsisten."}
                                </p>
                                <div className="mt-3 text-sm text-wellness-muted border-t border-slate-200 pt-3">
                                    <p className="font-medium text-wellness-text">Daftar kelas yang bisa dipesan:</p>
                                     
                                    {membership.classes.length > 0 ? (
                                        <ul className="list-disc list-inside mt-2">
                                            {membership.classes.map((c) => (
                                                <li key={c.id}>{c.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>-</p>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href={auth?.user ? route("welcome.membership-detail", membership.id) : route("login", { redirect: route("welcome.membership-detail", membership.id, false) })}
                                        className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                    >
                                        Buy Now
                                    </Link>
                                </div>
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
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <IconUser size={16} /> {trainer.name}
                                        <span className="mx-0.2">|</span>
                                        <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                            <IconYoga size={16} /> {trainer.expertise || "Spesialisasi trainer belum diisi."}
                                        </p>
                                    </h3>

                                    {/* <p className="text-sm text-wellness-muted">{trainer.gender}, {trainer.age} tahun</p> */}
                                    {/* <p className="inline-flex items-start gap-2 text-sm text-wellness-muted">
                                        <IconMapPin size={16} className="mt-0.5" /> {trainer.address}
                                    </p> */}
                                    <p className="whitespace-pre-line text-sm text-wellness-muted">
                                        Profile : 
                                        <br />
                                        {trainer.biodata || "Biodata trainer belum diisi."}
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
