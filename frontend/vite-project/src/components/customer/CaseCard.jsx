import {
    FaTicketAlt,
    FaUserTie,
    FaCalendarAlt,
    FaArrowRight,
} from "react-icons/fa";


const statusStyles = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-100",
    ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-100",
    PENDING: "bg-orange-50 text-orange-700 border-orange-100",
    ESCALATED: "bg-red-50 text-red-700 border-red-100",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CUSTOMER_CONFIRMATION:
        "bg-violet-50 text-violet-700 border-violet-100",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
    REJECTED: "bg-red-50 text-red-700 border-red-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
};


/* [COMMENTED OUT] priority hidden from customer
const priorityStyles = {
    LOW: {
        text: "text-slate-600",
        dot: "bg-slate-400",
    },

    MEDIUM: {
        text: "text-amber-600",
        dot: "bg-amber-500",
    },

    HIGH: {
        text: "text-orange-600",
        dot: "bg-orange-500",
    },

    CRITICAL: {
        text: "text-red-600",
        dot: "bg-red-500",
    },

    URGENT: {
        text: "text-red-600",
        dot: "bg-red-500",
    },
};
*/


const formatStatus = (status) => {
    if (!status) return "Unknown";

    return String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


export default function CaseCard({
    caseData,
    onClick,
}) {

    const {
        caseNumber,
        subject,
        status,
        // priority,  // [COMMENTED OUT] priority hidden from customer
        createdAt,
        assignedSupport,
        productCategory,
    } = caseData;


    const currentStatus =
        String(status || "UNKNOWN").toUpperCase();


    const statusClass =
        statusStyles[currentStatus] ||
        "bg-slate-100 text-slate-600 border-slate-200";


    /* [COMMENTED OUT] priority hidden from customer
    const priorityData =
        priorityStyles[
            String(priority || "").toUpperCase()
        ] || {
            text: "text-slate-500",
            dot: "bg-slate-400",
        };
    */


    const assignedName = assignedSupport
        ? `${assignedSupport.firstName || ""} ${
              assignedSupport.lastName || ""
          }`.trim()
        : "Waiting assignment";


    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString(
              undefined,
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              }
          )
        : "N/A";


    return (

        <article
            className="
                group
                relative
                flex
                h-full
                cursor-pointer
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:shadow-md
            "
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (event) => {

                          if (
                              event.key === "Enter" ||
                              event.key === " "
                          ) {

                              event.preventDefault();

                              onClick();

                          }

                      }
                    : undefined
            }
        >


            {/* =================================
                TOP SECTION
            ================================== */}

            <div className="
                flex
                items-start
                justify-between
                gap-3
                p-5
            ">


                {/* Ticket + Subject */}

                <div className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                ">


                    <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-600
                        transition-all
                        duration-200
                        group-hover:bg-slate-900
                        group-hover:text-white
                    ">

                        <FaTicketAlt className="text-sm" />

                    </div>


                    <div className="min-w-0">

                        <p className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        ">
                            Support Case
                        </p>


                        <h3 className="
                            mt-1
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                        "
                            title={subject || "Untitled Case"}
                        >

                            {subject || "Untitled Case"}

                        </h3>


                        <p className="
                            mt-1
                            text-[11px]
                            font-medium
                            text-slate-400
                        ">

                            #{caseNumber || "N/A"}

                        </p>

                    </div>

                </div>


                {/* Status */}

                <span
                    className={`
                        inline-flex
                        max-w-[135px]
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-semibold
                        ${statusClass}
                    `}
                >

                    <span
                        className="
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-current
                            opacity-70
                        "
                    />

                    <span className="truncate">
                        {formatStatus(currentStatus)}
                    </span>

                </span>

            </div>


            {/* =================================
                DETAILS
            ================================== */}

            <div className="
                mx-5
                border-t
                border-slate-100
            " />


            <div className="
                grid
                grid-cols-2
                gap-x-5
                gap-y-5
                px-5
                py-5
            ">


                {/* Category */}

                <div className="min-w-0">

                    <p className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                    ">
                        Category
                    </p>


                    <p className="
                        mt-1.5
                        truncate
                        text-sm
                        font-semibold
                        text-slate-700
                    ">

                        {productCategory?.name ||
                            "General Support"}

                    </p>

                </div>


                {/* [COMMENTED OUT] priority section hidden from customer
                <div>

                    <p className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                    ">
                        Priority
                    </p>


                    <div className="
                        mt-1.5
                        flex
                        items-center
                        gap-1.5
                    ">

                        <span
                            className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${priorityData.dot}
                            `}
                        />

                        <span
                            className={`
                                text-sm
                                font-semibold
                                ${priorityData.text}
                            `}
                        >

                            {priority
                                ? String(priority)
                                      .charAt(0)
                                      .toUpperCase() +
                                  String(priority)
                                      .slice(1)
                                      .toLowerCase()
                                : "Not assigned"}

                        </span>

                    </div>

                </div>
                */}


                {/* Created */}

                <div>

                    <p className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                    ">
                        Created
                    </p>


                    <div className="
                        mt-1.5
                        flex
                        items-center
                        gap-1.5
                    ">

                        <FaCalendarAlt
                            className="
                                shrink-0
                                text-[10px]
                                text-slate-400
                            "
                        />

                        <span className="
                            text-sm
                            font-medium
                            text-slate-600
                        ">

                            {formattedDate}

                        </span>

                    </div>

                </div>


                {/* Assigned */}

                <div className="min-w-0">

                    <p className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                    ">
                        Assigned To
                    </p>


                    <div className="
                        mt-1.5
                        flex
                        min-w-0
                        items-center
                        gap-1.5
                    ">

                        <FaUserTie
                            className="
                                shrink-0
                                text-[10px]
                                text-slate-400
                            "
                        />


                        <span className="
                            truncate
                            text-sm
                            font-medium
                            text-slate-600
                        ">

                            {assignedName}

                        </span>

                    </div>

                </div>

            </div>


            {/* =================================
                FOOTER
            ================================== */}

            <div className="
                mt-auto
                border-t
                border-slate-100
                px-5
                py-4
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                ">

                    <span className="
                        text-[11px]
                        font-medium
                        text-slate-400
                        transition-colors
                        group-hover:text-slate-600
                    ">

                        View case details

                    </span>


                    <div className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-50
                        text-slate-400
                        transition-all
                        duration-200
                        group-hover:bg-slate-900
                        group-hover:text-white
                    ">

                        <FaArrowRight
                            className="
                                text-[10px]
                                transition-transform
                                duration-200
                                group-hover:translate-x-0.5
                            "
                        />

                    </div>

                </div>

            </div>

        </article>

    );
}
