import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { IconChevronDown, IconMenu2, IconYoga } from "@tabler/icons-react";
import Button from "@/Components/Landing/Button";
import { getImageUrl } from "@/Utils/imageUrl";

const defaultNavItems = [
    { name: "Home", key: "home" },
    { name: "Classes", key: "classes" },
    { name: "Schedule", key: "schedule" },
    { name: "Pricing", key: "pricing" },
    { name: "Trainer", key: "trainer" },
    { name: "Appointment", key: "appointment" },
    { name: "Contact", key: "contact" },
];

const resolveHref = (key) => (key === "home" ? route("welcome") : route("welcome.page", key));

export default function Navbar({ navItems = defaultNavItems, currentKey = null }) {
    const { auth, landingPageSetting } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isTrainer = Array.isArray(auth?.roles) && auth.roles.includes("trainer");

    const studioLogoImage = getImageUrl(landingPageSetting?.studio_logo_image, "landing-page");

    const userMenuItems = [
        { name: "My profile", href: route("profile.edit") },
        ...(isTrainer
            ? [{ name: "My flow", href: route("user.my-flow") }]
            : [
                { name: "My schedule", href: route("user.my-schedule") },
                { name: "My appointment", href: route("user.my-appointment") },
                { name: "My memberships", href: route("user.my-memberships") },
            ]),
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-primary-100 bg-wellness-soft/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                <div className="flex items-center gap-3">
                   {studioLogoImage ? (
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-primary-200 bg-white p-1 shadow-sm">
                            <img src={studioLogoImage} alt="Logo Studio" className="h-full w-full object-contain" />
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md shadow-primary-700/20">
                            <IconYoga size={20} />
                        </div>
                    )}
                    <div>
                        <p className="text-base font-semibold">ORO Pilates Studio</p>
                        <p className="text-xs text-wellness-muted">Wellness & Movement</p>
                    </div>
                </div>

                <div className="hidden items-center gap-7 lg:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={resolveHref(item.key)}
                            className={item.key === currentKey ? "text-sm font-medium text-primary-600" : "text-sm text-wellness-muted transition hover:text-primary-600"}
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
                        <Button as={Link} href={route("login")} className="hidden md:inline-flex">
                            Login / Register
                        </Button>
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
                <div className="border-t border-primary-100 bg-wellness-soft px-4 py-4 md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4">
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
                            <Button as={Link} href={route("login")} className="w-full justify-center">
                                Login / Register
                            </Button>
                        )}

                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <Link key={item.key} href={resolveHref(item.key)} className={item.key === currentKey ? "text-sm font-medium text-primary-600" : "text-sm text-wellness-muted transition hover:text-primary-600"}>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
