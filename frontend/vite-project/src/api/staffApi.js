import Axios from "./axios";



export const StaffApi = {



    // ==========================
    // Register Staff
    // ==========================

    register(data){

        return Axios.post(
            "/staff/register",
            data
        );

    },





    // ==========================
    // Verify Email
    // ==========================

    verifyEmail(token){


        return Axios.post(
            "/staff/verify-email",
            {
                token
            }
        );


    },







    // ==========================
    // Resend Verification Email
    // ==========================


    resendVerification(email){


        return Axios.post(
            "/staff/resend-verification",
            {
                email
            }
        );


    },







    // ==========================
    // Get Staff Deep Profile
    // Requires Authentication
    // ==========================


    getStaffProfile(){


        return Axios.get(
            "/staff/analyze"
        );


    },








    // ==========================
    // Staff Feedback Analytics
    // Requires Authentication
    // ==========================


    getFeedbackAnalytics(staffId){

        const url = staffId ? `/staff/feedback/analytics?staffId=${encodeURIComponent(staffId)}` : "/staff/feedback/analytics";
        return Axios.get(url);

    }



};