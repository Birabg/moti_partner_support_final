const variants = {
    primary:
        "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900",

    accent:
        "bg-navy-500 text-white hover:bg-navy-600 focus-visible:outline-navy-500",

    gold:
        "bg-gold-500 text-navy-950 hover:bg-gold-600 focus-visible:outline-gold-500",

    outline:
        "border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 focus-visible:outline-navy-900",

    ghost:
        "text-ink-700 hover:bg-ink-100 focus-visible:outline-navy-900",

    danger:
        "bg-danger-500 text-white hover:bg-danger-600 focus-visible:outline-danger-500",
};

const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3.5 text-base",
};

export default function Button({
    as: Component = "button",
    variant = "primary",
    size = "md",
    className = "",
    loading = false,
    disabled = false,
    children,
    type = "button",
    ...props
}) {
    const variantClass =
        variants[variant] || variants.primary;

    const sizeClass =
        sizes[size] || sizes.md;

    return (
        <Component
            type={Component === "button" ? type : undefined}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                font-semibold
                tracking-wide
                transition-all
                duration-200
                shadow-sm
                hover:shadow-md
                active:scale-[0.98]
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${variantClass}
                ${sizeClass}
                ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span
                    className="
                        h-3.5
                        w-3.5
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                    "
                />
            )}

            {children}
        </Component>
    );
}