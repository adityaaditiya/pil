import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import Button from "@/Components/Dashboard/Button";
import { IconCirclePlus, IconPencilCog, IconTrash, IconUserSquare } from "@tabler/icons-react";

export default function Index({ trainers }) {
    return (
        <>
            <Head title="Trainer" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconUserSquare size={28} className="text-primary-500" /> Trainer
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data trainer studio pilates.</p>
                </div>
                <Link href={route("trainers.create")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium">
                    <IconCirclePlus size={18} /> Tambah Trainer
                </Link>
            </div>

            <div className="mb-4 max-w-sm">
                <Search url={route("trainers.index")} placeholder="Cari trainer..." />
            </div>

            <Table.Card title="Data Trainer">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th>Foto</Table.Th>
                            <Table.Th>Nama</Table.Th>
                            <Table.Th>Usia</Table.Th>
                            <Table.Th>Jenis Kelamin</Table.Th>
                            <Table.Th>Alamat</Table.Th>
                            <Table.Th></Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {trainers.data.map((item) => (
                            <tr key={item.id}>
                                <Table.Td>
                                    {item.photo ? (
                                        <img src={`/storage/trainers/${item.photo}`} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-slate-100" />
                                    )}
                                </Table.Td>
                                <Table.Td>{item.name}</Table.Td>
                                <Table.Td>{item.age}</Table.Td>
                                <Table.Td>{item.gender}</Table.Td>
                                <Table.Td>
                                    <p className="max-w-[260px] line-clamp-2">{item.address}</p>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex gap-2">
                                        <Button type="edit" href={route("trainers.edit", item.id)} icon={<IconPencilCog size={16} />} className="border bg-warning-100 border-warning-200 text-warning-600" />
                                        <Button type="delete" url={route("trainers.destroy", item.id)} icon={<IconTrash size={16} />} className="border bg-danger-100 border-danger-200 text-danger-600" />
                                    </div>
                                </Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>

            {trainers.last_page !== 1 && <Pagination links={trainers.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
