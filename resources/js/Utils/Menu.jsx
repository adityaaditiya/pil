import { usePage } from "@inertiajs/react";
import {
    IconBooks,
    IconBox,
    IconCategory,
    IconCalendarEvent,
    IconCalendarClock,
    IconChartArrowsVertical,
    IconChartBarPopular,
    IconChartInfographic,
    IconCirclePlus,
    IconClockHour6,
    IconCreditCard,
    IconPhoto,
    IconFileCertificate,
    IconFileDescription,
    IconFolder,
    IconHome2,
    IconLayout2,
    IconReceipt,
    IconSchool,
    IconShoppingCart,
    IconTable,
    IconWallet,
    IconUserBolt,
    IconUserShield,
    IconUserSquare,
    IconUsers,
    IconUsersPlus,
    IconBadge,
    IconYoga,
} from "@tabler/icons-react";
import hasAnyPermission from "./Permission";
import React from "react";

function Menu() {
    // define use page
    const { url } = usePage();

    // define menu navigations
    const menuNavigation = [
        {
            title: "Overview",
            details: [
                {
                    title: "Dashboard",
                    href: route("dashboard"),
                    active: url === "/dashboard" ? true : false, // Update comparison here
                    icon: <IconLayout2 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: "Data Management",
            details: [
                {
                    title: "Kategori Produk",
                    href: route("categories.index"),
                    active: url === "/dashboard/categories" ? true : false, // Update comparison here
                    icon: <IconFolder size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["categories-access"]),
                },
                {
                    title: "Produk",
                    href: route("products.index"),
                    active: url === "/dashboard/products" ? true : false, // Update comparison here
                    icon: <IconBox size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["products-access"]),
                },
                {
                    title: "Pelanggan",
                    href: route("customers.index"),
                    active: url === "/dashboard/customers" ? true : false, // Update comparison here
                    icon: <IconUsersPlus size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customers-access"]),
                },
                {
                    title: "Kategori Kelas",
                    href: route("class-categories.index"),
                    active: url.startsWith("/dashboard/class-categories"),
                    icon: <IconCategory size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["class-categories-access"]),
                },
                {
                    title: "Membership Plans",
                    href: route("membership-plans.index"),
                    active: url.startsWith("/dashboard/membership-plans"),
                    icon: <IconBadge size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: "Pilates Studio Control",
            details: [
                {
                    title: "Kelola Menu Studio",
                    href: route("studio-pages.index"),
                    active: url.startsWith("/dashboard/studio-pages"),
                    icon: <IconHome2 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: "Classes",
                    href: route("classes.index"),
                    active: url.startsWith("/dashboard/classes"),
                    icon: <IconYoga size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: "Appointment",
                    href: route("appointments.index"),
                    active: url.startsWith("/dashboard/appointments"),
                    icon: <IconCalendarClock size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: "Timetable",
                    href: route("timetable.index"),
                    active: url.startsWith("/dashboard/timetable"),
                    icon: <IconCalendarEvent size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: "Riwayat Booking",
                    href: route("bookings.history"),
                    active: url === "/dashboard/bookings/history",
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
                {
                    title: "Trainer",
                    href: route("trainers.index"),
                    active: url.startsWith("/dashboard/trainers"),
                    icon: <IconUserSquare size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: "Transaksi",
            details: [
                {
                    title: "Transaksi",
                    href: route("transactions.index"),
                    active: url === "/dashboard/transactions" ? true : false, // Update comparison here
                    icon: <IconShoppingCart size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: "Riwayat Transaksi",
                    href: route("transactions.history"),
                    active: url === "/dashboard/transactions/history" ? true : false,
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: "Transaksi Saya",
                    href: route("transactions.my"),
                    active: url === "/dashboard/transactions/my" ? true : false,
                    icon: <IconReceipt size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["my-transactions-access"]),
                },
                {
                    title: "Uang Kas",
                    href: route("transactions.cash.index"),
                    active: url === "/dashboard/transactions/cash" ? true : false,
                    icon: <IconWallet size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
            ],
        },
        {
            title: "Laporan",
            details: [
                {
                    title: "Laporan Penjualan",
                    href: route("reports.sales.index"),
                    active: url.startsWith("/dashboard/reports/sales"),
                    icon: (
                        <IconChartArrowsVertical size={20} strokeWidth={1.5} />
                    ),
                    permissions: hasAnyPermission(["reports-access"]),
                },
                {
                    title: "Laporan Barang Terjual",
                    href: route("reports.sold-items.index"),
                    active: url.startsWith("/dashboard/reports/sold-items"),
                    icon: <IconBooks size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["reports-access"]),
                },
                {
                    title: "Laporan Keuntungan",
                    href: route("reports.profits.index"),
                    active: url.startsWith("/dashboard/reports/profits"),
                    icon: <IconChartBarPopular size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["profits-access"]),
                },
                {
                    title: "Laporan Keuangan Cash",
                    href: route("reports.cash.index"),
                    active: url.startsWith("/dashboard/reports/cash"),
                    icon: (
                        <IconChartInfographic size={20} strokeWidth={1.5} />
                    ),
                    permissions: hasAnyPermission(["reports-access"]),
                },
                {
                    title: "Laporan Otorisasi",
                    href: route("reports.authorizations.index"),
                    active: url.startsWith("/dashboard/reports/authorizations"),
                    icon: <IconFileCertificate size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["reports-access"]),
                },
            ],
        },
        {
            title: "User Management",
            details: [
                {
                    title: "Hak Akses",
                    href: route("permissions.index"),
                    active: url === "/dashboard/permissions" ? true : false, // Update comparison here
                    icon: <IconUserBolt size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["permissions-access"]),
                },
                {
                    title: "Akses Group",
                    href: route("roles.index"),
                    active: url === "/dashboard/roles" ? true : false, // Update comparison here
                    icon: <IconUserShield size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["roles-access"]),
                },
                {
                    title: "Pengguna",
                    icon: <IconUsers size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["users-access"]),
                    subdetails: [
                        {
                            title: "Data Pengguna",
                            href: route("users.index"),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            active: url === "/dashboard/users" ? true : false,
                            permissions: hasAnyPermission(["users-access"]),
                        },
                        {
                            title: "Tambah Data Pengguna",
                            href: route("users.create"),
                            icon: (
                                <IconCirclePlus size={20} strokeWidth={1.5} />
                            ),
                            active:
                                url === "/dashboard/users/create"
                                    ? true
                                    : false,
                            permissions: hasAnyPermission(["users-create"]),
                        },
                    ],
                },
            ],
        },

        {
            title: "Membership",
            details: [
                {
                    title: "Membership",
                    href: route("memberships.plans"),
                    active: url === "/dashboard/memberships/plans",
                    icon: <IconBadge size={20} strokeWidth={1.5} />,
                    permissions: true,
                },
                {
                    title: "My Memberships",
                    href: route("memberships.my"),
                    active: url === "/dashboard/memberships/my",
                    icon: <IconFileDescription size={20} strokeWidth={1.5} />,
                    permissions: true,
                },
                {
                    title: "Riwayat Membership",
                    href: route("memberships.history"),
                    active: url === "/dashboard/memberships/history",
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: true,
                },
            ],
        },
        {
            title: "Pengaturan",
            details: [
                {
                    title: "Payment Gateway",
                    href: route("settings.payments.edit"),
                    active: url === "/dashboard/settings/payments",
                    icon: <IconCreditCard size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["payment-settings-access"]),
                },
                {
                    title: "Kelola Gambar Landing Page",
                    href: route("settings.landing-page.edit"),
                    active: url === "/dashboard/settings/landing-page",
                    icon: <IconPhoto size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
    ];

    return menuNavigation;
}

export { Menu };
export default Menu;
