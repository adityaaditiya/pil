import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import { IconUserSquare } from "@tabler/icons-react";

export default function Index({ trainers }) {
    return (
        <>
            <Head title="Trainer" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconUserSquare size={28} className="text-primary-500" /> Trainer
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Data trainer diambil dari Pengguna dengan Akses Group trainer.</p>
                </div>
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
                            <Table.Th>Tanggal Lahir</Table.Th>
                            <Table.Th>Gender</Table.Th>
                            <Table.Th>Alamat</Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {trainers.data.map((item) => (
                            <tr key={item.id}>
                                <Table.Td>
                                    <img
                                        src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`}
                                        alt={item.name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                </Table.Td>
                                <Table.Td>{item.name}</Table.Td>
                                <Table.Td>
                                    {item.date_of_birth 
                                        ? new Date(item.date_of_birth).toLocaleDateString('id-ID').replace(/\//g, '-') 
                                        : "-"}
                                </Table.Td>
                                <Table.Td>{item.gender || "-"}</Table.Td>
                                <Table.Td>
                                    <p className="max-w-[260px] line-clamp-2">{item.address || "-"}</p>
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
