export default function SectionTitle({ eyebrow, title, description, align = "center" }) {
    const alignClass = align === "left" ? "text-left" : "text-center";

    return (
        <div className={`max-w-3xl ${align === "left" ? "" : "mx-auto"} ${alignClass}`}>
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
                    {eyebrow}
                </p>
            )}
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-wellness-text md:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="mt-4 text-base leading-relaxed text-wellness-muted md:text-lg">
                    {description}
                </p>
            )}
        </div>
    );
}
