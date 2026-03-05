import { Link } from "@inertiajs/react";
import { IconChevronDown, IconMenu2, IconYoga } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const defaultMenuItems = [
    { name: "Home", key: "home" },
    { name: "About", key: "about" },
    { name: "Classes", key: "classes" },
    { name: "Schedule", key: "schedule" },
    { name: "Pricing", key: "pricing" },
    { name: "Trainer", key: "trainer" },
    { name: "Testimonials", key: "testimonials" },
    { name: "Contact", key: "contact" },
];

const menuHref = (key) => (key === "home" ? route("welcome") : route("welcome.page", key));

export default function WelcomeNavbar({ auth, menuItems = defaultMenuItems, activeKey = "" }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const userMenuItems = useMemo(
        () => [
            { name: "My profile", href: route("profile.edit") },
            { name: "My schedule", href: route("welcome.page", "schedule") },
            { name: "My memberships", href: route("memberships.my") },
        ],
        []
    );

    return (
        <nav className="sticky top-0 z-50 border-b border-primary-100 bg-wellness-soft/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                <Link href={route("welcome")} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md shadow-primary-700/20">
                        <IconYoga size={20} />
                    </div>
                    <div>
                        <p className="text-base font-semibold">ORO Pilates Studio</p>
                        <p className="text-xs text-wellness-muted">Wellness & Movement</p>
                    </div>
                </Link>

                <div className="hidden items-center gap-7 lg:flex">
                    {menuItems.map((item) => (
                        <Link
                            key={item.key}
                            href={menuHref(item.key)}
                            className={
                                item.key === activeKey
                                    ? "text-sm font-semibold text-primary-700"
                                    : "text-sm text-wellness-muted transition hover:text-primary-600"
                            }
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
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
                        <Link href={route("login")} className="hidden md:inline-flex rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                            Login / Register
                        </Link>
                    )}
                    <button
                        className="rounded-xl border border-primary-200 p-2.5 text-wellness-text md:hidden"
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle mobile menu"
                    >
                        <IconMenu2 size={20} />
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t border-primary-100 bg-white px-4 py-4 md:hidden">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                href={menuHref(item.key)}
                                className={
                                    item.key === activeKey
                                        ? "block rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
                                        : "block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50"
                                }
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    {auth?.user ? (
                        <div className="mt-3 space-y-2 border-t border-primary-100 pt-3">
                            {userMenuItems.map((item) => (
                                <Link key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-primary-50">
                                    {item.name}
                                </Link>
                            ))}
                            <Link href={route("logout")} method="post" as="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">
                                Logout
                            </Link>
                        </div>
                    ) : (
                        <Link href={route("login")} className="mt-3 inline-flex w-full justify-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                            Login / Register
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
