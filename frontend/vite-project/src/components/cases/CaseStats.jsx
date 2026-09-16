import {
    BriefcaseBusiness,
    Activity,
    AlertTriangle,
    Clock3,
    MessageCircle,
    CheckCircle2,
    CircleCheck,
} from "lucide-react";


// ============================================================
// STATUS CONFIGURATION
// ============================================================

const statConfig = [
    {
        key: "TOTAL",
        label: "Total Cases",
        description: "All cases recorded",
        icon: BriefcaseBusiness,
        iconStyle: "bg-blue-50 text-blue-600 border-blue-100",
    },

    {
        key: "IN_PROGRESS",
        label: "In Progress",
        description: "Currently being handled",
        icon: Activity,
        iconStyle: "bg-violet-50 text-violet-600 border-violet-100",
    },

    {
        key: "ESCALATED",
        label: "Escalated",
        description: "Requires attention",
        icon: AlertTriangle,
        iconStyle: "bg-red-50 text-red-600 border-red-100",
    },

    {
        key: "OPEN",
        label: "Open",
        description: "Waiting for action",
        icon: Clock3,
        iconStyle: "bg-amber-50 text-amber-600 border-amber-100",
    },

    {
        key: "PENDING",
        label: "Pending",
        description: "Waiting to be processed",
        icon: Clock3,
        iconStyle: "bg-orange-50 text-orange-600 border-orange-100",
    },

    {
        key: "AWAITING_CUSTOMER_RESPONSE",
        label: "Awaiting Customer",
        description: "Waiting for customer",
        icon: MessageCircle,
        iconStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },

    {
        key: "CLOSED",
        label: "Closed",
        description: "Closed cases",
        icon: CheckCircle2,
        iconStyle: "bg-slate-100 text-slate-600 border-slate-200",
    },

    {
        key: "RESOLVED",
        label: "Resolved",
        description: "Successfully completed",
        icon: CircleCheck,
        iconStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
];


// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(status) {

    if (!status) {
        return "";
    }

    return String(status)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    iconStyle,
}) {

    return (
        <div
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-5
                py-5
                shadow-[0_4px_20px_rgba(15,23,42,0.04)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:shadow-[0_8px_28px_rgba(15,23,42,0.07)]
            "
        >

            {/* Decorative corner glow */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-28
                    w-28
                    rounded-full
                    bg-slate-50
                    opacity-60
                "
            />


            {/* Top */}

            <div
                className="
                    relative
                    flex
                    items-start
                    justify-between
                "
            >

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        ${iconStyle}
                    `}
                >

                    <Icon
                        size={18}
                        strokeWidth={1.8}
                    />

                </div>


                {/* Arrow */}

                <span
                    className="
                        text-slate-300
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                    "
                >
                    ↗
                </span>

            </div>


            {/* Label */}

            <div
                className="
                    relative
                    mt-6
                "
            >

                <p
                    className="
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                    "
                >
                    {label}
                </p>


                {/* Number */}

                <p
                    className="
                        mt-2
                        text-3xl
                        font-semibold
                        tracking-tight
                        text-slate-950
                    "
                >
                    {value}
                </p>


                {/* Description */}

                <p
                    className="
                        mt-1.5
                        truncate
                        text-xs
                        font-medium
                        text-slate-400
                    "
                >
                    {description}
                </p>

            </div>


            {/* Bottom */}

            <div
                className="
                    relative
                    mt-5
                    flex
                    items-center
                    gap-2
                    border-t
                    border-slate-100
                    pt-3
                "
            >

                <span
                    className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-emerald-500
                    "
                />

                <span
                    className="
                        text-[10px]
                        font-semibold
                        text-slate-400
                    "
                >
                    Updated automatically
                </span>

            </div>

        </div>
    );
}


// ============================================================
// CASE STATS
// ============================================================

export default function CaseStats({
    cases = [],
}) {

    const safeCases = Array.isArray(cases)
        ? cases
        : [];


    // ------------------------------------------------------------
    // COUNT CASES
    // ------------------------------------------------------------

    const total = safeCases.length;


    const counts = safeCases.reduce(
        (acc, item) => {

            const status =
                normalizeStatus(item?.status);

            if (status) {
                acc[status] =
                    (acc[status] || 0) + 1;
            }

            return acc;

        },
        {}
    );


    // ------------------------------------------------------------
    // SUPPORT BOTH POSSIBLE API STATUS NAMES
    // ------------------------------------------------------------

    const awaitingCustomer =
        (counts.AWAITING_CUSTOMER_RESPONSE || 0) +
        (counts.WAITING_CUSTOMER_FEEDBACK || 0);


    const stats = {

        TOTAL: total,

        IN_PROGRESS:
            counts.IN_PROGRESS || 0,

        ESCALATED:
            counts.ESCALATED || 0,

        OPEN:
            counts.OPEN || 0,

        PENDING:
            counts.PENDING || 0,

        AWAITING_CUSTOMER_RESPONSE:
            awaitingCustomer,

        CLOSED:
            counts.CLOSED || 0,

        RESOLVED:
            counts.RESOLVED || 0,

    };


    return (

        <section
            className="
                space-y-4
            "
        >

            {/* ==================================================
                SECTION HEADER
            ================================================== */}

            <div
                className="
                    flex
                    items-end
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        className="
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-[0.16em]
                            text-blue-600
                        "
                    >
                        Case Overview
                    </p>


                    <h2
                        className="
                            mt-1
                            text-xl
                            font-semibold
                            tracking-tight
                            text-slate-950
                        "
                    >
                        Case activity
                    </h2>

                </div>


                <div
                    className="
                        hidden
                        items-center
                        gap-2
                        text-xs
                        font-medium
                        text-slate-400
                        sm:flex
                    "
                >

                    <span
                        className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-500
                        "
                    />

                    Live case data

                </div>

            </div>


            {/* ==================================================
                8 STAT CARDS
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >

                {statConfig.map((stat) => (

                    <StatCard
                        key={stat.key}
                        label={stat.label}
                        value={stats[stat.key]}
                        description={stat.description}
                        icon={stat.icon}
                        iconStyle={stat.iconStyle}
                    />

                ))}

            </div>

        </section>

    );
}