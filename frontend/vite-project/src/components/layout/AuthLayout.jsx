import {
  FaTicketAlt,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: FaTicketAlt,
    text: "Submit and monitor support requests from a centralized dashboard.",
  },
  {
    icon: FaShieldAlt,
    text: "Secure role-based access for customers, agents, and administrators.",
  },
  {
    icon: FaChartLine,
    text: "Receive real-time updates throughout the case lifecycle.",
  },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen flex overflow-hidden font-sans">
      {/* LEFT SIDE */}
      <div
        className="
        hidden
        lg:flex
        lg:w-1/2
        relative
        overflow-hidden
        bg-gradient-to-br
        from-slate-950
        via-navy-950
        to-slate-900
        text-white
        px-14
        py-10
      "
      >
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-navy-500/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-navy-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col w-full">
          {/* LOGO */}
          <div className="flex items-center gap-4">
            <div
              className="
              w-16
              h-16
              rounded-lg
              bg-white/10
              margin-right-1
              border-white/10
              flex
              items-center
              justify-center
              text-2xl
              font-medium
              text-white
              backdrop-blur
            "
            >
              M
            </div>

            <div>
              <h1 className="font-bold text-xl">
                MOTI Engineering PLC
              </h1>

              <p className="text-sm text-white/60">
                Partner Support Portal
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex items-center">
            <div className="max-w-xl">
              <span
                className="
                inline-block
                mb-6
                rounded-full
                bg-white/10
                px-5
                py-2
                text-xs
                font-semibold
                tracking-[0.2em]
                backdrop-blur
              "
              >
                ENTERPRISE SUPPORT
              </span>

              <h2
                className="
                text-2xl
                font-medium
                text-white
                leading-tight
                mb-6
              "
              >
                One Platform For Every
                Support Request.
              </h2>

              <p className="text-sm text-white/80 leading-10 mb-7">
                Streamline communication
                between customers,
                support teams, and
                administrators with a
                secure and transparent
                support management
                platform.
              </p>

              <div className="space-y-5">
                {FEATURES.map(
                  ({
                    icon: Icon,
                    text,
                  }) => (
                    <div
                      key={text}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="
                        w-11
                        h-11
                        rounded-lg
                        bg-white/10
                        flex
                        items-center
                        justify-center
                      "
                      >
                        <Icon
                          size={
                            16
                          }
                        />
                      </div>

                      <p className="text-white/80">
                        {text}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} MOTI
            Engineering PLC. All Rights
            Reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="
        flex-1
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-slate-100
        via-white
        to-navy-50
        p-6
      "
      >
        <div
          className="
          w-full
          max-w-md
          rounded-[32px]
          bg-white
          border
          border-slate-100
          shadow-sm
          px-10
          py-10
        "
        >
          <h1 className="text-3xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}