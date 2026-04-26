import React from "react";
import Input from "@/Components/Dashboard/Input";
import TextArea from "@/Components/Dashboard/TextArea";
import { useEffect } from 'react';

// Cukup gunakan errors dari props saja
export default function Form({ data, setData, errors }) {
    const showOptions = ["multiple_choice", "checkbox"].includes(data.input_type);

    const updateOption = (index, value) => {
        const next = [...data.options];
        next[index] = value;
        setData("options", next);
    };

    // Debugging untuk melihat error di console (opsional)
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            console.log("Error dari Server:", errors);
        }
    }, [errors]);

    return (
        <div className="space-y-4">
            <TextArea
                label="Teks Pertanyaan"
                value={data.question_text}
                onChange={(e) => setData("question_text", e.target.value)}
                errors={errors.question_text}
                placeholder="Masukkan pertanyaan kuesioner"
            />

            <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipe Input</label>
                <select
                    className="mt-1 w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={data.input_type}
                    onChange={(e) => {
                        setData("input_type", e.target.value);
                        // Reset options jika pindah ke tipe text agar validasi di backend lancar
                        if (e.target.value === 'text') setData("options", []);
                    }}
                >
                    <option value="text">Teks</option>
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="checkbox">Checkbox</option>
                </select>
                {errors.input_type && <small className="text-xs text-red-500 mt-1 block">{errors.input_type}</small>}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={data.is_required}
                    onChange={(e) => setData("is_required", e.target.checked)}
                    className="rounded border-slate-300"
                />
                Wajib diisi
            </label>

            {showOptions && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Opsi Jawaban</p>
                    {data.options.map((option, index) => (
                        <div key={index}>
                            <Input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Opsi ${index + 1}`}
                            />
                            {errors[`options.${index}`] && (
                                <small className="text-xs text-red-500">{errors[`options.${index}`]}</small>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="text-sm text-primary-600 font-semibold hover:underline"
                        // Pastikan menambah string kosong ""
                        onClick={() => setData("options", [...(data.options || []), ""])}
                    >
                        + Tambah Opsi
                    </button>
                    {errors.options && <small className="text-xs text-red-500 block mt-1">{errors.options}</small>}
                </div>
            )}
        </div>
    );
}