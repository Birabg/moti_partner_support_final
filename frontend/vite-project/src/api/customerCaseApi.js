import api from "./axios";

const notifyCaseRefresh = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cases:updated"));
    }
};

const customerCaseApi = {


    getDashboard(){

        return api.get(
            "/customer/analytics"
        );

    },


    getCustomerCases(){

        return api.get(
            "/customer/analytics"
        );

    },


    getMyCases(){

        return api.get(
            "/customer/analytics"
        );

    },


    getCaseDetails(caseId){

        return api.get(
            `/cases/${caseId}`
        );

    },


    createCase(data){
        return api.post(
            "/cases/create",
            data,
            {
                headers: data instanceof FormData ? undefined : { "Content-Type": "application/json" }
            }
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });
    },


    closeCase(caseId,data){

        return api.post(
            `/cases/close/${caseId}/feedback-close`,
            data
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    rejectCase(caseId){

        return api.post(
            `/cases/rejectedcase/${caseId}`
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    reopenCase(caseId){

        return api.post(
            `/cases/rejectedcase/${caseId}`
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    submitFeedback(caseId, rating, comment){
        return api.post(
            `/cases/close/${caseId}/feedback-close`,
            { rating, comment }
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });
    },
    markNotificationRead(notificationId){

        return api.patch(
            `/notification/read/${notificationId}`
        );

},

};


export default customerCaseApi;


// named exports
export const {
    getDashboard,
    getCustomerCases,
    getMyCases,
    getCaseDetails,
    createCase,
    closeCase,
    rejectCase,
    reopenCase,
    submitFeedback,
    markNotificationRead

} = customerCaseApi;