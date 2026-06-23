import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IconArrowRight, IconSend, IconInfoCircle, IconAlertTriangle, IconUser, IconChevronDown } from "@tabler/icons-react";


const matchesCustomerSearch = (customer, search) => {
    const keyword = search.toLowerCase();

    return [customer.name, customer.email, customer.no_telp]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
};

export default function Transfer({ customers = [], senderMemberships = [] }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing } = useForm({
        from_user_id: "",
        to_user_id: "",
        sender_membership_id: "",
        credits_amount: "",
        notes: "",
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // State untuk teks input pencarian
    const [senderSearch, setSenderSearch] = useState("");
    const [receiverSearch, setReceiverSearch] = useState("");

    // State untuk mengontrol buka-tutup dropdown custom
    const [openSenderDropdown, setOpenSenderDropdown] = useState(false);
    const [openReceiverDropdown, setOpenReceiverDropdown] = useState(false);

    // 1. FILTER & LIMIT Ggrm PENGIRIM (Maksimal 5 data agar tidak kepenuhan)
    const filteredSenders = useMemo(() => {
        if (!senderSearch) return customers.slice(0, 5); // Tampilkan 5 pertama jika kosong
        return customers
            .filter((c) => matchesCustomerSearch(c, senderSearch))
            .slice(0, 5); // BATASI HANYA 5 DATA
    }, [customers, senderSearch]);

    // 2. FILTER & LIMIT Penerima (Maksimal 5 data agar tidak kepenuhan)
    const filteredReceivers = useMemo(() => {
        if (!receiverSearch) return customers.slice(0, 5);
        return customers
            .filter((c) => matchesCustomerSearch(c, receiverSearch))
            .slice(0, 5); // BATASI HANYA 5 DATA
    }, [customers, receiverSearch]);

    const senderMembershipOptions = useMemo(() => 
        senderMemberships.filter((m) => String(m.user_id) === String(data.from_user_id)), 
        [senderMemberships, data.from_user_id]
    );
    
    const selectedMembership = useMemo(() => 
        senderMembershipOptions.find((m) => String(m.id) === String(data.sender_membership_id)) || null, 
        [senderMembershipOptions, data.sender_membership_id]
    );

    const selectedSender = useMemo(() =>
        customers.find((c) => String(c.user_id) === String(data.from_user_id)) || null,
        [customers, data.from_user_id]
    );

    const selectedReceiver = useMemo(() =>
        customers.find((c) => String(c.user_id) === String(data.to_user_id)) || null,
        [customers, data.to_user_id]
    );

    const formatDateTime = (value) => value ? new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

    const creditsAmount = Number(data.credits_amount || 0);
    const invalidCredits = selectedMembership ? creditsAmount > Number(selectedMembership.credits_remaining || 0) : false;
    const sameUser = data.from_user_id && data.to_user_id && String(data.from_user_id) === String(data.to_user_id);
    const disabledSubmit = processing || !data.from_user_id || !data.to_user_id || !data.sender_membership_id || !data.credits_amount || invalidCredits || sameUser;

    const submit = (e) => {
        e.preventDefault();
        post(route("memberships.transfer.store"));
    };

    return (
        <DashboardLayout>
            <Head title="Transfer Membership Credits" />
            
            {/* <div className="py-10 bg-slate-50/50 min-h-screen"> */}
            <div className="py-5 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    
                    {/* Header Halaman */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Transfer Membership</h1>
                        <p className="text-sm text-slate-500 mt-1">Maksimalkan sisa kredit dengan fitur transfer antar member dengan aman.</p>
                    </div>

                    {/* Main Container Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Form Sisi Kiri */}
                        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6">
                            
                            {/* Alur Pengirim & Penerima (Layout Diperbaiki agar tidak mepet) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-12 items-end bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100/80 relative w-full">
                                
                                {/* CUSTOM SELECT PENGIRIM */}
                                <div className="relative w-full">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">From Member (Pengirim)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                            <IconUser size={18} />
                                        </span>
                                        <input 
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5" 
                                            placeholder="Cari nama pengirim..." 
                                            onFocus={() => setOpenSenderDropdown(true)}
                                            onBlur={() => setTimeout(() => setOpenSenderDropdown(false), 200)}
                                            onChange={(e) => {
                                                setSenderSearch(e.target.value);
                                                setData('from_user_id', '');
                                            }} 
                                            value={senderSearch} 
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
                                            <IconChevronDown size={16} />
                                        </span>
                                    </div>

                                    {/* Dropdown Menu Pengirim */}
                                    {openSenderDropdown && (
                                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                                            {filteredSenders.length > 0 ? (
                                                filteredSenders.map((c) => (
                                                    <div 
                                                        key={`sender-${c.user_id}`}
                                                        onClick={() => {
                                                            setSenderSearch(c.name);
                                                            setData((old) => ({ ...old, from_user_id: String(c.user_id), sender_membership_id: '' }));
                                                        }}
                                                        className="flex items-center px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-slate-900 font-medium"
                                                    >
                                                        <span className="flex flex-col leading-tight">
                                                            <span>{c.name}</span>
                                                            {/* flex flex-col membuat email dan no. telp menumpuk ke bawah */}
                                                            <div className="flex flex-col text-[11px] font-normal text-slate-400">
                                                            <span>{c.email || "Email belum tersedia"}</span>
                                                            <span>{c.no_telp || "No. telepon belum tersedia"}</span>
                                                            </div>

                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-xs text-slate-400 italic">Member tidak ditemukan</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Lingkaran Anak Panah Tengah (Diperbaiki posisi z-index dan ukuran bayangan) */}
                                <div className="hidden md:flex absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full border border-slate-100 shadow-md z-20 text-slate-400 transition-transform hover:scale-110">
                                    <IconArrowRight size={16} className="text-slate-500" />
                                </div>

                                {/* CUSTOM SELECT PENERIMA */}
                                <div className="relative w-full">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">To Member (Penerima)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                            <IconUser size={18} />
                                        </span>
                                        <input 
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5" 
                                            placeholder="Cari nama penerima..." 
                                            onFocus={() => setOpenReceiverDropdown(true)}
                                            onBlur={() => setTimeout(() => setOpenReceiverDropdown(false), 200)}
                                            onChange={(e) => {
                                                setReceiverSearch(e.target.value);
                                                setData('to_user_id', '');
                                            }} 
                                            value={receiverSearch} 
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
                                            <IconChevronDown size={16} />
                                        </span>
                                    </div>

                                    {/* Dropdown Menu Penerima */}
                                    {openReceiverDropdown && (
                                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                                            {filteredReceivers.length > 0 ? (
                                                filteredReceivers.map((c) => (
                                                    <div 
                                                        key={`receiver-${c.user_id}`}
                                                        onClick={() => {
                                                            setReceiverSearch(c.name);
                                                            setData('to_user_id', String(c.user_id));
                                                        }}
                                                        className="flex items-center px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-slate-900 font-medium"
                                                    >
                                                        <span className="flex flex-col leading-tight">
                                                            <span>{c.name}</span>
                                                            <span className="text-[11px] font-normal text-slate-400">{c.email || "Email belum tersedia"} • {c.no_telp || "No. telepon belum tersedia"}</span>
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-xs text-slate-400 italic">Member tidak ditemukan</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pilih Paket Dropdown */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Membership Plan Pengirim</label>
                                <select 
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400"
                                    value={data.sender_membership_id} 
                                    onChange={(e) => setData('sender_membership_id', e.target.value)}
                                    disabled={!data.from_user_id}
                                >
                                    <option value="">{data.from_user_id ? "Pilih membership plan aktif..." : "Silakan pilih member pengirim terlebih dahulu"}</option>
                                    {senderMembershipOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.membership_plan_name} — Sisa {item.credits_remaining} Credits (Exp: {item.expires_at ? formatDateTime(item.expires_at) : '-'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Jumlah Credits */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Jumlah Credits Yang Ditransfer</label>
                                <div className="relative rounded-xl shadow-sm">
                                    <input 
                                        type="number" 
                                        min={1} 
                                        placeholder="Masukkan nominal credits"
                                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 ${invalidCredits ? 'border-red-300 bg-red-50/20 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'}`}
                                        value={data.credits_amount} 
                                        onChange={(e) => setData('credits_amount', e.target.value)} 
                                    />
                                </div>
                                
                                {/* Error Validation Message */}
                                {invalidCredits && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2 font-medium">
                                        <IconAlertTriangle size={14} />
                                        <span>Kuota transfer melebihi sisa credits yang dimiliki pengirim.</span>
                                    </div>
                                )}
                                {sameUser && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2 font-medium">
                                        <IconAlertTriangle size={14} />
                                        <span>Pengirim dan penerima harus merupakan akun member yang berbeda.</span>
                                    </div>
                                )}
                            </div>

                            {/* Catatan Sesi */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Notes (Catatan internal)</label>
                                <textarea 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5" 
                                    rows={3} 
                                    value={data.notes} 
                                    onChange={(e) => setData('notes', e.target.value)} 
                                    placeholder="Catat alasan transfer credits..." 
                                />
                            </div>

                            {/* Action Button */}
                            <div className="pt-2">
                                <button 
                                    disabled={disabledSubmit} 
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <IconSend size={16} />
                                    {processing ? "Memproses Transfer..." : "Kirim Credits Membership"}
                                </button>
                            </div>
                        </form>

                        {/* Live Summary Card (Sisi Kanan) */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 p-5">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-center text-slate-400 border-b border-slate-100 pb-3 mb-4">Detail Transfer Membership</h3>
                                
                                {selectedMembership ? (
                                    <div className="space-y-4">
                                        {(selectedSender || selectedReceiver) && (
                                            <div className="grid grid-cols-1 gap-3 border-b border-slate-50 pb-4">
                                                <div className="pl-5 rounded-2xl bg-slate-50 p-3">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Data Pengirim</p>
                                                    <p className="mt-1 text-sm font-extrabold text-slate-800">{selectedSender?.name || "-"}</p>
                                                    <p className="mt-1 text-[11px] font-medium text-slate-500">Email: {selectedSender?.email || "-"}</p>
                                                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">No. Telp: {selectedSender?.no_telp || "-"}</p>
                                                </div>
                                                <div className="pl-5 rounded-2xl bg-emerald-50 p-3">
                                                    <p className="text-[10px] uppercase font-bold text-emerald-500">Data Penerima</p>
                                                    <p className="mt-1 text-sm font-extrabold text-slate-800">{selectedReceiver?.name || "-"}</p>
                                                    <p className="mt-1 text-[11px] font-medium text-slate-500">Email: {selectedReceiver?.email || "-"}</p>
                                                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">No. Telp: {selectedReceiver?.no_telp || "-"}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Membership Plan Terpilih</p>
                                            <p className="font-bold text-slate-800 text-base mt-0.5">{selectedMembership.membership_plan_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Sisa Awal</p>
                                                <p className="font-extrabold text-slate-900 text-xl mt-0.5">{selectedMembership.credits_remaining} <span className="text-xs font-normal text-slate-400">credits</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Setelah Transfer</p>
                                                <p className={`font-extrabold text-xl mt-0.5 ${invalidCredits ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {Number(selectedMembership.credits_remaining) - creditsAmount} <span className="text-xs font-normal text-slate-400">credits</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-50">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Masa Berlaku Credits</p>
                                            <p className="text-xs font-semibold text-slate-600 mt-1">Sampai {selectedMembership.expires_at ? formatDateTime(selectedMembership.expires_at) : 'Tanpa batas waktu'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-2">
                                        <IconInfoCircle size={28} className="text-slate-300" />
                                        <p className="text-xs max-w-[200px] leading-relaxed">Pilih pelanggan dan membership plan aktif untuk melihat ringkasan kalkulasi sisa credits.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}