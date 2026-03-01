import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
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

const getScheduleCategory = (scheduleItem) =>
    scheduleItem?.pilates_class?.category || scheduleItem?.pilates_class?.difficulty_level || null;

export default function WelcomeSection({
    page,
    pageKey,
    menuItems,
    classes = [],
    schedules = [],
    memberships = [],
    trainers = [],
}) {
    const [selectedClassName, setSelectedClassName] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [selectedTrainer, setSelectedTrainer] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const meta = page || fallbackMeta[pageKey] || {
        name: "Welcome",
        title: "ORO Pilates Studio",
        content: "Selamat datang di ORO Pilates Studio.",
    };

    const classNameOptions = useMemo(() => {
        const classNames = new Set(classes.map((item) => item.name).filter(Boolean));

        return Array.from(classNames).sort((a, b) => a.localeCompare(b, "id"));
    }, [classes]);

    const scheduleClassNameOptions = useMemo(() => {
        const classNames = new Set(schedules.map((item) => item.pilates_class?.name).filter(Boolean));

        return Array.from(classNames).sort((a, b) => a.localeCompare(b, "id"));
    }, [schedules]);

    const difficultyOptions = useMemo(() => {
        const difficulties = new Set(classes.map((item) => item.difficulty_level).filter(Boolean));

        return Array.from(difficulties).sort((a, b) => a.localeCompare(b, "id"));
    }, [classes]);

    const scheduleDifficultyOptions = useMemo(() => {
        const difficulties = new Set(schedules.map((item) => item.pilates_class?.difficulty_level).filter(Boolean));

        return Array.from(difficulties).sort((a, b) => a.localeCompare(b, "id"));
    }, [schedules]);

    const trainerOptions = useMemo(() => {
        const scheduleTrainers = new Set(schedules.map((item) => item.trainer?.name).filter(Boolean));

        return Array.from(scheduleTrainers).sort((a, b) => a.localeCompare(b, "id"));
    }, [schedules]);

    const categoryOptions = useMemo(() => {
        const categories = new Set(schedules.map((item) => getScheduleCategory(item)).filter(Boolean));

        return Array.from(categories).sort((a, b) => a.localeCompare(b, "id"));
    }, [schedules]);

    const filteredClasses = useMemo(
        () =>
            classes.filter((item) => {
                const matchClass = selectedClassName === "all" || item.name === selectedClassName;
                const matchDifficulty = selectedDifficulty === "all" || item.difficulty_level === selectedDifficulty;

                return matchClass && matchDifficulty;
            }),
        [classes, selectedClassName, selectedDifficulty],
    );

    const filteredSchedules = useMemo(
        () =>
            schedules.filter((item) => {
                const className = item.pilates_class?.name;
                const difficultyLevel = item.pilates_class?.difficulty_level;
                const trainerName = item.trainer?.name;
                const classCategory = getScheduleCategory(item);

                const matchClass = selectedClassName === "all" || className === selectedClassName;
                const matchDifficulty = selectedDifficulty === "all" || difficultyLevel === selectedDifficulty;
                const matchTrainer = selectedTrainer === "all" || trainerName === selectedTrainer;
                const matchCategory = selectedCategory === "all" || classCategory === selectedCategory;

                return matchClass && matchDifficulty && matchTrainer && matchCategory;
            }),
        [schedules, selectedClassName, selectedDifficulty, selectedTrainer, selectedCategory],
    );

    const resetCommonFilter = () => {
        setSelectedClassName("all");
        setSelectedDifficulty("all");
    };

    const resetScheduleFilter = () => {
        setSelectedClassName("all");
        setSelectedDifficulty("all");
        setSelectedTrainer("all");
        setSelectedCategory("all");
    };

    const renderClassCardFilters = () => (
        <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-end gap-3 px-4">
            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Nama Kelas
                <select
                    value={selectedClassName}
                    onChange={(event) => setSelectedClassName(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Kelas</option>
                    {classNameOptions.map((className) => (
                        <option key={className} value={className}>
                            {className}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Difficulty Level
                <select
                    value={selectedDifficulty}
                    onChange={(event) => setSelectedDifficulty(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Level</option>
                    {difficultyOptions.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                            {difficulty}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="button"
                onClick={resetCommonFilter}
                className="rounded-xl border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
            >
                Reset Filter
            </button>
        </div>
    );

    const renderScheduleCardFilters = () => (
        <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-end gap-3 px-4">
            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Nama Kelas
                <select
                    value={selectedClassName}
                    onChange={(event) => setSelectedClassName(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Kelas</option>
                    {scheduleClassNameOptions.map((className) => (
                        <option key={className} value={className}>
                            {className}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Difficulty Level
                <select
                    value={selectedDifficulty}
                    onChange={(event) => setSelectedDifficulty(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Level</option>
                    {scheduleDifficultyOptions.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                            {difficulty}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Trainer
                <select
                    value={selectedTrainer}
                    onChange={(event) => setSelectedTrainer(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Trainer</option>
                    {trainerOptions.map((trainerName) => (
                        <option key={trainerName} value={trainerName}>
                            {trainerName}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-wellness-muted">
                Kategori Kelas
                <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-wellness-text focus:border-primary-500 focus:outline-none"
                >
                    <option value="all">Semua Kategori</option>
                    {categoryOptions.map((categoryName) => (
                        <option key={categoryName} value={categoryName}>
                            {categoryName}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="button"
                onClick={resetScheduleFilter}
                className="rounded-xl border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
            >
                Reset Filter
            </button>
        </div>
    );

    return (
        <>
            <Head title={`${meta.name} | ORO Pilates Studio`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                        <Link href={route("welcome")} className="flex items-center gap-2 font-semibold text-primary-700">
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

                            <Link href={route("login")} className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
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
                    <>
                        {renderClassCardFilters()}
                        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
                            {filteredClasses.length === 0 && <p className="text-wellness-muted">Belum ada data classes sesuai filter.</p>}
                            {filteredClasses.map((classItem) => (
                                <article key={classItem.id} className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                                    {classItem.image && <img src={imageUrl("classes", classItem.image)} alt={classItem.name} className="h-52 w-full object-cover" />}
                                    <div className="space-y-3 p-6">
                                        <h3 className="text-xl font-semibold">{classItem.name}</h3>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.duration} menit</span>
                                            <span className="rounded-full bg-primary-50 px-3 py-1">{classItem.difficulty_level}</span>
                                        </div>
                                        {/* <p className="text-sm text-wellness-muted">Trainer: {classItem.trainers.map((trainer) => trainer.name).join(", ") || "-"}</p> */}
                                        {/* <p className="font-semibold text-primary-600">{formatRupiah(classItem.price)}</p> */}
                                        <p className="text-sm text-wellness-muted">{classItem.about}</p>
                                    </div>
                                </article>
                            ))}
                        </section>
                    </>
                )}

                {pageKey === "schedule" && (
                    <>
                        {renderScheduleCardFilters()}
                        <section className="mx-auto max-w-6xl px-4 pb-16">
                            <div className="grid gap-4">
                                {filteredSchedules.length === 0 && <p className="text-wellness-muted">Belum ada data schedule sesuai filter.</p>}
                                {filteredSchedules.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h3 className="text-lg font-semibold">{item.pilates_class?.name || "Kelas"}</h3>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm text-wellness-muted md:grid-cols-2">
                                            <p className="inline-flex items-center gap-2">
                                                <IconCalendarEvent size={16} /> {formatDateTime(item.start_at)} WIB
                                            </p>
                                            <p className="inline-flex items-center gap-2">
                                                <IconUser size={16} /> {item.trainer?.name || "Trainer"}
                                            </p>
                                            <p className="inline-flex items-center gap-2">
                                                <IconClock size={16} /> Durasi {item.duration_minutes} menit
                                            </p>
                                            <p className="inline-flex items-center gap-2">
                                                <IconUsers size={16} /> Kapasitas {item.capacity} peserta
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </>
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
                                    <p className="inline-flex items-center gap-2">
                                        <IconStar size={16} /> {membership.credits} kredit kelas
                                    </p>
                                    <br />
                                    <p className="inline-flex items-center gap-2">
                                        <IconClock size={16} /> Berlaku {membership.valid_days || "-"} hari
                                    </p>
                                    <br />
                                    <p className="inline-flex items-center gap-2">
                                        <IconCurrencyDollar size={16} /> Aktivasi cepat & fleksibel
                                    </p>
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
