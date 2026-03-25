import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import { IconArrowLeft, IconCalendarClock, IconDeviceFloppy } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function Edit({ appointmentSession }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing } = useForm({
        session_name: appointmentSession?.session_name || "",
        description: appointmentSession?.description || "",
        default_price_drop_in: String(appointmentSession?.default_price_drop_in ?? "0"),
        default_price_credit: String(appointmentSession?.default_price_credit ?? "0"),
        default_payment_method: appointmentSession?.default_payment_method || "allow_drop_in",
    });

    const submit = (event) => {
        event.preventDefault();
        put(route("appointment-sessions.update", appointmentSession.id), {
            onSuccess: () => toast.success("Sesi Appointment berhasil diperbarui"),
            onError: () => toast.error("Gagal memperbarui sesi appointment"),
        });
    };

    return (
        <>
            <Head title="Ubah Sesi Appointment" />

            <div className="mb-6">
                <Link href={route("appointment-sessions.index")} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
                    <IconArrowLeft size={16} /> Kembali ke Sesi Appointment
                </Link>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconCalendarClock size={28} className="text-primary-500" /> Ubah Sesi Appointment
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-4">
                        <Input label="Nama Sesi" value={data.session_name} onChange={(event) => setData("session_name", event.target.value)} errors={errors.session_name} placeholder="Contoh: Private Morning Flow" />
                        <Textarea label="Deskripsi" value={data.description} onChange={(event) => setData("description", event.target.value)} errors={errors.description} placeholder="Deskripsi sesi appointment" rows={5} />
                        <Input type="number" min="0" step="0.01" label="Harga Drop-in Default" value={data.default_price_drop_in} onChange={(event) => setData("default_price_drop_in", event.target.value)} errors={errors.default_price_drop_in} placeholder="0" />
                        <Input type="number" min="0" step="0.01" label="Harga Credits Default" value={data.default_price_credit} onChange={(event) => setData("default_price_credit", event.target.value)} errors={errors.default_price_credit} placeholder="0" />
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
                            <select
                                value={data.default_payment_method}
                                onChange={(event) => setData("default_payment_method", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="credit_only">Hanya bisa pakai credits</option>
                                <option value="allow_drop_in">Bisa pakai credit atau drop-in</option>
                            </select>
                            {errors.default_payment_method && <small className="text-xs text-danger-500">{errors.default_payment_method}</small>}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Link href={route("appointment-sessions.index")} className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50">
                            <IconDeviceFloppy size={18} /> {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
