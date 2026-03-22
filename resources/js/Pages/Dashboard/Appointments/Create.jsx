import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconCalendarPlus, IconDeviceFloppy } from "@tabler/icons-react";

const weekdayLabels = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};

export default function Create({ classes = [], trainers = [], weekdayOptions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        pilates_class_id: "",
        trainer_id: "",
        session_name: "",
        description: "",
        price: "",
        duration_minutes: "60",
        start_date: "",
        end_date: "",
        start_time: "",
        repeat_schedule: false,
        days: [],
    });

    const toggleDay = (value) => {
        setData("days", data.days.includes(value) ? data.days.filter((item) => item !== value) : [...data.days, value]);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route("appointments.store"));
    };

    return (
        <>
            <Head title="Create Appointment" />

            <div className="mx-auto w-full max-w-5xl space-y-6">
                <div>
                    <Link href={route("appointments.index")} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Appointment
                    </Link>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <IconCalendarPlus size={26} className="text-primary-500" /> Create Appointment
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Buat jadwal appointment tunggal atau berulang dengan validasi bentrok ruangan dan trainer.</p>
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih Kelas</label>
                                <select value={data.pilates_class_id} onChange={(event) => setData("pilates_class_id", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                    <option value="">Pilih kelas appointment</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                                    ))}
                                </select>
                                {errors.pilates_class_id && <p className="text-xs text-rose-500">{errors.pilates_class_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih Trainer</label>
                                <select value={data.trainer_id} onChange={(event) => setData("trainer_id", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                    <option value="">Pilih trainer</option>
                                    {trainers.map((trainer) => (
                                        <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                                    ))}
                                </select>
                                {errors.trainer_id && <p className="text-xs text-rose-500">{errors.trainer_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nama Sesi</label>
                                <input type="text" value={data.session_name} onChange={(event) => setData("session_name", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Contoh: Private Morning Flow" />
                                {errors.session_name && <p className="text-xs text-rose-500">{errors.session_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deskripsi</label>
                                <textarea value={data.description} onChange={(event) => setData("description", event.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Ringkasan sesi appointment" />
                                {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Harga</label>
                                    <input type="number" min="0" step="0.01" value={data.price} onChange={(event) => setData("price", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.price && <p className="text-xs text-rose-500">{errors.price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Durasi (menit)</label>
                                    <input type="number" min="1" value={data.duration_minutes} onChange={(event) => setData("duration_minutes", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.duration_minutes && <p className="text-xs text-rose-500">{errors.duration_minutes}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tanggal Mulai</label>
                                    <input type="date" value={data.start_date} onChange={(event) => setData("start_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.start_date && <p className="text-xs text-rose-500">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tanggal Berakhir</label>
                                    <input type="date" value={data.end_date} onChange={(event) => setData("end_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.end_date && <p className="text-xs text-rose-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Jam Mulai</label>
                                <input type="time" value={data.start_time} onChange={(event) => setData("start_time", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                {errors.start_time && <p className="text-xs text-rose-500">{errors.start_time}</p>}
                            </div>

                            <label className="inline-flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
                                <input type="checkbox" className="mt-1" checked={data.repeat_schedule} onChange={(event) => setData("repeat_schedule", event.target.checked)} />
                                <span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">Ulangi Jadwal</span>
                                    <span className="mt-1 block text-xs text-slate-500">Jika dicentang, sistem akan membuat appointment dari tanggal mulai sampai tanggal berakhir sesuai hari yang dipilih.</span>
                                </span>
                            </label>

                            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih Hari</p>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {weekdayOptions.map((day) => (
                                        <label key={day.value} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <input type="checkbox" checked={data.days.includes(day.value)} onChange={() => toggleDay(day.value)} disabled={!data.repeat_schedule} />
                                            {weekdayLabels[day.value] || day.label}
                                        </label>
                                    ))}
                                </div>
                                {errors.days && <p className="text-xs text-rose-500">{errors.days}</p>}
                                {errors["days.0"] && <p className="text-xs text-rose-500">{errors["days.0"]}</p>}
                            </div>

                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                Sistem akan menolak penyimpanan bila jadwal bentrok dengan timetable studio atau trainer sudah memiliki appointment lain pada waktu yang sama.
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <Link href={route("appointments.index")} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                            <IconDeviceFloppy size={16} /> {processing ? "Menyimpan..." : "Simpan Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
