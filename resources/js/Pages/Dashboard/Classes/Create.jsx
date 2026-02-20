import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconSchool } from "@tabler/icons-react";

const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Open to all"];

export default function Create() {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        image: null,
        name: "",
        scheduled_at: "",
        slot: "",
        duration: "",
        difficulty_level: "Beginner",
        about: "",
        equipment: "",
        trainers: "",
        credit: "0",
        price: "0",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("classes.store"));
    };

    return (
        <>
            <Head title="Tambah Classes" />
            <div className="mb-6">
                <Link href={route("classes.index")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} /> Kembali ke Classes
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconSchool size={28} className="text-primary-500" />
                    Tambah Classes
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-4xl">
                    <Input type="file" label="Gambar" errors={errors.image} onChange={(e) => setData("image", e.target.files[0])} />
                    <Input type="text" label="Nama Kelas" value={data.name} errors={errors.name} onChange={(e) => setData("name", e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input type="datetime-local" label="Tanggal Jam" value={data.scheduled_at} errors={errors.scheduled_at} onChange={(e) => setData("scheduled_at", e.target.value)} />
                        <Input type="number" label="Slot" value={data.slot} errors={errors.slot} onChange={(e) => setData("slot", e.target.value)} />
                        <Input type="number" label="Durasi (menit)" value={data.duration} errors={errors.duration} onChange={(e) => setData("duration", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty Level</label>
                        <select value={data.difficulty_level} onChange={(e) => setData("difficulty_level", e.target.value)} className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            {difficultyLevels.map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        {errors.difficulty_level && <small className="text-xs text-danger-500">{errors.difficulty_level}</small>}
                    </div>
                    <Textarea label="About" value={data.about} errors={errors.about} onChange={(e) => setData("about", e.target.value)} rows={3} />
                    <Textarea label="Perlengkapan" value={data.equipment} errors={errors.equipment} onChange={(e) => setData("equipment", e.target.value)} rows={3} />
                    <Input type="text" label="Trainers" value={data.trainers} errors={errors.trainers} onChange={(e) => setData("trainers", e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input type="number" label="Credit" value={data.credit} errors={errors.credit} onChange={(e) => setData("credit", e.target.value)} />
                        <Input type="number" label="Harga" value={data.price} errors={errors.price} onChange={(e) => setData("price", e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href={route("classes.index")} className="px-5 py-2.5 rounded-xl border border-slate-200">Batal</Link>
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
