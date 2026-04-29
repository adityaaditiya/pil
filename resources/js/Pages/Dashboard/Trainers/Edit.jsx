import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconDeviceFloppy, IconUserSquare } from "@tabler/icons-react";

export default function Edit({ trainer }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        expertise: trainer.expertise || "",
        biodata: trainer.biodata || "",
        _method: "PUT",
    });
    const cleanDate = trainer.date_of_birth ? trainer.date_of_birth.split('T')[0] : "-";

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
                    {trainer.photo && <img src={`/storage/customers/${trainer.photo}`} alt={trainer.name} className="h-24 w-24 rounded-xl object-cover" />}
                    <Input type="text" label="User Trainer" value={trainer.user?.name || trainer.name || "-"} disabled />
                    <Input type="text" label="Tanggal Lahir" value={cleanDate} disabled />
                    <Input type="text" label="Gender" value={trainer.gender || "-"} disabled />
                    <Textarea label="Alamat" value={trainer.address || "-"} disabled rows={3} />
                    <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
                        Foto, tanggal lahir, gender, dan alamat diambil dari data pelanggan.
                        Ubah data tersebut melalui menu Dashboard Pelanggan.
                    </div>
                    <Input type="text" label="Keahlian" value={data.expertise} errors={errors.expertise} onChange={(e) => setData("expertise", e.target.value)} />
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
