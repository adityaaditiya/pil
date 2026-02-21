import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";
import { IconCalendarEvent } from "@tabler/icons-react";

export default function Index({ timetables }) {
    return (
        <>
            <Head title="Timetable" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconCalendarEvent size={28} className="text-primary-500" /> Timetable
                </h1>
                <p className="text-sm text-slate-500 mt-1">Jadwal sesi kelas pilates.</p>
            </div>

            <Table.Card title="Data Timetable">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th>Kelas</Table.Th>
                            <Table.Th>Trainer</Table.Th>
                            <Table.Th>Mulai</Table.Th>
                            <Table.Th>Kapasitas</Table.Th>
                            <Table.Th>Status</Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {timetables.data.map((item) => (
                            <tr key={item.id}>
                                <Table.Td>{item.pilates_class?.name ?? "-"}</Table.Td>
                                <Table.Td>{item.trainer?.name ?? "-"}</Table.Td>
                                <Table.Td>{new Date(item.start_at).toLocaleString("id-ID")}</Table.Td>
                                <Table.Td>{item.capacity}</Table.Td>
                                <Table.Td className="capitalize">{item.status}</Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>

            {timetables.last_page !== 1 && <Pagination links={timetables.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
