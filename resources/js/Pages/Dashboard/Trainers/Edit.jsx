import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconUserSquare } from "@tabler/icons-react";

export default function Edit({ trainer }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        photo: null,
        date_of_birth: trainer.date_of_birth || "",
        expertise: trainer.expertise || "",
        gender: trainer.gender || "Laki-laki",
        address: trainer.address || "",
        biodata: trainer.biodata || "",
        _method: "PUT",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("trainers.update", trainer.id));
    };

    return (
        <>
            <Head title="Edit Trainer" />
            <div className="mb-6">
                <Link href={route("trainers.index")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} /> Kembali ke Trainer
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconUserSquare size={28} className="text-primary-500" /> Edit Trainer
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-4xl">
                    {trainer.photo && <img src={`/storage/trainers/${trainer.photo}`} alt={trainer.name} className="h-24 w-24 rounded-xl object-cover" />}
                    <Input type="file" label="Foto" errors={errors.photo} onChange={(e) => setData("photo", e.target.files[0])} />
                    <Input type="text" label="User Trainer" value={trainer.user?.name || trainer.name || "-"} disabled />
                    <Input type="date" label="Tanggal Lahir" value={data.date_of_birth} errors={errors.date_of_birth} onChange={(e) => setData("date_of_birth", e.target.value)} />
                    <Input type="text" label="Keahlian" value={data.expertise} errors={errors.expertise} onChange={(e) => setData("expertise", e.target.value)} />
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                        <select value={data.gender} onChange={(e) => setData("gender", e.target.value)} className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        {errors.gender && <small className="text-xs text-danger-500">{errors.gender}</small>}
                    </div>
                    <Textarea label="Alamat" value={data.address} errors={errors.address} onChange={(e) => setData("address", e.target.value)} rows={3} />
                    <Textarea label="Biodata" value={data.biodata} errors={errors.biodata} onChange={(e) => setData("biodata", e.target.value)} rows={4} />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href={route("trainers.index")} className="px-5 py-2.5 rounded-xl border border-slate-200">Batal</Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white">
                            <IconDeviceFloppy size={18} /> {processing ? "Menyimpan..." : "Update"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
