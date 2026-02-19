export default function Card({ children, className = "" }) {
    return (
        <div
            className={`rounded-3xl border border-primary-100 bg-white p-6 shadow-[0_12px_30px_rgba(58,46,42,0.08)] ${className}`}
        >
            {children}
        </div>
    );
}
