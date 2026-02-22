import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({ classes }) {
    const { data, setData, post, processing, errors } = useForm({ name: "", credits: 1, price: 0, valid_days: "", is_active: true, description: "", class_rules: [] });
    return <><Head title="Tambah Membership Plan" /><h1 className="mb-4 text-2xl font-bold">Tambah Membership Plan</h1><Form data={data} setData={setData} errors={errors} classes={classes} /><button onClick={() => post(route("membership-plans.store"))} disabled={processing} className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-white">Simpan</button></>;
}
Create.layout = (page) => <DashboardLayout children={page} />;
