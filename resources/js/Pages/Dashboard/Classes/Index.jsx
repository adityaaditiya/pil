import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import Button from "@/Components/Dashboard/Button";
import { IconCirclePlus, IconPencilCog, IconSchool, IconTrash } from "@tabler/icons-react";

export default function Index({ classes }) {
    return (
        <>
            <Head title="Classes" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconSchool size={28} className="text-primary-500" /> Classes
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola master class studio pilates.</p>
                </div>
                <Link href={route("classes.create")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium">
                    <IconCirclePlus size={18} /> Tambah Classes
                </Link>
            </div>

            <div className="mb-4 max-w-sm">
                <Search url={route("classes.index")} placeholder="Cari kelas..." />
            </div>

            <Table.Card title="Data Master Classes">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th>Gambar</Table.Th>
                            <Table.Th>Nama Kelas</Table.Th>
                            <Table.Th>Durasi</Table.Th>
                            <Table.Th>Difficulty</Table.Th>
                            <Table.Th>About</Table.Th>
                            <Table.Th>Perlengkapan</Table.Th>
                            <Table.Th>Trainers</Table.Th>
                            <Table.Th>Credit Default</Table.Th>
                            <Table.Th>Harga Default</Table.Th>
                            <Table.Th></Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {classes.data.map((item) => (
                            <tr key={item.id}>
                                <Table.Td>
                                    <img src={`/storage/classes/${item.image}`} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                                </Table.Td>
                                <Table.Td>{item.name}</Table.Td>
                                <Table.Td>{item.duration} menit</Table.Td>
                                <Table.Td>{item.difficulty_level}</Table.Td>
                                <Table.Td><p className="max-w-[220px] line-clamp-2">{item.about}</p></Table.Td>
                                <Table.Td><p className="max-w-[220px] line-clamp-2">{item.equipment}</p></Table.Td>
                                <Table.Td>{item.trainers.map((trainer) => trainer.name).join(", ")}</Table.Td>
                                <Table.Td>{item.credit}</Table.Td>
                                <Table.Td>{item.price}</Table.Td>
                                <Table.Td>
                                    <div className="flex gap-2">
                                        <Button type="edit" href={route("classes.edit", item.id)} icon={<IconPencilCog size={16} />} className="border bg-warning-100 border-warning-200 text-warning-600" />
                                        <Button type="delete" url={route("classes.destroy", item.id)} icon={<IconTrash size={16} />} className="border bg-danger-100 border-danger-200 text-danger-600" />
                                    </div>
                                </Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>

            {classes.last_page !== 1 && <Pagination links={classes.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
