export default function ApprovalStatistics({

    customers,
    staff

}){


    return(

        <div className="grid md:grid-cols-2 gap-6">


            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-medium">

                    Pending Customers

                </h2>


                <h1 className="text-2xl mt-4 font-bold text-navy-700">

                    {customers.length}

                </h1>

            </div>



            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-medium">

                    Pending Staff

                </h2>


                <h1 className="text-2xl mt-4 font-medium text-red-700">

                    {staff.length}

                </h1>

            </div>


        </div>
    )


}