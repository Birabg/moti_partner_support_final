import { useState } from "react";
import { resolveCase } from "../../api/caseApi";

export default function ResolveCaseModal({
    caseData,
    close,
    refresh
}) {

    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {

        if (!summary.trim()) {
            alert("Please enter a resolution summary.");
            return;
        }

        try {

            setLoading(true);

            await resolveCase(
                caseData.id,
                { resolutionSummary: summary }
            );

            await refresh();

            close();

        } catch (error) {

            console.log(error);

            const msg = err?.response?.data?.message || err?.message || "Failed to resolve case.";
            alert(msg);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-lg p-8 w-full max-w-xl">

                <h2 className="text-2xl font-bold text-navy-950 mb-6">
                    Resolve Case
                </h2>

                <p className="mb-4 text-gray-500">
                    Case Number:
                    {" "}
                    {caseData.caseNumber}
                </p>

                <textarea

                    rows={7}

                    value={summary}

                    onChange={(e) =>
                        setSummary(e.target.value)
                    }

                    placeholder="Write resolution summary..."

                    className="w-full border rounded-xl p-4"

                />

                <div className="flex justify-end gap-3 mt-6">

                    <button

                        onClick={close}

                        className="px-5 py-3 rounded-xl bg-gray-200"

                    >
                        Cancel
                    </button>

                    <button

                        onClick={submit}

                        disabled={loading}

                        className="px-5 py-3 rounded-xl bg-green-600 text-white"

                    >
                        {
                            loading
                                ? "Resolving..."
                                : "Resolve"
                        }
                    </button>

                </div>

            </div>

        </div>

    );

}