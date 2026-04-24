import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    IconTicket,
    IconCalendarEvent,
    IconCheck,
    IconArrowRight
} from "@tabler/icons-react";

export default function Plans({ plans }) {
    const formatRupiah = (value) => {
        if (!value || Number(value) === 0) {
            return "Rp 0";
        }

        return `Rp ${new Intl.NumberFormat("id-ID").format(Number(value))}`;
    };

    return (
        <>
            <Head title="Membership Allocation" />

<div className="py-6">
    <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Membership Allocation</h1>
        <p className="mt-2 text-slate-500">Tentukan hak akses dan kuota sesi latihan untuk akun pelanggan melalui daftar paket</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
            <div 
                key={plan.id} 
                className="relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-primary-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
                {/* Header Paket */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                        {plan.name}
                    </h2>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">
                            {formatRupiah(plan.price)}
                        </span>
                    </div>
                </div>

                {/* Highlight Credits */}
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-primary-50 p-4 dark:bg-primary-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-200 dark:shadow-none">
                        <IconTicket size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-primary-800 dark:text-primary-300">Total Kredit</p>
                        <p className="text-xl font-bold text-primary-900 dark:text-white">{plan.credits} Credits</p>
                    </div>
                </div>

                {/* Detail Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <IconCalendarEvent size={18} className="text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Masa Aktif {plan.valid_days} Hari</span>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Akses Kelas:</p>
                        <div className="flex flex-wrap gap-2">
                            {plan.classes.map((c) => (
                                <span 
                                    key={c.id} 
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    <IconCheck size={14} className="text-green-500" />
                                    {c.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8">
                    <Link 
                        href={route("memberships.checkout", plan.id)} 
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-center text-sm font-bold text-white transition-all hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                        Beli & Aktifkan Paket
                        <IconArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        ))}
    </div>
</div>
        </>
    );
}
Plans.layout = (page) => <DashboardLayout children={page} />;
