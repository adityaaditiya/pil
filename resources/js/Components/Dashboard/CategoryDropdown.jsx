import React, { useState, useRef, useEffect } from "react";
import {
    IconChevronDown,
    IconSquare,
    IconSquareCheckFilled,
    IconSearch,
    IconX,
} from "@tabler/icons-react";

export const categoryOptions = [
    {
        value: "transaksi_penjualan",
        label: "TRANSAKSI PENJUALAN PRODUK",
        group: "Transaksi Utama",
    },
    {
        value: "transaksi_membership",
        label: "TRANSAKSI MEMBERSHIP",
        group: "Transaksi Utama",
    },
    {
        value: "transaksi_appointment_drop_in",
        label: "TRANSAKSI APPOINTMENT",
        group: "Transaksi Utama",
    },
    {
        value: "transaksi_timetable_drop_in",
        label: "TRANSAKSI BOOKING SCHEDULE",
        group: "Transaksi Utama",
    },

    {
        value: "BAYAR BUNGA BANK",
        label: "BAYAR BUNGA BANK",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "BON OPERASIONAL",
        label: "BON OPERASIONAL",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "BON PRIBADI OWNER",
        label: "BON PRIBADI OWNER",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "BON TRANSFER BANK",
        label: "BON TRANSFER BANK",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "DEBIT CREDIT CARD",
        label: "DEBIT CREDIT CARD",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "KURANG MODAL",
        label: "KURANG MODAL",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "TAMBAH MODAL",
        label: "TAMBAH MODAL",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "SETOR KE OWNER",
        label: "SETOR KE OWNER",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "SETOR KE BANK",
        label: "SETOR KE BANK",
        group: "Cash Entry / Uang Kas",
    },
    {
        value: "UANG LAIN LAIN",
        label: "UANG LAIN LAIN",
        group: "Cash Entry / Uang Kas",
    },
];

export default function CategoryDropdown({ value = "", onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    const selectedValues = value ? value.split(",").filter(Boolean) : [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (val) => {
        let updated;
        if (selectedValues.includes(val)) {
            updated = selectedValues.filter((v) => v !== val);
        } else {
            updated = [...selectedValues, val];
        }
        onChange(updated.join(","));
    };

    const handleSelectAll = () => {
        onChange("");
    };

    const filteredOptions = categoryOptions.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const groups = Array.from(new Set(filteredOptions.map((o) => o.group)));

    const getTriggerLabel = () => {
        if (selectedValues.length === 0) return "Semua Kategori";
        if (selectedValues.length === 1) {
            const found = categoryOptions.find(
                (o) => o.value === selectedValues[0]
            );
            return found ? found.label : selectedValues[0];
        }
        return `${selectedValues.length} Kategori Dipilih`;
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kategori Transaksi
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border text-left text-sm flex items-center justify-between transition-all duration-200 ${
                    isOpen
                        ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                } text-slate-800 dark:text-slate-200`}
            >
                <span className="truncate pr-2 font-medium flex items-center gap-2">
                    {selectedValues.length > 1 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400">
                            {selectedValues.length}
                        </span>
                    )}
                    <span
                        className={
                            selectedValues.length === 0
                                ? "text-slate-500 dark:text-slate-400"
                                : ""
                        }
                    >
                        {getTriggerLabel()}
                    </span>
                </span>
                <IconChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary-500" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[280px] max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 right-0 sm:left-0">
                    <div className="space-y-2 mb-2">
                        <div className="relative">
                            <IconSearch
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kategori..."
                                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-primary-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <IconX size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-between px-1 text-xs">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className={`font-medium transition-colors ${
                                    selectedValues.length === 0
                                        ? "text-primary-600 dark:text-primary-400 font-semibold"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                Semua Kategori
                            </button>
                            {selectedValues.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-danger-500 hover:text-danger-600 font-medium"
                                >
                                    Reset Pilihan
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                        {groups.length > 0 ? (
                            groups.map((group) => (
                                <div key={group} className="space-y-1">
                                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        {group}
                                    </div>
                                    {filteredOptions
                                        .filter((opt) => opt.group === group)
                                        .map((opt) => {
                                            const isSelected =
                                                selectedValues.includes(
                                                    opt.value
                                                );
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() =>
                                                        toggleOption(opt.value)
                                                    }
                                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                                                        isSelected
                                                            ? "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-medium"
                                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                                                    }`}
                                                >
                                                    {isSelected ? (
                                                        <IconSquareCheckFilled
                                                            size={18}
                                                            className="text-primary-500 shrink-0"
                                                        />
                                                    ) : (
                                                        <IconSquare
                                                            size={18}
                                                            className="text-slate-300 dark:text-slate-600 shrink-0"
                                                        />
                                                    )}
                                                    <span className="truncate">
                                                        {opt.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">
                                Kategori tidak ditemukan
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
