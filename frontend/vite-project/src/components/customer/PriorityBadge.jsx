import React from "react";

const COLORS = {

    LOW: "bg-green-100 text-green-700",

    MEDIUM: "bg-yellow-100 text-yellow-700",

    HIGH: "bg-orange-100 text-orange-700",

    CRITICAL: "bg-red-100 text-red-700",

};

export default function PriorityBadge({ priority }) {

    return (

        <span
            className={`
                inline-flex
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${COLORS[priority] || "bg-slate-100 text-slate-700"}
            `}
        >

            {priority}

        </span>

    );

}
