import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Table from "@/Components/Dashboard/Table";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";

export default function Index({ questions }) {
    return (
        <>
            <Head title="Kelola Kuesioner" />
            <div className="flex justify-between mb-4">
                <Search url={route("questions.index")} placeholder="Cari pertanyaan..." />
                <Link href={route("questions.create")} className="px-4 py-2 rounded-xl bg-primary-500 text-white">Tambah Pertanyaan</Link>
            </div>
            <Table.Card title="Template Pertanyaan Kuesioner">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th>Pertanyaan</Table.Th>
                            <Table.Th>Tipe</Table.Th>
                            <Table.Th>Wajib</Table.Th>
                            <Table.Th></Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {questions.data.map((q) => (
                            <tr key={q.id}>
                                <Table.Td>{q.question_text}</Table.Td>
                                <Table.Td>{q.input_type}</Table.Td>
                                <Table.Td>{q.is_required ? "Ya" : "Tidak"}</Table.Td>
                                <Table.Td>
                                    <div className="flex gap-2">
                                        <Button type="edit" href={route("questions.edit", q.id)} label="Edit" className="border" />
                                        <Button type="delete" url={route("questions.destroy", q.id)} label="Hapus" className="border" />
                                    </div>
                                </Table.Td>
                            </tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.Card>
            {questions.last_page !== 1 && <Pagination links={questions.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
