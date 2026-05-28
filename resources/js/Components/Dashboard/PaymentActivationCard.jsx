import React from "react";
import Checkbox from "@/Components/Dashboard/Checkbox";
import { IconHome2 } from "@tabler/icons-react";

export default function PaymentActivationCard({ data, setData, errors = {} }) {
    const methodCardClass =
        "flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3";

    const paymentMethods = [
        {
            key: "qris_enabled",
            label: "QRIS",
        },
        {
            key: "bank_transfer_enabled",
            label: "Transfer Bank",
        },
        {
            key: "debit_enabled",
            label: "Debit",
        },
        {
            key: "ayo_enabled",
            label: "AYO",
        },
        {
            key: "credit_card_enabled",
            label: "Credit Card",
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 dark:text-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <IconHome2 size={18} />
                Aktivasi Payment
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map((method) => (
                    <div key={method.key}>
                        <div className={methodCardClass}>
                            <p className="text-sm font-semibold">{method.label}</p>
                            <Checkbox
                                checked={data[method.key]}
                                onChange={(e) =>
                                    setData(method.key, e.target.checked)
                                }
                            />
                        </div>
                        {errors?.[method.key] && (
                            <small className="text-xs text-danger-500 mt-1 block">
                                {errors[method.key]}
                            </small>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
