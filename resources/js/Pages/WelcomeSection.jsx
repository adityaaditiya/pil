import { Head, Link, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    IconArrowLeft,
    IconArrowRight,
    IconBrandInstagram,
    IconBrandTiktok,
    IconBrandWhatsapp,
    IconCalendarMonth,
    IconCheck,
    IconClock,
    IconCreditCard,
    IconCurrencyDollar,
    IconFilter,
    IconMail,
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
    appointment: {
        name: "Appointment",
        title: "Book Your Appointment",
        content: "Pilih layanan, trainer, tanggal, dan checkout sesi pilates Anda dengan alur booking yang praktis.",
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



const contactFaqs = [
    {
        question: "Apakah saya perlu reservasi sebelum datang ke studio?",
        answer: "Ya, kami menyarankan reservasi terlebih dahulu agar Anda mendapatkan slot kelas, trainer, dan waktu yang paling sesuai.",
    },
    {
        question: "Apakah tersedia kelas untuk pemula?",
        answer: "Tentu. Tim kami memiliki kelas beginner friendly dan private session untuk membantu Anda mulai dengan aman dan nyaman.",
    },
    {
        question: "Bagaimana cara menghubungi admin untuk konsultasi jadwal?",
        answer: "Anda dapat menghubungi kami melalui WhatsApp, email, atau DM Instagram dan TikTok untuk respon yang lebih cepat pada jam operasional.",
    },
    {
        question: "Apakah lokasi studio mudah ditemukan?",
        answer: "Lokasi studio tersedia pada embedded Google Maps di halaman ini agar Anda bisa langsung membuka navigasi menuju studio.",
    },
];

const contactInfo = {
    email: "hello@oropilatesstudio.com",
    address: "Jl. Layur No. 08, Tegalsari, Kec. Tegal Barat, Kota Tegal, Jawa Tengah 52111",
    hours: "Senin - Sabtu, 07:00 - 20:00 WIB",
    instagramUrl: "https://www.instagram.com/oropilatesstudio/",
    tiktokUrl: "https://www.tiktok.com/@oropilatesstudio",
    whatsappUrl: "https://wa.me/6282326923196",
    mapsEmbedUrl: "https://www.google.com/maps?q=Jl.%20Layur%20No.%2008%2C%20Tegal&z=16&output=embed",
};

const appointmentServices = [
    { id: "private", name: "Private Class", duration: "60 menit", price: 350000, description: "Sesi 1-on-1 dengan program latihan personal." },
    { id: "duet", name: "Duet Private", duration: "60 menit", price: 500000, description: "Latihan privat berdua dengan fokus yang tetap terarah." },
    { id: "group", name: "Group Class", duration: "60 menit", price: 185000, description: "Kelas kelompok kecil untuk latihan yang dinamis dan suportif." },
];

const appointmentHours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    // Ambil hari-hari dari bulan sebelumnya untuk mengisi gap (jika ingin pas hari Senin)
    // Tapi untuk versi simpel, kita mulai dari tanggal 1:
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

export default function WelcomeSection({
    page,
    pageKey,
    menuItems,
    classes = [],
    schedules = [],
    memberships = [],
    trainers = [],
    paymentGateways = [],
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
    const [selectedServiceId, setSelectedServiceId] = useState(appointmentServices[0].id);
    const [selectedTrainerId, setSelectedTrainerId] = useState("any");
    const [selectedAppointmentDate, setSelectedAppointmentDate] = useState("");
        // Tambahkan di deretan useState
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const calendarDays = useMemo(() => {
        return getDaysInMonth(currentYear, currentMonth);
    }, [currentMonth, currentYear]);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };
    const [selectedAppointmentTime, setSelectedAppointmentTime] = useState("");

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
    const navItems = useMemo(() => {
        const mappedItems = menuItems
            .filter((item) => item.key !== "home" && item.key !== "testimonials")
            .map((item) => (item.key === "trainer" ? { ...item, key: "trainers" } : item));

        if (!mappedItems.some((item) => item.key === "appointment")) {
            const trainerIndex = mappedItems.findIndex((item) => item.key === "trainers");
            const appointmentItem = { name: "Appointment", key: "appointment" };

            if (trainerIndex >= 0) {
                mappedItems.splice(trainerIndex + 1, 0, appointmentItem);
            } else {
                mappedItems.push(appointmentItem);
            }
        }

        return [{ name: "Home", key: "home" }, ...mappedItems];
    }, [menuItems]);

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

    const appointmentTrainerChoices = useMemo(() => ([
        
        ...trainers.map((trainer) => ({
            id: String(trainer.id),
            name: trainer.name,
            expertise: trainer.expertise || "Trainer Pilates",
        })),
    ]), [trainers]);

    const appointmentDates = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Array.from({ length: 14 }, (_, index) => {
            const next = new Date(today);
            next.setDate(today.getDate() + index);
            return next;
        });
    }, []);

    useEffect(() => {
        if (pageKey !== "appointment") {
            return;
        }

        if (!selectedAppointmentDate && appointmentDates[0]) {
            setSelectedAppointmentDate(getDateKey(appointmentDates[0]));
        }
    }, [pageKey, selectedAppointmentDate, appointmentDates]);

    const selectedService = useMemo(() => appointmentServices.find((service) => service.id === selectedServiceId) || appointmentServices[0], [selectedServiceId]);

    const occupiedAppointmentHours = useMemo(() => {
        if (!selectedAppointmentDate) {
            return [];
        }

        return schedules
            .filter((item) => {
                const itemDateKey = getDateKey(item.start_at);
                const trainerMatches = selectedTrainerId === "any" || String(item.trainer_id ?? item.trainer?.id) === selectedTrainerId;

                return itemDateKey === selectedAppointmentDate && trainerMatches;
            })
            .map((item) => new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(item.start_at)));
    }, [schedules, selectedAppointmentDate, selectedTrainerId]);

    const availableAppointmentHours = useMemo(() => appointmentHours.filter((hour) => !occupiedAppointmentHours.includes(hour)), [occupiedAppointmentHours]);

    useEffect(() => {
        if (pageKey !== "appointment") {
            return;
        }

        if (!availableAppointmentHours.includes(selectedAppointmentTime)) {
            setSelectedAppointmentTime(availableAppointmentHours[0] || "");
        }
    }, [pageKey, availableAppointmentHours, selectedAppointmentTime]);

    const selectedAppointmentTrainer = appointmentTrainerChoices.find((trainer) => trainer.id === selectedTrainerId) || appointmentTrainerChoices[0];
    const selectedAppointmentDateLabel = selectedAppointmentDate
        ? formatSectionDate(new Date(`${selectedAppointmentDate}T00:00:00`))
        : "Pilih tanggal";
    const appointmentPaymentLabels = paymentGateways.length > 0
        ? paymentGateways.map((gateway) => gateway.label || gateway.name || gateway.value)
        : ["Payment gateway drop-in"];


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


                {pageKey === "appointment" && (
                    <section className="mx-auto max-w-6xl px-4 pb-16">
                        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
                            <div className="space-y-6">
                                <article className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><IconYoga size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-semibold">1. Pilih Kategori</h2>
                                            <p className="text-sm text-wellness-muted">Tentukan tipe latihan yang paling sesuai dengan kebutuhan Anda.</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                                        {appointmentServices.map((service) => {
                                            const isActive = service.id === selectedServiceId;
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => setSelectedServiceId(service.id)}
                                                    className={`rounded-3xl border p-5 text-left transition ${
                                                        isActive
                                                            ? "border-primary-500 bg-primary-50 shadow-sm"
                                                            : "border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/40"
                                                    }`}
                                                >
                                                    {/* Header: Nama dan Durasi Sejajar */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-base font-semibold">{service.name}</span>
                                                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-primary-700 shadow-sm border border-primary-100">
                                                            {service.duration}
                                                        </span>
                                                    </div>

                                                    <p className="mt-3 text-sm text-wellness-muted leading-relaxed">
                                                        {service.description}
                                                    </p>

                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="font-bold text-lg text-primary-700">
                                                            {formatRupiah(service.price)}
                                                        </span>
                                                        {isActive && (
                                                            <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--primary-500),0.6)]" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </article>

                                <article className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><IconUser size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-semibold">2. Pilih trainer</h2>
                                            <p className="text-sm text-wellness-muted">Select trainer</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        {appointmentTrainerChoices.map((trainer) => {
                                            const isActive = trainer.id === selectedTrainerId;
                                            return (
                                                <button
                                                    key={trainer.id}
                                                    type="button"
                                                    onClick={() => setSelectedTrainerId(trainer.id)}
                                                    className={`rounded-3xl border p-5 text-left transition ${isActive ? "border-primary-500 bg-primary-50 shadow-sm" : "border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/40"}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-base font-semibold">{trainer.name}</p>
                                                            <p className="mt-1 text-sm text-wellness-muted">{trainer.expertise}</p>
                                                        </div>
                                                        {isActive && <IconCheck size={18} className="text-primary-600" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </article>

                                <article className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><IconCalendarMonth size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-semibold">3. Pilih tanggal & jam</h2>
                                            {/* <p className="text-sm text-wellness-muted">Kalender hanya menampilkan slot jam yang trainer-nya tidak sedang bertugas.</p> */}
                                            <p className="text-sm text-wellness-muted">Select date and time</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-6 lg:grid-cols-[3fr_1.1fr]">
                                        <div className="rounded-3xl bg-primary-50/50 p-6 text-slate-700 shadow-xl">
                                    {/* Header Kalender */}
                                    <div className="mb-8 flex items-center justify-between">
                                        <button onClick={handlePrevMonth} className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition">
                                            <IconArrowLeft size={20} />
                                        </button>
                                        <h3 className="text-lg font-bold capitalize">
                                            {new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(currentYear, currentMonth))}
                                        </h3>
                                        <button onClick={handleNextMonth} className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition">
                                            <IconArrowRight size={20} />
                                        </button>
                                    </div>

                                    {/* Header Hari */}
                                    <div className="mb-4 grid grid-cols-7 text-center text-xs font-bold text-slate-700">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <div key={i} className="py-2">{day}</div>
                                        ))}
                                    </div>

                                    {/* Grid Tanggal */}
                                    <div className="grid grid-cols-7 gap-y-2 text-center">
                                        {/* Padding untuk hari pertama bulan (opsional, agar posisi hari pas) */}
                                        {Array.from({ length: (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}

                                        {calendarDays.map((date) => {
                                            const dateKey = getDateKey(date);
                                            const isActive = dateKey === selectedAppointmentDate;
                                            const isToday = getDateKey(new Date()) === dateKey;

                                            return (
                                                <button
                                                    key={dateKey}
                                                    type="button"
                                                    onClick={() => setSelectedAppointmentDate(dateKey)}
                                                    className={`relative flex h-10 w-full items-center justify-center text-sm transition-all
                                                        ${isActive 
                                                            ? "font-bold text-primary-400 after:absolute after:bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-primary-500" 
                                                            : "text-slate-700 hover:text-primary-500 hover:bg-primary-50/5 rounded-lg"
                                                        }
                                                        ${isToday && !isActive ? "text-slate-700 font-bold" : ""}
                                                    `}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                        <div className="mt-0 rounded-3xl border border-primary-100 bg-white p-4 shadow-sm">
                                            <p className="text-sm font-medium text-slate-700">Jam tersedia</p>
                                            {/* grid-cols-2 memastikan 2 kolom di mobile, sm:grid-cols-3/4 untuk layar besar */}
                                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                                                {availableAppointmentHours.length > 0 ? (
                                                    availableAppointmentHours.map((hour) => {
                                                        const isActive = hour === selectedAppointmentTime;
                                                        return (
                                                            <button
                                                                key={hour}
                                                                type="button"
                                                                onClick={() => setSelectedAppointmentTime(hour)}
                                                                className={`rounded-2xl border px-3 py-3.5 text-sm font-semibold transition-all ${
                                                                    isActive
                                                                        ? "border-primary-500 bg-primary-600 text-white shadow-md"
                                                                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50"
                                                                }`}
                                                            >
                                                                {hour}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-wellness-muted">
                                                        Tidak ada slot kosong.
                                                    </div>
                                                )}
                                            </div>

                                            {/* <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/60 p-4 text-sm text-wellness-muted">
                                                <p className="font-medium text-wellness-text">Informasi ketersediaan</p>
                                                <p className="mt-2">Sistem menyaring jam yang bentrok dengan jadwal trainer aktif sehingga Anda hanya melihat waktu yang masih bisa dipesan.</p>
                                            </div> */}
                                        </div>
                                    </div>
                                </article>
                            </div>

                            <aside className="space-y-6">
                                <article className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><IconCreditCard size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-semibold">4. Konfirmasi & checkout</h2>
                                            <p className="text-sm text-wellness-muted">Ringkasan appointment Anda sebelum melanjutkan pembayaran.</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4 rounded-3xl bg-primary-50/60 p-5">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sesi</p>
                                            <p className="text-base font-semibold text-wellness-text">{selectedService.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trainer</p>
                                            <p className="text-base font-semibold text-wellness-text">{selectedAppointmentTrainer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Jadwal</p>
                                            <p className="text-base font-semibold text-wellness-text">{selectedAppointmentDateLabel}{selectedAppointmentTime ? ` • ${selectedAppointmentTime}` : ""} WIB</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Harga</p>
                                            <p className="text-lg font-bold text-primary-700">{formatRupiah(selectedService.price)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {/* <div className="rounded-2xl border border-primary-100 p-4">
                                            <p className="text-sm font-semibold text-wellness-text">Metode pembayaran</p>
                                            <ul className="mt-3 space-y-2 text-sm text-wellness-muted">
                                                <li className="flex items-start gap-2"><IconCheck size={16} className="mt-0.5 text-primary-600" /> Gunakan credits membership bila sesi termasuk benefit paket aktif Anda.</li>
                                                <li className="flex items-start gap-2"><IconCheck size={16} className="mt-0.5 text-primary-600" /> Atau lanjutkan dengan payment gateway drop-in: {appointmentPaymentLabels.join(", ")}.</li>
                                            </ul>
                                        </div> */}

                                        <Link
                                            href={route("welcome.page", "schedule")}
                                            className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                        >
                                            Selesaikan Pembayaran
                                        </Link>

                                        {!auth?.user && (
                                            <p className="text-sm text-wellness-muted">Login diperlukan untuk menyelesaikan checkout appointment dan menggunakan membership credits.</p>
                                        )}
                                    </div>
                                </article>

                                <article className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold">Ketentuan Pembatalan</h3>
                                    <div className="mt-2 rounded-2xl border border-primary-100 p-4">
                                            {/* <p className="text-sm font-semibold text-wellness-text">Metode pembayaran</p> */}
                                            <ul className="mt-0 space-y-2 text-sm text-wellness-muted">
                                                <li className="flex items-start gap-2 text-justify"><IconCheck size={16} className="mt-0.5 text-primary-600" /> Demi kenyamanan bersama, kami sangat menghargai kerja sama Anda untuk tidak melakukan pembatalan mendadak agar jadwal kelas tetap berjalan efektif.</li>
                                                <li className="flex items-start gap-2 text-justify"><IconCheck size={16} className="mt-0.5 text-primary-600" /> Catatan: Pengembalian kredit/saldo hanya berlaku untuk pembatalan yang dilakukan maksimal 24 jam sebelum sesi dimulai. Pembatalan setelah melewati batas waktu tersebut akan dianggap hangus.</li>
                                            </ul>
                                        </div>
                                </article>
                            </aside>
                        </div>
                    </section>
                )}

                {pageKey === "pricing" && (
                    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                        {memberships.length === 0 && (
                            <p className="text-wellness-muted">Belum ada data membership.</p>
                        )}
                        {memberships.map((membership) => (
                            /* h-full memastikan semua kartu sama tinggi, flex-col untuk mengatur posisi vertikal */
                            <article 
                                key={membership.id} 
                                className="flex flex-col h-full rounded-3xl border border-primary-100 bg-white p-6 shadow-sm"
                            >
                                {/* Bagian Atas: Header & Harga */}
                                <div className="flex-none">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        <IconSparkles size={14} /> Membership
                                    </div>
                                    
                                    {/* min-h-14 (56px) memastikan baris harga tetap sejajar walau judul cuma 1 baris */}
                                    <div className="min-h-[40px] flex items-center mt-1">
                                        <h3 className="text-xl font-semibold leading-tight">{membership.name}</h3>
                                    </div>
                                    
                                    <p className="mt-0.2 text-3xl font-bold text-primary-600">
                                        {formatRupiah(membership.price)}
                                    </p>
                                    
                                    <div className="mt-4 space-y-2 text-sm text-wellness-muted">
                                        <div className="flex items-center gap-2">
                                            <IconStar size={16} /> <span>{membership.credits} credits class</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IconClock size={16} /> <span>Berlaku {membership.valid_days || "-"} hari</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IconCurrencyDollar size={16} /> <span>Benefit Terbaik Setiap Sesi</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Tengah: Deskripsi & List Kelas (Dibuat Flex-1 agar mendorong tombol ke bawah) */}
                                <div className="flex-1 flex flex-col mt-3">
                                    <p className="text-sm text-wellness-muted whitespace-pre-line mb-2">
                                        {membership.description || "Paket membership untuk latihan konsisten."}
                                    </p>

                                    {/* mt-auto di sini memastikan 'Daftar kelas' nempel ke area tombol di bawah */}
                                    <div className="mt-auto pt-2 border-t border-slate-300">
                                        <p className="text-sm font-medium text-wellness-text">Daftar kelas yang bisa dipesan:</p>
                                        <div className="mt-2 min-h-[40px]"> {/* min-h agar area list punya ruang tetap */}
                                            {membership.classes && membership.classes.length > 0 ? (
                                                <ul className="list-disc list-inside text-sm text-wellness-muted space-y-1">
                                                    {membership.classes.map((c) => (
                                                        <li key={c.id} className="leading-tight">{c.name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-wellness-muted">-</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Bawah: Tombol */}
                                <div className="mt-4 flex-none">
                                    <Link
                                        href={auth?.user ? route("welcome.membership-detail", membership.id) : route("login", { redirect: route("welcome.membership-detail", membership.id, false) })}
                                        className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-md"
                                    >
                                        Buy Now
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {pageKey === "contact" && (
                    <section className="mx-auto max-w-6xl px-4 pb-16">
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-6">
                                <article className="overflow-hidden rounded-[32px] border border-primary-100 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
                                    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-primary-900 p-8 text-white">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
                                        <div className="relative">
                                            <p className="text-sm uppercase tracking-[0.28em] text-primary-100">Contact Experience</p>
                                            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Hubungi studio dengan tampilan yang lebih premium.</h2>
                                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-100/90 md:text-base">Kami siapkan semua channel komunikasi penting dalam satu halaman: FAQ, lokasi studio, sosial media, business information, dan tombol WhatsApp untuk konsultasi cepat.</p>
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <a
                                                    href={`${route("welcome")}#faq`}
                                                    className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-primary-50"
                                                >
                                                    Lihat FAQ di Welcome
                                                </a>
                                                <a
                                                    href={contactInfo.whatsappUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                                                >
                                                    <IconBrandWhatsapp size={18} /> Hubungi Kami
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </article>

                                <article className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">FAQ</p>
                                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Hal yang sering ditanyakan</h2>
                                        </div>
                                        <a
                                            href={`${route("welcome")}#faq`}
                                            className="inline-flex items-center rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
                                        >
                                            Ke FAQ Welcome
                                        </a>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        {contactFaqs.map((item) => (
                                            <details key={item.question} className="group rounded-3xl border border-slate-200 bg-slate-50/70 p-5 open:border-primary-200 open:bg-primary-50/60">
                                                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                                                    {item.question}
                                                </summary>
                                                <p className="mt-3 text-sm leading-relaxed text-wellness-muted">{item.answer}</p>
                                            </details>
                                        ))}
                                    </div>
                                </article>

                                <article className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Lokasi Studio</p>
                                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Google Maps dengan tampilan premium</h2>
                                        </div>
                                        <div className="hidden rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm text-primary-700 md:inline-flex">Easy access navigation</div>
                                    </div>
                                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-2 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.55)]">
                                        <div className="rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-3">
                                            <iframe
                                                title="ORO Pilates Studio Location"
                                                src={contactInfo.mapsEmbedUrl}
                                                className="h-[360px] w-full rounded-[20px] border-0 grayscale-[0.15] contrast-125 saturate-[0.9]"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                </article>
                            </div>

                            <aside className="space-y-6">
                                <article className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Connect</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Connect dengan sosial media</h2>
                                    <p className="mt-3 text-sm leading-relaxed text-wellness-muted">Ikuti update class, wellness tips, dan promo terbaru melalui Instagram dan TikTok kami.</p>

                                    <div className="mt-6 grid gap-3">
                                        <a href={contactInfo.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-pink-50 via-white to-orange-50 p-4 transition hover:border-primary-200 hover:shadow-sm">
                                            <div className="rounded-2xl bg-white p-3 text-pink-600 shadow-sm"><IconBrandInstagram size={24} /></div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Instagram</p>
                                                <p className="text-sm text-wellness-muted">Lihat update studio & reels terbaru</p>
                                            </div>
                                        </a>
                                        <a href={contactInfo.tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-100 via-white to-cyan-50 p-4 transition hover:border-primary-200 hover:shadow-sm">
                                            <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm"><IconBrandTiktok size={24} /></div>
                                            <div>
                                                <p className="font-semibold text-slate-900">TikTok</p>
                                                <p className="text-sm text-wellness-muted">Temukan video singkat tips gerakan</p>
                                            </div>
                                        </a>
                                    </div>

                                    <div className="mt-8 rounded-[28px] border border-primary-100 bg-primary-50/60 p-5">
                                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Business Information</p>
                                        <div className="mt-4 space-y-4 text-sm text-slate-700">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-2xl bg-white p-2.5 text-primary-700 shadow-sm"><IconMail size={18} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Email</p>
                                                    <a href={`mailto:${contactInfo.email}`} className="text-wellness-muted transition hover:text-primary-700">{contactInfo.email}</a>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-2xl bg-white p-2.5 text-primary-700 shadow-sm"><IconMapPin size={18} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Lokasi</p>
                                                    <p className="text-wellness-muted">{contactInfo.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-2xl bg-white p-2.5 text-primary-700 shadow-sm"><IconClock size={18} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Jam Operasional</p>
                                                    <p className="text-wellness-muted">{contactInfo.hours}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={contactInfo.whatsappUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                                    >
                                        <IconBrandWhatsapp size={20} /> Hubungi Kami
                                    </a>
                                </article>
                            </aside>
                        </div>
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
