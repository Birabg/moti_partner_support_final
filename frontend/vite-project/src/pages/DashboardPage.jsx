import { useAuth } from "../context/useAuth";


import AdminDashboard from "./dashboard/AdminDashboard";
import DirectorDashboard from "./director/DirectorDashboard";
import ManagerDashboard from "./dashboard/ManagerDashboard";
import SupportDashboard from "./support/PSSupportDashboard";
import CustomerDashboard from "./customer/CustomerDashboard";



export default function DashboardPage() {


    const { user } = useAuth();



    console.log("CURRENT USER:", user);



    // System Admin
    if (user?.isSAdmin) {

        return <AdminDashboard />;

    }



    // Director
    if (user?.isDirector) {

        return <DirectorDashboard />;

    }



    // Manager
    if (user?.isManager) {

        return <ManagerDashboard />;

    }



    // PS Support Agent
    if (user?.isPSsupport) {

        return <SupportDashboard />;

    }




    // Customer
    if (user?.partyType === "CUSTOMER") {

        return <CustomerDashboard />;

    }





    return (

        <div>

            <h2>
                Unauthorized User
            </h2>

        </div>

    );


}