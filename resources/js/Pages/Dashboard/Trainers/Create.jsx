import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconUserSquare } from "@tabler/icons-react";

export default function Create() {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        name: "",
        photo: null,
        age: "",
        gender: "Laki-laki",
        address: "",
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
                    <Input type="file" label="Foto" errors={errors.photo} onChange={(e) => setData("photo", e.target.files[0])} />
                    <Input type="text" label="Nama" value={data.name} errors={errors.name} onChange={(e) => setData("name", e.target.value)} />
                    <Input type="number" label="Usia" value={data.age} errors={errors.age} onChange={(e) => setData("age", e.target.value)} />
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
                        <select value={data.gender} onChange={(e) => setData("gender", e.target.value)} className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        {errors.gender && <small className="text-xs text-danger-500">{errors.gender}</small>}
                    </div>
                    <Textarea label="Alamat" value={data.address} errors={errors.address} onChange={(e) => setData("address", e.target.value)} rows={3} />

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
