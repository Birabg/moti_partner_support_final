import api from "./axios";

const notifyCaseRefresh = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cases:updated"));
    }
};

const caseApi = {


    // Get all cases (Admin)
    getAllCases(
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc"
    ){

        return api.get(
            "/cases",
            {
                params:{
                    page,
                    limit,
                    sortBy,
                    order
                }
            }
        );

    },


    // Get single case
    getCase(caseId){

        return api.get(
            `/cases/${caseId}`
        );

    },


    // Create customer case
    createCase(data){
        return api.post(
            "/cases/create",
            data,
            {
                headers: data instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : { "Content-Type": "application/json" }
            }
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });
    },


    // Assign case to support
    assignCase(caseId,data){

        return api.patch(
            `/cases/${caseId}/assign`,
            data
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    // Reassign case
    reassignCase(caseId,data){

        return api.patch(
            `/cases/${caseId}/reassign`,
            data
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    // Change priority
    changePriority(caseId,data){

        return api.patch(
            `/cases/give/${caseId}/priority`,
            data
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },


    // Resolve case
    resolveCase(caseId,data){
        const body = { ...(data || {}) };
        if (!body.resolutionSummary && body.resolution) {
            body.resolutionSummary = body.resolution;
            delete body.resolution;
        }
        return api.patch(
            `/cases/${caseId}/resolve`,
            body
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });

    },



    // Customer closes case with feedback
    closeCaseWithFeedback(caseId,data){

        return api.post(
            `/cases/close/${caseId}/feedback-close`,
            data
        );

    },


    // Reject resolution
    rejectResolution(caseId){

        return api.post(
            `/cases/rejectedcase/${caseId}`
        );

    },

    // Generic status update (PATCH /cases/:id/status)
    updateStatus(caseId, payload){
        return api.patch(
            `/cases/${caseId}/status`,
            payload
        ).then((response)=>{
            notifyCaseRefresh();
            return response;
        });
    }


};


export default caseApi;



// Named exports
export const {
    getAllCases,
    getCase,
    createCase,
    assignCase,
    reassignCase,
    changePriority,
    resolveCase,
    closeCaseWithFeedback,
    rejectResolution

} = caseApi;