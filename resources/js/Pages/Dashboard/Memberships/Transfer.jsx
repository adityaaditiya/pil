import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import { useMemo } from "react";

export default function Transfer({ customers = [], senderMemberships = [] }) {
    const { data, setData, post, processing } = useForm({
        from_user_id: "",
        to_user_id: "",
        sender_membership_id: "",
        credits_amount: "",
        notes: "",
    });

    const senderMembershipOptions = useMemo(() => senderMemberships.filter((m) => String(m.user_id) === String(data.from_user_id)), [senderMemberships, data.from_user_id]);
    const selectedMembership = useMemo(() => senderMembershipOptions.find((m) => String(m.id) === String(data.sender_membership_id)) || null, [senderMembershipOptions, data.sender_membership_id]);
    const creditsAmount = Number(data.credits_amount || 0);
    const invalidCredits = selectedMembership ? creditsAmount > Number(selectedMembership.credits_remaining || 0) : false;
    const sameUser = data.from_user_id && data.to_user_id && String(data.from_user_id) === String(data.to_user_id);
    const disabledSubmit = processing || !data.from_user_id || !data.to_user_id || !data.sender_membership_id || !data.credits_amount || invalidCredits || sameUser;

    const submit = (e) => {
        e.preventDefault();
        post(route("memberships.transfer.store"));
    };

    return (
        <DashboardLayout>
            <Head title="Transfer Membership" />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold mb-6">Transfer Membership Credits</h1>
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium">From Member</label>
                            <input list="customer-list" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Pilih pengirim" onChange={(e)=>{setData('from_user_id', e.target.value);setData('sender_membership_id','');}} value={data.from_user_id} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Membership Plan Pengirim</label>
                            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={data.sender_membership_id} onChange={(e)=>setData('sender_membership_id', e.target.value)}>
                                <option value="">Pilih membership plan</option>
                                {senderMembershipOptions.map((item) => <option key={item.id} value={item.id}>{item.membership_plan_name} - {item.credits_remaining} credits (exp {item.expires_at ?? '-'})</option>)}
                            </select>
                        </div>
                        {selectedMembership && <p className="text-sm text-slate-600">Sisa aktif: {selectedMembership.membership_plan_name} | {selectedMembership.credits_remaining} credits | aktif sampai {selectedMembership.expires_at ?? '-'}</p>}
                        <div>
                            <label className="text-sm font-medium">To Member</label>
                            <input list="customer-list" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Pilih penerima" onChange={(e)=>setData('to_user_id', e.target.value)} value={data.to_user_id} />
                        </div>
                        <datalist id="customer-list">
                            {customers.map((c) => <option key={c.user_id} value={c.user_id}>{c.name}</option>)}
                        </datalist>
                        <div>
                            <label className="text-sm font-medium">Credits Amount</label>
                            <input type="number" min={1} className="mt-1 w-full rounded-xl border px-3 py-2" value={data.credits_amount} onChange={(e)=>setData('credits_amount', e.target.value)} />
                            {invalidCredits && <p className="text-xs text-red-500 mt-1">Credits melebihi sisa credits pengirim.</p>}
                            {sameUser && <p className="text-xs text-red-500 mt-1">Pengirim dan penerima tidak boleh sama.</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} value={data.notes} onChange={(e)=>setData('notes', e.target.value)} placeholder="Opsional" />
                        </div>
                        <button disabled={disabledSubmit} className="rounded-xl bg-primary-600 text-white px-4 py-2 disabled:opacity-50">Kirim Transfer</button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
