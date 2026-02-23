import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconCalendarPlus, IconDeviceFloppy } from "@tabler/icons-react";

const statuses = [
    { value: "scheduled", label: "Scheduled" },
    { value: "closed", label: "Closed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function Create({ classes = [], trainers = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        pilates_class_id: "",
        trainer_id: "",
        start_at: "",
        capacity: "",
        credit_override: "0",
        price_override: "0",
        allow_drop_in: true,
        status: "scheduled",
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("timetable.store"));
    };

    return (
        <>
            <Head title="Tambah Session" />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <Link
                            href={route("timetable.index")}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary-600"
                        >
                            <IconArrowLeft size={16} /> Kembali ke Schedule Booking
                        </Link>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconCalendarPlus size={26} className="text-primary-500" /> Tambah Session
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">Tambah jadwal session pilates baru untuk booking pelanggan.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Class</label>
                            <select
                                value={data.pilates_class_id}
                                onChange={(event) => setData("pilates_class_id", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="">Pilih class</option>
                                {classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                                ))}
                            </select>
                            {errors.pilates_class_id && <p className="text-xs text-rose-500">{errors.pilates_class_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trainer</label>
                            <select
                                value={data.trainer_id}
                                onChange={(event) => setData("trainer_id", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="">Pilih trainer</option>
                                {trainers.map((trainer) => (
                                    <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                                ))}
                            </select>
                            {errors.trainer_id && <p className="text-xs text-rose-500">{errors.trainer_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Waktu Mulai</label>
                            <input
                                type="datetime-local"
                                value={data.start_at}
                                onChange={(event) => setData("start_at", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            />
                            {errors.start_at && <p className="text-xs text-rose-500">{errors.start_at}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Capacity</label>
                            <input
                                type="number"
                                min="1"
                                value={data.capacity}
                                onChange={(event) => setData("capacity", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Contoh: 12"
                            />
                            {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Credit / Kelas</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.credit_override}
                                onChange={(event) => setData("credit_override", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            />
                            {errors.credit_override && <p className="text-xs text-rose-500">{errors.credit_override}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Harga Drop-in</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price_override}
                                disabled={!data.allow_drop_in}
                                onChange={(event) => setData("price_override", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                            />
                            {errors.price_override && <p className="text-xs text-rose-500">{errors.price_override}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Metode Pembayaran</label>
                            <select
                                value={data.allow_drop_in ? "allow_drop_in" : "credit_only"}
                                onChange={(event) => {
                                    const allowDropIn = event.target.value === "allow_drop_in";
                                    setData("allow_drop_in", allowDropIn);
                                    if (!allowDropIn) {
                                        setData("price_override", "0");
                                    }
                                }}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="allow_drop_in">Bisa pakai credit atau drop-in</option>
                                <option value="credit_only">Hanya bisa pakai credits</option>
                            </select>
                            {errors.allow_drop_in && <p className="text-xs text-rose-500">{errors.allow_drop_in}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</label>
                            <select
                                value={data.status}
                                onChange={(event) => setData("status", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800"
                            >
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                            {errors.status && <p className="text-xs text-rose-500">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                        <Link
                            href={route("timetable.index")}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            <IconDeviceFloppy size={16} /> {processing ? "Menyimpan..." : "Simpan Session"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
