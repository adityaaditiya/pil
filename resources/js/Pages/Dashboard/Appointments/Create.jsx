import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCalendarPlus,
    IconDeviceFloppy,
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
const createEmptySlot = () => ({ start_hour: "06", start_minute: "00", end_hour: "07", end_minute: "00" });

const buildInitialSchedules = (weekdayOptions) => weekdayOptions.reduce((carry, day) => {
    carry[day.value] = {
        active: false,
        slots: [createEmptySlot()],
    };

    return carry;
}, {});

const getScheduleError = (errors, dayValue, field) => errors[`schedules.${dayValue}.${field}`];
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

export default function Create({ classes = [], trainers = [], appointmentSessions = [], weekdayOptions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        pilates_class_id: "",
        trainer_id: "",
        appointment_session_id: "",
        admin_notes: "",
        price: "",
        start_date: "",
        end_date: "",
        repeat_schedule: false,
        duration_minutes: 60,
        schedules: buildInitialSchedules(weekdayOptions),
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

    const selectedAppointmentSession = appointmentSessions.find((item) => String(item.id) === String(data.appointment_session_id));

    const submit = (event) => {
        event.preventDefault();
        post(route("appointments.store"));
    };

    return (
        <>
            <Head title="Create Appointment" />

            <div className="mx-auto w-full max-w-6xl space-y-6">
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
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sesi Appointment</label>
                                <select value={data.appointment_session_id} onChange={(event) => setData("appointment_session_id", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                                    <option value="">Pilih sesi appointment</option>
                                    {appointmentSessions.map((item) => (
                                        <option key={item.id} value={item.id}>{item.session_name}</option>
                                    ))}
                                </select>
                                {errors.appointment_session_id && <p className="text-xs text-rose-500">{errors.appointment_session_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deskripsi Sesi</label>
                                <textarea value={selectedAppointmentSession?.description || ""} readOnly rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" placeholder="Deskripsi akan terisi otomatis dari master sesi appointment" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Catatan Admin</label>
                                <textarea value={data.admin_notes} onChange={(event) => setData("admin_notes", event.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Catatan internal untuk admin" />
                                {errors.admin_notes && <p className="text-xs text-rose-500">{errors.admin_notes}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Harga</label>
                                <input placeholder="Harga Sesi Appointment" type="number" min="0" step="0.01" value={data.price} onChange={(event) => setData("price", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800" />
                                {errors.price && <p className="text-xs text-rose-500">{errors.price}</p>}
                            </div>

                                <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Durasi
                                        </label>
                                        
                                        <select
                                        name="duration_minutes"
                                        value={data.duration_minutes} // Langsung ikat ke data
                                        onChange={(event) => setData("duration_minutes", event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                        {/* Tambahkan opsi placeholder jika perlu, atau langsung mulai dari 30 */}
                                        <option value="" disabled>Pilih Durasi</option> 
                                        {[30, 60, 90, 120, 150, 180].map((val) => (
                                            <option key={val} value={val}>
                                                {val} Menit
                                            </option>
                                        ))}
                                    </select>

                                        {errors.duration_minutes && (
                                            <p className="text-xs text-rose-500">{errors.duration_minutes}</p>
                                        )}
                                </div>

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

                            <label className="inline-flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
                                <input type="checkbox" className="mt-1" checked={data.repeat_schedule} onChange={(event) => setData("repeat_schedule", event.target.checked)} />
                                <span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">Ulangi Jadwal</span>
                                    <span className="mt-1 block text-xs text-slate-500">Wajib di checklist apabila membuat appointment dari tanggal mulai sampai tanggal berakhir sesuai hari aktif dan semua slot jam yang dipilih.</span>
                                </span>
                            </label>

                            {/* <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                Sistem akan menolak penyimpanan bila jadwal bentrok dengan timetable atau trainer sudah memiliki appointment lain pada waktu yang sama.
                            </div> */}
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih Hari & Slot Jam</p>
                                {/* <p className="mt-1 text-xs text-slate-500">Tiap hari bisa diaktifkan/nonaktifkan dan memiliki lebih dari satu slot jam operasional. Sistem akan membaginya menjadi sesi appointment mengikuti durasi kelas.</p> */}
                            </div>

                            {errors.schedules && <p className="text-xs text-rose-500">{errors.schedules}</p>}

                            <div className="space-y-4">
                                {weekdayOptions.map((day) => {
                                    const daySchedule = data.schedules[day.value] || { active: false, slots: [createEmptySlot()] };

                                    return (
                                        <div key={day.value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{weekdayLabels[day.value] || day.label}</h3>
                                                    {/* <p className="text-xs text-slate-500">Atur satu atau beberapa slot jam untuk hari ini.</p> */}
                                                </div>
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
                                                        <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 lg:gap-4 items-end">
                                                            {/* Kolom Jam Mulai */}
                                                            <div className="text-sm text-slate-500">
                                                                Jam Mulai
                                                                <TimeSelect
                                                                    hour={slot.start_hour}
                                                                    minute={slot.start_minute}
                                                                    disabled={!daySchedule.active}
                                                                    onHourChange={(value) => updateSlot(day.value, slotIndex, "start_hour", value)}
                                                                    onMinuteChange={(value) => updateSlot(day.value, slotIndex, "start_minute", value)}
                                                                />
                                                            </div>

                                                            {/* Kolom Sampai */}
                                                            <div className="text-sm text-slate-500">
                                                                Sampai
                                                                <TimeSelect
                                                                    hour={slot.end_hour}
                                                                    minute={slot.end_minute}
                                                                    disabled={!daySchedule.active}
                                                                    onHourChange={(value) => updateSlot(day.value, slotIndex, "end_hour", value)}
                                                                    onMinuteChange={(value) => updateSlot(day.value, slotIndex, "end_minute", value)}
                                                                />
                                                            </div>

                                                            {/* Tombol Hapus - Di mobile akan turun ke bawah atau bisa diletakkan di samping jika kolomnya cukup */}
                                                            <div className="col-span-2 lg:col-span-1 flex justify-end lg:block">
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

                                                <div className="space-y-1">
                                                    <button type="button" onClick={() => addSlot(day.value)} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50">
                                                        <IconPlus size={16} /> Tambah Jam
                                                    </button>
                                                    {getScheduleError(errors, day.value, "slots") && <p className="text-xs text-rose-500">{getScheduleError(errors, day.value, "slots")}</p>}
                                                    {getScheduleError(errors, day.value, "active") && <p className="text-xs text-rose-500">{getScheduleError(errors, day.value, "active")}</p>}
                                                </div>
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
                            <IconDeviceFloppy size={16} /> {processing ? "Menyimpan..." : "Simpan Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
