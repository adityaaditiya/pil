const classes = [
    {
        title: "Intermediate - Upper Body Integration (Private Event)",
        meta: "★ No ratings yet",
        desc: "An energizing Pilates class that takes you beyond the basics. Strength, endurance, and precision to tone your body.",
        cta: "View More",
        href: "/classes/intermediate-upper-body",
        image: "/images/classes/class-1.jpg",
    },
    {
        title: "1-on-1 Private",
        meta: "Private • 55 min",
        desc: "Sesi privat untuk hasil maksimal, fokus postur, core, dan mobilitas sesuai kebutuhanmu.",
        cta: "Book now",
        href: "/book/private",
        image: "/images/classes/class-2.jpg",
    },
];

function ClassShowcaseCard({ item }) {
    return (
        <article className="relative h-[420px] overflow-hidden rounded-3xl shadow-xl md:h-[520px] group">
            <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

            <div className="absolute bottom-0 left-0 p-6 text-white md:p-10">
                <h3 className="text-xl font-semibold md:text-2xl">{item.title}</h3>

                {item.meta ? <p className="mt-2 text-xs text-white/80 md:text-sm">{item.meta}</p> : null}

                <p className="mt-3 max-w-xl overflow-hidden text-sm text-white/85 md:text-base line-clamp-2">{item.desc}</p>

                <a
                    href={item.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#3A2E2A] transition duration-500 ease-out hover:bg-[#F8F4ED] hover:shadow-lg"
                >
                    {item.cta}
                </a>
            </div>
        </article>
    );
}

export default function ClassesShowcaseSection() {
    return (
        <section className="bg-[#F4EFE6] py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">CLASSES</p>
                    <h2 className="mt-3 text-3xl font-semibold leading-tight text-wellness-text md:text-4xl">
                        Choose your next session
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-wellness-muted md:text-lg">
                        Discover curated classes designed to strengthen, align, and elevate your movement practice.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {classes.map((item) => (
                        <ClassShowcaseCard key={item.title} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// import ClassesShowcaseSection from '@/Components/ClassesShowcaseSection';
// <ClassesShowcaseSection />
