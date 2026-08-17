import Axios from "./axios";


const CustomerApi = {

    register(data) {
        return Axios.post(
            "/customer/register",
            data
        );
    },


    verifyEmail(token) {
        return Axios.post(
            "/customer/verify-email",
            { token }
        );
    },


    resendVerification(email) {
        return Axios.post(
            "/customer/resend-verification",
            { email }
        );
    },


    profile() {
        return Axios.get(
            "/customer/analytics"
        );
    },


    dashboard() {
        return Axios.get(
            "/customer/analytics"
        );
    },


    analytics() {
        return Axios.get(
            "/customer/analytics"
        );
    },


    myHistory() {
        return Axios.get(
            "/customer/analytics"
        );
    },


    notifications() {
        return Axios.get(
            "/notification/get"
        );
    },


    updateProfile(data) {
        return Axios.patch(
            "/user/own/updateProfile",
            data
        );
    },


    changePassword(data) {
        return Axios.patch(
            "/customer/change-password",
            data
        );
    },


    submitFeedback(data) {
        return Axios.post(
            "/feedback",
            data
        );
    }

};


// IMPORTANT:
// Named export (for RegisterPage.jsx)
export { CustomerApi };


// Default export (for other files)
export default CustomerApi;