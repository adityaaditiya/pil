import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import { IconCirclePlus, IconPencilCog, IconTrash } from "@tabler/icons-react";

export default function Index({ studioPages }) {
    return (
        <>
            <Head title="Kelola Menu Studio" />

            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Menu Studio</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">CRUD halaman Home, About, Classes, Schedule, Pricing, Trainers, Testimonials, Contact</p>
                </div>
                <Button
                    type="link"
                    href={route("studio-pages.create")}
                    label="Tambah Halaman"
                    icon={<IconCirclePlus size={18} />}
                    className="bg-primary-500 text-white hover:bg-primary-600"
                />
            </div>

            <div className="mb-4 max-w-sm">
                <Search url={route("studio-pages.index")} placeholder="Cari halaman..." />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Nama</th>
                            <th className="px-4 py-3 font-semibold">Key</th>
                            <th className="px-4 py-3 font-semibold">Title</th>
                            <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studioPages.data.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3">{item.name}</td>
                                <td className="px-4 py-3">{item.key}</td>
                                <td className="px-4 py-3">{item.title}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
                                        <Link href={route("studio-pages.edit", item.id)} className="rounded-lg bg-amber-100 p-2 text-amber-700">
                                            <IconPencilCog size={16} />
                                        </Link>
                                        <Button type="delete" url={route("studio-pages.destroy", item.id)} icon={<IconTrash size={16} />} className="rounded-lg bg-rose-100 text-rose-700" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={studioPages.links} align="end" />
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
