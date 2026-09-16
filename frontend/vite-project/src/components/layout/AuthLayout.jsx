import {
  FaTicketAlt,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: FaTicketAlt,
    title: "Centralized support",
    text: "Submit, track, and manage every support request from one workspace.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure access",
    text: "Role-based access keeps customers, support teams, and administrators protected.",
  },
  {
    icon: FaChartLine,
    title: "Live visibility",
    text: "Stay informed with real-time case updates throughout the support lifecycle.",
  },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-ink-900">
      <div className="min-h-screen flex">

        {/* =========================================================
            LEFT — MOTI BRAND EXPERIENCE
        ========================================================= */}
        <section
          className="
            relative hidden overflow-hidden
            lg:flex lg:w-[52%] xl:w-[55%]
            bg-[#08162b]
            text-white
          "
        >
          {/* Atmospheric gradients */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#315f9f]/20 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-52 -right-40 h-[620px] w-[620px] rounded-full bg-[#567fbd]/15 blur-[130px]" />

          {/* Fine engineering grid */}
          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.055]
              [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
              [background-size:44px_44px]
            "
          />

          {/* Architectural diagonal lines */}
          <div className="pointer-events-none absolute right-[-120px] top-[12%] h-[480px] w-[480px] rotate-45 border border-white/[0.07]" />
          <div className="pointer-events-none absolute right-[-30px] top-[20%] h-[340px] w-[340px] rotate-45 border border-white/[0.05]" />

          {/* Main content */}
          <div className="relative z-10 flex min-h-screen w-full flex-col px-10 py-9 sm:px-14 xl:px-20">

            {/* BRAND */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/[0.08]
                    shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                    backdrop-blur-xl
                  "
                >
                  <span className="font-display text-xl font-extrabold tracking-tight">
                    M
                  </span>
                </div>

                <div>
                  <p className="font-display text-[17px] font-bold tracking-tight text-white">
                    MOTI Engineering PLC
                  </p>

                  <p className="mt-0.5 text-[12px] font-medium tracking-wide text-white/45">
                    PARTNER SUPPORT PORTAL
                  </p>
                </div>
              </div>

              <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span className="text-[10px] font-semibold tracking-[0.16em] text-white/55">
                  SECURE PLATFORM
                </span>
              </div>
            </div>

            {/* HERO */}
            <div className="flex flex-1 items-center">
              <div className="w-full max-w-[650px] py-14">

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8bb1e4]" />

                  <span className="text-[10px] font-bold tracking-[0.22em] text-white/65">
                    ENTERPRISE SUPPORT
                  </span>
                </div>

                <h2
                  className="
                    max-w-[620px]
                    font-display
                    text-4xl
                    font-semibold
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-white
                    sm:text-5xl
                    xl:text-[58px]
                  "
                >
                  One platform.
                  <br />
                  <span className="text-[#8eafd8]">
                    Every support request.
                  </span>
                </h2>

                <p className="mt-7 max-w-[570px] text-[15px] leading-7 text-white/55">
                  Connect customers, support teams, and administrators through
                  a secure support environment designed for clear communication,
                  faster resolution, and complete visibility.
                </p>

                {/* FEATURES */}
                <div className="mt-11 space-y-3.5">
                  {FEATURES.map(({ icon: Icon, title: featureTitle, text }) => (
                    <div
                      key={featureTitle}
                      className="
                        group flex items-start gap-4
                        rounded-2xl
                        border border-white/[0.07]
                        bg-white/[0.035]
                        p-4
                        transition-all duration-300
                        hover:border-white/[0.13]
                        hover:bg-white/[0.055]
                        hover:translate-x-1
                      "
                    >
                      <div
                        className="
                          flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-xl
                          border border-white/10
                          bg-white/[0.07]
                          text-[#9bbbe6]
                          transition-transform duration-300
                          group-hover:scale-105
                        "
                      >
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-semibold text-white">
                            {featureTitle}
                          </h3>

                          <FaArrowRight
                            size={9}
                            className="
                              text-white/20
                              transition-all duration-300
                              group-hover:translate-x-1
                              group-hover:text-white/50
                            "
                          />
                        </div>

                        <p className="mt-1 text-[12px] leading-5 text-white/40">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TRUST LINE */}
                <div className="mt-9 flex items-center gap-2 text-[11px] text-white/35">
                  <FaCheckCircle size={11} className="text-[#7fa6d5]" />
                  Designed for secure enterprise support operations
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-white/[0.07] pt-5">
              <p className="text-[11px] text-white/30">
                © {new Date().getFullYear()} MOTI Engineering PLC
              </p>

              <p className="hidden text-[10px] font-semibold tracking-[0.15em] text-white/25 sm:block">
                PARTNER SUPPORT
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT — AUTHENTICATION
        ========================================================= */}
        <main
          className="
            relative flex min-h-screen flex-1
            items-center justify-center
            overflow-hidden
            bg-[#f7f8fa]
            px-5 py-10
            sm:px-8
            lg:px-12
            xl:px-20
          "
        >
          {/* Soft background lighting */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#dbe7f7]/50 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#e9eef5] blur-[100px]" />

          {/* Small decorative line */}
          <div className="pointer-events-none absolute right-10 top-10 hidden h-24 w-24 border-r border-t border-[#dbe2eb] lg:block" />

          <div className="relative z-10 w-full max-w-[440px]">

            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102037] text-lg font-bold text-white shadow-lg">
                M
              </div>

              <div>
                <p className="font-display text-sm font-bold text-[#102037]">
                  MOTI Engineering PLC
                </p>
                <p className="text-[10px] font-medium tracking-[0.12em] text-slate-400">
                  PARTNER SUPPORT PORTAL
                </p>
              </div>
            </div>

            {/* AUTH PANEL */}
            <div
              className="
                rounded-[26px]
                border border-[#e4e8ee]
                bg-white
                px-7 py-8
                shadow-[0_24px_70px_rgba(16,32,55,0.08)]
                sm:px-9 sm:py-10
              "
            >
              {/* Small heading marker */}
              <div className="mb-7 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#567fbd]" />
                <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  PARTNER ACCESS
                </span>
              </div>

              <h1
                className="
                  font-display
                  text-[30px]
                  font-bold
                  tracking-[-0.035em]
                  text-[#101a28]
                "
              >
                {title}
              </h1>

              <p className="mt-2.5 max-w-[360px] text-[13px] leading-6 text-[#667285]">
                {subtitle}
              </p>

              <div className="mt-8">
                {children}
              </div>
            </div>

            {/* Security note */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <FaShieldAlt size={10} />
              <span>Secure authentication • MOTI Partner Support Portal</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}