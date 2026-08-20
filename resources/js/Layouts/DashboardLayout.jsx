import React, { useEffect, useState } from "react";
import Sidebar from "@/Components/Dashboard/Sidebar";
import Navbar from "@/Components/Dashboard/Navbar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/Context/ThemeSwitcherContext";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function AppLayout({ children }) {
    const { darkMode, themeSwitcher } = useTheme();
    const { flash } = usePage().props;

    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === "true"
    );

    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen);
    }, [sidebarOpen]);

    useEffect(() => {
        if (flash?.error) {
            Swal.fire({
                icon: "error",
                title: "Menu Tidak Diizinkan",
                text: flash.error,
                confirmButtonColor: "#ef4444",
                confirmButtonText: "Tutup",
            });
        }
    }, [flash?.error]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
            <Sidebar sidebarOpen={sidebarOpen} />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    themeSwitcher={themeSwitcher}
                    darkMode={darkMode}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full py-6 px-4 md:px-6 lg:px-8 pb-20 md:pb-6">
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                className: "text-sm",
                                duration: 3000,
                                style: {
                                    background: darkMode ? "#1e293b" : "#fff",
                                    color: darkMode ? "#f1f5f9" : "#1e293b",
                                    border: `1px solid ${
                                        darkMode ? "#334155" : "#e2e8f0"
                                    }`,
                                    borderRadius: "12px",
                                },
                            }}
                        />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
