"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffDeepDetailProfile = exports.getAllSupportStaff = exports.getStaffFeedbackAnalytics = exports.resendVerification = exports.verifyEmail = exports.register = void 0;
const staff_service_1 = require("./staff.service");
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const register = async (req, res) => {
    const { firstName, lastName, middleName, email, password, gender, phoneNumber } = req.body;
    if (!firstName || !middleName || !email || !password || !gender || !phoneNumber) {
        res
            .status(400)
            .json({ error: "Missing mandatory registration profile fields." });
        return;
    }
    if (!EMAIL_REGEX.test(email)) {
        res.status(400).json({ error: "Invalid email format string provided." });
        return;
    }
    if (password.trim().length < 8) {
        res.status(400).json({
            error: "Password fails complexity rule. Must contain at least 8 characters.",
        });
        return;
    }
    if (firstName.trim().length < 2) {
        res.status(400).json({ error: "First name parameter is too short." });
        return;
    }
    try {
        const result = await (0, staff_service_1.Register)({
            firstName: firstName.trim(),
            lastName: lastName?.trim(),
            middleName: middleName.trim(),
            email: email.trim().toLowerCase(),
            passwordPlain: password,
            gender,
            phoneNumber
        });
        res.status(201).json({
            message: "Staff registration submitted successfully. Please check your inbox to verify your account.",
            staffId: result.staffId,
        });
    }
    catch (error) {
        console.error("CRITICAL REGISTRATION FAILURE:", error);
        if (error instanceof Error &&
            (error.message.includes("exists") ||
                error.message.includes("corporate email"))) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({
            error: "An unexpected error occurred while processing your registration. Please try again later.",
        });
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    const token = req.query.token || req.body.token;
    if (!token || typeof token !== "string" || token.length !== 64) {
        res.status(400).json({
            error: "A valid 64-character hexadecimal cryptographic token is required.",
        });
        return;
    }
    try {
        const confirmation = await (0, staff_service_1.verifyStaffEmail)(token);
        res.status(200).json({
            message: "Email successfully verified. Your internal account is now active.",
            details: confirmation,
        });
    }
    catch (error) {
        res.status(400).json({
            error: error.message || "Activation routine encountered a failure.",
        });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email)) {
        res
            .status(400)
            .json({ error: "A valid email format structure is required." });
        return;
    }
    try {
        await (0, staff_service_1.resendStaffVerification)(email.trim().toLowerCase());
        res.status(200).json({
            message: "If an eligible matching account was found, a fresh verification link has been delivered.",
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Resend failed." });
    }
};
exports.resendVerification = resendVerification;
const getStaffFeedbackAnalytics = async (req, res, next) => {
    try {
        // Determine requester identity and optional target staffId
        const requester = req.user || {};
        const requesterId = requester.id || requester.userId || requester.staffId;
        const isAdmin = !!requester.isSAdmin;
        const isManager = !!requester.isManager;
        const isDirector = !!requester.isDirector;
        // optional query param to request analytics for a specific staff
        const rawQueryStaffId = req.query.staffId;
        const queryStaffId = Array.isArray(rawQueryStaffId) ? rawQueryStaffId[0] : rawQueryStaffId;
        if (!requesterId && !isAdmin) {
            return res.status(401).json({ success: false, message: "Authentication context missing. Ensure you are passing a valid token." });
        }
        // Determine list of staff ids to run analytics for
        let targetStaffIds = [];
        if (typeof queryStaffId === 'string' && queryStaffId.length > 0) {
            // If caller requested a specific staff id, permit if admin or manager/director or requesting self
            if (isAdmin || isManager || isDirector || queryStaffId === requesterId) {
                targetStaffIds = [queryStaffId];
            }
            else {
                return res.status(403).json({ success: false, message: 'Not authorized to view other staff analytics' });
            }
        }
        else if (isManager || isDirector) {
            // managers/directors: aggregate team members within their managed scope
            // manager info includes managerType and departmentId/divisionId/sectionId in the JWT
            const managerType = requester.managerType || null;
            const departmentId = requester.departmentId || null;
            const divisionId = requester.divisionId || null;
            const sectionId = requester.sectionId || null;
            // build where clause depending on managerType
            let staffWhere = { isPSsupport: true, status: 'ACTIVE' };
            if (managerType === 'SECTION' && sectionId)
                staffWhere.sectionId = sectionId;
            else if (managerType === 'DIVISION' && divisionId)
                staffWhere.divisionId = divisionId;
            else if (managerType === 'DEPARTMENT' && departmentId)
                staffWhere.departmentId = departmentId;
            const team = await database_1.prisma.staff.findMany({ where: staffWhere, select: { id: true } });
            targetStaffIds = team.map((s) => s.id);
            if (targetStaffIds.length === 0) {
                return res.status(200).json({ success: true, data: { agent: { id: requesterId, name: `${requester.firstName || ''} ${requester.lastName || ''}`.trim() }, summary: { averageRating: null, totalReviewsCount: 0 }, ratingDistribution: { '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 }, reviewsFeed: [] } });
            }
        }
        else {
            // default: personal analytics
            if (!requesterId)
                return res.status(401).json({ success: false, message: 'Authentication context missing' });
            targetStaffIds = [requesterId];
        }
        // Query case reports assigned to any of the target staff ids with feedback
        const resolvedCasesWithFeedback = await database_1.prisma.caseReport.findMany({
            where: {
                assignedSupportId: { in: targetStaffIds },
                status: { in: ["CUSTOMER_CONFIRMATION", "CLOSED"] },
                feedback: { isNot: null }
            },
            select: {
                id: true,
                caseNumber: true,
                subject: true,
                closedAt: true,
                assignedSupportId: true,
                feedback: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        submittedAt: true
                    }
                }
            },
            orderBy: { closedAt: "desc" }
        });
        const totalReviewsCount = resolvedCasesWithFeedback.length;
        // prepare agent display info: single staff or aggregated team
        let agentDisplay;
        if (targetStaffIds.length === 1) {
            const staffExists = await database_1.prisma.staff.findUnique({ where: { id: targetStaffIds[0] }, select: { id: true, firstName: true, lastName: true } });
            if (!staffExists) {
                return res.status(404).json({ success: false, message: 'Requested staff member was not found.' });
            }
            agentDisplay = { id: staffExists.id, name: `${staffExists.firstName || ''} ${staffExists.lastName || ''}`.trim() || 'Staff' };
        }
        else {
            agentDisplay = { id: null, name: `Team (${targetStaffIds.length})` };
        }
        if (totalReviewsCount === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    agent: agentDisplay,
                    summary: { averageRating: null, totalReviewsCount: 0 },
                    ratingDistribution: { "5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0 },
                    reviewsFeed: []
                }
            });
        }
        let totalRatingSum = 0;
        const distribution = { "5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0 };
        const reviewsFeed = resolvedCasesWithFeedback.map(c => {
            const ratingVal = c.feedback.rating;
            totalRatingSum += ratingVal;
            const score = Math.round(ratingVal);
            if (score === 5)
                distribution["5_star"]++;
            else if (score === 4)
                distribution["4_star"]++;
            else if (score === 3)
                distribution["3_star"]++;
            else if (score === 2)
                distribution["2_star"]++;
            else if (score === 1)
                distribution["1_star"]++;
            return {
                caseId: c.id,
                caseNumber: c.caseNumber,
                subject: c.subject,
                feedbackId: c.feedback.id,
                rating: ratingVal,
                comment: c.feedback.comment,
                submittedAt: c.feedback.submittedAt
            };
        });
        const averageRating = parseFloat((totalRatingSum / totalReviewsCount).toFixed(2));
        return res.status(200).json({
            success: true,
            data: {
                agent: agentDisplay,
                summary: {
                    averageRating,
                    totalReviewsCount
                },
                ratingDistribution: distribution,
                reviewsFeed
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffFeedbackAnalytics = getStaffFeedbackAnalytics;
const getAllSupportStaff = async (req, res) => {
    try {
        const staff = await database_1.prisma.staff.findMany({
            where: {
                isPSsupport: true,
                status: "ACTIVE",
            },
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
            },
            orderBy: {
                firstName: "asc",
            },
        });
        res.status(200).json({
            success: true,
            data: staff,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAllSupportStaff = getAllSupportStaff;
const getStaffDeepDetailProfile = async (req, res, next) => {
    try {
        const staffId = req.user?.id || req.user?.userId;
        if (!staffId) {
            return res.status(401).json({
                success: false,
                message: "Authentication context missing. Are you logged in?"
            });
        }
        const staffRecord = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                section: {
                    include: {
                        division: {
                            include: { department: true },
                        },
                    },
                },
                managedDepartment: true,
                managedDivision: {
                    include: { department: true },
                },
                managedSection: {
                    include: {
                        division: { include: { department: true } },
                    },
                },
                assignedCases: {
                    orderBy: { id: "desc" },
                    select: {
                        id: true,
                        caseNumber: true,
                        subject: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!staffRecord) {
            throw new error_1.NotFoundError("Target staff member profile could not be located in the system.");
        }
        const agent = staffRecord;
        const activeCases = (agent.assignedCases || []).filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");
        const completedCases = (agent.assignedCases || []).filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
        const totalAssignedHistorically = agent.assignedCases?.length || 0;
        const openCount = activeCases.filter((c) => c.status === "OPEN").length;
        const inProgressCount = activeCases.filter((c) => c.status === "IN_PROGRESS").length;
        const closedCount = completedCases.length;
        const ratedCases = completedCases.filter((c) => typeof c.rating === "number");
        const totalRatingSum = ratedCases.reduce((sum, c) => sum + c.rating, 0);
        const averageFeedbackRating = ratedCases.length > 0 ? parseFloat((totalRatingSum / ratedCases.length).toFixed(2)) : null;
        let structuralAssignment;
        if (agent.section) {
            structuralAssignment = {
                assignmentType: "SECTION_MEMBER",
                sectionId: agent.sectionId,
                sectionName: agent.section.name,
                divisionId: agent.section.division?.id || null,
                divisionName: agent.section.division?.name || "Unassigned",
                departmentId: agent.section.division?.department?.id || null,
                departmentName: agent.section.division?.department?.name || "Unassigned",
            };
        }
        else if (agent.managedSection) {
            structuralAssignment = {
                assignmentType: "SECTION_MANAGER",
                sectionId: agent.managedSection.id,
                sectionName: agent.managedSection.name,
                divisionId: agent.managedSection.division?.id || null,
                divisionName: agent.managedSection.division?.name || "Unassigned",
                departmentId: agent.managedSection.division?.department?.id || null,
                departmentName: agent.managedSection.division?.department?.name || "Unassigned",
            };
        }
        else if (agent.managedDivision) {
            structuralAssignment = {
                assignmentType: "DIVISION_MANAGER",
                sectionId: null,
                sectionName: null,
                divisionId: agent.managedDivision.id,
                divisionName: agent.managedDivision.name,
                departmentId: agent.managedDivision.department?.id || null,
                departmentName: agent.managedDivision.department?.name || "Unassigned",
            };
        }
        else if (agent.managedDepartment) {
            structuralAssignment = {
                assignmentType: "DEPARTMENT_MANAGER",
                sectionId: null,
                sectionName: null,
                divisionId: null,
                divisionName: null,
                departmentId: agent.managedDepartment.id,
                departmentName: agent.managedDepartment.name,
            };
        }
        else {
            structuralAssignment = {
                assignmentType: "UNASSIGNED",
                sectionId: null,
                sectionName: "Unassigned",
                divisionId: null,
                divisionName: "Unassigned",
                departmentId: null,
                departmentName: "Unassigned",
            };
        }
        return res.status(200).json({
            success: true,
            data: {
                profile: {
                    id: agent.id,
                    firstName: agent.firstName,
                    middleName: agent.middleName,
                    lastName: agent.lastName,
                    name: `${agent.firstName} ${agent.middleName || ""} ${agent.lastName || ""}`.trim(),
                    email: agent.email,
                    phoneNumber: agent.phoneNumber,
                    createdAt: agent.createdAt,
                    status: agent.status,
                    isSystemAdmin: agent.isSAdmin,
                    isPSsupport: agent.isPSsupport ?? false,
                    role: agent.isSAdmin
                        ? "SYSTEM_ADMIN"
                        : agent.isManager
                            ? "MANAGER"
                            : agent.isPSsupport
                                ? "PSSUPPORT"
                                : "STAFF",
                },
                structuralAssignment,
                workloadMetrics: {
                    totalAssignedHistorically,
                    activeOpenCount: openCount,
                    activeInProgressCount: inProgressCount,
                    historicalClosedCount: closedCount,
                    averageFeedbackRatingReceived: averageFeedbackRating,
                },
                activeWorkloadList: activeCases,
                historicalClosedList: completedCases.map((c) => ({
                    id: c.id,
                    caseNumber: c.caseNumber,
                    subject: c.subject,
                    resolvedAt: c.resolvedAt,
                    feedback: {
                        rating: c.rating || null,
                        comment: c.customerFeedback || c.feedback || null,
                    },
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffDeepDetailProfile = getStaffDeepDetailProfile;
