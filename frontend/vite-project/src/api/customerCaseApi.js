import api from "./axios";

/*
|--------------------------------------------------------------------------
| Notify the application that case data has changed
|--------------------------------------------------------------------------
*/
const notifyCaseRefresh = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cases:updated"));
    }
};


/*
|--------------------------------------------------------------------------
| Customer Case API
|--------------------------------------------------------------------------
*/
const customerCaseApi = {

    /*
    |--------------------------------------------------------------------------
    | Customer Dashboard
    |--------------------------------------------------------------------------
    */
    getDashboard() {
        return api.get("/customer/analytics");
    },


    /*
    |--------------------------------------------------------------------------
    | Get all cases belonging to the logged-in customer
    |--------------------------------------------------------------------------
    */
    getCustomerCases() {
        return api.get("/customer/analytics");
    },


    /*
    |--------------------------------------------------------------------------
    | Alias for customer cases
    |--------------------------------------------------------------------------
    */
    getMyCases() {
        return api.get("/customer/analytics");
    },


    /*
    |--------------------------------------------------------------------------
    | Get one case
    |--------------------------------------------------------------------------
    */
    getCaseDetails(caseId) {
        if (!caseId) {
            return Promise.reject(
                new Error("Case ID is required")
            );
        }

        return api.get(`/cases/${caseId}`);
    },


    /*
    |--------------------------------------------------------------------------
    | Create Case
    |--------------------------------------------------------------------------
    */
    createCase(data) {
        return api.post(
            "/cases/create",
            data,
            data instanceof FormData
                ? undefined
                : {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
        ).then((response) => {
            notifyCaseRefresh();
            return response;
        });
    },


    /*
    |--------------------------------------------------------------------------
    | Close Case
    |--------------------------------------------------------------------------
    */
    closeCase(caseId, data = {}) {
        if (!caseId) {
            return Promise.reject(
                new Error("Case ID is required")
            );
        }

        return api.post(
            `/cases/close/${caseId}/feedback-close`,
            data
        ).then((response) => {
            notifyCaseRefresh();
            return response;
        });
    },


    /*
    |--------------------------------------------------------------------------
    | Reject Case / Resolution
    |--------------------------------------------------------------------------
    */
    rejectCase(caseId) {
        if (!caseId) {
            return Promise.reject(
                new Error("Case ID is required")
            );
        }

        return api.post(
            `/cases/rejectedcase/${caseId}`
        ).then((response) => {
            notifyCaseRefresh();
            return response;
        });
    },


    /*
    |--------------------------------------------------------------------------
    | Reopen Case
    |--------------------------------------------------------------------------
    */
    reopenCase(caseId) {
        if (!caseId) {
            return Promise.reject(
                new Error("Case ID is required")
            );
        }

        return api.post(
            `/cases/rejectedcase/${caseId}`
        ).then((response) => {
            notifyCaseRefresh();
            return response;
        });
    },


    /*
    |--------------------------------------------------------------------------
    | Submit Feedback
    |--------------------------------------------------------------------------
    */
    submitFeedback(caseId, rating, comment) {
        if (!caseId) {
            return Promise.reject(
                new Error("Case ID is required")
            );
        }

        return api.post(
            `/cases/close/${caseId}/feedback-close`,
            {
                rating,
                comment,
            }
        ).then((response) => {
            notifyCaseRefresh();
            return response;
        });
    },


    /*
    |--------------------------------------------------------------------------
    | Mark Notification As Read
    |--------------------------------------------------------------------------
    */
    markNotificationRead(notificationId) {
        if (!notificationId) {
            return Promise.reject(
                new Error("Notification ID is required")
            );
        }

        return api.patch(
            `/notification/read/${notificationId}`
        );
    },
};


/*
|--------------------------------------------------------------------------
| Default export
|--------------------------------------------------------------------------
*/
export default customerCaseApi;


/*
|--------------------------------------------------------------------------
| Named exports
|--------------------------------------------------------------------------
*/
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
    markNotificationRead,
} = customerCaseApi;