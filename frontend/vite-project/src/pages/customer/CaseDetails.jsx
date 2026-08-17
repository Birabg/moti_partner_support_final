import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {

    getCaseDetails,

    submitFeedback,

    reopenCase,

} from "../../api/customerCaseApi";

import StatusBadge from "../../components/customer/StatusBadge";

import PriorityBadge from "../../components/customer/PriorityBadge";

import CaseTimeline from "../../components/customer/CaseTimeline";

import FeedbackModal from "../../components/customer/FeedbackModal";

export default function CaseDetails() {

    const { id } = useParams();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [feedbackOpen, setFeedbackOpen] = useState(false);

    useEffect(() => {

        loadCase();

    }, [id]);

    async function loadCase() {

        try {

            const response = await getCaseDetails(id);

            setData(
                response?.data?.data ||
                response?.data ||
                response
            );

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    }

    async function handleFeedback(

        rating,

        comment

    ) {

        await submitFeedback(

            id,

            rating,

            comment

        );

        await loadCase();

    }

    async function rejectResolution() {

        try {

            await reopenCase(id);

            await loadCase();

        }

        catch (error) {

            console.log(error);

        }

    }

    if (loading)

        return (

            <div className="py-20 text-center">

                Loading...

            </div>

        );

    if (!data)

        return (

            <div className="py-20 text-center">

                Case not found.

            </div>

        );

    return (

        <div className="space-y-8">

            <div className="bg-white rounded-lg border border-navy-100 shadow-sm p-6">

                <div className="flex justify-between">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Case</p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">

                            {

                                data.caseNumber

                            }

                        </h1>

                        <p className="mt-3 text-slate-500">

                            {

                                data.subject

                            }

                        </p>

                    </div>

                    <div className="space-y-3">

                        <StatusBadge

                            status={data.status}

                        />

                        <PriorityBadge

                            priority={data.priority}

                        />

                    </div>

                </div>

                <hr className="my-6"/>

                <div>

                    <h3 className="font-semibold mb-2">

                        Description

                    </h3>

                    <p>

                        {

                            data.description

                        }

                    </p>

                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">

                    <div>

                        <h4 className="font-semibold">

                            Category

                        </h4>

                        <p>

                            {

                                data.productCategory?.name

                            }

                        </p>

                    </div>

                    <div>

                        <h4 className="font-semibold">

                            Subcategory

                        </h4>

                        <p>

                            {

                                data.productSubcategory?.name

                            }

                        </p>

                    </div>

                    <div>

                        <h4 className="font-semibold">

                            Assigned Support

                        </h4>

                        <p>

                            {

                                data.assignedPSsupport

                                ?

                                `${data.assignedPSsupport.firstName} ${data.assignedPSsupport.lastName}`

                                :

                                "Not Assigned"

                            }

                        </p>

                    </div>

                    <div>

                        <h4 className="font-semibold">

                            Created

                        </h4>

                        <p>

                            {

                                new Date(

                                    data.createdAt

                                ).toLocaleString()

                            }

                        </p>

                    </div>

                </div>

                {

                    data.status === "RESOLVED" &&

                    (

                        <div className="mt-8 flex gap-4">

                            <button

                                onClick={()=>

                                    setFeedbackOpen(true)

                                }

                                className="bg-green-600 text-white px-5 py-3 rounded-lg"

                            >

                                Leave Feedback

                            </button>

                            <button

                                onClick={rejectResolution}

                                className="bg-red-600 text-white px-5 py-3 rounded-lg"

                            >

                                Reject Resolution

                            </button>

                        </div>

                    )

                }

            </div>

            <CaseTimeline

                history={

                    data.statusHistory || []

                }

            />

            <FeedbackModal

                open={feedbackOpen}

                onClose={()=>

                    setFeedbackOpen(false)

                }

                onSubmit={handleFeedback}

            />

        </div>

    );

}