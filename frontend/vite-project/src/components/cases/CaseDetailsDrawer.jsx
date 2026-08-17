import {

    useEffect,

    useState

} from "react";

import {

    getCase

} from "../../api/caseApi";

import CaseTimeline from "./CaseTimeline";



export default function CaseDetailsDrawer({

    caseData,

    close

}){

    const [

        fullCase,

        setFullCase

    ] = useState(caseData || null);
    const [error, setError] = useState(null);

    useEffect(()=>{

        async function load(){
            if (!caseData?.id) {
                setError("Unable to load case details: missing case identifier.");
                setFullCase(null);
                return;
            }

            setError(null);

            try {
                const response = await getCase(caseData.id);
                const caseDetails = response?.data?.data || response?.data || null;
                setFullCase(caseDetails || caseData);
            } catch (err) {
                console.error("Failed to load case details:", err);
                setFullCase(caseData);
                if (!caseData) {
                    setError("Unable to load case details. Please try again.");
                }
            }
        }

        load();

    },[caseData]);

    if (error){

        return(

            <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl overflow-auto p-8 z-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Case details</h2>
                    <button onClick={close}>✕</button>
                </div>
                <div className="text-red-600">{error}</div>
            </div>

        );

    }

    if(!fullCase){

        return(

            <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl overflow-auto p-8 z-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Case details</h2>
                    <button onClick={close}>✕</button>
                </div>
                <div>Loading case details…</div>
            </div>

        );

    }

    return(

        <div
            className="
            fixed
            right-0
            top-0
            h-screen
            w-[600px]
            bg-white
            shadow-2xl
            overflow-auto
            p-8
            z-50
            "
        >

            <div
                className="
                flex
                justify-between
                items-center
                mb-8
                "
            >

                <h2
                    className="
                    text-2xl
                    font-bold
                    "
                >

                    {

                        fullCase.caseNumber

                    }

                </h2>

                <button
                    onClick={close}
                >

                    ✕

                </button>

            </div>

            <p>

                <b>Customer:</b>

                {" "}

                {
                    fullCase.customer
                        ? `${fullCase.customer.firstName || ""} ${fullCase.customer.lastName || ""}`.trim()
                        : fullCase.customerName || fullCase.customer?.name || "Customer"
                }

            </p>

            <p>

                <b>Status:</b>

                {" "}

                {

                    fullCase.status

                }

            </p>

            <p>
                <b>Subject:</b> {fullCase.subject || "—"}
            </p>

            <p>
                <b>Category:</b> {fullCase.productCategory?.name || "—"}
            </p>

            <p>
                <b>Subcategory:</b> {fullCase.productSubcategory?.name || "—"}
            </p>

            <p>
                <b>Service Type:</b> {fullCase.serviceType?.name || "—"}
            </p>

            <p>
                <b>Branch:</b> {fullCase.branchName || "—"}
            </p>

            <p>
                <b>Priority:</b> {fullCase.priority || "—"}
            </p>

            <p>
                <b>Explanation:</b>
                <br />
                {fullCase.description || fullCase.explanation || "—"}
            </p>

            <p>
                <b>Attachments:</b>
                {fullCase.attachments?.length > 0 ? (
                    <ul className="list-disc list-inside mt-2">
                        {fullCase.attachments.map((attachment) => (
                            <li key={attachment.id || attachment.fileName}>{attachment.fileName || attachment.name || "Attachment"}</li>
                        ))}
                    </ul>
                ) : (
                    " —"
                )}
            </p>

            <CaseTimeline
                history={fullCase.statusHistory || []}
            />

        </div>

    );

}