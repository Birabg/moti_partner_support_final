import { Headset } from "lucide-react";

// ============================================================
// STANDARD CUSTOMER PAGE HERO
// Dark navy hero consistent with the Admin Dashboard /
// AdminPageHero. Keeps the customer section uniform with the
// admin section.
// ============================================================

export default function CustomerPageHero({
    eyebrow = "Customer Portal",
    title,
    description,
    icon: Icon = Headset,
    right,
}) {
    return (
        <section
            className="
                relative
                overflow-hidden
                rounded-[24px]
                border
                border-[#dce4ee]
                bg-[#0b1b33]
                text-white
                shadow-[0_18px_50px_rgba(11,27,51,0.12)]
            "
        >
            {/* Background atmosphere */}
            <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#416da8]/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[360px] w-[360px] rounded-full bg-[#668ec4]/10 blur-[100px]" />

            {/* Engineering grid */}
            <div
                className="
                    pointer-events-none absolute inset-0 opacity-[0.045]
                    [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                    [background-size:36px_36px]
                "
            />

            {/* Decorative frame */}
            <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[300px] w-[300px] rotate-45 border border-white/[0.06]" />
            <div className="pointer-events-none absolute right-[-35px] top-[-35px] h-[210px] w-[210px] rotate-45 border border-white/[0.05]" />

            <div className="relative z-10 flex flex-col justify-between gap-7 px-6 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-center">
                <div className="flex min-w-0 items-start gap-4">
                    <div
                        className="
                            flex h-12 w-12 shrink-0 items-center justify-center
                            rounded-2xl
                            border border-white/10
                            bg-white/[0.08]
                            text-[#91b3df]
                            shadow-[0_10px_30px_rgba(0,0,0,0.16)]
                        "
                    >
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                                {eyebrow}
                            </span>
                        </div>

                        <h1 className="font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {right && (
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                        {right}
                    </div>
                )}
            </div>
        </section>
    );
}