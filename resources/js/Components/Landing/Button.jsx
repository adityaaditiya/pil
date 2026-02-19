export default function Button({
    as = "button",
    href,
    children,
    variant = "primary",
    className = "",
}) {
    const Component = as;

    const baseClass =
        "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-wellness-soft";

    const variants = {
        primary:
            "bg-primary-500 text-white shadow-lg shadow-primary-900/15 hover:bg-primary-600",
        secondary:
            "border border-primary-300 bg-white/80 text-wellness-text hover:border-primary-500 hover:text-primary-700",
    };

    return (
        <Component href={href} className={`${baseClass} ${variants[variant]} ${className}`}>
            {children}
        </Component>
    );
}
