import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";

export default function Plans({ plans }) {
    return (
        <>
            <Head title="Membership" />
            <h1 className="mb-4 text-2xl font-bold">Membership</h1>
            <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border p-4">
                        <h2 className="font-semibold">{plan.name}</h2>
                        <p>{plan.credits} credits • Rp {plan.price}</p>
                        <p className="text-sm text-slate-500">Class: {plan.classes.map((c) => c.name).join(", ")}</p>
                        <button className="mt-3 rounded-lg bg-primary-500 px-3 py-2 text-sm text-white" onClick={() => router.post(route("memberships.activate", plan.id))}>Buy / Activate</button>
                    </div>
                ))}
            </div>
        </>
    );
}
Plans.layout = (page) => <DashboardLayout children={page} />;
