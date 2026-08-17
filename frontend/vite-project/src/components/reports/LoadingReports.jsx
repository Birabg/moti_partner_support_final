import {
    FaSpinner,
    FaChartBar,
} from "react-icons/fa";

export default function LoadingReports() {
    return (
        <div
            className="
                min-h-[70vh]
                flex
                items-center
                justify-center
            "
        >
            <div className="text-center">
                <div
                    className="
                        w-24
                        h-24
                        rounded-full
                        bg-green-100
                        flex
                        items-center
                        justify-center
                        mx-auto
                    "
                >
                    <FaSpinner
                        className="
                            text-5xl
                            text-green-600
                            animate-spin
                        "
                    />
                </div>

                <h2
                    className="
                        text-3xl
                        font-bold
                        mt-8
                        text-slate-800
                    "
                >
                    Loading Reports...
                </h2>

                <p
                    className="
                        text-slate-500
                        mt-3
                    "
                >
                    Please wait while analytics are generated.
                </p>

                <div
                    className="
                        mt-10
                        flex
                        justify-center
                    "
                >
                    <div
                        className="
                            px-6
                            py-3
                            rounded-full
                            bg-green-50
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <FaChartBar className="text-green-600" />

                        <span className="font-medium text-green-700">
                            Preparing Dashboard
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}