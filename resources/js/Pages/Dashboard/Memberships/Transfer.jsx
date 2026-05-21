import React, { useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Transfer({ customers = [], senderMemberships = [] }) {
    const { data, setData, post, processing } = useForm({
        sender_membership_id: "",
        receiver_customer_id: "",
        credits_amount: "",
        notes: "",
    });

    const selectedSenderMembership = useMemo(
        () => senderMemberships.find((item) => Number(item.id) === Number(data.sender_membership_id)),
        [senderMemberships, data.sender_membership_id]
    );

    const selectedReceiver = useMemo(
        () => customers.find((item) => Number(item.id) === Number(data.receiver_customer_id)),
        [customers, data.receiver_customer_id]
    );

    const disabledSubmit =
        !selectedSenderMembership ||
        !selectedReceiver ||
        Number(data.credits_amount || 0) <= 0 ||
        Number(data.credits_amount || 0) > Number(selectedSenderMembership?.credits_remaining || 0) ||
        Number(selectedSenderMembership?.user_id) === Number(selectedReceiver?.user_id);

    return (
        <>
            <Head title="Transfer Membership" />
            <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800">Transfer Membership</h1>
                <p className="mt-1 text-sm text-slate-500">Pindahkan credit membership antar pelanggan dengan aman.</p>

                <form className="mt-6 grid gap-5" onSubmit={(e) => { e.preventDefault(); post(route("memberships.transfer.store")); }}>
                    <div>
                        <label className="mb-2 block text-sm font-semibold">From Member</label>
                        <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={data.sender_membership_id} onChange={(e) => setData("sender_membership_id", e.target.value)}>
                            <option value="">Pilih pengirim & membership plan</option>
                            {senderMemberships.map((membership) => (
                                <option key={membership.id} value={membership.id}>{membership.customer_name} - {membership.plan_name} (sisa {membership.credits_remaining} credits)</option>
                            ))}
                        </select>
                        {selectedSenderMembership && <p className="mt-2 text-xs text-slate-500">Sisa aktif: {selectedSenderMembership.credits_remaining} credits • Exp: {selectedSenderMembership.expires_at ? new Date(selectedSenderMembership.expires_at).toLocaleDateString("id-ID") : "-"}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">To Member</label>
                        <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={data.receiver_customer_id} onChange={(e) => setData("receiver_customer_id", e.target.value)}>
                            <option value="">Pilih penerima</option>
                            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} {customer.no_telp ? `(${customer.no_telp})` : ""}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Credits Amount</label>
                        <input type="number" min="1" className="w-full rounded-xl border border-slate-200 px-3 py-2" value={data.credits_amount} onChange={(e) => setData("credits_amount", e.target.value.replace(/[^\d]/g, ""))} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Notes</label>
                        <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2" rows="3" value={data.notes} onChange={(e) => setData("notes", e.target.value)} placeholder="Transfer kuota ke keluarga" />
                    </div>

                    <button type="submit" disabled={processing || disabledSubmit} className="rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Kirim Transfer</button>
                </form>
            </div>
        </>
    );
}

Transfer.layout = (page) => <DashboardLayout children={page} />;
