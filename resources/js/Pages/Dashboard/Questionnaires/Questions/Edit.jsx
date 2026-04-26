import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ question }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing } = useForm({
        question_text: question.question_text,
        input_type: question.input_type,
        is_required: question.is_required,
        options: question.options?.length ? question.options : ["", ""],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("questions.update", question.id));
    };

    return (
        <>
            <Head title="Edit Pertanyaan" />
            <form onSubmit={submit} className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <Form data={data} setData={setData} errors={errors} />
                <div className="flex justify-end gap-3 mt-6">
                    <Link href={route("questions.index")} className="px-4 py-2 rounded-xl border">Batal</Link>
                    <button disabled={processing} className="px-4 py-2 rounded-xl bg-primary-500 text-white">Update</button>
                </div>
            </form>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
