// src/api/reportsApi.js

import api from "./axios";


export const ReportsApi = {

    // ================================
    // MAIN DASHBOARD METRICS
    // ================================

    dashboard: () =>
        api.get(
            "/pro/report/cases/metrics/all"
        ),


    // ================================
    // ALL CASE DETAILS
    // ================================

    cases: (
        page = 1,
        limit = 20
    ) =>
        api.get(
            `/pro/report/cases/deepall?page=${page}&limit=${limit}`
        ),


    // ================================
    // CASE SUMMARY COUNT
    // ================================

    summary: () =>
        api.get(
            "/pro/report/cases/count"
        ),


    // ================================
    // SINGLE CASE DETAIL
    // ================================

    caseDetail: (
        caseId
    ) =>
        api.get(
            `/pro/report/cases/casesdetail/${caseId}`
        ),


    // ================================
    // CUSTOMER FEEDBACK ANALYTICS
    // ================================

    feedback: () =>
        api.get(
            "/pro/report/feedback/cases/feedback-metrics"
        ),

    // Backwards-compatible wrappers used by existing UI pages
    getMetrics: () =>
        api.get(
            "/pro/report/cases/metrics/all"
        ),

    getFeedback: () =>
        api.get(
            "/pro/report/feedback/cases/feedback-metrics"
        ),

    getCases: (page = 1, limit = 20) =>
        api.get(
            `/pro/report/cases/deepall?page=${page}&limit=${limit}`
        ),



    // ================================
    // EXPORT REPORTS
    // ================================


    exportPdf: () =>
        api.get(
            "/reports/export/pdf",
            {
                responseType:
                    "blob",
            }
        ),



    exportExcel: () =>
        api.get(
            "/reports/export/excel",
            {
                responseType:
                    "blob",
            }
        ),



    exportCsv: () =>
        api.get(
            "/reports/export/csv",
            {
                responseType:
                    "blob",
            }
        ),


};