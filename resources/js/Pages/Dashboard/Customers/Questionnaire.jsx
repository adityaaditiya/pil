import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Questionnaire({ customer, questions }) {
    const { errors } = usePage().props;

    const initialAnswers = questions.reduce((acc, question) => {
        acc[question.id] = question.answer ?? (question.input_type === "checkbox" ? [] : "");
        return acc;
    }, {});

    const { data, setData, put, processing } = useForm({ answers: initialAnswers });

    const submit = (e) => {
        e.preventDefault();
        put(route("customers.questionnaire.update", customer.id));
    };

    const onCheckboxChange = (questionId, option, checked) => {
        const current = data.answers[questionId] || [];
        const next = checked ? [...current, option] : current.filter((item) => item !== option);
        setData("answers", { ...data.answers, [questionId]: next });
    };

    return (
        <>
            <Head title={`Kuesioner ${customer.name}`} />
            <form onSubmit={submit} className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <h1 className="text-xl font-semibold">Kuesioner - {customer.name}</h1>
                {questions.length === 0 && <p>Belum ada pertanyaan. Silakan tambah di menu Kelola Kuesioner.</p>}
                {questions.map((question, index) => (
                    <div key={question.id}>
                        <label className="block text-sm font-medium mb-2">
                            {index + 1}. {question.question_text} {question.is_required && <span className="text-danger-500">*</span>}
                        </label>

                        {question.input_type === "text" && (
                            <textarea
                                className="w-full border rounded-xl p-3"
                                value={data.answers[question.id] || ""}
                                onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                            />
                        )}

                        {question.input_type === "multiple_choice" && (
                            <select
                                className="w-full border rounded-xl p-3"
                                value={data.answers[question.id] || ""}
                                onChange={(e) => setData("answers", { ...data.answers, [question.id]: e.target.value })}
                            >
                                <option value="">Pilih jawaban</option>
                                {question.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}

                        {question.input_type === "checkbox" && (
                            <div className="space-y-2">
                                {question.options.map((option) => (
                                    <label key={option} className="flex items-center gap-2">
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
                            <small className="text-danger-500">{errors[`answers.${question.id}`] || errors[`answers.${question.id}.*`]}</small>
                        )}
                    </div>
                ))}
                <div className="flex justify-end gap-3">
                    <Link href={route("customers.index")} className="px-4 py-2 rounded-xl border">Kembali</Link>
                    <button disabled={processing} className="px-4 py-2 rounded-xl bg-primary-500 text-white">Simpan Jawaban</button>
                </div>
            </form>
        </>
    );
}

Questionnaire.layout = (page) => <DashboardLayout children={page} />;
