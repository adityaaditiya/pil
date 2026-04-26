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

            {/* Bagian Header Halaman */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Kelola Kuesioner
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Manajemen Template Kuesioner Pelanggan
                </p>
            </div>

            {/* Bagian Toolbar (Pencarian & Tombol Aksi) */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
                <div className="w-full sm:w-96 shadow-sm rounded-xl">
                    <Search url={route("questions.index")} placeholder="Cari pertanyaan..." className="w-full" />
                </div>
                <Link 
                    href={route("questions.create")} 
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-primary-600 border border-transparent rounded-xl shadow-sm hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Tambah Pertanyaan
                </Link>
            </div>

            {/* Bagian Tabel */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                <Table.Card title="Template Pertanyaan Kuesioner" className="border-none shadow-none">
                    <Table>
                        <Table.Thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <Table.Th className="py-4 text-sm font-semibold text-gray-700">Pertanyaan</Table.Th>
                                <Table.Th className="py-4 text-sm font-semibold text-gray-700">Tipe</Table.Th>
                                <Table.Th className="py-4 text-sm font-semibold text-gray-700">Wajib</Table.Th>
                                <Table.Th className="py-4 text-sm font-semibold text-right text-gray-700">Aksi</Table.Th>
                            </tr>
                        </Table.Thead>
                        <Table.Tbody className="divide-y divide-gray-100">
                            {questions.data.map((q) => (
                                <tr key={q.id} className="transition-colors hover:bg-gray-50/60">
                                    <Table.Td className="py-4 text-sm font-medium text-gray-900">
                                        {q.question_text}
                                    </Table.Td>
                                    <Table.Td className="py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200/60">
                                            {q.input_type}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            q.is_required 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" 
                                                : "bg-gray-50 text-gray-600 border-gray-200/60"
                                        }`}>
                                            {q.is_required ? "Ya" : "Tidak"}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Tombol Edit */}
                                        <Link 
                                            href={route("questions.edit", q.id)} 
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                        >
                                            Edit
                                        </Link>
                                        
                                        {/* Tombol Hapus (Pastikan url/method sesuai dengan cara Anda menghapus data) */}
                                        <Link 
                                            href={route("questions.destroy", q.id)} 
                                            method="delete"
                                            as="button"
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                        >
                                            Hapus
                                        </Link>
                                    </div>
                                </Table.Td>
                                </tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.Card>
            </div>

            {/* Bagian Pagination */}
            {questions.last_page !== 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination links={questions.links} />
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;