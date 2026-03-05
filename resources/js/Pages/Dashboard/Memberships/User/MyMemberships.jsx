import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import WelcomeNavbar from "@/Components/Landing/WelcomeNavbar";

export default function MyMemberships({ memberships }) {
    const { auth } = usePage().props;
    const isCustomer = !(auth?.permissions || []).includes("dashboard-access");

    const content = (
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

    if (isCustomer) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <WelcomeNavbar auth={auth} />
                <div className="mx-auto max-w-6xl px-4 py-10">{content}</div>
            </div>
        );
    }

    return <DashboardLayout>{content}</DashboardLayout>;
}
