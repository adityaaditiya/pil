import { Link } from "@inertiajs/react";

export default function CtaBannerSection() {
    const cards = [
        {
            title: "1-on-1 Private",
            desc: "Sesi privat untuk hasil maksimal",
            button: "Book now",
            image:
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
        },
        {
            title: "Your journey, your pace",
            desc: "Paket fleksibel sesuai ritme kamu",
            button: "Lihat Paket",
            image:
                "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
        },
        {
            title: "Community Moves",
            desc: "Kelas grup dengan energi kolektif",
            button: "Booking Kelas",
            image:
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
        },
    ];

    return (
        <section className="bg-wellness-soft py-24 px-4 md:px-6">
            <div className="mx-auto max-w-7xl space-y-10">
                <div className="rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-wellness-brown px-6 py-20 shadow-xl md:px-16">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
                            Saatnya Prioritaskan Tubuhmu dengan Pilates Premium
                        </h2>
                        <p className="mt-5 text-lg leading-relaxed text-white/90">
                            Bangun kekuatan, postur, dan ketenangan lewat program
                            berkelas dengan suasana hangat dan elegan.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-8 py-4 text-sm font-semibold text-white transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
                            >
                                Booking Kelas
                            </Link>
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center rounded-full border border-white px-8 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-wellness-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
                            >
                                Coba Trial
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <article
                            key={card.title}
                            className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl"
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 h-full w-full scale-100 object-cover transition duration-500 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50" />

                            <div className="absolute bottom-0 p-6 text-white">
                                <h3 className="text-2xl font-semibold leading-tight">
                                    {card.title}
                                </h3>
                                <p className="mt-2 text-sm text-white/90">
                                    {card.desc}
                                </p>
                                <Link
                                    href="#"
                                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-wellness-brown transition hover:bg-wellness-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                >
                                    {card.button}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
