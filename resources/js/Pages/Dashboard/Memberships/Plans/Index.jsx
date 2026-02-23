import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Button from "@/Components/Dashboard/Button";

export default function Index({ plans }) {
    return (
        <>
            <Head title="Membership Plans" />
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Membership Plans</h1>
                <Link href={route("membership-plans.create")} className="rounded-xl bg-primary-500 px-4 py-2 text-sm text-white">+ Tambah Paket</Link>
            </div>
            <Table.Card title="Data Paket Membership">
                <Table>
                    <Table.Thead><tr><Table.Th>Nama</Table.Th><Table.Th>Credits</Table.Th><Table.Th>Harga</Table.Th><Table.Th>Jumlah Kelas Terkait</Table.Th><Table.Th>Status</Table.Th><Table.Th></Table.Th></tr></Table.Thead>
                    <Table.Tbody>
                        {plans.data.map((plan) => (
                            <tr key={plan.id}>
                                <Table.Td>{plan.name}</Table.Td><Table.Td>{plan.credits}</Table.Td><Table.Td>{plan.price}</Table.Td><Table.Td>{plan.class_rules_count}</Table.Td><Table.Td>{plan.is_active ? "Aktif" : "Nonaktif"}</Table.Td>
                                <Table.Td><div className="flex gap-2"><Button type="edit" href={route("membership-plans.edit", plan.id)} /><Button type="delete" url={route("membership-plans.destroy", plan.id)} /></div></Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>
        </>
    );
}
Index.layout = (page) => <DashboardLayout children={page} />;
