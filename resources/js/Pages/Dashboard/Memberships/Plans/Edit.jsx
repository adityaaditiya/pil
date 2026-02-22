import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ plan, classes }) {
    const { data, setData, put, processing, errors } = useForm({ ...plan, class_rules: plan.class_rules.map((item) => ({ pilates_class_id: item.pilates_class_id, credit_cost: item.credit_cost })) });
    return <><Head title="Edit Membership Plan" /><h1 className="mb-4 text-2xl font-bold">Edit Membership Plan</h1><Form data={data} setData={setData} errors={errors} classes={classes} /><button onClick={() => put(route("membership-plans.update", plan.id))} disabled={processing} className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-white">Update</button></>;
}
Edit.layout = (page) => <DashboardLayout children={page} />;
