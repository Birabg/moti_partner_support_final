// frontend/src/components/approval/PendingCustomerCard.jsx


import {ApprovalApi} from "../../api/approvalApi";


export default function PendingCustomerCard({

    customer,
    reload

}){


    async function approve(){


        await ApprovalApi.approve(

            customer.id,
            "CUSTOMER"

        );


        reload();


    }


    async function reject(){


        await ApprovalApi.reject(

            customer.id,
            "CUSTOMER"

        );


        reload();


    }



    return(


        <div
        className="rounded-lg bg-white shadow-sm p-8 space-y-3"
        >


            <h2
            className="text-sm font-medium"
            >
                {customer.fullName}
            </h2>


            <p>
                {customer.email}
            </p>


            <p>
                {customer.organization?.name}
            </p>



            <div
            className="flex gap-10"
            >


                <button

                onClick={approve}

                className="bg-green-600 text-white px-8 py-3 rounded-lg"

                >

                    Approve

                </button>



                <button

                onClick={reject}

                className="bg-red-600 text-white px-8 py-3 rounded-lg"

                >

                    Reject

                </button>



            </div>



        </div>


    );


}