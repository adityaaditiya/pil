import React from "react";

function FieldLabel({ children, required }) {
    return (
        <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {children}
            </span>
            {/* {required && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Wajib
                </span>
            )} */}
        </div>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export default function Form({ data, setData, errors, classes = [] }) {
    const selectedClassIds = (data.class_rules || []).map((rule) =>
        Number(rule.pilates_class_id)
    );

    const toggleClassRule = (classId) => {
        const exists = selectedClassIds.includes(classId);
        if (exists) {
            setData(
                "class_rules",
                data.class_rules.filter(
                    (rule) => Number(rule.pilates_class_id) !== classId
                )
            );
            return;
        }

        setData("class_rules", [
            ...data.class_rules,
            { pilates_class_id: classId, credit_cost: 1 },
        ]);
    };

    const updateCost = (classId, value) => {
        setData(
            "class_rules",
            data.class_rules.map((rule) =>
                Number(rule.pilates_class_id) === classId
                    ? { ...rule, credit_cost: value }
                    : rule
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Nama Paket */}
            <div>
                <FieldLabel required>Nama Paket</FieldLabel>
                <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                    placeholder="Contoh: Premium 10 Credits"
                    value={data.name || ""}
                    onChange={(e) => setData("name", e.target.value)}
                />
                <FieldError message={errors?.name} />
            </div>

            {/* Credits / Harga / Masa aktif */}
            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <FieldLabel required>Credits</FieldLabel>
                    <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                        placeholder="Mis: 10"
                        value={data.credits ?? ""}
                        onChange={(e) => setData("credits", e.target.value)}
                    />
                    <FieldError message={errors?.credits} />
                </div>

                <div>
                    <FieldLabel required>Harga</FieldLabel>
                    <input
                        type="number"
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                        placeholder="Mis: 250000"
                        value={data.price ?? ""}
                        onChange={(e) => setData("price", e.target.value)}
                    />
                    <FieldError message={errors?.price} />
                </div>

                <div>
                    <FieldLabel>Masa aktif (hari)</FieldLabel>
                    <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                        placeholder="Mis: 30 (kosong = tidak expired)"
                        value={data.valid_days ?? ""}
                        onChange={(e) => setData("valid_days", e.target.value)}
                    />
                    <FieldError message={errors?.valid_days} />
                </div>
            </div>

            {/* Deskripsi */}
            <div>
                <FieldLabel>Deskripsi</FieldLabel>
                <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                    rows={3}
                    placeholder="Tulis benefit paket, ketentuan, dll."
                    value={data.description ?? ""}
                    onChange={(e) => setData("description", e.target.value)}
                />
                <FieldError message={errors?.description} />
            </div>

            {/* Status aktif */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Status Paket
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Jika nonaktif, paket tidak muncul di halaman user.
                    </p>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200 dark:border-slate-700 dark:focus:ring-slate-800"
                        checked={!!data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                    />
                    Aktif
                </label>
            </div>

            {/* Rule class */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Rule Class yang Diizinkan
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Centang class yang boleh ditukar dengan paket ini, lalu set biaya credit-nya.
                    </p>
                </div>

                <div className="space-y-2">
                    {classes.map((item) => {
                        const checked = selectedClassIds.includes(item.id);
                        const rule = data.class_rules?.find(
                            (x) => Number(x.pilates_class_id) === item.id
                        );

                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                            >
                                <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200 dark:border-slate-700 dark:focus:ring-slate-800"
                                        checked={checked}
                                        onChange={() => toggleClassRule(item.id)}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </label>

                                {/* {checked && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Biaya
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
                                            value={rule?.credit_cost ?? 1}
                                            onChange={(e) =>
                                                updateCost(item.id, e.target.value)
                                            }
                                        />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            credit
                                        </span>
                                    </div>
                                )} */}
                            </div>
                        );
                    })}
                </div>

                <FieldError message={errors?.class_rules} />
            </div>
        </div>
    );
}
