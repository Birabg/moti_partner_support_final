import { FaClipboardCheck } from "react-icons/fa";

import "../../styles/pendingApproval.css";


export default function EmptyPendingApproval({refresh}){


    return(

        <div className="empty-approval-container text-medium">


            <h1 className="text-medium" >

                Pending Approval Center

            </h1>


            <div className="approval-card">


                <div className="approval-icon">

                    <FaClipboardCheck/>

                </div>



                <h2 >

                    No Pending Approvals Yet

                </h2>


                <p>

                    No customers or staff members are waiting
                    for administrator approval.

                </p>


                <p>

                    Newly registered users will automatically
                    appear here once they verify their email.

                </p>



                <button

                className="refresh-button"

                onClick={refresh}

                >

                    Refresh List

                </button>



            </div>




            

        </div>

    )


}