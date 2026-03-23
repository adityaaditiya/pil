import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconEdit, IconDeviceFloppy } from "@tabler/icons-react";

export default function Edit({ classes = [], trainers = [], appointment, updateScopeOptions = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        pilates_class_id: appointment?.pilates_class_id || "",
        trainer_id: appointment?.trainer_id || "",
        session_name: appointment?.session_name || "",
        description: appointment?.description || "",
        price: appointment?.price || "",
        duration_minutes: appointment?.duration_minutes || 60,
        start_at: appointment?.start_at || "",
        update_scope: updateScopeOptions[0]?.value || "single",
    });

    const submit = (event) => {
        event.preventDefault();
        put(route("appointments.update", appointment?.id));
    };

    return (
        <>
            <Head title="Ubah Appointment" />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                <div>
                    <Link href={route("appointments.index")} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Appointment
                    </Link>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <IconEdit size={26} className="text-primary-500" /> Ubah Appointment
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Perbarui jadwal appointment dan pertahankan invoice {appointment?.invoice}.</p>
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Invoice</label>
                            <input value={appointment?.invoice || ""} disabled className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kelas</label>
                            <select value={data.pilates_class_id} onChange={(event) => setData("pilates_class_id", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                <option value="">Pilih kelas appointment</option>
                                {classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                                ))}
                            </select>
                            {errors.pilates_class_id && <p className="text-xs text-rose-500">{errors.pilates_class_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trainer</label>
                            <select value={data.trainer_id} onChange={(event) => setData("trainer_id", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                <option value="">Pilih trainer</option>
                                {trainers.map((trainer) => (
                                    <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                                ))}
                            </select>
                            {errors.trainer_id && <p className="text-xs text-rose-500">{errors.trainer_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilihan Edit</label>
                            <select value={data.update_scope} onChange={(event) => setData("update_scope", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                {updateScopeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            {errors.update_scope && <p className="text-xs text-rose-500">{errors.update_scope}</p>}
                            <p className="text-xs text-slate-500">Pilih apakah perubahan berlaku hanya pada sesi ini atau seluruh sesi berulang berikutnya.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Waktu Mulai</label>
                            <input type="datetime-local" value={data.start_at} onChange={(event) => setData("start_at", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                            {errors.start_at && <p className="text-xs text-rose-500">{errors.start_at}</p>}
                            {errors.schedules && <p className="text-xs text-rose-500">{errors.schedules}</p>}
                            <p className="text-xs text-slate-500">Jika jam diubah dan Anda memilih sesi ini dan semua seterusnya, tanggal tiap sesi tetap sama tetapi jam akan diseragamkan.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nama Sesi</label>
                            <input type="text" value={data.session_name} onChange={(event) => setData("session_name", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Contoh: Private Morning Flow" />
                            {errors.session_name && <p className="text-xs text-rose-500">{errors.session_name}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deskripsi</label>
                            <textarea value={data.description} onChange={(event) => setData("description", event.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Ringkasan sesi appointment" />
                            {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Harga</label>
                            <input type="number" min="0" step="0.01" value={data.price} onChange={(event) => setData("price", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                            {errors.price && <p className="text-xs text-rose-500">{errors.price}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Durasi</label>
                            <select value={data.duration_minutes} onChange={(event) => setData("duration_minutes", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                {[30, 60, 90, 120, 150, 180].map((val) => (
                                    <option key={val} value={val}>{val} Menit</option>
                                ))}
                            </select>
                            {errors.duration_minutes && <p className="text-xs text-rose-500">{errors.duration_minutes}</p>}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <Link href={route("appointments.index")} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                            <IconDeviceFloppy size={16} /> {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
