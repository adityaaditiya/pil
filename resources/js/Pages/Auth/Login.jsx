import { useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconShoppingCart,
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from "@tabler/icons-react";
import { useState } from "react";

import { IconArrowLeft, IconYoga } from "@tabler/icons-react";

export default function Login({ status, canResetPassword, redirect = "" }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        redirect,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset("password");
    }, []);

    useEffect(() => {
        setData("redirect", redirect || "");
    }, [redirect]);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
                {/* Left - Form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 mb-6"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                    <IconYoga
                                        size={24}
                                        className="text-white"
                                    />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ORO Pilates Studio
                                </span>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Selamat Datang Kembali
                            </h1>
                            {/* <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Masuk untuk mengakses dashboard Anda
                            </p> */}
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-success-50 dark:bg-success-950/50 text-success-700 dark:text-success-400 text-sm">
                                {status}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconMail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@email.com"
                                        className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 ${
                                            errors.email
                                                ? "border-danger-500 focus:border-danger-500"
                                                : "border-slate-200 dark:border-slate-700 focus:border-primary-500"
                                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-primary-500/20 transition-all`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-danger-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconLock size={20} />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 ${
                                            errors.password
                                                ? "border-danger-500 focus:border-danger-500"
                                                : "border-slate-200 dark:border-slate-700 focus:border-primary-500"
                                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-primary-500/20 transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <IconEyeOff size={20} />
                                        ) : (
                                            <IconEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-danger-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Ingat saya
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                                    >
                                        Lupa Password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2
                                            size={20}
                                            className="animate-spin"
                                        />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </button>

                            {/* Register Link */}
                            {/* <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                Belum punya akun?{" "}
                                <Link
                                    href={route("register", redirect ? { redirect } : {})}
                                    className="text-primary-500 hover:text-primary-600 font-semibold"
                                >
                                    Daftar Sekarang
                                </Link>
                            </p> */}
                        </form>

                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                                    Atau lanjutkan dengan
                                </span>
                            </div>
                        </div>

                        <a
                            href="https://oropilatesstudio.com/auth/google"
                            className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800"
                        >
                            {/* Logo SVG Google Asli */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </a>
                    </div>
                </div>

                {/* Right - Image/Decoration */}
                <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12">
                    <div className="max-w-md text-center text-white">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8">
                            <IconYoga size={48} />
                        </div>
                        {/* <h2 className="text-3xl font-bold mb-4">
                            Kelola Bisnis Anda dengan Mudah
                        </h2>
                        <p className="text-lg opacity-90">
                            Sistem Point of Sale modern yang membantu Anda
                            mengelola transaksi, inventori, dan laporan keuangan
                            dengan efisien.
                        </p> */}
                        <h2 className="text-3xl font-bold mb-4">
                            ORO Pilates Studio
                        </h2>
                        <p className="text-lg opacity-90">
                            Move Better. Feel Stronger.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {[
                                "Certified Trainers",
                                "Small Group Classes",
                                "Beginner Friendly",
                            ].map((feature, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
