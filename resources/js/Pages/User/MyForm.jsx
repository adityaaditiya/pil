import { Head, useForm, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Landing/Navbar";

export default function MyForm({ questions = [] }) {
    const { errors, flash } = usePage().props;

    const initialAnswers = questions.reduce((acc, question) => {
        acc[question.id] = question.answer ?? (question.input_type === "checkbox" ? [] : "");
        return acc;
    }, {});

    const { data, setData, put, processing } = useForm({ answers: initialAnswers });

    const submit = (event) => {
        event.preventDefault();
        put(route("user.my-form.update"));
    };

    const onCheckboxChange = (questionId, option, checked) => {
        const current = data.answers[questionId] || [];
        const next = checked ? [...current, option] : current.filter((item) => item !== option);

        setData("answers", {
            ...data.answers,
            [questionId]: next,
        });
    };

    return (
        <>
            <Head title="My Form" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <section className="mx-auto max-w-4xl px-4 py-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold md:text-4xl">My Form</h1>
                        <p className="mt-2 text-sm text-wellness-muted">Lengkapi data kuesioner pelanggan Anda di halaman ini.</p>
                    </div>

                    <form onSubmit={submit} className="rounded-3xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
                        {flash?.success && (
                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {flash.success}
                            </div>
                        )}

                        {questions.length === 0 ? (
                            <p className="text-sm text-slate-600">Belum ada pertanyaan kuesioner dari studio.</p>
                        ) : (
                            <div className="space-y-6">
                                {questions.map((question, index) => (
                                    <div key={question.id}>
                                        <label className="mb-2 block text-sm font-medium text-slate-800">
                                            {index + 1}. {question.question_text}{" "}
                                            {question.is_required && <span className="text-danger-500">*</span>}
                                        </label>

                                        {question.input_type === "text" && (
                                            <textarea
                                                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                                value={data.answers[question.id] || ""}
                                                onChange={(event) =>
                                                    setData("answers", {
                                                        ...data.answers,
                                                        [question.id]: event.target.value,
                                                    })
                                                }
                                            />
                                        )}

                                        {question.input_type === "multiple_choice" && (
                                            <select
                                                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                                value={data.answers[question.id] || ""}
                                                onChange={(event) =>
                                                    setData("answers", {
                                                        ...data.answers,
                                                        [question.id]: event.target.value,
                                                    })
                                                }
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
                                            <div className="space-y-2">
                                                {question.options.map((option) => (
                                                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={(data.answers[question.id] || []).includes(option)}
                                                            onChange={(event) =>
                                                                onCheckboxChange(question.id, option, event.target.checked)
                                                            }
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
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || questions.length === 0}
                                className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Simpan Form
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}
