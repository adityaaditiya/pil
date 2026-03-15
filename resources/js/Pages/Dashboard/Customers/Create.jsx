import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import toast from "react-hot-toast";
import {
    IconUsers,
    IconDeviceFloppy,
    IconArrowLeft,
    IconMail,
    IconLock,
} from "@tabler/icons-react";

export default function Create() {
    const { errors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: "",
        email: "",
        no_telp: "",
        address: "",
        gender: "Laki-laki",
        date_of_birth: "",
        photo: null,
        credit: "0",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"), {
            onSuccess: () => toast.success("Pelanggan berhasil ditambahkan"),
            onError: () => toast.error("Gagal menyimpan pelanggan"),
        });
    };

    return (
        <>
            <Head title="Tambah Pelanggan" />

            <div className="mb-6">
                <Link
                    href={route("customers.index")}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3"
                >
                    <IconArrowLeft size={16} />
                    Kembali ke Pelanggan
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconUsers size={28} className="text-primary-500" />
                    Tambah Pelanggan Baru
                </h1>
            </div>

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="max-w-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    label="Nama Pelanggan"
                                    placeholder="Masukkan nama lengkap"
                                    errors={errors.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    value={data.name}
                                />
                                <div className="relative">
                                    <Input
                                        type="text"
                                        label="No. Handphone"
                                        placeholder="628xxxxxxxxxx"
                                        errors={errors.no_telp}
                                        onChange={(e) =>
                                            setData("no_telp", e.target.value)
                                        }
                                        value={data.no_telp}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="email"
                                    label="Email"
                                    icon={<IconMail size={18} strokeWidth={1.5} />}
                                    placeholder="nama@email.com"
                                    errors={errors.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    value={data.email}
                                />
                                <Input
                                    type="password"
                                    label="Password"
                                    icon={<IconLock size={18} strokeWidth={1.5} />}
                                    placeholder="Minimal 8 karakter"
                                    errors={errors.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    value={data.password}
                                />
                            </div>
                            <Input
                                type="password"
                                label="Konfirmasi Password"
                                icon={<IconLock size={18} strokeWidth={1.5} />}
                                placeholder="Ulangi password"
                                errors={errors.password_confirmation}
                                onChange={(e) =>
                                    setData("password_confirmation", e.target.value)
                                }
                                value={data.password_confirmation}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                                    <select value={data.gender} onChange={(e) => setData("gender", e.target.value)} className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                    {errors.gender && <small className="text-xs text-danger-500">{errors.gender}</small>}
                                </div>
                                <Input
                                    type="date"
                                    label="Tanggal Lahir"
                                    errors={errors.date_of_birth}
                                    onChange={(e) =>
                                        setData("date_of_birth", e.target.value)
                                    }
                                    value={data.date_of_birth}
                                />
                            </div>
                            <Input
                                type="file"
                                label="Foto (Opsional)"
                                errors={errors.photo}
                                onChange={(e) =>
                                    setData("photo", e.target.files[0])
                                }
                            />

                            {/* <Input
                                type="number"
                                label="Credit"
                                placeholder="0"
                                errors={errors.credit}
                                onChange={(e) =>
                                    setData("credit", e.target.value)
                                }
                                value={data.credit}
                            /> */}
                            
                            <Textarea
                                label="Alamat"
                                placeholder="Alamat lengkap pelanggan"
                                errors={errors.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                value={data.address}
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href={route("customers.index")}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
