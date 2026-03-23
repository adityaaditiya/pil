import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconDeviceFloppy,
    IconEdit,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";

const weekdayLabels = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};

const hourOptions = Array.from({ length: 17 }, (_, index) => String(index + 6).padStart(2, "0"));
const minuteOptions = ["00", "30"];
const defaultSlot = { start_hour: "06", start_minute: "00", end_hour: "07", end_minute: "00" };
const createEmptySlot = () => ({ ...defaultSlot });

const buildInitialSchedules = (weekdayOptions, schedules = {}) => weekdayOptions.reduce((carry, day) => {
    const existingSchedule = schedules[day.value];

    carry[day.value] = {
        active: Boolean(existingSchedule?.active),
        slots: existingSchedule?.slots?.length ? existingSchedule.slots : [createEmptySlot()],
    };

    return carry;
}, {});

const getSlotError = (errors, dayValue, slotIndex, field) => errors[`schedules.${dayValue}.slots.${slotIndex}.${field}`];

function TimeSelect({ label, hour, minute, onHourChange, onMinuteChange, disabled = false }) {
    return (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
                <select
                    value={hour}
                    onChange={(event) => onHourChange(event.target.value)}
                    disabled={disabled}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
                >
                    {hourOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <span className="hidden pb-3 text-center text-slate-400 sm:block">:</span>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
                <select
                    value={minute}
                    onChange={(event) => onMinuteChange(event.target.value)}
                    disabled={disabled}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
                >
                    {minuteOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default function Edit({ classes = [], trainers = [], appointment, weekdayOptions = [], updateScopeOptions = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        pilates_class_id: appointment?.pilates_class_id || "",
        trainer_id: appointment?.trainer_id || "",
        session_name: appointment?.session_name || "",
        description: appointment?.description || "",
        price: appointment?.price || "",
        duration_minutes: appointment?.duration_minutes || 60,
        start_at: appointment?.start_at || "",
        start_date: appointment?.start_date || "",
        end_date: appointment?.end_date || appointment?.start_date || "",
        repeat_schedule: Boolean(appointment?.repeat_schedule),
        update_scope: updateScopeOptions[0]?.value || "single",
        schedules: buildInitialSchedules(weekdayOptions, appointment?.schedules || {}),
    });

    const updateScheduleDay = (dayValue, callback) => {
        setData("schedules", {
            ...data.schedules,
            [dayValue]: callback(data.schedules[dayValue] || { active: false, slots: [createEmptySlot()] }),
        });
    };

    const toggleDayActive = (dayValue) => {
        updateScheduleDay(dayValue, (daySchedule) => ({
            ...daySchedule,
            active: !daySchedule.active,
            slots: daySchedule.slots?.length ? daySchedule.slots : [createEmptySlot()],
        }));
    };

    const updateSlot = (dayValue, slotIndex, field, value) => {
        updateScheduleDay(dayValue, (daySchedule) => ({
            ...daySchedule,
            slots: daySchedule.slots.map((slot, index) => (index === slotIndex ? { ...slot, [field]: value } : slot)),
        }));
    };

    const addSlot = (dayValue) => {
        updateScheduleDay(dayValue, (daySchedule) => ({
            ...daySchedule,
            active: true,
            slots: [...daySchedule.slots, createEmptySlot()],
        }));
    };

    const removeSlot = (dayValue, slotIndex) => {
        updateScheduleDay(dayValue, (daySchedule) => {
            const nextSlots = daySchedule.slots.filter((_, index) => index !== slotIndex);

            return {
                ...daySchedule,
                slots: nextSlots.length ? nextSlots : [createEmptySlot()],
            };
        });
    };

    const submit = (event) => {
        event.preventDefault();
        put(route("appointments.update", appointment?.id));
    };

    return (
        <>
            <Head title="Ubah Appointment" />

            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div>
                    <Link href={route("appointments.index")} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Appointment
                    </Link>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <IconEdit size={26} className="text-primary-500" /> Ubah Appointment
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Perbarui sesi tunggal atau seluruh sesi berulang berikutnya, termasuk tanggal berakhir dan slot jam aktif.</p>
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Invoice</label>
                                <input value={appointment?.invoice || ""} disabled className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilihan Edit</label>
                                <select value={data.update_scope} onChange={(event) => setData("update_scope", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                    {updateScopeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {errors.update_scope && <p className="text-xs text-rose-500">{errors.update_scope}</p>}
                            </div>

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
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Waktu Mulai Sesi Ini</label>
                                <input type="datetime-local" value={data.start_at} onChange={(event) => setData("start_at", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                {errors.start_at && <p className="text-xs text-rose-500">{errors.start_at}</p>}
                                <p className="text-xs text-slate-500">Dipakai saat memilih “Hanya Sesi Ini”. Jika memilih semua seterusnya, gunakan tanggal berakhir dan slot jam di panel kanan.</p>
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

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tanggal Mulai</label>
                                    <input type="date" value={data.start_date} min={appointment?.start_date || ""} onChange={(event) => setData("start_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.start_date && <p className="text-xs text-rose-500">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tanggal Berakhir</label>
                                    <input type="date" value={data.end_date} min={data.start_date || appointment?.start_date || ""} onChange={(event) => setData("end_date", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                    {errors.end_date && <p className="text-xs text-rose-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <label className="inline-flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
                                <input type="checkbox" className="mt-1" checked={data.repeat_schedule} onChange={(event) => setData("repeat_schedule", event.target.checked)} />
                                <span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">Ulangi Jadwal</span>
                                    <span className="mt-1 block text-xs text-slate-500">Aktifkan saat mengubah sesi berulang dari tanggal mulai sampai tanggal berakhir berdasarkan hari aktif dan slot jam di panel kanan.</span>
                                </span>
                            </label>
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih Hari & Slot Jam</p>
                                <p className="mt-1 text-xs text-slate-500">Field ini tersedia saat ubah data agar pola sesi berulang ke depan bisa disesuaikan langsung dari dashboard appointment.</p>
                            </div>

                            {errors.schedules && <p className="text-xs text-rose-500">{errors.schedules}</p>}

                            <div className="space-y-4">
                                {weekdayOptions.map((day) => {
                                    const daySchedule = data.schedules[day.value] || { active: false, slots: [createEmptySlot()] };

                                    return (
                                        <div key={day.value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{weekdayLabels[day.value] || day.label}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDayActive(day.value)}
                                                    className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold transition ${daySchedule.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"}`}
                                                >
                                                    {daySchedule.active ? "Aktif" : "Nonaktif"}
                                                </button>
                                            </div>

                                            <div className="mt-2 space-y-2">
                                                {daySchedule.slots.map((slot, slotIndex) => (
                                                    <div key={`${day.value}-${slotIndex}`} className={`rounded-2xl border border-dashed p-4 ${daySchedule.active ? "border-slate-200" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                                                        <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-4">
                                                            <div className="text-sm text-slate-500">
                                                                Jam Mulai
                                                                <TimeSelect
                                                                    label="Mulai"
                                                                    hour={slot.start_hour}
                                                                    minute={slot.start_minute}
                                                                    disabled={!daySchedule.active}
                                                                    onHourChange={(value) => updateSlot(day.value, slotIndex, "start_hour", value)}
                                                                    onMinuteChange={(value) => updateSlot(day.value, slotIndex, "start_minute", value)}
                                                                />
                                                            </div>

                                                            <div className="text-sm text-slate-500">
                                                                Sampai
                                                                <TimeSelect
                                                                    label="Sampai"
                                                                    hour={slot.end_hour}
                                                                    minute={slot.end_minute}
                                                                    disabled={!daySchedule.active}
                                                                    onHourChange={(value) => updateSlot(day.value, slotIndex, "end_hour", value)}
                                                                    onMinuteChange={(value) => updateSlot(day.value, slotIndex, "end_minute", value)}
                                                                />
                                                            </div>

                                                            <div className="flex justify-end lg:block">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSlot(day.value, slotIndex)}
                                                                    disabled={!daySchedule.active && daySchedule.slots.length === 1}
                                                                    className="inline-flex h-11 w-full lg:w-11 items-center justify-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    aria-label={`Hapus slot ${weekdayLabels[day.value] || day.label} ${slotIndex + 1}`}
                                                                >
                                                                    <IconTrash size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 space-y-1">
                                                            {getSlotError(errors, day.value, slotIndex, "start_hour") && <p className="text-xs text-rose-500">{getSlotError(errors, day.value, slotIndex, "start_hour")}</p>}
                                                            {getSlotError(errors, day.value, slotIndex, "start_minute") && <p className="text-xs text-rose-500">{getSlotError(errors, day.value, slotIndex, "start_minute")}</p>}
                                                            {getSlotError(errors, day.value, slotIndex, "end_hour") && <p className="text-xs text-rose-500">{getSlotError(errors, day.value, slotIndex, "end_hour")}</p>}
                                                            {getSlotError(errors, day.value, slotIndex, "end_minute") && <p className="text-xs text-rose-500">{getSlotError(errors, day.value, slotIndex, "end_minute")}</p>}
                                                            {getSlotError(errors, day.value, slotIndex, "time_range") && <p className="text-xs text-rose-500">{getSlotError(errors, day.value, slotIndex, "time_range")}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => addSlot(day.value)}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    <IconPlus size={16} /> Tambah Slot
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
