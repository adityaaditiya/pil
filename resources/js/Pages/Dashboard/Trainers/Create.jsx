import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconUserSquare } from "@tabler/icons-react";

export default function Create({ trainerUsers = [] }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        user_id: "",
        expertise: "",
        biodata: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("trainers.store"));
    };

    return (
        <>
            <Head title="Tambah Trainer" />
            <div className="mb-6">
                <Link href={route("trainers.index")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} /> Kembali ke Trainer
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconUserSquare size={28} className="text-primary-500" /> Tambah Trainer
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-4xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User Trainer</label>
                        <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)} className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <option value="">Pilih user trainer</option>
                            {trainerUsers.map((user) => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                        {errors.user_id && <small className="text-xs text-danger-500">{errors.user_id}</small>}
                    </div>
                    <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
                        Foto, tanggal lahir, gender, dan alamat otomatis diambil dari data pelanggan.
                        Perubahan data tersebut dilakukan melalui menu Dashboard Pelanggan.
                    </div>
                    <Input type="text" label="Keahlian" value={data.expertise} errors={errors.expertise} onChange={(e) => setData("expertise", e.target.value)} />
                    <Textarea label="Biodata" value={data.biodata} errors={errors.biodata} onChange={(e) => setData("biodata", e.target.value)} rows={4} />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href={route("trainers.index")} className="px-5 py-2.5 rounded-xl border border-slate-200">Batal</Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white">
                            <IconDeviceFloppy size={18} /> {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
