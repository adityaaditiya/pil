import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Search from "@/Components/Dashboard/Search";
import Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";
import { IconCalendarClock, IconCirclePlus, IconPencilCog, IconTrash } from "@tabler/icons-react";

export default function Index({ appointmentSessions }) {
    return (
        <>
            <Head title="Sesi Appointment" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sesi Appointment</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kelola daftar nama sesi dan deskripsi yang dipakai pada form appointment.</p>
                </div>
                <Button type="link" href={route("appointment-sessions.create")} label="Tambah Sesi Appointment" icon={<IconCirclePlus size={18} />} className="bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600" />
            </div>

            <div className="mb-4 w-full sm:w-80">
                <Search url={route("appointment-sessions.index")} placeholder="Cari sesi appointment..." />
            </div>

            <Table.Card title="Data Sesi Appointment">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th className="w-10">No</Table.Th>
                            <Table.Th>Nama Sesi</Table.Th>
                            <Table.Th>Deskripsi</Table.Th>
                            <Table.Th>Harga Drop-in</Table.Th>
                            <Table.Th>Harga Credits</Table.Th>
                            <Table.Th>Metode Pembayaran</Table.Th>
                            <Table.Th className="w-32">Aksi</Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {appointmentSessions.data.map((item, index) => (
                            <tr key={item.id}>
                                <Table.Td>{index + 1 + (appointmentSessions.current_page - 1) * appointmentSessions.per_page}</Table.Td>
                                <Table.Td>
                                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                                        <IconCalendarClock size={16} className="text-primary-500" /> {item.session_name}
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.description || "-"}</p>
                                </Table.Td>
                                <Table.Td>{Number(item.default_price_drop_in || 0).toLocaleString("id-ID")}</Table.Td>
                                <Table.Td>{Number(item.default_price_credit || 0).toLocaleString("id-ID")}</Table.Td>
                                <Table.Td>{item.default_payment_method === "credit_only" ? "Hanya bisa pakai credits" : "Bisa pakai credit atau drop-in"}</Table.Td>
                                <Table.Td>
                                    <div className="flex gap-2">
                                        <Link href={route("appointment-sessions.edit", item.id)} className="inline-flex items-center justify-center rounded-xl border border-warning-200 bg-warning-100 p-2 text-warning-600 transition hover:bg-warning-200">
                                            <IconPencilCog size={16} />
                                        </Link>
                                        <Button type="delete" url={route("appointment-sessions.destroy", item.id)} icon={<IconTrash size={16} />} className="border border-danger-200 bg-danger-100 text-danger-600" />
                                    </div>
                                </Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>

            {appointmentSessions.last_page !== 1 && <Pagination links={appointmentSessions.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
