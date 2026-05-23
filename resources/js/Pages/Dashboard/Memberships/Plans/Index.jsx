import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Button from "@/Components/Dashboard/Button";
import Pagination from "@/Components/Dashboard/Pagination";
import Search from "@/Components/Dashboard/Search"; // <-- Pastikan komponen Search ini diimpor

export default function Index({ plans }) {
    const formatRupiah = (value) => {
        if (!value || Number(value) === 0) {
            return "Rp 0";
        }

        return `Rp ${new Intl.NumberFormat("id-ID").format(Number(value))}`;
    };

    const rows = plans?.data ?? [];
    const paginationLinks = plans?.links ?? [];

    return (
        <>
            <Head title="Membership Plans" />
            <div className="space-y">
                {/* Header Section */}
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Membership Plans
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Kelola paket dan kuota kelas membership studio
                        </p>
                    </div>
                    <Link 
                        href={route("membership-plans.create")} 
                        className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors shadow-sm"
                    >
                        + Tambah Paket
                    </Link>
                </div>

                {/* Bagian Tombol Pencarian Simpel */}
                <div className="mb-4 max-w-sm">
                    <Search 
                        url={route("membership-plans.index")} 
                        placeholder="Cari Paket Membership..." 
                    />
                </div>

                {/* Table Section */}
                <Table.Card title="Data Paket Membership">
                    <Table>
                        <Table.Thead>
                            <tr>
                                <Table.Th>Nama</Table.Th>
                                <Table.Th>Tag</Table.Th>
                                <Table.Th>Urutan</Table.Th>
                                <Table.Th>Credits</Table.Th>
                                <Table.Th>Harga</Table.Th>
                                <Table.Th>Jumlah Kelas Terkait</Table.Th>
                                <Table.Th>Masa Aktif</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th></Table.Th>
                            </tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? (
                                rows.map((plan) => (
                                    <tr key={plan.id}>
                                        <Table.Td className="font-medium text-slate-900 dark:text-white">
                                            {plan.name}
                                        </Table.Td>
                                        <Table.Td>{plan.tag || "-"}</Table.Td>
                                        <Table.Td>{plan.order_position ?? 0}</Table.Td>
                                        <Table.Td>{plan.credits}</Table.Td>
                                        <Table.Td>{formatRupiah(plan.price)}</Table.Td>
                                        <Table.Td>{plan.class_rules_count}</Table.Td>
                                        <Table.Td>{plan.valid_days} hari</Table.Td>
                                        <Table.Td>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                plan.is_active 
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                            }`}>
                                                {plan.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="link"
                                                    href={route("membership-plans.edit", plan.id)}
                                                    label="Ubah"
                                                    className="bg-amber-500 px-3 py-2 text-xs text-white"
                                                />
                                                {/* <Button
                                                    type="delete"
                                                    url={route("membership-plans.destroy", plan.id)}
                                                    label="Hapus"
                                                    className="bg-rose-500 px-3 py-2 text-xs text-white"
                                                /> */}
                                            </div>
                                        </Table.Td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <Table.Td colSpan={9} className="text-center text-slate-500 py-8">
                                        Tidak ada data paket membership yang cocok dengan pencarian.
                                    </Table.Td>
                                </tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.Card>

                {/* Pagination Section */}
                {paginationLinks.length > 3 && (
                    <div className="mt-4 flex justify-end">
                        <Pagination links={paginationLinks} />
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;