import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconAward,
    IconCheck,
    IconClock,
    IconFlower,
    IconHeartHandshake,
    IconBrandInstagram,
    IconMapPin,
    IconPhone,
    IconShieldCheck,
    IconSparkles,
    IconStretching,
    IconYoga,
} from "@tabler/icons-react";
import Button from "@/Components/Landing/Button";
import Card from "@/Components/Landing/Card";
import SectionTitle from "@/Components/Landing/SectionTitle";
import Navbar from "@/Components/Landing/Navbar";
import { getImageUrl } from "@/Utils/imageUrl";

export default function Welcome() {
    const { auth, trainers = [], membershipPlans = [], landingPageSetting = {} } = usePage().props;

    const trustBadges = ["Certified Trainers", "Small Group", "Beginner Friendly"];

    const navItems = [
        { name: "Home", key: "home" },
        { name: "About", key: "about" },
        { name: "Classes", key: "classes" },
        { name: "Schedule", key: "schedule" },
        { name: "Pricing", key: "pricing" },
        { name: "Trainer", key: "trainer" },
        { name: "Appointment", key: "appointment" },
        { name: "Contact", key: "contact" },
    ];

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


    const appointmentFlow = [
        {
            step: "01",
            title: "Pilih Kategori / Layanan",
            desc: "User memilih jenis latihan seperti Private Class, Duet Private, atau Group Class sesuai kebutuhan.",
        },
        {
            step: "02",
            title: "Pilih Trainer",
            desc: "User dapat memilih trainer spesifik atau opsi \"Siapa Saja\" untuk trainer yang tersedia.",
        },
        {
            step: "03",
            title: "Pilih Tanggal & Jam",
            desc: "Sistem menampilkan kalender dan hanya menampilkan jam ketika trainer yang dipilih sedang tidak bertugas.",
        },
        {
            step: "04",
            title: "Konfirmasi & Checkout",
            desc: "User meninjau ringkasan sesi, jam, dan harga lalu melanjutkan pembayaran menggunakan Credits Membership atau payment gateway drop-in.",
        },
    ];


    const heroBackgroundImage = getImageUrl(
        landingPageSetting?.hero_background_image,
        "landing-page",
    );
    const scheduleBackgroundImage = getImageUrl(
        landingPageSetting?.schedule_background_image,
        "landing-page",
    );
    const classesBackgroundImage = getImageUrl(
        landingPageSetting?.classes_background_image,
        "landing-page",
    );

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
            a: "Pembatalan dapat dilakukan maksimal 1 Hari sebelum kelas. Lebih dari itu tidak dapat refund, paket lain mengikuti syarat member.",
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
                    30% Off Class this week — Slot terbatas, reservasi sekarang.
                </div>

                <Navbar navItems={navItems} currentKey="home" />

                <section className="bg-gradient-to-br from-wellness-beige via-wellness-soft to-wellness-greige px-4 pb-20 pt-16 md:px-6 md:pt-20">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Pilates Studio Premium</p>
                            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">Move Better. Feel Stronger.</h1>
                            <p className="mt-6 max-w-xl text-base leading-relaxed text-wellness-muted md:text-lg">
                                Tingkatkan postur, kekuatan core, dan mobilitas melalui kelas pilates yang personal, elegan, dan menenangkan.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Button as={Link} href={route("welcome.page", "classes")}>Book A Class</Button>
                                <Button as={Link} href={route("welcome.page", "pricing")} variant="secondary">Lihat Penawaran!</Button>
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
                                src={heroBackgroundImage}
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


                {/* Hapus px-4 dan md:px-6 di sini */}
                <section className="py-10"> 
                    <div className="relative h-[100vh] w-full">
                            <SectionTitle
                                eyebrow="Classes"
                                title="Pilihan kelas sesuai ritme Anda"
                                description="Mulai dari basic hingga sesi personal, semua kelas dipandu instruktur profesional bersertifikat."
                            />
                            <br />
                        <div className="relative h-[100vh] w-full">
                            {/* Gambar Background */}
                            <img 
                                src={classesBackgroundImage} 
                                alt="Pilates class" 
                                className="absolute inset-0 h-full w-full object-cover" 
                            />
                        
                            {/* Overlay Konten */}
                            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 md:p-16">
                                
                                {/* Container untuk teks agar tetap rapi di tengah/kiri sesuai layout website */}
                                <div className="container mx-auto px-4 md:px-6">
                                    <div className="max-w-xl text-left">
                                        <h1 className="text-white text-xl md:text-4xl ">
                                            Latihan Pilates yang Menenangkan
                                        </h1>
                            
                                        <div className="mt-6 flex flex-col md:flex-row gap-3">
                                            <Button as={Link} href={route("welcome.page", "classes")}>Find Your Class</Button>
                                            <Link 
                                            href={route("welcome.page", "schedule")} 
                                            className="flex items-center justify-center inline-block border border-white text-white px-6 py-2 rounded-full text-sm hover:bg-gray-500"
                                            >
                                            Book An Appointment
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <section className="bg-wellness-soft px-4 py-20 md:px-6">
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
                </section> */}
                <br />
                <section className="py-20 mt-20">
                    <div className="relative h-[100vh] w-full">
                        <SectionTitle
                            eyebrow="Schedule"
                            title="Preview jadwal mingguan"
                            description="Atur waktu latihan Anda dengan jadwal yang fleksibel untuk pagi dan malam."
                        />
                        
                {/* Hapus px-4 dan md:px-6 di sini */}
                <section className="mt-18 bg-wellness-soft"> 
                <div className="relative h-[100vh] w-full">
                    {/* Gambar Background */}
                    <img 
                    src={scheduleBackgroundImage} 
                    alt="Pilates class" 
                    className="absolute inset-0 h-full w-full object-cover" 
                    />
                    
                    {/* Overlay Konten */}
                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 md:p-16">
                    {/* Container untuk teks agar tetap rapi di tengah/kiri sesuai layout website */}
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-xl text-left">
                        <h1 className="text-white text-xl md:text-2xl ">
                            Jadwal mingguan yang fleksibel untuk pagi dan malam
                        </h1>
                        
                        <div className="mt-6 flex flex-col md:flex-row gap-3">
                            
                            <Link 
                                href={route("welcome.page", "schedule")} 
                                className="inline-block border border-white text-white px-6 py-2 rounded-full text-sm hover:bg-gray-500 text-center"
                            >
                                View More
                            </Link>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                    </div>
                </section>

                            {/* <Card className="mt-10 p-0 overflow-hidden">
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
                        </Card> */} 

                <section className="mt-18 bg-wellness-soft px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Pricing"
                            title="Paket membership sederhana & transparan"
                            description="Pilih paket yang paling sesuai dengan gaya hidup dan target kebugaran Anda."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {membershipPlans.slice(0, 4).map((item) => {
                                const isMostPopular = item.tag === "Most Popular";

                                return (
                                <Card
                                    key={item.id}
                                    className={`flex flex-col h-full ${
                                        isMostPopular 
                                        ? "border-2 border-primary-600 ring-2 ring-primary-500/20" 
                                        : "border border-primary-100"
                                    }`}
                                >
                                    {/* Konten Atas */}
                                    <div>
                                        {item.tag && (
                                            <span className="inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                                                {item.tag}
                                            </span>
                                        )}
                                        
                                        {/* TAMBAHKAN min-h DI SINI (Contoh: min-h-[56px] untuk 2 baris teks) */}
                                        <div className="min-h-[60px] flex items-center">
                                            <h3 className="mt-2 text-xl font-semibold leading-tight">{item.name}</h3>
                                        </div>

                                        {/* Harga sekarang akan selalu sejajar karena judul di atasnya punya tinggi tetap */}
                                        <p className="mt-1 text-3xl font-semibold text-primary-600">
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(item.price || 0))}
                                        </p>
                                    </div>

                                    {/* Area Tengah (Deskripsi) */}
                                    <div className="flex-1 mt-2">
                                        <p className="text-sm text-wellness-muted whitespace-pre-line">
                                            {item.description || "Benefit membership akan tampil di sini."}
                                        </p>
                                    </div>

                                    {/* Tombol */}
                                    <div className="mt-3">
                                        <Button
                                            as={Link}
                                            href={auth?.user ? route("welcome.membership-detail", item.id) : route("login", { redirect: route("welcome.membership-detail", item.id, false) })}
                                            variant={isMostPopular ? "primary" : "secondary"}
                                            className={`${
                                                isMostPopular 
                                                ? "w-full bg-primary-600 hover:bg-primary-700 text-white" 
                                                : "w-full border-primary-600 text-primary-700 hover:bg-primary-50"
                                            } py-2.5 text-sm font-semibold`} 
                                        >
                                            Buy Now
                                        </Button>
                                    </div>
                                </Card>
                                );
                            })}
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
                                        src={trainer.photo ? `/storage/trainers/${trainer.photo}` : "https://images.unsplash.com/photo-1595079835353-fb3cf0f83f20?auto=format&fit=crop&w=500&q=80"}
                                        alt={trainer.name}
                                        className="mx-auto h-64 w-full rounded-2xl object-cover"
                                    />
                                    <h3 className="mt-5 text-xl font-semibold">{trainer.name}</h3>
                                    <p className="mt-2 text-sm text-wellness-muted">{trainer.expertise || "Spesialisasi trainer belum diisi."}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-wellness-soft px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-7xl">
                        <SectionTitle
                            eyebrow="Appointment"
                            title="Rancangan alur appointment yang mudah diikuti"
                            description="Flow booking dirancang singkat, jelas, dan fleksibel agar user cepat menyelesaikan reservasi sesi."
                        />
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {appointmentFlow.map((item) => (
                                <Card key={item.step} className="border border-primary-100">
                                    <div className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary-700">
                                        Step {item.step}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-wellness-text">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-wellness-muted">{item.desc}</p>
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
                                <p className="flex items-center gap-2"><IconMapPin size={16} /> Jl. Layur No. 08, Kota Tegal</p>
                                <p className="flex items-center gap-2"><IconClock size={16} /> Senin - Sabtu, 07:00 - 20:00</p>
                                <p className="flex items-center gap-2"><IconPhone size={16} /> +62 823-2692-3196</p>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-white">Quick Links</p>
                            <ul className="mt-4 space-y-2 text-sm text-primary-100">
                                {navItems.map((item) => (
                                    <li key={item.key}>
                                        <Link href={item.key === "home" ? route("welcome") : route("welcome.page", item.key)} className="hover:text-white">{item.name}</Link>
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
                            <Button as={Link} href={route("welcome.page", "classes")} className="mt-6 w-full bg-primary-500 text-white hover:bg-primary-700">
                                Book A Class
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
