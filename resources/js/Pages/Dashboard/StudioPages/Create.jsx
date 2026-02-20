import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";

export default function Create() {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({ name: "", key: "", title: "", content: "" });

    const submit = (e) => {
        e.preventDefault();
        post(route("studio-pages.store"));
    };

    return (
        <>
            <Head title="Tambah Halaman Welcome" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Tambah Halaman Welcome</h1>
            <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Input label="Nama Menu" value={data.name} onChange={(e) => setData("name", e.target.value)} errors={errors.name} placeholder="Home" />
                <Input label="Key" value={data.key} onChange={(e) => setData("key", e.target.value)} errors={errors.key} placeholder="home" />
                <Input label="Judul Halaman" value={data.title} onChange={(e) => setData("title", e.target.value)} errors={errors.title} placeholder="Welcome to ORO Pilates" />
                <Textarea label="Konten" value={data.content} onChange={(e) => setData("content", e.target.value)} errors={errors.content} rows={6} />
                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="rounded-xl bg-primary-500 px-4 py-2 text-white">Simpan</button>
                    <Link href={route("studio-pages.index")} className="rounded-xl border border-slate-300 px-4 py-2">Batal</Link>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
