import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconSchool } from "@tabler/icons-react";

const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Open to all"];

export default function Edit({ classItem, trainers }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        image: null,
        name: classItem.name,
        duration: classItem.duration,
        difficulty_level: classItem.difficulty_level,
        about: classItem.about,
        equipment: classItem.equipment,
        trainer_ids: classItem.trainers.map((trainer) => trainer.id),
        credit: classItem.credit,
        price: classItem.price,
        _method: "PUT",
    });

    const toggleTrainer = (trainerId) => {
        setData(
            "trainer_ids",
            data.trainer_ids.includes(trainerId)
                ? data.trainer_ids.filter((id) => id !== trainerId)
                : [...data.trainer_ids, trainerId]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("classes.update", classItem.id));
    };

    return (
        <>
            <Head title="Edit Classes" />
            <div className="mb-6">
                <Link href={route("classes.index")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} /> Kembali ke Classes
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconSchool size={28} className="text-primary-500" />
                    Edit Classes
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-4xl">
                    <Input type="file" label="Gambar" errors={errors.image} onChange={(e) => setData("image", e.target.files[0])} />
                    <Input type="text" label="Nama Kelas" value={data.name} errors={errors.name} onChange={(e) => setData("name", e.target.value)} />
                    <Input type="number" label="Durasi (menit)" value={data.duration} errors={errors.duration} onChange={(e) => setData("duration", e.target.value)} />
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trainers</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {trainers.map((trainer) => (
                                <label key={trainer.id} className="inline-flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={data.trainer_ids.includes(trainer.id)} onChange={() => toggleTrainer(trainer.id)} />
                                    {trainer.name}
                                </label>
                            ))}
                        </div>
                        {errors.trainer_ids && <small className="text-xs text-danger-500">{errors.trainer_ids}</small>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input type="number" label="Credit Default" value={data.credit} errors={errors.credit} onChange={(e) => setData("credit", e.target.value)} />
                        <Input type="number" label="Harga Default" value={data.price} errors={errors.price} onChange={(e) => setData("price", e.target.value)} />
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

Edit.layout = (page) => <DashboardLayout children={page} />;
