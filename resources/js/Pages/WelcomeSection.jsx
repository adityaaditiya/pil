import { Head, Link } from "@inertiajs/react";
import { IconArrowLeft, IconYoga } from "@tabler/icons-react";

export default function WelcomeSection({ page, menuItems }) {
    return (
        <>
            <Head title={`${page.name} | ORO Pilates Studio`} />
            <div className="min-h-screen bg-wellness-beige text-wellness-text">
                <nav className="border-b border-primary-100 bg-wellness-soft/95">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                        <Link href={route("welcome")} className="flex items-center gap-2 font-semibold">
                            <IconYoga size={20} /> ORO Pilates Studio
                        </Link>
                        <div className="flex flex-wrap gap-4 text-sm text-wellness-muted">
                            {menuItems.map((item) => (
                                <Link key={item.key} href={route("welcome.page", item.key)} className={item.key === page.key ? "text-primary-600" : ""}>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                <section className="mx-auto max-w-4xl px-4 py-20">
                    <Link href={route("welcome")} className="mb-8 inline-flex items-center gap-2 text-sm text-primary-600">
                        <IconArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold">{page.title}</h1>
                    <p className="mt-6 text-lg text-wellness-muted leading-relaxed">{page.content}</p>
                </section>
            </div>
        </>
    );
}
