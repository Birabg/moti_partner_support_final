// src/components/customer/DashboardStatCard.jsx

import { motion } from "framer-motion";

export default function DashboardStatCard({
    title,
    value,
    icon,
    color = "blue",
}) {
    const colors = {
        blue: {
            bg: "bg-navy-50",
            text: "text-navy-600",
            border: "border-navy-100",
        },
        green: {
            bg: "bg-green-50",
            text: "text-green-600",
            border: "border-green-100",
        },
        amber: {
            bg: "bg-amber-50",
            text: "text-amber-600",
            border: "border-amber-100",
        },
        red: {
            bg: "bg-red-50",
            text: "text-red-600",
            border: "border-red-100",
        },
        purple: {
            bg: "bg-purple-50",
            text: "text-purple-600",
            border: "border-purple-100",
        },
    };

    const style = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{
                y: -5,
                transition: {
                    duration: 0.2,
                },
            }}
            className={`
                bg-white
                rounded-lg
                border
                ${style.border}
                shadow-sm
                p-6
            `}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-slate-800">
                        {value}
                    </h2>
                </div>

                <div
                    className={`
                        w-14
                        h-14
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-2xl
                        ${style.bg}
                        ${style.text}
                    `}
                >
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}
