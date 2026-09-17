import React from "react";

const COLORS = {
    OPEN: "bg-navy-100 text-navy-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    ASSIGNED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-navy-100 text-navy-700",
    WAITING_CUSTOMER: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-200 text-gray-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {

    return (

        <span
            className={`
                inline-flex
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${COLORS[status] || "bg-slate-100 text-slate-700"}
            `}
        >

            {status?.replaceAll("_", " ")}

        </span>

    );

}
