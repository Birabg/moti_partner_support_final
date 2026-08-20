"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackByStaffId = void 0;
const database_1 = require("../../config/database");
const getFeedbackByStaffId = async (req, res, next) => {
    try {
        const rawStaffId = req.params.staffId;
        const staffId = Array.isArray(rawStaffId) ? rawStaffId[0] : rawStaffId;
        if (!staffId || typeof staffId !== 'string')
            return res.status(400).json({ success: false, message: 'staffId is required as path param' });
        const staffExists = await database_1.prisma.staff.findUnique({ where: { id: staffId }, select: { id: true, firstName: true, lastName: true } });
        if (!staffExists)
            return res.status(404).json({ success: false, message: 'Staff not found' });
        const resolvedCasesWithFeedback = await database_1.prisma.caseReport.findMany({
            where: {
                assignedSupportId: staffId,
                status: { in: ["CUSTOMER_CONFIRMATION", "CLOSED"] },
                feedback: { isNot: null }
            },
            select: {
                id: true,
                caseNumber: true,
                subject: true,
                closedAt: true,
                feedback: { select: { id: true, rating: true, comment: true, submittedAt: true } }
            },
            orderBy: { closedAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: resolvedCasesWithFeedback });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeedbackByStaffId = getFeedbackByStaffId;
