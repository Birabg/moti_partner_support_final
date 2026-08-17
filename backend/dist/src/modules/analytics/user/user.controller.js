"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPSSupportPerformanceAnalytics = exports.getCustomerCaseloadAnalytics = void 0;
const database_1 = require("../../../config/database");
const client_1 = require("../../../../generated/prisma/client");
const getCustomerCaseloadAnalytics = async (req, res, next) => {
    try {
        const customersData = await database_1.prisma.customer.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                caseReports: {
                    select: {
                        id: true,
                        status: true,
                        rating: true
                    }
                }
            },
            orderBy: { lastName: "asc" }
        });
        const customerProfiles = customersData.map((cust) => {
            const cases = cust.caseReports || [];
            const totalCases = cases.length;
            const inProgressCount = cases.filter((c) => c.status === client_1.CaseStatus.IN_PROGRESS).length;
            const closedCount = cases.filter((c) => c.status === client_1.CaseStatus.CLOSED).length;
            const ratedCases = cases.filter((c) => c.status === client_1.CaseStatus.CLOSED && typeof c.rating === "number");
            const totalScoreSum = ratedCases.reduce((sum, c) => sum + c.rating, 0);
            const averageFeedbackScore = ratedCases.length > 0
                ? parseFloat((totalScoreSum / ratedCases.length).toFixed(2))
                : null;
            return {
                customerId: cust.id,
                name: `${cust.firstName} ${cust.lastName}`,
                email: cust.email,
                metrics: {
                    totalCasesCreated: totalCases,
                    inProgressCasesCount: inProgressCount,
                    closedCasesCount: closedCount,
                    averageFeedbackScoreRating: averageFeedbackScore
                }
            };
        });
        return res.status(200).json({
            success: true,
            data: customerProfiles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerCaseloadAnalytics = getCustomerCaseloadAnalytics;
const getPSSupportPerformanceAnalytics = async (req, res, next) => {
    try {
        const staffData = await database_1.prisma.staff.findMany({
            where: { status: "ACTIVE" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isPSsupport: true,
                staff: {
                    select: {
                        id: true,
                        status: true,
                        rating: true
                    }
                }
            },
            orderBy: { lastName: "asc" }
        });
        const supportProfiles = staffData.map((agent) => {
            const assignedCases = agent.staff || [];
            const totalReceived = assignedCases.length;
            const inProgressCount = assignedCases.filter((c) => c.status === client_1.CaseStatus.IN_PROGRESS).length;
            const closedCount = assignedCases.filter((c) => c.status === client_1.CaseStatus.CLOSED).length;
            const reviewedCases = assignedCases.filter((c) => c.status === client_1.CaseStatus.CLOSED && typeof c.rating === "number");
            const ratingScoreSum = reviewedCases.reduce((sum, c) => sum + c.rating, 0);
            const agentAverageCsat = reviewedCases.length > 0
                ? parseFloat((ratingScoreSum / reviewedCases.length).toFixed(2))
                : null;
            return {
                agentId: agent.id,
                name: `${agent.firstName} ${agent.lastName}`,
                email: agent.email,
                isPSsupport: agent.isPSsupport ?? true,
                metrics: {
                    totalCasesReceived: totalReceived,
                    inProgressCasesCount: inProgressCount,
                    closedCasesCount: closedCount,
                    averageFeedbackRatingReceived: agentAverageCsat
                }
            };
        });
        return res.status(200).json({
            success: true,
            data: supportProfiles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPSSupportPerformanceAnalytics = getPSSupportPerformanceAnalytics;
