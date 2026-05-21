import CustomerSelect from "@/Components/POS/CustomerSelect";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import { IconExchange } from "@tabler/icons-react";
import { useMemo, useState } from "react";

export default function Transfer({ customers = [] }) {
    const [sender, setSender] = useState(null);
    const [receiver, setReceiver] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        sender_customer_id: "",
        receiver_customer_id: "",
        credits_amount: "",
        notes: "",
    });

    const senderCredit = useMemo(() => Number(sender?.credit || 0), [sender]);
    const amount = Number(data.credits_amount || 0);
    const sameCustomer = Number(data.sender_customer_id) && Number(data.sender_customer_id) === Number(data.receiver_customer_id);
    const amountExceeded = amount > senderCredit;
    const isDisabled = processing || !data.sender_customer_id || !data.receiver_customer_id || amount < 1 || sameCustomer || amountExceeded;

    const submit = (e) => {
        e.preventDefault();
        post(route("memberships.transfer.store"));
    };

    return (
        <DashboardLayout>
            <Head title="Transfer Membership" />
            <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><IconExchange className="text-primary-500" />Transfer Membership</h1>
                <p className="mb-8 text-sm text-slate-500">Pindahkan credits membership antar pelanggan dengan aman dan cepat.</p>
                <form onSubmit={submit} className="space-y-6">
                    <CustomerSelect customers={customers} selectedCustomer={sender} onSelect={(item) => { setSender(item); setData("sender_customer_id", item?.id || ""); }} searchRoute="memberships.transfer.customers.search" label="From Member" />
                    {sender && <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">Sisa credits aktif: <span className="font-semibold">{senderCredit}</span></div>}
                    {errors.sender_customer_id && <p className="text-sm text-red-500">{errors.sender_customer_id}</p>}

                    <CustomerSelect customers={customers} selectedCustomer={receiver} onSelect={(item) => { setReceiver(item); setData("receiver_customer_id", item?.id || ""); }} searchRoute="memberships.transfer.customers.search" label="To Member" />
                    {errors.receiver_customer_id && <p className="text-sm text-red-500">{errors.receiver_customer_id}</p>}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Credits Amount</label>
                        <input type="number" min="1" value={data.credits_amount} onChange={(e) => setData("credits_amount", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none" placeholder="Contoh: 10" />
                        {amountExceeded && <p className="mt-1 text-xs text-red-500">Jumlah credits melebihi sisa credits pengirim.</p>}
                        {errors.credits_amount && <p className="mt-1 text-xs text-red-500">{errors.credits_amount}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Notes (Opsional)</label>
                        <textarea value={data.notes} onChange={(e) => setData("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none" placeholder="Transfer kuota ke keluarga" />
                    </div>

                    {sameCustomer && <p className="text-sm text-red-500">Pengirim dan penerima tidak boleh orang yang sama.</p>}

                    <button type="submit" disabled={isDisabled} className="inline-flex items-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Kirim Transfer</button>
                </form>
            </div>
        </DashboardLayout>
    );
}
