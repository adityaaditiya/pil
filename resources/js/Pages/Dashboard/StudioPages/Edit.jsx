import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";

const imageKeys = ["home", "classes", "schedule"];

export default function Edit({ studioPage }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing } = useForm({
        name: studioPage.name,
        key: studioPage.key,
        title: studioPage.title,
        content: studioPage.content,
        image: null,
        remove_image: false,
    });

    const shouldShowImageField = imageKeys.includes(data.key);
    const currentImage = useMemo(() => {
        if (data.image instanceof File) {
            return URL.createObjectURL(data.image);
        }

        if (!data.remove_image && studioPage.image) {
            return `/storage/${studioPage.image}`;
        }

        return null;
    }, [data.image, data.remove_image, studioPage.image]);

    const submit = (e) => {
        e.preventDefault();
        put(route("studio-pages.update", studioPage.id), { forceFormData: true });
    };

    return (
        <>
            <Head title="Edit Halaman Welcome" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Edit Halaman Welcome</h1>
            <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <Input label="Nama Menu" value={data.name} onChange={(e) => setData("name", e.target.value)} errors={errors.name} />
                <Input label="Key" value={data.key} onChange={(e) => setData("key", e.target.value)} errors={errors.key} />
                <Input label="Judul Halaman" value={data.title} onChange={(e) => setData("title", e.target.value)} errors={errors.title} />
                <Textarea label="Konten" value={data.content} onChange={(e) => setData("content", e.target.value)} errors={errors.content} rows={6} />

                {shouldShowImageField && (
                    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Gambar Section</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dipakai untuk section Welcome, SectionTitle Classes, dan SectionTitle Schedule di landing page.</p>
                        </div>

                        {currentImage && (
                            <img src={currentImage} alt={data.name} className="h-48 w-full rounded-xl object-cover" />
                        )}

                        <Input
                            type="file"
                            label="Upload Gambar"
                            errors={errors.image}
                            accept="image/*"
                            onChange={(e) => {
                                setData("image", e.target.files[0] || null);
                                setData("remove_image", false);
                            }}
                        />

                        {studioPage.image && (
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={data.remove_image}
                                    onChange={(e) => {
                                        setData("remove_image", e.target.checked);
                                        if (e.target.checked) {
                                            setData("image", null);
                                        }
                                    }}
                                />
                                Hapus gambar saat ini
                            </label>
                        )}
                    </div>
                )}

                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="rounded-xl bg-primary-500 px-4 py-2 text-white">Update</button>
                    <Link href={route("studio-pages.index")} className="rounded-xl border border-slate-300 px-4 py-2">Batal</Link>
                </div>
            </form>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
