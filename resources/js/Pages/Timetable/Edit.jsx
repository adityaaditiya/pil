import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconCalendarPlus, IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";

const statuses = [
    { value: "scheduled", label: "Scheduled" },
    { value: "closed", label: "Closed" },
    { value: "cancelled", label: "Cancelled" },
];

const hourOptions = Array.from({ length: 17 }, (_, i) => String(i + 6).padStart(2, "0"));
const minuteOptions = ["00", "30"];
const createEmptySlot = () => ({ start_hour: "06", start_minute: "00", end_hour: "07", end_minute: "00" });
const buildInitialSchedules = (weekdayOptions, schedules = {}) => weekdayOptions.reduce((carry, day) => {
    const existing = schedules[day.value];
    carry[day.value] = { active: Boolean(existing?.active), slots: existing?.slots?.length ? existing.slots : [createEmptySlot()] };
    return carry;
}, {});

function TimeSelect({ label, hour, minute, onHourChange, onMinuteChange, disabled = false }) {
    return (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <div className="space-y-2"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label><select value={hour} onChange={(e) => onHourChange(e.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm disabled:opacity-60">{hourOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
            <span className="hidden pb-3 text-center text-slate-400 sm:block">:</span>
            <div className="space-y-2"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label><select value={minute} onChange={(e) => onMinuteChange(e.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm disabled:opacity-60">{minuteOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
        </div>
    );
}

export default function Edit({ classes = [], trainers = [], session, weekdayOptions = [], updateScopeOptions = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        pilates_class_id: session?.pilates_class_id || "",
        trainer_id: session?.trainer_id || "",
        start_at: session?.start_at || "",
        capacity: session?.capacity || "",
        duration_minutes: session?.duration_minutes || "",
        credit_override: session?.credit_override ?? "0",
        price_override: session?.price_override ?? "0",
        allow_drop_in: session?.allow_drop_in ?? true,
        status: session?.status || "scheduled",
        admin_notes: session?.admin_notes || "",
        start_date: session?.start_date || "",
        end_date: session?.end_date || session?.start_date || "",
        repeat_schedule: Boolean(session?.repeat_schedule),
        update_scope: updateScopeOptions[0]?.value || "single",
        schedules: buildInitialSchedules(weekdayOptions, session?.schedules || {}),
    });

    const isLocked = Boolean(session?.locked);

    const updateScheduleDay = (dayValue, callback) => {
        setData("schedules", {
            ...data.schedules,
            [dayValue]: callback(data.schedules[dayValue] || { active: false, slots: [createEmptySlot()] }),
        });
    };
    const toggleDayActive = (dayValue) => updateScheduleDay(dayValue, (d) => ({ ...d, active: !d.active, slots: d.slots?.length ? d.slots : [createEmptySlot()] }));
    const updateSlot = (dayValue, slotIndex, field, value) => updateScheduleDay(dayValue, (d) => ({ ...d, slots: d.slots.map((slot, i) => i === slotIndex ? { ...slot, [field]: value } : slot) }));
    const addSlot = (dayValue) => updateScheduleDay(dayValue, (d) => ({ ...d, active: true, slots: [...d.slots, createEmptySlot()] }));
    const removeSlot = (dayValue, slotIndex) => updateScheduleDay(dayValue, (d) => {
        const nextSlots = d.slots.filter((_, i) => i !== slotIndex);
        return { ...d, slots: nextSlots.length ? nextSlots : [createEmptySlot()] };
    });

    const submit = (event) => {
        event.preventDefault();
        if (isLocked) return;
        put(route("timetable.update", session?.id));
    };

    const handleClassChange = (classId) => {
        const selectedClass = classes.find((item) => String(item.id) === String(classId));
        setData("pilates_class_id", classId);
        if (!selectedClass) return;
        setData("credit_override", String(selectedClass.credit ?? 0));
        setData("price_override", String(selectedClass.price ?? 0));
        setData("allow_drop_in", selectedClass.default_payment_method !== "credit");
    };

    return (
        <>
            <Head title="Ubah Session" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div>
                    <Link href={route("timetable.index")} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary-600"><IconArrowLeft size={16} /> Kembali ke Schedule Booking</Link>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><IconCalendarPlus size={26} className="text-primary-500" /> Ubah Session</h1>
                    {isLocked && <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">Session ini sudah memiliki booking pelanggan, jadi tidak bisa diubah.</p>}
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Pilihan Edit</label><select disabled={isLocked} value={data.update_scope} onChange={(e) => setData("update_scope", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">{updateScopeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                            <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Class</label><select disabled={isLocked} value={data.pilates_class_id} onChange={(e) => handleClassChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"><option value="">Pilih class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Keterangan</label><textarea disabled={isLocked} value={data.admin_notes} onChange={(e) => setData("admin_notes", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Catatan internal seperti tanggal periode booking schedule" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Trainer</label><select disabled={isLocked} value={data.trainer_id} onChange={(e) => setData("trainer_id", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"><option value="">Pilih trainer</option>{trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Waktu Mulai Sesi Ini</label><input disabled={isLocked} type="datetime-local" value={data.start_at} onChange={(e) => setData("start_at", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Capacity</label><input disabled={isLocked} type="number" min="1" value={data.capacity} onChange={(e) => setData("capacity", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Durasi (Menit)</label><select disabled={isLocked} value={data.duration_minutes} onChange={(e) => setData("duration_minutes", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">{[30, 60, 90, 120, 150, 180].map((v) => <option key={v} value={v}>{v} Menit</option>)}</select></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Credit / Kelas</label><input disabled={isLocked} type="number" min="0" step="0.01" value={data.credit_override} onChange={(e) => setData("credit_override", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold">Harga Drop-in</label><input disabled={isLocked || !data.allow_drop_in} type="number" min="0" step="0.01" value={data.price_override} onChange={(e) => setData("price_override", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                            <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Metode Pembayaran</label><select disabled={isLocked} value={data.allow_drop_in ? "allow_drop_in" : "credit_only"} onChange={(e) => { const allow = e.target.value === "allow_drop_in"; setData("allow_drop_in", allow); if (!allow) setData("price_override", "0"); }} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"><option value="allow_drop_in">Bisa pakai credit atau drop-in</option><option value="credit_only">Hanya bisa pakai credits</option></select></div>
                            <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Status</label><select disabled={isLocked} value={data.status} onChange={(e) => setData("status", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">{statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2"><label className="text-sm font-semibold">Tanggal Mulai</label><input disabled={isLocked} type="date" value={data.start_date} min={session?.start_date || ""} onChange={(e) => setData("start_date", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Tanggal Berakhir</label><input disabled={isLocked} type="date" value={data.end_date} min={data.start_date || session?.start_date || ""} onChange={(e) => setData("end_date", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm" /></div>
                            </div>
                            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm"><input disabled={isLocked} type="checkbox" checked={data.repeat_schedule} onChange={(e) => setData("repeat_schedule", e.target.checked)} />Ulangi Jadwal</label>

                            <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                                <h3 className="text-sm font-semibold">Pilih Hari & Slot Jam</h3>
                                {weekdayOptions.map((day) => {
                                    const daySchedule = data.schedules?.[day.value] || { active: false, slots: [createEmptySlot()] };
                                    return <div key={day.value} className="rounded-2xl border border-slate-200 p-4 space-y-3"><label className="inline-flex items-center gap-3 text-sm font-semibold"><input disabled={isLocked} type="checkbox" checked={Boolean(daySchedule.active)} onChange={() => toggleDayActive(day.value)} />{day.label}</label>{daySchedule.active && <div className="space-y-3">{daySchedule.slots.map((slot, idx) => <div key={`${day.value}-${idx}`} className="rounded-xl border border-slate-200 p-3"><div className="grid gap-3 md:grid-cols-2"><TimeSelect disabled={isLocked} label="Mulai" hour={slot.start_hour} minute={slot.start_minute} onHourChange={(v) => updateSlot(day.value, idx, "start_hour", v)} onMinuteChange={(v) => updateSlot(day.value, idx, "start_minute", v)} /><TimeSelect disabled={isLocked} label="Selesai" hour={slot.end_hour} minute={slot.end_minute} onHourChange={(v) => updateSlot(day.value, idx, "end_hour", v)} onMinuteChange={(v) => updateSlot(day.value, idx, "end_minute", v)} /></div><div className="mt-2 text-right"><button disabled={isLocked} type="button" onClick={() => removeSlot(day.value, idx)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-500"><IconTrash size={14} />Hapus</button></div></div>)}<button disabled={isLocked} type="button" onClick={() => addSlot(day.value)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"><IconPlus size={16} />Tambah Slot</button></div>}</div>;
                                })}
                            </div>
                        </div>
                    </div>

                    {(errors.schedules || errors.update_scope) && <p className="mt-4 text-xs text-rose-500">{errors.schedules || errors.update_scope}</p>}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <Link href={route("timetable.index")} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold">Batal</Link>
                        <button type="submit" disabled={processing || isLocked} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:bg-slate-400"><IconDeviceFloppy size={16} />{processing ? "Menyimpan..." : "Simpan Perubahan"}</button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
