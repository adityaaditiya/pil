import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";

export default function Plans({ plans }) {
    const formatRupiah = (value) => {
        if (!value || Number(value) === 0) {
            return "Rp 0";
        }

        return `Rp ${new Intl.NumberFormat("id-ID").format(Number(value))}`;
    };

    return (
        <>
            <Head title="Membership" />
            <h1 className="mb-4 text-2xl font-bold">Membership</h1>
            <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border p-4">
                        <h2 className="font-semibold">{plan.name}</h2>
                        <p>{plan.credits} credits • {formatRupiah(plan.price)}</p>
                        <div className="mt-2 text-sm text-wellness-muted">
                            <span className="font-medium block mb-1">Masa Aktif: {plan.valid_days} hari</span>
                        <span className="font-medium block mb-1">Kelas Terkait:</span>
                        <div className="flex flex-col gap-1">
                            {plan.classes.map((c) => (
                                <div key={c.id} className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-slate-400"></span> {/* Bullet point kecil */}
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                        <Link href={route("memberships.checkout", plan.id)} className="mt-3 inline-block rounded-lg bg-primary-500 px-3 py-2 text-sm text-white">Buy / Activate</Link>
                    </div>
                ))}
            </div>
        </>
    );
}
Plans.layout = (page) => <DashboardLayout children={page} />;
