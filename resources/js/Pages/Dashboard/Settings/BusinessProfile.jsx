import React, { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Dashboard/Input";
import { IconDeviceFloppy, IconBuildingStore } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function BusinessProfile({ setting }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        studio_name: setting?.studio_name || "",
        _method: "PUT",
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("settings.business-profile.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kelola Profile Bisnis" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconBuildingStore size={28} className="text-primary-500" />
                    Profile Bisnis
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                    Atur nama profile bisnis atau studio Anda yang akan ditampilkan di seluruh website.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-6">
                        <div>
                            <Input
                                type="text"
                                label="Nama Studio / Bisnis"
                                value={data.studio_name}
                                onChange={(event) =>
                                    setData("studio_name", event.target.value)
                                }
                                errors={errors?.studio_name}
                                placeholder="Masukkan nama bisnis..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-start">
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

BusinessProfile.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
