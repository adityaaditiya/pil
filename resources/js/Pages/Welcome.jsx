import { Head, Link } from "@inertiajs/react";
import {
    IconAward,
    IconCheck,
    IconClock,
    IconFlower,
    IconHeartHandshake,
    IconBrandInstagram,
    IconMapPin,
    IconMenu2,
    IconPhone,
    IconShieldCheck,
    IconSparkles,
    IconStretching,
    IconYoga,
} from "@tabler/icons-react";
import Button from "@/Components/Landing/Button";
import Card from "@/Components/Landing/Card";
import SectionTitle from "@/Components/Landing/SectionTitle";

export default function Welcome() {
    const navItems = [
        { name: "Home", key: "home" },
        { name: "About", key: "about" },
        { name: "Classes", key: "classes" },
        { name: "Schedule", key: "schedule" },
        { name: "Pricing", key: "pricing" },
        { name: "Trainers", key: "trainers" },
        { name: "Testimonials", key: "testimonials" },
        { name: "Contact", key: "contact" },
    ];

    const trustBadges = ["Certified Trainers", "Small Group", "Beginner Friendly"];

    const benefits = [
        {
            icon: IconSparkles,
            title: "Postur Lebih Seimbang",
            desc: "Latihan terarah membantu alignment tubuh agar lebih tegap dan nyaman sepanjang hari.",
        },
        {
            icon: IconShieldCheck,
            title: "Core Lebih Kuat",
            desc: "Program kami menargetkan otot inti untuk mendukung stabilitas, keseimbangan, dan performa.",
        },
        {
            icon: IconStretching,
            title: "Fleksibilitas Meningkat",
            desc: "Gerakan mindful untuk membuka rentang gerak dengan aman, lembut, dan progresif.",
        },
        {
            icon: IconFlower,
            title: "Stress Relief",
            desc: "Rasakan sesi yang menenangkan dengan ritme napas, fokus, dan suasana studio yang hangat.",
        },
    ];

    const classTypes = [
        {
            title: "Reformer Pilates",
            desc: "Latihan dengan reformer machine untuk membangun kekuatan dan kontrol gerakan presisi.",
            duration: "55 menit",
            level: "All Levels",
        },
        {
            title: "Mat Pilates",
            desc: "Kelas dasar hingga intermediate yang berfokus pada teknik inti dan mobilitas tubuh.",
            duration: "50 menit",
            level: "Beginner - Intermediate",
        },
        {
            title: "Private Session",
            desc: "Pendampingan 1-on-1 dengan program personal sesuai tujuan kebugaran Anda.",
            duration: "60 menit",
            level: "Personalized",
        },
        {
            title: "Recovery & Stretch",
            desc: "Sesi pemulihan untuk melepas ketegangan otot dan memperbaiki kualitas gerak.",
            duration: "45 menit",
            level: "Beginner Friendly",
        },
    ];

    const scheduleRows = [
        { day: "Senin", morning: "07:00 Reformer", evening: "18:30 Mat Flow" },
        { day: "Selasa", morning: "08:00 Private", evening: "19:00 Recovery" },
        { day: "Rabu", morning: "07:30 Mat Core", evening: "18:30 Reformer" },
        { day: "Kamis", morning: "08:00 Recovery", evening: "19:00 Private" },
        { day: "Jumat", morning: "07:00 Reformer", evening: "18:00 Mat Basics" },
        { day: "Sabtu", morning: "09:00 Signature Class", evening: "16:30 Recovery" },
    ];

    const prices = [
        {
            plan: "Trial",
            price: "Rp150.000",
            note: "1x kelas untuk member baru",
            popular: false,
        },
        {
            plan: "Monthly Unlimited",
            price: "Rp1.450.000",
            note: "Akses semua kelas selama 30 hari",
            popular: true,
        },
        {
            plan: "10 Class Pack",
            price: "Rp1.250.000",
            note: "Masa aktif 2 bulan, fleksibel",
            popular: false,
        },
        {
            plan: "Private",
            price: "Rp450.000",
            note: "Sesi personal per pertemuan",
            popular: false,
        },
    ];

    const trainers = [
        { name: "Nadia Putri", specialty: "Posture & Rehabilitation" },
        { name: "Alya Prameswari", specialty: "Prenatal Pilates" },
        { name: "Shinta Maheswari", specialty: "Strength & Mobility" },
    ];

    const testimonials = [
        {
            quote: "Studio-nya tenang dan instruktur sangat detail. Postur saya jauh membaik dalam 6 minggu.",
            name: "Cecilia, 32",
        },
        {
            quote: "Saya pemula total, tapi kelasnya ramah dan progresnya terasa konsisten setiap minggu.",
            name: "Vina, 28",
        },
        {
            quote: "Program private session membantu recovery punggung saya lebih cepat dan aman.",
            name: "Monica, 37",
        },
    ];

    const faqs = [
        {
            q: "Apakah cocok untuk pemula?",
            a: "Ya. Kami menyediakan kelas beginner friendly dengan instruktur bersertifikasi yang membimbing teknik dari dasar.",
        },
        {
            q: "Apa yang perlu dibawa saat kelas?",
            a: "Kenakan pakaian olahraga nyaman, kaus kaki grip, dan bawa botol minum. Mat disediakan oleh studio.",
        },
        {
            q: "Bagaimana kebijakan cancel atau refund?",
            a: "Pembatalan dapat dilakukan maksimal 8 jam sebelum kelas. Trial tidak dapat refund, paket lain mengikuti syarat member.",
        },
        {
            q: "Apakah ada kelas private?",
            a: "Tersedia private session 1-on-1 dengan program personal sesuai kebutuhan kebugaran atau pemulihan Anda.",
        },
    ];

    return (
        <>
            <Head title="Pilates Studio | Move Better. Feel Stronger." />

            <div className="min-h-screen bg-wellness-beige text-wellness-text">
                <div className="bg-primary-600 px-4 py-2 text-center text-xs font-medium text-white md:text-sm">
                    Free Trial Class this week — Slot terbatas, reservasi sekarang.
                </div>

                <nav className="sticky top-0 z-50 border-b border-primary-100 bg-wellness-soft/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md shadow-primary-700/20">
                                <IconYoga size={20} />
                            </div>
                            <div>
                                <p className="text-base font-semibold">ORO Pilates Studio</p>
                                <p className="text-xs text-wellness-muted">Wellness & Movement</p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-7 lg:flex">
                            {navItems.map((item) => (
                                <Link key={item.key} href={route("welcome.page", item.key)} className="text-sm text-wellness-muted transition hover:text-primary-600">
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button as={Link} href={route("welcome.page", "contact")} className="hidden md:inline-flex">
                                Booking Kelas
                            </Button>
                            <button className="rounded-xl border border-primary-200 p-2.5 text-wellness-text lg:hidden" type="button">
                                <IconMenu2 size={20} />
                            </button>
                        </div>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-wellness-beige via-wellness-soft to-wellness-greige px-4 pb-20 pt-16 md:px-6 md:pt-20">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Pilates Studio Premium</p>
                            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">Move Better. Feel Stronger.</h1>
                            <p className="mt-6 max-w-xl text-base leading-relaxed text-wellness-muted md:text-lg">
                                Tingkatkan postur, kekuatan core, dan mobilitas melalui kelas pilates yang personal, elegan, dan menenangkan.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Button as={Link} href={route("welcome.page", "pricing")}>Coba Trial</Button>
                                <Button as={Link} href={route("welcome.page", "schedule")} variant="secondary">Lihat Jadwal</Button>
                            </div>

                            <div className="mt-10 flex flex-wrap gap-3">
                                {trustBadges.map((badge) => (
                                    <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm text-wellness-muted">
                                        <IconCheck size={14} className="text-primary-600" />
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden p-0">
                            <img
                                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"
                                alt="Pilates class"
                                className="h-full min-h-[420px] w-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Benefits"
                            title="Rasakan manfaat nyata di setiap sesi"
                            description="Program pilates kami dirancang untuk mendukung kualitas hidup yang lebih seimbang, kuat, dan mindful."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {benefits.map(({ icon: Icon, title, desc }) => (
                                <Card key={title}>
                                    <div className="mb-5 inline-flex rounded-2xl bg-primary-100 p-3 text-primary-600">
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="text-lg font-semibold">{title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-wellness-muted">{desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-wellness-soft px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Classes"
                            title="Pilihan kelas sesuai ritme Anda"
                            description="Mulai dari basic hingga sesi personal, semua kelas dipandu instruktur profesional bersertifikat."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                            {classTypes.map((item) => (
                                <Card key={item.title}>
                                    <h3 className="text-xl font-semibold">{item.title}</h3>
                                    <p className="mt-3 text-sm text-wellness-muted">{item.desc}</p>
                                    <div className="mt-6 flex flex-wrap gap-3 text-xs text-wellness-muted">
                                        <span className="rounded-full bg-primary-50 px-3 py-1.5">Durasi: {item.duration}</span>
                                        <span className="rounded-full bg-primary-50 px-3 py-1.5">Level: {item.level}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Schedule"
                            title="Preview jadwal mingguan"
                            description="Atur waktu latihan Anda dengan jadwal yang fleksibel untuk pagi dan malam."
                        />
                        <Card className="mt-10 p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-primary-50 text-wellness-text">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Hari</th>
                                            <th className="px-6 py-4 font-semibold">Pagi</th>
                                            <th className="px-6 py-4 font-semibold">Sore / Malam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleRows.map((row) => (
                                            <tr key={row.day} className="border-t border-primary-100 text-wellness-muted">
                                                <td className="px-6 py-4 font-medium text-wellness-text">{row.day}</td>
                                                <td className="px-6 py-4">{row.morning}</td>
                                                <td className="px-6 py-4">{row.evening}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </section>

                <section className="bg-wellness-soft px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Pricing"
                            title="Paket membership sederhana & transparan"
                            description="Pilih paket yang paling sesuai dengan gaya hidup dan target kebugaran Anda."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {prices.map((item) => (
                                <Card key={item.plan} className={item.popular ? "border-primary-500 ring-2 ring-primary-500/20" : ""}>
                                    {item.popular && (
                                        <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
                                    )}
                                    <h3 className="mt-4 text-xl font-semibold">{item.plan}</h3>
                                    <p className="mt-3 text-3xl font-semibold text-primary-600">{item.price}</p>
                                    <p className="mt-2 text-sm text-wellness-muted">{item.note}</p>
                                    <Button as={Link} href={route("welcome.page", "contact")} variant={item.popular ? "primary" : "secondary"} className="mt-6 w-full">
                                        Booking Kelas
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Trainers"
                            title="Dipandu instruktur berpengalaman"
                            description="Tim kami menghadirkan pendekatan personal agar setiap gerakan terasa aman, efektif, dan menyenangkan."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {trainers.map((trainer) => (
                                <Card key={trainer.name} className="text-center">
                                    <img
                                        src="https://images.unsplash.com/photo-1595079835353-fb3cf0f83f20?auto=format&fit=crop&w=500&q=80"
                                        alt={trainer.name}
                                        className="mx-auto h-44 w-full rounded-2xl object-cover"
                                    />
                                    <h3 className="mt-5 text-xl font-semibold">{trainer.name}</h3>
                                    <p className="mt-2 text-sm text-wellness-muted">{trainer.specialty}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-wellness-soft px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Testimonials"
                            title="Apa kata member kami"
                            description="Cerita pengalaman nyata dari member yang merasakan perubahan tubuh dan kualitas hidup."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {testimonials.map((item) => (
                                <Card key={item.name}>
                                    <p className="text-sm leading-relaxed text-wellness-muted">“{item.quote}”</p>
                                    <p className="mt-6 font-semibold">{item.name}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-5xl">
                        <SectionTitle
                            eyebrow="FAQ"
                            title="Pertanyaan yang sering diajukan"
                            description="Jika Anda masih ragu memulai, temukan jawaban singkatnya di sini."
                        />
                        <div className="mt-10 space-y-4">
                            {faqs.map((item) => (
                                <details key={item.q} className="rounded-3xl border border-primary-100 bg-white p-6">
                                    <summary className="cursor-pointer list-none text-base font-semibold text-wellness-text">
                                        {item.q}
                                    </summary>
                                    <p className="mt-3 text-sm leading-relaxed text-wellness-muted">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="bg-primary-600 px-4 py-14 text-primary-50 md:px-6">
                    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <p className="text-xl font-semibold text-white">ORO Pilates Studio</p>
                            <p className="mt-4 max-w-md text-sm text-primary-100">
                                Studio pilates modern untuk Anda yang ingin bergerak lebih baik, merasa lebih kuat, dan hidup lebih mindful.
                            </p>
                            <div className="mt-5 space-y-2 text-sm text-primary-100">
                                <p className="flex items-center gap-2"><IconMapPin size={16} /> Jl. Kemang Raya No. 25, Jakarta Selatan</p>
                                <p className="flex items-center gap-2"><IconClock size={16} /> Senin - Sabtu, 07:00 - 20:00</p>
                                <p className="flex items-center gap-2"><IconPhone size={16} /> +62 812-3456-7890</p>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-white">Quick Links</p>
                            <ul className="mt-4 space-y-2 text-sm text-primary-100">
                                {navItems.map((item) => (
                                    <li key={item.key}>
                                        <Link href={route("welcome.page", item.key)} className="hover:text-white">{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-semibold text-white">Follow Us</p>
                            <div className="mt-4 flex items-center gap-3">
                                <a href="#" className="rounded-xl border border-primary-400 p-2 hover:bg-primary-500">
                                    <IconBrandInstagram size={18} />
                                </a>
                                <a href="#" className="rounded-xl border border-primary-400 p-2 hover:bg-primary-500">
                                    <IconAward size={18} />
                                </a>
                                <a href="#" className="rounded-xl border border-primary-400 p-2 hover:bg-primary-500">
                                    <IconHeartHandshake size={18} />
                                </a>
                            </div>
                            <Button as={Link} href={route("welcome.page", "contact")} className="mt-6 w-full bg-white text-primary-700 hover:bg-primary-50">
                                Booking Kelas
                            </Button>
                        </div>
                    </div>
                    <div className="mx-auto mt-10 max-w-7xl border-t border-primary-500 pt-6 text-center text-sm text-primary-100">
                        © {new Date().getFullYear()} ORO Pilates Studio. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
