"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaseFeedbackAnalytics = void 0;
const database_1 = require("../../../../config/database");
const client_1 = require("../../../../../generated/prisma/client");
const getCaseFeedbackAnalytics = async (req, res, next) => {
    try {
        const [totalClosedCases, casesWithFeedback] = await database_1.prisma.$transaction([
            database_1.prisma.caseReport.count({
                where: { status: client_1.CaseStatus.CLOSED }
            }),
            database_1.prisma.caseReport.count({
                where: {
                    status: client_1.CaseStatus.CLOSED,
                    OR: [
                        { customerFeedback: { not: null } },
                        { feedback: { not: null } }
                    ]
                }
            })
        ]);
        const trackingRecords = await database_1.prisma.caseReport.findMany({
            where: {
                status: client_1.CaseStatus.CLOSED,
                OR: [
                    { customerFeedback: { not: null } },
                    { feedback: { not: null } }
                ]
            },
            select: {
                id: true,
                caseNumber: true,
                subject: true,
                resolvedAt: true,
                closedAt: true,
                customerFeedback: true,
                rating: true,
                assignedSupport: {
                    select: {
                        id: true,
                        firstName: true,
                        middleName: true
                    }
                }
            },
            orderBy: { closedAt: "desc" }
        });
        let totalRatingSum = 0;
        let scoredReviewsCount = 0;
        const feedbackList = trackingRecords.map((record) => {
            if (record.rating && typeof record.rating === "number") {
                totalRatingSum += record.rating;
                scoredReviewsCount++;
            }
            return {
                caseId: record.id,
                caseNumber: record.caseNumber,
                subject: record.subject,
                closedAt: record.closedAt || record.resolvedAt,
                assignedAgent: record.assignedSupport
                    ? `${record.assignedSupport.firstName} ${record.assignedSupport.middleName}`
                    : "Unassigned / Automated System",
                rating: record.rating || "No Score Provided",
                comment: record.customerFeedback || record.feedback || ""
            };
        });
        const feedbackSubmissionRate = totalClosedCases > 0
            ? parseFloat(((casesWithFeedback / totalClosedCases) * 100).toFixed(2))
            : 0;
        const averageCustomerScore = scoredReviewsCount > 0
            ? parseFloat((totalRatingSum / scoredReviewsCount).toFixed(2))
            : null;
        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalClosedCases,
                    casesWithFeedbackReceived: casesWithFeedback,
                    feedbackSubmissionRatePercentage: feedbackSubmissionRate,
                    averageSatisfactionScore: averageCustomerScore
                },
                reviews: feedbackList
            }
        });
    }
    catch (error) {
        // Defensive fallback for Prisma schema mismatches (e.g., missing customerFeedback/feedback fields)
        if (error?.code === 'P2022' || /Unknown argument `customerFeedback`/.test(error?.message || '')) {
            try {
                console.warn('[getCaseFeedbackAnalytics] primary query failed, returning best-effort feedback data:', error?.message || error);
                const totalClosedCases = await database_1.prisma.caseReport.count({ where: { status: client_1.CaseStatus.CLOSED } });
                // Can't reliably detect feedback presence if fields absent from DB/schema; return 0 for counts and best-effort list
                const casesWithFeedback = 0;
                const trackingRecords = await database_1.prisma.caseReport.findMany({
                    where: { status: client_1.CaseStatus.CLOSED },
                    select: {
                        id: true,
                        caseNumber: true,
                        subject: true,
                        resolvedAt: true,
                        closedAt: true,
                        rating: true,
                        assignedSupport: { select: { id: true, firstName: true, middleName: true } }
                    },
                    orderBy: { closedAt: 'desc' }
                });
                let totalRatingSum = 0;
                let scoredReviewsCount = 0;
                const feedbackList = trackingRecords.map((record) => {
                    if (record.rating && typeof record.rating === 'number') {
                        totalRatingSum += record.rating;
                        scoredReviewsCount++;
                    }
                    return {
                        caseId: record.id,
                        caseNumber: record.caseNumber,
                        subject: record.subject,
                        closedAt: record.closedAt || record.resolvedAt,
                        assignedAgent: record.assignedSupport ? `${record.assignedSupport.firstName} ${record.assignedSupport.middleName}` : 'Unassigned / Automated System',
                        rating: record.rating || 'No Score Provided',
                        comment: ''
                    };
                });
                const feedbackSubmissionRate = totalClosedCases > 0 ? parseFloat(((casesWithFeedback / totalClosedCases) * 100).toFixed(2)) : 0;
                const averageCustomerScore = scoredReviewsCount > 0 ? parseFloat((totalRatingSum / scoredReviewsCount).toFixed(2)) : null;
                return res.status(200).json({
                    success: true,
                    data: {
                        summary: {
                            totalClosedCases,
                            casesWithFeedbackReceived: casesWithFeedback,
                            feedbackSubmissionRatePercentage: feedbackSubmissionRate,
                            averageSatisfactionScore: averageCustomerScore
                        },
                        reviews: feedbackList,
                        warning: 'Returned best-effort feedback data due to internal schema mismatch.'
                    }
                });
            }
            catch (fallbackErr) {
                return next(fallbackErr);
            }
        }
        return next(error);
    }
};
exports.getCaseFeedbackAnalytics = getCaseFeedbackAnalytics;
