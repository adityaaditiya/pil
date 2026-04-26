import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";
import Navbar from "@/Components/Landing/Navbar";
import {
    IconArrowLeft,
    IconClock,
    IconUser,
    IconStar,
    IconYoga,
    IconTrash,
} from "@tabler/icons-react";

const imageUrl = (folder, file) => (file ? `/storage/${folder}/${file}` : null);

const formatDate = (date) =>
    date ? new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
          }).format(new Date(date)) : "-";

const formatTime = (date) =>
    date ? new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date)) : "-";

export default function WelcomeScheduleDetail({ schedule, requiredQuestionnaire }) {
    const { auth, errors } = usePage().props;
    const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

    const questionnaireQuestions = requiredQuestionnaire?.questions ?? [];
    const shouldShowQuestionnaire = Boolean(requiredQuestionnaire?.should_show) && questionnaireQuestions.length > 0;

    // Inisialisasi answers
    const initialAnswers = useMemo(() =>
        questionnaireQuestions.reduce((acc, question) => {
            acc[question.id] = question.input_type === "checkbox" ? [] : "";
            return acc;
        }, {}),
    [questionnaireQuestions]);

    const { data, setData, post, processing } = useForm({ answers: initialAnswers });

    // Efek untuk menangani pertanyaan baru yang ditambahkan Admin secara dinamis
    useEffect(() => {
        const updatedAnswers = { ...data.answers };
        let hasChanges = false;

        questionnaireQuestions.forEach((q) => {
            if (!(q.id in updatedAnswers)) {
                updatedAnswers[q.id] = q.input_type === "checkbox" ? [] : "";
                hasChanges = true;
            }
        });

        if (hasChanges) setData("answers", updatedAnswers);
    }, [questionnaireQuestions]);

    const onCheckboxChange = (questionId, option, checked) => {
        const current = data.answers[questionId] || [];
        const next = checked ? [...current, option] : current.filter((item) => item !== option);
        setData("answers", { ...data.answers, [questionId]: next });
    };

    const onConfirmBookingClick = () => {
        if (!auth?.user) {
            window.location.href = route("login");
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
        post(route("welcome.schedule-questionnaire.submit", schedule.id), {
            onSuccess: () => {
                setIsQuestionnaireOpen(false);
                // Redirect otomatis ke halaman pembayaran setelah sukses
                window.location.href = route("welcome.schedule-payment", schedule.id);
            },
        });
    };

    const scheduleRows = [
        { label: "Class Name", value: schedule.pilates_class?.name || "-" },
        { label: "Category", value: schedule.pilates_class?.class_category?.name || "-" },
        { label: "Date", value: formatDate(schedule.start_at) },
        { label: "Time", value: `${formatTime(schedule.start_at)} WIB` },
        { label: "Duration", value: `${schedule.duration_minutes} menit` },
        { label: "Equipment", value: <div className="whitespace-pre-line">{schedule.pilates_class?.equipment || "-"}</div> },
        { label: "Capacity", value: `${schedule.capacity} peserta` },
    ];

    return (
        <>
            <Head title={`${schedule.pilates_class?.name || "Schedule"} | Detail`} />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey="schedule" />

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <Link href={route("welcome.page", "schedule")} className="mb-6 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Schedule
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Book this class</h2>
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {scheduleRows.map((row) => (
                                                <tr key={row.label} className="border-b border-slate-100 last:border-none">
                                                    <td className="w-44 bg-slate-50 px-4 py-3 font-medium text-slate-700">{row.label}</td>
                                                    <td className="px-4 py-3 text-slate-700">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold">Instructor</h2>
                                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                                    <div className="inline-flex items-center gap-2 font-semibold">
                                        <IconUser size={16} /> {schedule.trainer?.name || "-"}
                                    </div>
                                    <p className="mt-1 text-sm text-wellness-muted">{schedule.trainer?.expertise}</p>
                                </div>
                            </div>
                        </aside>

                        <article className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                            <img
                                src={imageUrl("classes", schedule.pilates_class?.image)}
                                alt={schedule.pilates_class?.name}
                                className="h-72 w-full object-cover md:h-96"
                            />
                            <div className="space-y-4 p-6 md:p-8">
                                <h1 className="text-3xl font-bold">{schedule.pilates_class?.name}</h1>
                                <p className="text-wellness-muted text-justify">{schedule.pilates_class?.about}</p>
                                <button
                                    onClick={onConfirmBookingClick}
                                    className="w-full rounded-full bg-primary-600 py-4 text-center font-bold text-white transition hover:bg-primary-700"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            {/* MODAL KUESIONER */}
            {isQuestionnaireOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        {/* Container Utama Modal - Kita batasi max-height-nya agar tidak melebihi layar */}
        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            
            {/* HEADER - Tetap di atas */}
            <div className="p-8 pb-4">
                <h2 className="text-2xl font-bold">Lengkapi Profil Latihan</h2>
                <p className="mt-2 text-slate-500 text-sm">Informasi ini membantu kami menyesuaikan sesi dengan kondisi Anda.</p>
            </div>

            {/* FORM BODY - Bagian yang bisa di-scroll */}
            <form onSubmit={submitQuestionnaire} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-2 space-y-5 custom-scrollbar">
                    {questionnaireQuestions.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                {index + 1}. {question.question_text} {question.is_required && <span className="text-red-500">*</span>}
                            </label>

                            {question.input_type === "text" && (
                                <textarea
                                    required={question.is_required}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:ring-primary-500"
                                    value={data.answers[question.id] || ""}
                                    onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                                />
                            )}

                            {question.input_type === "multiple_choice" && (
                                <select
                                    required={question.is_required}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm"
                                    value={data.answers[question.id] || ""}
                                    onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                                >
                                    <option value="">Pilih jawaban...</option>
                                    {question.options?.map((opt, i) => (
                                        <option key={`${question.id}-opt-${i}`} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}

                            {question.input_type === "checkbox" && (
                                <div className="grid grid-cols-2 gap-2">
                                    {question.options?.map((opt, i) => (
                                        <label key={`${question.id}-chk-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-100 p-3 text-sm hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(data.answers[question.id] || []).includes(opt)}
                                                onChange={(e) => onCheckboxChange(question.id, opt, e.target.checked)}
                                                className="rounded text-primary-600"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {errors[`answers.${question.id}`] && <p className="text-xs text-red-500">{errors[`answers.${question.id}`]}</p>}
                        </div>
                    ))}
                </div>

                {/* FOOTER - Tetap di bawah dengan bayangan tipis agar terlihat terpisah */}
                <div className="p-8 pt-4 border-t border-slate-100 flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsQuestionnaireOpen(false)} 
                        className="flex-1 rounded-full py-3 font-semibold text-slate-500 hover:bg-slate-50 transition"
                    >
                        Nanti saja
                    </button>
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="flex-[2] rounded-full bg-primary-600 py-3 font-bold text-white shadow-lg shadow-primary-100 transition hover:bg-primary-700 disabled:opacity-50"
                    >
                        {processing ? "Memproses..." : "Simpan data"}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
        </>
    );
}