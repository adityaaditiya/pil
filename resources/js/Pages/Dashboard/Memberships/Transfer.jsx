import React, { useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import InputSelect from "@/Components/Dashboard/InputSelect";
import { IconArrowsExchange, IconSparkles } from "@tabler/icons-react";

export default function Transfer({ members = [] }) {
    const [fromMembership, setFromMembership] = useState(null);
    const [toMembership, setToMembership] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        from_membership_id: "",
        to_membership_id: "",
        credits_transferred: "",
        notes: "",
    });

    const isSameMembership = fromMembership?.id && toMembership?.id && fromMembership.id === toMembership.id;
    const creditAmount = Number(data.credits_transferred || 0);
    const senderCredits = Number(fromMembership?.credits_remaining || 0);
    const exceedsCredit = creditAmount > senderCredits;

    const submitDisabled = useMemo(() => {
        return processing || !fromMembership || !toMembership || !creditAmount || creditAmount < 1 || exceedsCredit || isSameMembership;
    }, [processing, fromMembership, toMembership, creditAmount, exceedsCredit, isSameMembership]);

    const submit = (event) => {
        event.preventDefault();
        post(route("memberships.transfer.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset("credits_transferred", "notes");
            },
        });
    };

    const handleFromChange = (value) => {
        setFromMembership(value);
        setData("from_membership_id", value?.id || "");
    };

    const handleToChange = (value) => {
        setToMembership(value);
        setData("to_membership_id", value?.id || "");
    };

    return (
        <>
            <Head title="Transfer Membership" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><IconArrowsExchange size={28} className="text-primary-500" />Transfer Membership</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pindahkan credits membership aktif antar pelanggan dengan aman.</p>
                </div>

                <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-5 md:grid-cols-2">
                        <InputSelect label="From Member" data={members} selected={fromMembership} setSelected={handleFromChange} placeholder="Pilih pengirim" searchable errors={errors.from_membership_id} displayKey="label" />
                        <InputSelect label="To Member" data={members} selected={toMembership} setSelected={handleToChange} placeholder="Pilih penerima" searchable errors={errors.to_membership_id} displayKey="label" />
                    </div>

                    {fromMembership && (
                        <div className="mt-5 rounded-2xl bg-primary-50 p-4 text-sm text-primary-800">
                            <p className="font-semibold">Membership Pengirim</p>
                            <p>{fromMembership.membership_plan_name} • {fromMembership.member_name}</p>
                            <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-primary-700"><IconSparkles size={14} />Sisa Credits: {fromMembership.credits_remaining}</p>
                        </div>
                    )}

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Credits Amount</label>
                            <input type="number" min="1" value={data.credits_transferred} onChange={(e) => setData("credits_transferred", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" placeholder="Masukkan jumlah credits" />
                            {errors.credits_transferred && <small className="mt-1 block text-xs text-red-500">{errors.credits_transferred}</small>}
                            {exceedsCredit && <small className="mt-1 block text-xs text-red-500">Jumlah credits melebihi sisa credits pengirim.</small>}
                            {isSameMembership && <small className="mt-1 block text-xs text-red-500">Pengirim dan penerima tidak boleh sama.</small>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Opsional)</label>
                            <textarea value={data.notes} onChange={(e) => setData("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" placeholder="Transfer kuota ke keluarga" />
                            {errors.notes && <small className="mt-1 block text-xs text-red-500">{errors.notes}</small>}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" disabled={submitDisabled} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Kirim Transfer</button>
                    </div>
                </form>
            </div>
        </>
    );
}

Transfer.layout = (page) => <DashboardLayout children={page} />;
