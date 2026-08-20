import React, { useState, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Input from "@/Components/Dashboard/Input";
import Modal from "@/Components/Dashboard/Modal";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconDatabaseOff,
    IconCirclePlus,
    IconTrash,
    IconUserShield,
    IconPencilCog,
    IconPencilCheck,
    IconShield,
    IconSearch,
    IconRefresh,
    IconCheck,
} from "@tabler/icons-react";

// Role Card Component
function RoleCard({ role, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                        <IconUserShield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {role.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {role.permissions.length} hak akses
                        </p>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                    {role.permissions.slice(0, 8).map((permission, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-400"
                        >
                            <IconShield size={10} />
                            {permission.name}
                        </span>
                    ))}
                    {role.permissions.length > 8 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-slate-500">
                            +{role.permissions.length - 8} lainnya
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-950/50 text-sm font-medium transition-colors"
                >
                    <IconPencilCog size={16} />
                    <span>Edit</span>
                </button>
                <div className="w-px bg-slate-100 dark:bg-slate-800" />
                <button
                    onClick={onDelete}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/50 text-sm font-medium transition-colors"
                >
                    <IconTrash size={16} />
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    );
}

const CRUD_MODULES = [
    { key: "users", label: "Users" },
    { key: "roles", label: "Roles" },
    { key: "permissions", label: "Permissions" },
    { key: "categories", label: "Categories" },
    { key: "products", label: "Products" },
    { key: "customers", label: "Customers" },
    { key: "class-categories", label: "Class Categories" },
    { key: "classes", label: "Classes" },
    { key: "trainers", label: "Trainers" },
    { key: "timetable", label: "Timetable" },
    { key: "appointment-sessions", label: "Appointment Sessions" },
    { key: "appointments", label: "Appointments" },
    { key: "membership-plans", label: "Membership Plans" },
    { key: "memberships", label: "Memberships", actions: ["access", "create", "delete"] },
    { key: "questions", label: "Questions" },
];

const NON_CRUD_MODULES = {
    "Appointments": [
        "appointments-history-access",
    ],
    "Memberships": [
        "membership-transfer-access",
        "membership-extension-access",
        "my-memberships-access",
        "memberships-history-access",
    ],
    "Transactions & Finance": [
        "transactions-access",
        "my-transactions-access",
        "payment-activation-access",
        "payment-settings-access",
    ],
    "Reports": [
        "report-sales-access",
        "report-sold-items-access",
        "report-booking-access",
        "report-appointment-access",
        "report-membership-access",
        "report-membership-extension-access",
        "report-membership-validity-access",
        "report-membership-transfer-access",
        "report-cash-access",
        "report-authorizations-access",
        "report-stock-mutations-access",
        "report-trainers-access",
        "profits-access",
    ],
    "General & Studio": [
        "dashboard-access",
        "studio-pages-access",
        "bookings-history-access",
        "authorization-cancel-transactions",
        "landing-page-settings-access",
    ],
};

// Helper: Custom Checkbox Component
const CustomCheckbox = ({ label, checked, onChange, disabled }) => (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50" : ""}`}>
        <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                checked
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            }`}
        >
            {checked && <IconCheck size={14} strokeWidth={3} />}
        </div>
        {label && <span className="text-sm text-slate-700 dark:text-slate-300 select-none">{label}</span>}
        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />
    </label>
);

export default function Index() {
    const { roles, permissions, errors } = usePage().props;

    const {
        data,
        setData,
        transform,
        post,
        delete: destroy,
    } = useForm({
        id: "",
        name: "",
        selectedPermission: [],
        isUpdate: false,
        isOpen: false,
    });

    const [searchPermission, setSearchPermission] = useState("");

    const setSelectedPermission = (value) =>
        setData("selectedPermission", value);

    transform((data) => ({
        ...data,
        selectedPermission: data.selectedPermission.map((permission) => 
            typeof permission === "object" ? permission.id : permission
        ),
        _method: data.isUpdate === true ? "put" : "post",
    }));

    const saveRole = async (e) => {
        e.preventDefault();
        post(route("roles.store"), {
            onSuccess: () =>
                setData({ selectedPermission: [], name: "", isOpen: false }),
        });
    };

    const updateRole = async (e) => {
        e.preventDefault();
        post(route("roles.update", data.id), {
            onSuccess: () =>
                setData({
                    id: "",
                    name: "",
                    selectedPermission: [],
                    isUpdate: false,
                    isOpen: false,
                }),
        });
    };

    const handleEdit = (role) => {
        setData({
            id: role.id,
            selectedPermission: role.permissions.map(p => p.id),
            name: role.name,
            isUpdate: true,
            isOpen: true,
        });
        setSearchPermission("");
    };

    const handleDelete = (roleId) => {
        if (confirm("Hapus role ini?")) {
            destroy(route("roles.destroy", roleId));
        }
    };

    // --- FORM LOGIC ---
    const getPermId = (name) => permissions.find((p) => p.name === name)?.id;
    const getPermName = (id) => permissions.find((p) => p.id === id)?.name;

    const isChecked = (name) => {
        const id = getPermId(name);
        if (!id) return false;
        return data.selectedPermission.includes(id);
    };

    const updatePermissions = (updates) => {
        let next = [...data.selectedPermission];
        updates.forEach(({ name, checked }) => {
            const id = getPermId(name);
            if (!id) return;
            const hasIt = next.includes(id);
            if (checked && !hasIt) {
                next.push(id);
            } else if (!checked && hasIt) {
                next = next.filter((item) => item !== id);
            }
        });
        setData("selectedPermission", next);
    };

    const handleToggle = (moduleKey, action, checked) => {
        const updates = [{ name: `${moduleKey}-${action}`, checked }];
        
        // Smart dependencies
        if (checked && action !== 'access') {
            updates.push({ name: `${moduleKey}-access`, checked: true });
        } else if (!checked && action === 'access') {
            ['create', 'edit', 'update', 'delete'].forEach(act => {
                updates.push({ name: `${moduleKey}-${act}`, checked: false });
            });
        }
        updatePermissions(updates);
    };

    const handleToggleRow = (moduleKey, checked) => {
        const updates = ['access', 'create', 'edit', 'update', 'delete'].map(act => ({
            name: `${moduleKey}-${act}`,
            checked
        }));
        updatePermissions(updates);
    };

    const handleGlobalSelectAll = () => {
        setData("selectedPermission", permissions.map(p => p.id));
    };

    const handleGlobalReset = () => {
        setData("selectedPermission", []);
    };

    // Calculate Row States
    const isRowIndeterminate = (moduleKey) => {
        const acts = ['access', 'create', 'edit', 'update', 'delete'];
        let checkedCount = 0;
        let totalCount = 0;
        acts.forEach(act => {
            const name = `${moduleKey}-${act}`;
            if (getPermId(name)) {
                totalCount++;
                if (isChecked(name)) checkedCount++;
            }
        });
        return checkedCount > 0 && checkedCount < totalCount;
    };

    const isRowChecked = (moduleKey) => {
        const acts = ['access', 'create', 'edit', 'update', 'delete'];
        let checkedCount = 0;
        let totalCount = 0;
        acts.forEach(act => {
            const name = `${moduleKey}-${act}`;
            if (getPermId(name)) {
                totalCount++;
                if (isChecked(name)) checkedCount++;
            }
        });
        return totalCount > 0 && checkedCount === totalCount;
    };

    // Filtering logic
    const filteredCrud = useMemo(() => {
        if (!searchPermission) return CRUD_MODULES;
        const lower = searchPermission.toLowerCase();
        return CRUD_MODULES.filter(m => m.label.toLowerCase().includes(lower));
    }, [searchPermission]);

    const filteredNonCrud = useMemo(() => {
        if (!searchPermission) return NON_CRUD_MODULES;
        const lower = searchPermission.toLowerCase();
        const result = {};
        for (const [group, perms] of Object.entries(NON_CRUD_MODULES)) {
            const filtered = perms.filter(p => p.replace(/-/g, ' ').toLowerCase().includes(lower));
            if (filtered.length > 0 || group.toLowerCase().includes(lower)) {
                result[group] = group.toLowerCase().includes(lower) ? perms : filtered;
            }
        }
        return result;
    }, [searchPermission]);


    return (
        <>
            <Head title="Akses Group" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconUserShield
                                size={28}
                                className="text-primary-500"
                            />
                            Akses Group
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {roles.total || roles.data?.length || 0} group
                            terdaftar
                        </p>
                    </div>
                    <Button
                        type={"button"}
                        icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                        className={
                            "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                        }
                        label={"Tambah Group"}
                        onClick={() => {
                            setData("isOpen", true);
                            setSearchPermission("");
                        }}
                    />
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 w-full sm:w-80">
                <Search
                    url={route("roles.index")}
                    placeholder="Cari akses group..."
                />
            </div>

            {/* Modal */}
            <Modal
                show={data.isOpen}
                onClose={() =>
                    setData({
                        isOpen: false,
                        id: "",
                        name: "",
                        selectedPermission: [],
                        isUpdate: false,
                    })
                }
                maxWidth="6xl"
                title={
                    data.isUpdate ? "Ubah Akses Group" : "Tambah Akses Group"
                }
                icon={<IconUserShield size={20} strokeWidth={1.5} />}
            >
                <form onSubmit={data.isUpdate ? updateRole : saveRole} className="space-y-6">
                    {/* Top Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <Input
                            label={"Nama group"}
                            type={"text"}
                            placeholder={"Masukan nama group..."}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            errors={errors.name}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Inner Search */}
                            <div className="relative w-full sm:w-72">
                                <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchPermission}
                                    onChange={(e) => setSearchPermission(e.target.value)}
                                    placeholder="Cari hak akses..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            {/* Actions & Indicator */}
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="text-primary-600 dark:text-primary-400 font-bold">{data.selectedPermission.length}</span> dari {permissions.length} dipilih
                                </span>
                                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                                <button
                                    type="button"
                                    onClick={handleGlobalSelectAll}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 font-medium transition-colors"
                                >
                                    Select All Global
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGlobalReset}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <IconRefresh size={16} /> Reset
                                </button>
                            </div>
                        </div>
                        {errors.selectedPermission && (
                            <p className="text-red-500 text-sm">{errors.selectedPermission}</p>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin space-y-6 pb-6">
                        {/* CRUD Matrix */}
                        {filteredCrud.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Data Management (CRUD)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 text-sm text-slate-500 dark:text-slate-400">
                                                <th className="px-5 py-3 font-medium w-1/3">Modul</th>
                                                <th className="px-5 py-3 font-medium text-center">View / Access</th>
                                                <th className="px-5 py-3 font-medium text-center">Create</th>
                                                <th className="px-5 py-3 font-medium text-center">Edit / Update</th>
                                                <th className="px-5 py-3 font-medium text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {filteredCrud.map((mod) => (
                                                <tr key={mod.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-5 py-3 flex items-center gap-3">
                                                        <CustomCheckbox
                                                            checked={isRowChecked(mod.key)}
                                                            onChange={(e) => handleToggleRow(mod.key, e.target.checked)}
                                                        />
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{mod.label}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex justify-center">
                                                            {getPermId(`${mod.key}-access`) ? (
                                                                <CustomCheckbox
                                                                    checked={isChecked(`${mod.key}-access`)}
                                                                    onChange={(e) => handleToggle(mod.key, 'access', e.target.checked)}
                                                                />
                                                            ) : (
                                                                <CustomCheckbox checked={false} disabled={true} onChange={() => {}} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex justify-center">
                                                            {getPermId(`${mod.key}-create`) ? (
                                                                <CustomCheckbox
                                                                    checked={isChecked(`${mod.key}-create`)}
                                                                    onChange={(e) => handleToggle(mod.key, 'create', e.target.checked)}
                                                                />
                                                            ) : (
                                                                <CustomCheckbox checked={false} disabled={true} onChange={() => {}} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex justify-center">
                                                            {(getPermId(`${mod.key}-edit`) || getPermId(`${mod.key}-update`)) ? (
                                                                <CustomCheckbox
                                                                    checked={getPermId(`${mod.key}-edit`) ? isChecked(`${mod.key}-edit`) : isChecked(`${mod.key}-update`)}
                                                                    onChange={(e) => handleToggle(mod.key, getPermId(`${mod.key}-edit`) ? 'edit' : 'update', e.target.checked)}
                                                                />
                                                            ) : (
                                                                <CustomCheckbox checked={false} disabled={true} onChange={() => {}} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex justify-center">
                                                            {getPermId(`${mod.key}-delete`) ? (
                                                                <CustomCheckbox
                                                                    checked={isChecked(`${mod.key}-delete`)}
                                                                    onChange={(e) => handleToggle(mod.key, 'delete', e.target.checked)}
                                                                />
                                                            ) : (
                                                                <CustomCheckbox checked={false} disabled={true} onChange={() => {}} />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Non-CRUD Sections */}
                        {Object.keys(filteredNonCrud).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(filteredNonCrud).map(([group, perms]) => (
                                    <div key={group} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{group}</h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const allChecked = perms.every(p => isChecked(p));
                                                    const updates = perms.map(p => ({ name: p, checked: !allChecked }));
                                                    updatePermissions(updates);
                                                }}
                                                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                                            >
                                                {perms.every(p => isChecked(p)) ? "Uncheck All" : "Check All"}
                                            </button>
                                        </div>
                                        <div className="p-5 flex-1 space-y-3">
                                            {perms.map(perm => (
                                                <CustomCheckbox
                                                    key={perm}
                                                    label={perm.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    checked={isChecked(perm)}
                                                    onChange={(e) => updatePermissions([{ name: perm, checked: e.target.checked }])}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {filteredCrud.length === 0 && Object.keys(filteredNonCrud).length === 0 && (
                            <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed">
                                <IconSearch size={32} className="mx-auto mb-3 opacity-50" />
                                <p>Tidak ada hak akses yang cocok dengan pencarian.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-950 px-2 pb-2">
                        <Button
                            type="button"
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6"
                            label="Batal"
                            onClick={() => setData("isOpen", false)}
                        />
                        <Button
                            type="submit"
                            icon={<IconPencilCheck size={18} />}
                            className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 px-8"
                            label="Simpan Group"
                        />
                    </div>
                </form>
            </Modal>

            {/* Content */}
            {roles.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {roles.data.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={() => handleEdit(role)}
                            onDelete={() => handleDelete(role.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <IconDatabaseOff
                            size={32}
                            className="text-slate-400"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                        Belum Ada Group
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Tambahkan group akses pertama.
                    </p>
                    <Button
                        type={"button"}
                        icon={<IconCirclePlus size={18} />}
                        className={
                            "bg-primary-500 hover:bg-primary-600 text-white"
                        }
                        label={"Tambah Group"}
                        onClick={() => setData("isOpen", true)}
                    />
                </div>
            )}

            {roles.last_page !== 1 && <Pagination links={roles.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
