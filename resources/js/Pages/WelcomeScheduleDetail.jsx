import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconArrowLeft,
    IconClock,
    IconMapPin,
    IconStar,
    IconUser,
    IconYoga,
} from "@tabler/icons-react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);
const formatDate = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
          }).format(new Date(date))
        : "-";

const formatTime = (date) =>
    date
        ? new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date))
        : "-";

export default function WelcomeScheduleDetail({ schedule, requiredQuestionnaire }) {
    const { auth, errors } = usePage().props;
    const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
    const questionnaireQuestions = requiredQuestionnaire?.questions ?? [];
    const shouldShowQuestionnaire = Boolean(requiredQuestionnaire?.should_show) && questionnaireQuestions.length > 0;
    const initialAnswers = useMemo(
        () =>
            questionnaireQuestions.reduce((acc, question) => {
                acc[question.id] = question.input_type === "checkbox" ? [] : "";
                return acc;
            }, {}),
        [questionnaireQuestions]
    );
    const { data, setData, post, processing } = useForm({ answers: initialAnswers });

    const onCheckboxChange = (questionId, option, checked) => {
        const current = data.answers[questionId] || [];
        const next = checked ? [...current, option] : current.filter((item) => item !== option);
        setData("answers", { ...data.answers, [questionId]: next });
    };

    const onConfirmBookingClick = () => {
        if (!auth?.user) {
            window.location.href = route("welcome.schedule-payment", schedule.id);
            return;
        }

        if (!shouldShowQuestionnaire) {
            window.location.href = route("welcome.schedule-payment", schedule.id);
            return;
        }

        setIsQuestionnaireOpen(true);
    };

    const submitQuestionnaire = (event) => {
        event.preventDefault();
        post(route("welcome.schedule-questionnaire.submit", schedule.id));
    };

    const scheduleRows = [
        // { label: "ID Schedule", value: schedule.id },
        { label: "Class Name", value: schedule.pilates_class?.name || "-" },
        { label: "Category", value: schedule.pilates_class?.class_category?.name || "-" },
        // { label: "Trainer", value: schedule.trainer?.name || "-" },
        { label: "Date", value: formatDate(schedule.start_at) },
        { label: "Time", value: `${formatTime(schedule.start_at)} WIB` },
        { label: "Duration", value: `${schedule.pilates_class?.duration || schedule.duration_minutes || 0} menit` },
        {
  label: "Equipment",
  value: (
    <div className="whitespace-pre-line">
      {schedule.pilates_class?.equipment || "-"}
    </div>
  )
},
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
                <Navbar currentKey="schedule" />

                <section className="mx-auto max-w-6xl px-4 py-10">
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

                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm whitespace-pre-line">
                                <h2 className="text-xl font-semibold">Instructor</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                    <div className="inline-flex items-center gap-2 font-semibold">
                                        <IconUser size={16} /> {schedule.trainer?.name || "-"} |
                                        <p className="whitespace-pre-line text-sm text-wellness-muted">
                                            {schedule.trainer?.expertise || "Spesialisasi trainer belum diisi."}
                                        </p>
                                    </div>
                                    {/* <p className="mt-2 text-sm text-wellness-muted">
                                        {schedule.trainer?.gender || "-"}
                                    </p> */}
                                    {/* <p className="mt-1 inline-flex items-start gap-2 text-sm text-wellness-muted">
                                        <IconMapPin size={14} className="mt-0.5" />
                                        {schedule.trainer?.address || "-"}
                                    </p> */}
                                    <p className="mt-2 text-sm text-wellness-muted">
                                        {schedule.trainer?.biodata || "Biodata trainer belum diisi."}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm whitespace-pre-line">
                                <h2 className="text-xl font-semibold">Ketentuan Pembatalan</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                <p className="text-sm text-wellness-muted whitespace-pre-line text-justify">
                                Demi kenyamanan bersama, kami sangat menghargai kerja sama Anda untuk tidak melakukan pembatalan mendadak agar jadwal kelas tetap berjalan efektif.
                                </p>
                                <p className="mt-2 text-sm text-wellness-muted whitespace-pre-line text-justify">
                                Catatan: Pengembalian kredit/saldo hanya berlaku untuk pembatalan yang dilakukan maksimal 24 jam sebelum sesi dimulai. Pembatalan setelah melewati batas waktu tersebut akan dianggap hangus.
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
                                        {schedule.duration_minutes} menit
                                    </p>
                                &nbsp;
                                <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        <IconUser size={16} />
                                        {schedule.capacity}  peserta
                                    </p>

                                <h1 className="text-3xl font-bold md:text-4xl">
                                    {schedule.pilates_class?.name || "Detail Schedule"}
                                </h1>

                                <p className="text-wellness-muted text-justify">
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

                                
                                <link rel="stylesheet" href="https://maps.app.goo.gl/hHjRXS5fa6ezSBa96" />
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.267416072759!2d109.13153807480896!3d-6.858518693139926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fb73855438ee5%3A0x9a72d2d730a422fc!2sOro%20Padel%20Tegal!5e0!3m2!1sid!2sid!4v1773433907949!5m2!1sid!2sid"
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                <p className="text-sm text-wellness-muted text-justify">
                                    Getting there:  
                                    Jl. Layur No.8, Tegalsari, Kec. Tegal Bar., Kota Tegal, Jawa Tengah 52111
                                </p>
                                <button
                                    type="button"
                                    onClick={onConfirmBookingClick}
                                    className="inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            {isQuestionnaireOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-semibold">Lengkapi Kuesioner Wajib</h2>
                        <p className="mt-1 text-sm text-wellness-muted">
                            Sebelum melanjutkan booking, isi pertanyaan wajib berikut.
                        </p>

                        <form onSubmit={submitQuestionnaire} className="mt-5 space-y-4">
                            {questionnaireQuestions.map((question, index) => (
                                <div key={question.id}>
                                    <label className="mb-2 block text-sm font-medium text-slate-800">
                                        {index + 1}. {question.question_text} <span className="text-danger-500">*</span>
                                    </label>

                                    {question.input_type === "text" && (
                                        <textarea
                                            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                                            value={data.answers[question.id] || ""}
                                            onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                                        />
                                    )}

                                    {question.input_type === "multiple_choice" && (
                                        <select
                                            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                                            value={data.answers[question.id] || ""}
                                            onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                                        >
                                            <option value="">Pilih jawaban</option>
                                            {question.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {question.input_type === "checkbox" && (
                                        <div className="space-y-2 rounded-xl border border-slate-300 p-3">
                                            {question.options.map((option) => (
                                                <label key={option} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={(data.answers[question.id] || []).includes(option)}
                                                        onChange={(e) => onCheckboxChange(question.id, option, e.target.checked)}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {(errors[`answers.${question.id}`] || errors[`answers.${question.id}.*`]) && (
                                        <small className="text-danger-500">
                                            {errors[`answers.${question.id}`] || errors[`answers.${question.id}.*`]}
                                        </small>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    className="rounded-full border border-slate-300 px-4 py-2 text-sm"
                                    onClick={() => setIsQuestionnaireOpen(false)}
                                >
                                    Nanti saja
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    Simpan & Lanjut Bayar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
