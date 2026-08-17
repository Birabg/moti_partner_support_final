import PendingStaffCard from "./PendingStaffCard";


export default function PendingStaffTable({

    staff,
    approveUser,
    rejectUser

}){


    return(

        <div
        className="space-y-6"
        >


            <h1
            className="
            text-2xl
            font-medium
            "
            >

                Pending Staff

            </h1>



            <div
            className="
            grid
            md:grid-cols-2
            gap-6
            "
            >


                {

                    staff.map((item)=>(

                        <PendingStaffCard

                        key={item.id}

                        staff={item}

                        approveUser={approveUser}

                        rejectUser={rejectUser}

                        />

                    ))

                }


            </div>


        </div>

    );


}