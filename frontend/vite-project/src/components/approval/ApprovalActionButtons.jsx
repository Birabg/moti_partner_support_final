export default function ApprovalActionButtons({

    onApprove,
    onReject

}){


    return(

        <div className="space-x-3">


            <button

                onClick={onApprove}

                className="bg-green-700 text-white px-3 py-1 rounded"

            >

                Approve

            </button>



            <button

                onClick={onReject}

                className="bg-red-700 text-white px-3 py-1 rounded"

            >

                Reject

            </button>


        </div>

    )


}