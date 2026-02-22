import React from "react";

export default function Form({ data, setData, errors, classes = [] }) {
    const selectedClassIds = data.class_rules.map((rule) => Number(rule.pilates_class_id));

    const toggleClassRule = (classId) => {
        const exists = selectedClassIds.includes(classId);
        if (exists) {
            setData("class_rules", data.class_rules.filter((rule) => Number(rule.pilates_class_id) !== classId));
            return;
        }

        setData("class_rules", [...data.class_rules, { pilates_class_id: classId, credit_cost: 1 }]);
    };

    const updateCost = (classId, value) => {
        setData(
            "class_rules",
            data.class_rules.map((rule) => Number(rule.pilates_class_id) === classId ? { ...rule, credit_cost: value } : rule)
        );
    };

    return (
        <div className="space-y-4">
            <input className="w-full rounded-xl border px-4 py-2.5" placeholder="Nama Paket" value={data.name} onChange={(e) => setData("name", e.target.value)} />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            <div className="grid gap-3 md:grid-cols-3">
                <input type="number" min={1} className="rounded-xl border px-4 py-2.5" placeholder="Credits" value={data.credits} onChange={(e) => setData("credits", e.target.value)} />
                <input type="number" min={0} className="rounded-xl border px-4 py-2.5" placeholder="Harga" value={data.price} onChange={(e) => setData("price", e.target.value)} />
                <input type="number" min={1} className="rounded-xl border px-4 py-2.5" placeholder="Masa aktif (hari)" value={data.valid_days || ""} onChange={(e) => setData("valid_days", e.target.value)} />
            </div>
            <textarea className="w-full rounded-xl border px-4 py-2.5" rows={3} placeholder="Deskripsi" value={data.description || ""} onChange={(e) => setData("description", e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_active} onChange={(e) => setData("is_active", e.target.checked)} /> Aktif</label>

            <div className="rounded-xl border p-4">
                <p className="mb-3 font-semibold">Rule Class yang Diizinkan</p>
                <div className="space-y-2">
                    {classes.map((item) => {
                        const checked = selectedClassIds.includes(item.id);
                        const rule = data.class_rules.find((x) => Number(x.pilates_class_id) === item.id);
                        return (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={checked} onChange={() => toggleClassRule(item.id)} /> {item.name}
                                </label>
                                {checked && <input type="number" min={1} className="w-24 rounded-lg border px-2 py-1 text-sm" value={rule?.credit_cost || 1} onChange={(e) => updateCost(item.id, e.target.value)} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
