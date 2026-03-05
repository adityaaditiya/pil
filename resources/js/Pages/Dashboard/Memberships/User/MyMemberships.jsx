import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { IconChevronDown, IconMenu2, IconYoga } from "@tabler/icons-react";

export default function MyMemberships({ memberships }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { name: "Home", key: "home" },
        { name: "About", key: "about" },
        { name: "Classes", key: "classes" },
        { name: "Schedule", key: "schedule" },
        { name: "Pricing", key: "pricing" },
        { name: "Trainer", key: "trainer" },
        { name: "Testimonials", key: "testimonials" },
        { name: "Contact", key: "contact" },
    ];

    const userMenuItems = [
        { name: "My profile", href: route("profile.edit") },
        { name: "My schedule", href: route("welcome.page", "schedule") },
        { name: "My memberships", href: route("memberships.my") },
    ];

    return (
        <>
            <Head title="My Memberships" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <nav className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                        <Link href={route("welcome")} className="flex items-center gap-2 font-semibold text-primary-700">
                            <IconYoga size={20} /> ORO Pilates Studio
                        </Link>

                        <div className="hidden md:flex flex-wrap items-center gap-3 text-sm text-wellness-muted">
                            {navItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.key === "home" ? route("welcome") : route("welcome.page", item.key)}
                                    className="px-2 py-1 hover:text-primary-600"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {auth?.user ? (
                                <div className="relative hidden md:flex">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                        className="flex items-center gap-2 rounded-full border border-primary-100 bg-white px-2 py-1"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold uppercase text-white">
                                            {(auth.user.name || "U").charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{auth.user.name}</span>
                                        <IconChevronDown size={16} className="text-slate-500" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-primary-100 bg-white p-2 shadow-lg">
                                            {userMenuItems.map((item) => (
                                                <Link key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50">
                                                    {item.name}
                                                </Link>
                                            ))}
                                            <Link href={route("logout")} method="post" as="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">
                                                Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href={route("login")} className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
                                    Login / Register
                                </Link>
                            )}
                        </div>

                        <button
                            className="rounded-xl border border-primary-200 p-2.5 text-wellness-text md:hidden"
                            type="button"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            aria-label="Toggle mobile menu"
                        >
                            <IconMenu2 size={20} />
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="border-t border-primary-100 bg-white/90 px-4 py-4 md:hidden">
                            <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-wellness-muted">
                                {auth?.user ? (
                                    <div className="rounded-2xl border border-primary-100 bg-white p-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                            className="flex w-full items-center gap-2 rounded-xl px-1 py-1"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold uppercase text-white">
                                                {(auth.user.name || "U").charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{auth.user.name}</span>
                                            <IconChevronDown size={16} className="ml-auto text-slate-500" />
                                        </button>

                                        {isUserMenuOpen && (
                                            <div className="mt-2 space-y-1">
                                                {userMenuItems.map((item) => (
                                                    <Link key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50">
                                                        {item.name}
                                                    </Link>
                                                ))}
                                                <Link href={route("logout")} method="post" as="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">
                                                    Logout
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link href={route("login")} className="rounded-full bg-primary-600 px-4 py-2 text-center font-medium text-white hover:bg-primary-700">
                                        Login / Register
                                    </Link>
                                )}

                                <div className="flex flex-col gap-2">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.key}
                                            href={item.key === "home" ? route("welcome") : route("welcome.page", item.key)}
                                            className="px-2 py-1 hover:text-primary-600"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                <section className="mx-auto max-w-6xl px-4 py-10">
                    <h1 className="mb-4 text-2xl font-bold">My Memberships</h1>
                    <div className="space-y-3">
                        {memberships.map((item) => (
                            <div key={item.id} className="rounded-xl border border-primary-100 bg-white p-4">
                                <p className="font-semibold">{item.plan?.name}</p>
                                <p className="text-sm">{item.credits_remaining} / {item.credits_total} credits</p>
                                <p className="text-sm">Expires: {item.expires_at || "Tidak ada"}</p>
                                <p className="text-sm">Status: {item.status}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
