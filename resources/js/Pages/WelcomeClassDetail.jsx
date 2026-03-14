import { Head, Link } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconClock,
    IconMapPin,
    IconStar,
    IconUser,
} from "@tabler/icons-react";
import Navbar from "@/Components/Landing/Navbar";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);
export default function WelcomeClassDetail({ classItem, menuItems = [] }) {
    const detailRows = [
        { label: "Claesses Name", value: classItem.name || "-" },
        { label: "Classes Category", value: classItem.class_category?.name || "-" },
        { label: "Difficulty Level", value: classItem.difficulty_level || "-" },
        { label: "Duration", value: classItem.duration ? `${classItem.duration} menit` : "-" },
        // { label: "Slot", value: classItem.slot ?? "-" },
        // { label: "Credit", value: classItem.credit ?? "-" },
        // { label: "Harga", value: formatRupiah(classItem.price) },
        // { label: "Jadwal Default", value: formatDateTime(classItem.scheduled_at) },
        // { label: "About Classes", value: classItem.about || "-" },
        {
  label: "What you will need",
  value: (
    <div className="whitespace-pre-line">
      {classItem.equipment || "-"}
    </div>
  )
},
        // { label: "What you will need", value: classItem.equipment || "-" },
        // { label: "Created At", value: formatDateTime(classItem.created_at) },
        // { label: "Updated At", value: formatDateTime(classItem.updated_at) },
    ];

    return (
        <>
            <Head title={`${classItem.name} | Detail Kelas`} />
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar navItems={[{ name: "Home", key: "home" }, ...menuItems.filter((item) => item.key !== "home")]} currentKey="classes" />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <Link href={route("welcome.page", "classes")} className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Daftar Kelas
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                        <article className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                            {classItem.image ? (
                                <img src={imageUrl("classes", classItem.image)} alt={classItem.name} className="h-72 w-full object-cover md:h-96" />
                            ) : (
                                <div className="flex h-72 items-center justify-center bg-primary-50 text-primary-700 md:h-96">Gambar kelas belum tersedia.</div>
                            )}
                            <div className="space-y-4 p-6 md:p-8">
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                    <IconStar size={14} /> {classItem.difficulty_level || "Open to all"}
                                </p> &nbsp;
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"><IconClock size={16} /> Durasi {classItem.duration || "-"} menit</p>
                                <h1 className="text-3xl font-bold md:text-4xl">{classItem.name}</h1>
                                <p className="text-wellness-muted text-justify">{classItem.about || "Kelas ini dirancang untuk membantu progres latihan pilates Anda secara konsisten."}</p>
                                <div className="grid gap-3 text-sm text-wellness-muted sm:grid-cols-2">
                                    
                                    {/* <p className="inline-flex items-center gap-2"><IconCreditCard size={16} /> Credit {classItem.credit ?? "-"}</p>
                                    <p className="inline-flex items-center gap-2"><IconUsers size={16} /> Slot {classItem.slot ?? "-"} peserta</p>
                                    <p className="inline-flex items-center gap-2"><IconCalendarEvent size={16} /> Default: {formatDateTime(classItem.scheduled_at)}</p> */}
                                </div>
                                {/* <div className="rounded-2xl bg-primary-50 p-4 text-primary-700">
                                    <p className="text-sm">Harga kelas</p>
                                    <p className="text-2xl font-bold">{formatRupiah(classItem.price)}</p>
                                </div> */}
                                <Link
                                    href={route("welcome.page", { key: "schedule", class_name: classItem.name })}
                                    className="inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </article>

                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Detail Class</h2>
                                {/* <p className="mt-1 text-sm text-wellness-muted">Seluruh data utama kelas ditampilkan berikut ini.</p> */}
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {detailRows.map((row) => (
                                                <tr key={row.label} className="border-b border-slate-100 last:border-none">
                                                    <td className="w-40 bg-slate-50 px-4 py-3 font-medium text-slate-700">{row.label}</td>
                                                    <td className="px-4 py-3 text-slate-700">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Instructor</h2>
                                <div className="mt-4 space-y-3">
                                    {(classItem.trainers || []).length === 0 && (
                                        <p className="text-sm text-wellness-muted">Belum ada trainer terdaftar untuk kelas ini.</p>
                                    )}
                                    {(classItem.trainers || []).map((trainer) => (
                                        <div key={trainer.id} className="rounded-2xl border border-slate-200 p-4">
                                            <p className="inline-flex items-center gap-2 font-semibold"><IconUser size={16} /> {trainer.name}</p>
                                            <p className="mt-2 text-sm text-wellness-muted">{trainer.gender || "-"}</p>
                                            <p className="mt-1 inline-flex items-start gap-2 text-sm text-wellness-muted"><IconMapPin size={14} className="mt-0.5" /> {trainer.address || "-"}</p>
                                            <p className="mt-2 text-sm text-wellness-muted whitespace-pre-line">{trainer.biodata || "Biodata trainer belum diisi."}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}
