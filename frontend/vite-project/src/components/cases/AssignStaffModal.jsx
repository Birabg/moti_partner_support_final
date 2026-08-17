import {
    useEffect,
    useState
} from "react";

import Axios from "../../api/axios";

import {
    assignCase
} from "../../api/caseApi";



export default function AssignStaffModal({
    caseData,
    close,
    refresh
}) {


    const [staffList, setStaffList] = useState([]);

    const [selectedStaff, setSelectedStaff] = useState("");

    const [loading, setLoading] = useState(false);

    const [loadingStaff, setLoadingStaff] = useState(true);



    // ============================
    // GET SUPPORT STAFF
    // GET /api/staff/support
    // ============================

    const loadSupportStaff = async()=>{


        try {


            setLoadingStaff(true);


            const response = await Axios.get(
                "/staff/support"
            );


            setStaffList(
                response.data.data || []
            );


        } catch(error){


            console.log(
                "Failed loading support staff:",
                error
            );


        } finally {


            setLoadingStaff(false);


        }


    };





   useEffect(() => {

    if (caseData) {
        loadSupportStaff();
    }

}, [caseData]);






    // ============================
    // PATCH /api/cases/:id/assign
    // ============================


    const submitAssignment = async()=>{


        if(!selectedStaff){

            alert(
                "Please select support staff"
            );

            return;

        }



        try {


            setLoading(true);



            await assignCase(
                caseData.id,
                { assignedSupportId: selectedStaff }
            );



            await refresh();



            close();



        } catch(error){


            console.log(
                "Assignment failed:",
                error
            );


            alert(
                "Failed to assign case"
            );


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
                shadow-xl
                "
            >



                <h2
                    className="
                    text-2xl
                    font-bold
                    text-navy-950
                    mb-6
                    "
                >

                    Assign Support Staff

                </h2>





                <p
                    className="
                    text-gray-500
                    mb-4
                    "
                >

                    Case:

                    {" "}

                    {caseData.caseNumber}


                </p>






                {
                    loadingStaff ?


                    (

                        <div
                            className="
                            p-4
                            text-center
                            "
                        >

                            Loading staff...

                        </div>


                    )


                    :


                    (

                        <select
    value={selectedStaff}
    disabled={loadingStaff}
    onChange={(e) => setSelectedStaff(e.target.value)}
    className="
        w-full
        border
        rounded-xl
        px-4
        py-3
        mb-6
    "
>

    <option value="">
        Select Support Staff
    </option>

    {staffList.map((staff) => (

        <option
            key={staff.id}
            value={staff.id}
        >

            {staff.firstName}
            {" "}
            {staff.middleName}
            {" "}
            {staff.lastName ?? ""}

            {" - "}

            {staff.email}

        </option>

    ))}

</select>


                    )

                }







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

                        onClick={submitAssignment}

                        disabled={loading}

                        className="
                        px-5
                        py-3
                        rounded-xl
                        bg-green-600
                        text-white
                        "

                    >

                        {
                            loading
                            ?
                            "Assigning..."
                            :
                            "Assign"
                        }


                    </button>



                </div>





            </div>



        </div>


    );


}