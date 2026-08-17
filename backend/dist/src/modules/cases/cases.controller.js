"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getSupportStaff = exports.rejectedCase = exports.closeCaseWithFeedback = exports.resolveCase = exports.GivePriority = exports.ReassignCase = exports.AssignCase = exports.createAdminCase = exports.createCustomerCase = exports.assertCanAssignToStaff = exports.getCase = exports.getAllCases = void 0;
const CaseService = __importStar(require("./case.service"));
const CaseStatusService = __importStar(require("./caseStatus.service"));
const error_1 = require("../../utils/error");
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const getAllCases = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortBy = String(req.query.sortBy || "createdAt");
        const order = req.query.order === "asc"
            ? "asc"
            : "desc";
        const result = await CaseService.getAllCases(page, limit, sortBy, order);
        res.status(200).json({
            success: true,
            data: result.cases,
            pagination: result.pagination
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAllCases = getAllCases;
const getCase = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await CaseService.getCase(id);
        if (!data) {
            throw new error_1.NotFoundError("Case not found.");
        }
        res.status(200).json({
            message: "Case loaded successfully.",
            data
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};
exports.getCase = getCase;
const assertCanAssignToStaff = async (operator, assignedSupportId) => {
    if (operator.isSAdmin)
        return;
    const targetStaff = await database_1.prisma.staff.findUnique({
        where: { id: assignedSupportId },
        include: {
            section: { include: { division: true } },
            managedSection: { include: { division: true } },
            managedDivision: true,
            managedDepartment: true,
        },
    });
    if (!targetStaff)
        throw new error_1.BadRequestError("Target staff member not found.");
    if (targetStaff.isSAdmin) {
        throw new error_1.BadRequestError("A case cannot be assigned to a System Admin.");
    }
    let targetSectionId = null;
    let targetDivisionId = null;
    let targetDepartmentId = null;
    if (targetStaff.managedSection) {
        targetSectionId = targetStaff.managedSection.id;
        targetDivisionId = targetStaff.managedSection.divisionId;
        targetDepartmentId = targetStaff.managedSection.division.departmentId;
    }
    else if (targetStaff.managedDivision) {
        targetDivisionId = targetStaff.managedDivision.id;
        targetDepartmentId = targetStaff.managedDivision.departmentId;
    }
    else if (targetStaff.managedDepartment) {
        targetDepartmentId = targetStaff.managedDepartment.id;
    }
    else if (targetStaff.isPSsupport && targetStaff.section) {
        targetSectionId = targetStaff.section.id;
        targetDivisionId = targetStaff.section.divisionId;
        targetDepartmentId = targetStaff.section.division.departmentId;
    }
    else {
        throw new error_1.BadRequestError("This staff member has no organizational placement (no managed unit, no assigned section) and cannot receive cases.");
    }
    const operatorScope = operator.managedSection
        ? { level: "SECTION", id: operator.managedSection.id }
        : operator.managedDivision
            ? { level: "DIVISION", id: operator.managedDivision.id }
            : operator.managedDepartment
                ? { level: "DEPARTMENT", id: operator.managedDepartment.id }
                : null;
    if (!operatorScope) {
        throw new error_1.ForbiddenError("You do not manage any organizational unit and cannot assign cases.");
    }
    const inScope = (operatorScope.level === "SECTION" && operatorScope.id === targetSectionId) ||
        (operatorScope.level === "DIVISION" && operatorScope.id === targetDivisionId) ||
        (operatorScope.level === "DEPARTMENT" && operatorScope.id === targetDepartmentId);
    if (!inScope) {
        throw new error_1.ForbiddenError("Access Denied: this staff member is outside the organizational unit you manage.");
    }
};
exports.assertCanAssignToStaff = assertCanAssignToStaff;
const hasStructuralAuthorization = (operator, targetCase) => {
    if (operator.isSAdmin)
        return true;
    if (!targetCase.assignedSupport)
        return false;
    const assignedAgent = targetCase.assignedSupport;
    const sectionMatch = operator.sectionId &&
        assignedAgent.sectionId &&
        operator.sectionId === assignedAgent.sectionId;
    const divisionMatch = operator.divisionId &&
        assignedAgent.divisionId &&
        operator.divisionId === assignedAgent.divisionId;
    const departmentMatch = operator.departmentId &&
        assignedAgent.departmentId &&
        operator.departmentId === assignedAgent.departmentId;
    return !!(sectionMatch || divisionMatch || departmentMatch);
};
const hasStructuralAuthorization2 = (actor, targetCase) => {
    if (targetCase.assignedSupportId === actor.userId) {
        return true;
    }
    if (actor.role === "DEPARTMENT_MANAGER" && actor.departmentId) {
        return targetCase.departmentId === actor.departmentId;
    }
    if (actor.role === "DIVISION_MANAGER" && actor.divisionId) {
        return (targetCase.divisionId === actor.divisionId &&
            targetCase.departmentId === actor.departmentId);
    }
    if (actor.role === "SECTION_MANAGER" && actor.sectionId) {
        return (targetCase.sectionId === actor.sectionId &&
            targetCase.divisionId === actor.divisionId &&
            targetCase.departmentId === actor.departmentId);
    }
    return false;
};
const createCustomerCase = async (req, res) => {
    try {
        const actor = req.user;
        const customerId = actor?.id || actor?.userId;
        if (!customerId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const customerRecord = await database_1.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customerRecord) {
            throw new error_1.ForbiddenError("Access Denied: Only customers can access this route.");
        }
        const { branchName, productCategoryId, productSubcategoryId, subject, description, serviceTypeId, attachments, } = req.body;
        if (!branchName ||
            !productCategoryId ||
            !productSubcategoryId ||
            !subject ||
            !description ||
            !serviceTypeId) {
            throw new error_1.BadRequestError("Missing core parameters needed to initialize Case Report.");
        }
        const parsedAttachments = Array.isArray(req.files)
            ? req.files.map((file) => ({
                fileName: file.originalname,
                storagePath: file.path || file.filename,
                fileSizeBytes: file.size,
                mimeType: file.mimetype,
            }))
            : attachments || [];
        const result = await CaseService.createCase({
            branchName,
            customerId,
            productCategoryId,
            productSubcategoryId,
            subject,
            description,
            serviceTypeId,
            attachments: parsedAttachments,
        });
        res.status(201).json({
            message: "Case Report initialized successfully.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.createCustomerCase = createCustomerCase;
const createAdminCase = async (req, res) => {
    try {
        const actor = req.user;
        const staffId = actor?.id || actor?.userId;
        if (!staffId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const staffRecord = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
        });
        if (!staffRecord || (!staffRecord.isSAdmin && !staffRecord.isManager)) {
            throw new error_1.ForbiddenError("Access Denied: Only System Administrators or Managers can log a case on behalf of a customer.");
        }
        const { customerEmail, reason, branchName, productCategoryId, productSubcategoryId, subject, description, serviceTypeId, attachments, } = req.body;
        if (!customerEmail ||
            !reason ||
            !branchName ||
            !productCategoryId ||
            !productSubcategoryId ||
            !subject ||
            !description ||
            !serviceTypeId) {
            throw new error_1.BadRequestError("Missing required fields: customerEmail, reason, and all core case parameters are mandatory.");
        }
        if (typeof reason !== "string" || reason.trim().length < 5) {
            throw new error_1.BadRequestError("Validation Failure: Please provide a valid reason for creating this case (at least 5 characters).");
        }
        const targetCustomer = await database_1.prisma.customer.findUnique({
            where: { email: customerEmail.trim().toLowerCase() },
        });
        if (!targetCustomer) {
            throw new error_1.NotFoundError(`No customer account found with email: ${customerEmail}`);
        }
        const rawFiles = req.files;
        const parsedAttachments = Array.isArray(rawFiles)
            ? rawFiles.map((file) => ({
                fileName: file.originalname,
                storagePath: file.path || file.filename,
                fileSizeBytes: file.size,
                mimeType: file.mimetype,
            }))
            : attachments || [];
        const result = await CaseService.createCase({
            branchName,
            customerId: targetCustomer.id,
            productCategoryId,
            productSubcategoryId,
            subject,
            description,
            serviceTypeId,
            creationReason: reason.trim(),
            staffActorId: staffId,
            attachments: parsedAttachments,
        });
        res.status(201).json({
            message: "Case Report logged on behalf of customer.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.createAdminCase = createAdminCase;
const AssignCase = async (req, res) => {
    try {
        const actor = req.user;
        const caseId = req.params.id;
        const { assignedSupportId } = req.body;
        if (!assignedSupportId) {
            throw new error_1.BadRequestError("The assignedSupportId parameter is mandatory.");
        }
        if (!actor || (!actor.userId && !actor.id)) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const staffId = actor.userId || actor.id;
        const operator = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                managedDepartment: { select: { id: true } },
                managedDivision: { select: { id: true } },
                managedSection: { select: { id: true } },
            },
        });
        if (!operator) {
            throw new error_1.ForbiddenError("Access Denied: Only staff members can route cases.");
        }
        let managerType;
        if (operator.managedDepartment)
            managerType = "DEPARTMENT";
        else if (operator.managedDivision)
            managerType = "DIVISION";
        else if (operator.managedSection)
            managerType = "SECTION";
        const operatorPayload = {
            id: operator.id,
            isSAdmin: operator.isSAdmin,
            isManager: operator.isManager,
            managerType,
            departmentId: operator.managedDepartment?.id || operator.departmentId,
            divisionId: operator.managedDivision?.id || operator.divisionId,
            sectionId: operator.managedSection?.id || operator.sectionId,
        };
        const result = await CaseService.assignCaseSupport(caseId, assignedSupportId, operatorPayload);
        res.status(200).json({
            message: "Case successfully routed to the assigned staff member.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.AssignCase = AssignCase;
const ReassignCase = async (req, res) => {
    try {
        const actor = req.user;
        const caseId = req.params.id;
        const { assignedSupportId } = req.body;
        if (!assignedSupportId) {
            throw new error_1.BadRequestError("The assignedSupportId parameter is mandatory.");
        }
        if (!actor || (!actor.userId && !actor.id)) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const staffId = actor.userId || actor.id;
        const operator = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                managedDepartment: true,
                managedDivision: true,
                managedSection: true,
            },
        });
        if (!operator) {
            throw new error_1.ForbiddenError("Access Denied: Only staff members can route cases.");
        }
        let managerType;
        if (operator.managedDepartment)
            managerType = "DEPARTMENT";
        else if (operator.managedDivision)
            managerType = "DIVISION";
        else if (operator.managedSection)
            managerType = "SECTION";
        const operatorPayload = {
            id: operator.id,
            isSAdmin: operator.isSAdmin,
            isManager: operator.isManager,
            managerType,
            departmentId: operator.managedDepartment?.id || operator.departmentId,
            divisionId: operator.managedDivision?.id || operator.divisionId,
            sectionId: operator.managedSection?.id || operator.sectionId,
        };
        const result = await CaseService.reassignOpenCase(caseId, assignedSupportId, operatorPayload);
        res.status(200).json({
            message: "Case successfully routed to the assigned staff member.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.ReassignCase = ReassignCase;
const GivePriority = async (req, res) => {
    try {
        const actor = req.user;
        const caseId = req.params.id;
        const { priority } = req.body;
        if (!priority || !Object.values(client_1.CasePriority).includes(priority)) {
            throw new error_1.BadRequestError("A valid CasePriority enum flag must be passed.");
        }
        if (!actor || (!actor.userId && !actor.id)) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const staffId = actor.userId || actor.id;
        const operator = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                managedDepartment: { select: { id: true } },
                managedDivision: { select: { id: true } },
                managedSection: { select: { id: true } },
            },
        });
        if (!operator) {
            throw new error_1.ForbiddenError("Access Denied: Only staff members can modify case priority.");
        }
        let managerType;
        if (operator.managedDepartment)
            managerType = "DEPARTMENT";
        else if (operator.managedDivision)
            managerType = "DIVISION";
        else if (operator.managedSection)
            managerType = "SECTION";
        const operatorPayload = {
            id: operator.id,
            isSAdmin: operator.isSAdmin,
            isManager: operator.isManager,
            isSystemSupport: operator.isSystemSupport, // FIX: added — was never passed, blocking System Support entirely
            managerType,
            departmentId: operator.managedDepartment?.id,
            divisionId: operator.managedDivision?.id,
            sectionId: operator.managedSection?.id,
        };
        const updatedCase = await CaseService.givePriority(caseId, priority, operatorPayload);
        // FIX: removed the second processPriorityChangeNotifications call
        // entirely. The service already sends the correct notification
        // internally, with the real pre-update oldPriority. This duplicate
        // call used updatedCase.priority — which is the NEW value, since the
        // update had already happened — so it was sending "changed from X to
        // X" as a second, wrong notification on every single request.
        res.status(200).json({
            message: `Case priority successfully updated to ${priority}.`,
            data: updatedCase,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.GivePriority = GivePriority;
const resolveCase = async (req, res) => {
    try {
        const id = req.params.id;
        const caseId = id;
        const actor = req.user;
        const agentId = actor?.id || actor?.userId;
        if (!agentId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid staff token credentials.");
        }
        const { resolutionSummary } = req.body;
        if (!resolutionSummary) {
            throw new error_1.BadRequestError("A formal resolution summary payload is required to resolve this case.");
        }
        const result = await CaseService.resolveCase(caseId, resolutionSummary, agentId);
        res.status(200).json({
            message: "Case report marked as RESOLVED. Verification notice dispatched to customer.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.resolveCase = resolveCase;
const closeCaseWithFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        const caseId = id;
        const actor = req.user;
        const customerId = actor?.id || actor?.userId;
        if (!customerId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid customer token credentials.");
        }
        const { rating, comment } = req.body;
        if (rating === undefined || rating === null) {
            throw new error_1.BadRequestError("A customer satisfaction score rating parameter is required.");
        }
        const parsedRating = parseInt(rating, 10);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            throw new error_1.BadRequestError("Validation Failure: Rating metrics must be an integer between 1 and 5.");
        }
        const result = await CaseService.closeCaseWithFeedback(caseId, parsedRating, comment, customerId);
        res.status(200).json({
            message: "Feedback submitted successfully. Case file marked as CLOSED.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.closeCaseWithFeedback = closeCaseWithFeedback;
const rejectedCase = async (req, res) => {
    try {
        const id = req.params.id;
        const caseId = id;
        const actor = req.user;
        const customerId = actor?.id || actor?.userId;
        if (!customerId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid customer token credentials.");
        }
        const result = await CaseService.reopenCase(caseId, customerId);
        res.status(200).json({
            message: "Resolution rejected. Case file successfully returned to active status queue.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.rejectedCase = rejectedCase;
const getSupportStaff = async (req, res) => {
    try {
        const staff = await database_1.prisma.staff.findMany({
            where: {
                isPSsupport: true,
                status: "ACTIVE"
            },
            orderBy: {
                firstName: "asc"
            },
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true
            }
        });
        res.status(200).json({
            success: true,
            data: staff
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getSupportStaff = getSupportStaff;
const updateStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const actor = req.user;
        if (!actor || (!actor.userId && !actor.id)) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const newStatus = req.body.status;
        const reason = req.body.reason;
        const note = req.body.note;
        const resolutionSummary = req.body.resolutionSummary;
        if (!newStatus) {
            throw new error_1.BadRequestError("A target status is required.");
        }
        const actorId = actor.userId || actor.id;
        // Add role flags when available on the token
        const actorPayload = { id: actorId };
        if (actor.isSAdmin)
            actorPayload.isSAdmin = true;
        if (actor.isPSsupport)
            actorPayload.isPSsupport = true;
        if (actor.isManager)
            actorPayload.isManager = true;
        if (actor.isDirector)
            actorPayload.isDirector = true;
        const result = await CaseStatusService.updateStatus(id, newStatus, actorPayload, { reason, note, resolutionSummary });
        res.status(200).json({ message: `Case status updated to ${newStatus}.`, data: result });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.updateStatus = updateStatus;
