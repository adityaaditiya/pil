import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";

export default function MyMemberships({ memberships }) {
    return (
        <>
            <Head title="My Memberships" />
            <h1 className="mb-4 text-2xl font-bold">My Memberships</h1>
            <div className="space-y-3">
                {memberships.map((item) => (
                    <div key={item.id} className="rounded-xl border p-4">
                        <p className="font-semibold">{item.plan?.name}</p>
                        <p className="text-sm">{item.credits_remaining} / {item.credits_total} credits</p>
                        <p className="text-sm">Expires: {item.expires_at || "Tidak ada"}</p>
                        <p className="text-sm">Status: {item.status}</p>
                    </div>
                ))}
            </div>
        </>
    );
}
MyMemberships.layout = (page) => <DashboardLayout children={page} />;
