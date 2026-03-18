import React, { useEffect, useMemo } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Dashboard/Input";
import { getImageUrl } from "@/Utils/imageUrl";
import { IconDeviceFloppy, IconPhoto, IconPhotoEdit } from "@tabler/icons-react";
import toast from "react-hot-toast";

const imageFields = [
    {
        key: "hero_background_image",
        title: "Gambar Background Section Pilates Studio Premium",
        description: "Digunakan pada section utama welcome dengan headline Pilates Studio Premium.",
    },
    {
        key: "schedule_background_image",
        title: "Gambar Background SectionTitle Schedule",
        description: "Digunakan pada section Schedule di halaman landing page (welcome).",
    },
    {
        key: "classes_background_image",
        title: "Gambar Background SectionTitle Classes",
        description: "Digunakan pada section Classes di halaman landing page (welcome).",
    },
];

export default function LandingPage({ setting }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        hero_background_image: null,
        schedule_background_image: null,
        classes_background_image: null,
        _method: "PUT",
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const previews = useMemo(
        () => ({
            hero_background_image:
                data.hero_background_image instanceof File
                    ? URL.createObjectURL(data.hero_background_image)
                    : getImageUrl(setting?.hero_background_image, "landing-page"),
            schedule_background_image:
                data.schedule_background_image instanceof File
                    ? URL.createObjectURL(data.schedule_background_image)
                    : getImageUrl(setting?.schedule_background_image, "landing-page"),
            classes_background_image:
                data.classes_background_image instanceof File
                    ? URL.createObjectURL(data.classes_background_image)
                    : getImageUrl(setting?.classes_background_image, "landing-page"),
        }),
        [data.classes_background_image, data.hero_background_image, data.schedule_background_image, setting],
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("settings.landing-page.update"), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Kelola Gambar Landing Page" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconPhotoEdit size={28} className="text-primary-500" />
                    Kelola Gambar Landing Page
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                    Kelola gambar pada halaman landing page (welcome) untuk background section Pilates Studio Premium, Schedule, dan Classes.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
                {imageFields.map((field) => (
                    <div
                        key={field.key}
                        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {field.title}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                    {field.description}
                                </p>
                            </div>

                            <div>
                                <div className="mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                    {previews[field.key] ? (
                                        <img
                                            src={previews[field.key]}
                                            alt={field.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400 dark:text-slate-500">
                                            <IconPhoto size={40} className="mx-auto" />
                                            <p className="mt-2 text-sm">Belum ada gambar</p>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setData(field.key, event.target.files?.[0] ?? null)
                                    }
                                    errors={errors?.[field.key]}
                                />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    Format yang disarankan JPG/PNG dengan ukuran maksimal 4MB.
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <IconDeviceFloppy size={18} />
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </>
    );
}

LandingPage.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
