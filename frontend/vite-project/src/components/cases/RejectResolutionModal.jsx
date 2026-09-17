import { useState } from "react";

import {
    rejectResolution
} from "../../api/caseApi";

export default function RejectResolutionModal({

    caseData,

    close,

    refresh

}) {

    const [loading, setLoading] = useState(false);

    const submit = async () => {

        try {

            setLoading(true);

            await rejectResolution(caseData.id);

            await refresh();

            close();

        } catch (error) {

            console.log(error);

            alert("Failed to reject resolution.");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            "
        >

            <div
                className="
                bg-white
                rounded-lg
                p-8
                w-full
                max-w-md
                "
            >

                <h2
                    className="
                    text-2xl
                    font-bold
                    text-red-600
                    mb-5
                    "
                >
                    Reject Resolution
                </h2>

                <p className="text-gray-600 mb-6">

                    Are you sure you want to reopen

                    <br />

                    <strong>
                        Case {caseData.caseNumber}
                    </strong>

                    ?

                </p>

                <div
                    className="
                    flex
                    justify-end
                    gap-3
                    "
                >

                    <button

                        onClick={close}

                        className="
                        px-5
                        py-3
                        rounded-xl
                        bg-gray-200
                        "

                    >
                        Cancel
                    </button>

                    <button

                        onClick={submit}

                        disabled={loading}

                        className="
                        px-5
                        py-3
                        rounded-xl
                        bg-red-600
                        text-white
                        "

                    >

                        {
                            loading
                                ? "Reopening..."
                                : "Reject Resolution"
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}
