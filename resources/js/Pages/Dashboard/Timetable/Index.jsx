import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Dashboard/Modal";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { IconCalendarEvent, IconClock, IconPencil, IconPlus, IconTrash, IconUser, IconUsers } from "@tabler/icons-react";

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const statusClasses = {
    scheduled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function Index({ sessions = [], selectedStartDate, selectedEndDate, canBook, customers = [], paymentGateways = [], availableMemberships = [] }) {
    const { auth } = usePage().props;
    const canManageTimetable = Boolean(auth?.super || auth?.permissions?.["dashboard-access"]);
    const [startDate, setStartDate] = useState(selectedStartDate);
    const [endDate, setEndDate] = useState(selectedEndDate);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const hasSessions = useMemo(() => sessions.length > 0, [sessions]);

    const { data, setData, post, processing, errors, reset } = useForm({
        timetable_id: "",
        customer_id: "",
        participants: 1,
        payment_type: "credit",
        payment_method: "credits",
        user_membership_id: "",
    });

    const selectedMemberships = useMemo(() => {
        if (!selectedCustomer?.user_id || !selectedSession?.pilates_class_id) return [];

        return availableMemberships
            .map((membership) => {
                if (membership.user_id !== selectedCustomer.user_id) return null;
                const classRule = (membership.class_rules || []).find((rule) => Number(rule.pilates_class_id) === Number(selectedSession.pilates_class_id));
                if (!classRule) return null;

                return { ...membership, credit_cost: Number(classRule.credit_cost || 1) };
            })
            .filter(Boolean);
    }, [availableMemberships, selectedCustomer, selectedSession]);

    const selectedMembership = useMemo(
        () => selectedMemberships.find((membership) => Number(membership.id) === Number(data.user_membership_id)),
        [selectedMemberships, data.user_membership_id]
    );

    const paymentMethodOptions = useMemo(() => [{ value: "cash", label: "Tunai" }, ...paymentGateways], [paymentGateways]);

    const applyDateFilter = (nextStartDate, nextEndDate) => {
        router.get(route("timetable.index"), { start_date: nextStartDate, end_date: nextEndDate }, { preserveState: true, replace: true });
    };

    const openPaymentModal = () => {
        if (!selectedSession) return;
        const allowDropIn = Boolean(selectedSession.allow_drop_in);
        setData({
            timetable_id: selectedSession.id,
            customer_id: "",
            participants: 1,
            payment_type: allowDropIn ? "drop_in" : "credit",
            payment_method: allowDropIn ? "cash" : "credits",
            user_membership_id: "",
        });
        setSelectedCustomer(null);
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        reset();
        setSelectedCustomer(null);
    };

    const handleSubmitBooking = (event) => {
        event.preventDefault();

        post(route("bookings.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setShowPaymentModal(false);
                setShowSuccessModal(true);
                setSelectedSession(null);
            },
        });
    };

    return (
        <>
            <Head title="Schedule Booking" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-white"><IconCalendarEvent className="text-primary-500" size={28} /> Schedule Booking</h1>
                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end md:gap-4">
                            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); applyDateFilter(e.target.value, endDate); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm" />
                            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); applyDateFilter(startDate, e.target.value); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm" />
                            {canManageTimetable && <Link href={route("timetable.create")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white"><IconPlus size={16} /> Tambah Session</Link>}
                        </div>
                    </div>
                </section>

                {hasSessions && (
                    <section className="grid gap-4 lg:grid-cols-2">
                        {sessions.map((session) => {
                            const disabled = session.status !== "scheduled" || session.remaining_slots <= 0;

                            return (
                                <div key={session.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-semibold">{session.class?.name}</p>
                                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><IconUser size={15} /> {session.trainer?.name || "TBA"}</p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[session.status] || statusClasses.closed}`}>{session.status}</span>
                                    </div>
                                    <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                        <p className="flex items-center gap-2"><IconClock size={16} /> {session.start_at_label} - {session.end_at_label}</p>
                                        <p className="flex items-center gap-2"><IconUsers size={16} /> {session.remaining_slots}/{session.capacity} slots</p>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button type="button" onClick={() => setSelectedSession(session)} className="rounded-xl border border-primary-200 px-3 py-2 text-sm font-medium text-primary-600">{disabled ? "Sesi tidak tersedia" : "View Details"}</button>
                                        {canManageTimetable && <><Link href={route("timetable.edit", session.id)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"><IconPencil size={15} /> Ubah</Link><button type="button" onClick={() => { if (window.confirm("Yakin ingin menghapus session ini?")) { router.delete(route("timetable.destroy", session.id), { data: { start_date: startDate, end_date: endDate }, preserveScroll: true }); } }} className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600"><IconTrash size={15} /> Hapus</button></>}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
            </div>

            <Modal title="Session Details" show={Boolean(selectedSession)} onClose={() => setSelectedSession(null)} maxWidth="2xl">
                {selectedSession && (
                    <div className="space-y-4 p-1">
                        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
                            <p>Waktu: {selectedSession.start_at_label} - {selectedSession.end_at_label} WIB</p>
                            <p>Kapasitas: {selectedSession.capacity} peserta</p>
                            <p>Sisa Slot Peserta: {selectedSession.remaining_slots}</p>
                            <p>Durasi Kelas: {selectedSession.duration_minutes || selectedSession.class?.duration || 0} menit</p>
                            <p>Perlengkapan Kelas: {selectedSession.class?.equipment || "-"}</p>
                            <p>Metode Pembayaran: {selectedSession.allow_drop_in ? "Credit atau Drop-in" : "Hanya Credit"}</p>
                        </div>
                        <button type="button" onClick={openPaymentModal} disabled={!canBook || selectedSession.status !== "scheduled" || selectedSession.remaining_slots <= 0} className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400">{!canBook ? "Login Required" : "Book Now"}</button>
                    </div>
                )}
            </Modal>

            <Modal title="Pembayaran" show={showPaymentModal} onClose={closePaymentModal} maxWidth="2xl">
                {selectedSession && (
                    <form onSubmit={handleSubmitBooking} className="space-y-4 p-1">
                        <CustomerSelect
                            customers={customers}
                            selected={selectedCustomer}
                            onSelect={(customer) => {
                                setSelectedCustomer(customer);
                                setData("customer_id", customer.id);
                            }}
                            placeholder="Pilih pelanggan..."
                            error={errors.customer_id}
                            label="Pelanggan"
                        />
                        <p className="text-sm">Slot Peserta: <span className="font-medium">{data.participants}</span> | Sisa Slot Peserta: <span className="font-medium">{selectedSession.remaining_slots}</span></p>
                        <input type="number" min={1} max={selectedSession.remaining_slots || 1} value={data.participants} onChange={(e) => setData("participants", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5" />

                        <div className="space-y-2 rounded-xl border p-3">
                            <label className="flex items-start gap-3">
                                <input type="radio" checked={data.payment_type === "credit"} onChange={() => { setData("payment_type", "credit"); setData("payment_method", "credits"); }} />
                                <div>
                                    <p className="text-sm font-semibold">Credits Membership</p>
                                    <p className="text-xs text-slate-500">Sisa credit user saat ini: {selectedMembership?.credits_remaining ?? 0}</p>
                                </div>
                            </label>

                            {data.payment_type === "credit" && (
                                <select value={data.user_membership_id} onChange={(e) => setData("user_membership_id", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                                    <option value="">Pilih membership</option>
                                    {selectedMemberships.map((membership) => <option key={membership.id} value={membership.id}>{membership.plan_name} - sisa {membership.credits_remaining} credits (biaya {membership.credit_cost}/kelas)</option>)}
                                </select>
                            )}

                            {selectedSession.allow_drop_in && (
                                <>
                                    <label className="flex items-center gap-3"><input type="radio" checked={data.payment_type === "drop_in"} onChange={() => { setData("payment_type", "drop_in"); setData("user_membership_id", ""); }} /> <span className="text-sm font-semibold">Drop-in</span></label>
                                    {data.payment_type === "drop_in" && (
                                        <select value={data.payment_method} onChange={(e) => setData("payment_method", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                                            {paymentMethodOptions.map((gateway) => <option key={gateway.value} value={gateway.value}>{gateway.label}</option>)}
                                        </select>
                                    )}
                                </>
                            )}
                        </div>

                        {errors.payment_type && <p className="text-xs text-red-500">{errors.payment_type}</p>}
                        {errors.user_membership_id && <p className="text-xs text-red-500">{errors.user_membership_id}</p>}

                        <button type="submit" disabled={processing} className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white">{processing ? "Memproses..." : "Selesaikan Transaksi"}</button>
                    </form>
                )}
            </Modal>

            <Modal title="Transaksi Selesai" show={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="md">
                <div className="space-y-3 p-1">
                    <p className="text-sm text-slate-600">Pembayaran berhasil dan booking telah dikonfirmasi.</p>
                    <button type="button" onClick={() => setShowSuccessModal(false)} className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white">Tutup</button>
                </div>
            </Modal>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
