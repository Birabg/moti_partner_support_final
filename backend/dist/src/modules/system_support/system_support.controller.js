"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCasePriority = exports.AssignCase = exports.assertCanSetPriority = exports.assertCanAssignToStaff = void 0;
exports.hasStructuralAuthorization = hasStructuralAuthorization;
const error_1 = require("../../utils/error");
const database_1 = require("../../config/database");
const system_support_service_1 = require("./system_support.service");
function hasStructuralAuthorization(actor, targetCase) {
    const staff = actor.staffProfile || actor;
    if (!staff)
        return false;
    const caseSectionId = targetCase.productCategory?.sectionId;
    const caseDivisionId = targetCase.productCategory?.section?.divisionId;
    const caseDepartmentId = targetCase.productCategory?.section?.division?.departmentId;
    if (staff.managedSectionId && staff.managedSectionId === caseSectionId) {
        return true;
    }
    if (staff.managedDivisionId && staff.managedDivisionId === caseDivisionId) {
        return true;
    }
    if (staff.managedDepartmentId && staff.managedDepartmentId === caseDepartmentId) {
        return true;
    }
    return false;
}
const assertCanAssignToStaff = async (operator, targetCase, assignedSupportId) => {
    if (operator.isSAdmin)
        return;
    if (operator.role === "SYSTEM_SUPPORT") {
        if (targetCase.assignedSupportId !== null) {
            throw new error_1.ForbiddenError("System Support can only assign new, unassigned cases. This case is already assigned.");
        }
        return;
    }
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
    if (targetStaff.isSAdmin)
        throw new error_1.BadRequestError("A case cannot be assigned to a System Admin.");
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
        throw new error_1.BadRequestError("This staff member has no organizational placement and cannot receive cases.");
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
const assertCanSetPriority = async (operator, targetCase) => {
    if (operator.isSAdmin)
        return;
    if (operator.role === "SYSTEM_SUPPORT") {
        if (targetCase.assignedSupportId !== null) {
            throw new error_1.ForbiddenError("System Support can only set priority on unassigned cases.");
        }
        return;
    }
    if (!targetCase.assignedSupportId) {
        throw new error_1.ForbiddenError("Only an admin or system support can set priority on an unassigned case.");
    }
    await (0, exports.assertCanAssignToStaff)(operator, targetCase, targetCase.assignedSupportId);
};
exports.assertCanSetPriority = assertCanSetPriority;
const AssignCase = async (req, res) => {
    try {
        const actor = req.user;
        const caseId = req.params.id;
        const { assignedSupportId } = req.body;
        if (!assignedSupportId) {
            throw new error_1.BadRequestError("The assignedSupportId parameter is mandatory.");
        }
        if (!actor || !actor.userId) {
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        }
        const operator = await database_1.prisma.staff.findUnique({
            where: { id: actor.userId },
            include: {
                managedDepartment: { select: { id: true } },
                managedDivision: { select: { id: true } },
                managedSection: { select: { id: true } },
            },
        });
        if (!operator) {
            throw new error_1.ForbiddenError("Access Denied: Only staff members can route cases.");
        }
        const targetCase = await database_1.prisma.caseReport.findUnique({ where: { id: caseId } });
        if (!targetCase) {
            throw new error_1.NotFoundError("Case report record not found.");
        }
        await (0, exports.assertCanAssignToStaff)(operator, targetCase, assignedSupportId);
        const result = await (0, system_support_service_1.assignCaseSupport)(caseId, assignedSupportId, operator.id, operator.isSystemSupport && !operator.isSAdmin);
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
const UpdateCasePriority = async (req, res) => {
    try {
        const actor = req.user;
        const caseId = req.params.id;
        const { priority } = req.body;
        if (!priority)
            throw new error_1.BadRequestError("priority is required.");
        if (!actor?.userId)
            throw new error_1.ForbiddenError("Access Denied: Invalid token credentials.");
        const operator = await database_1.prisma.staff.findUnique({
            where: { id: actor.userId },
            include: {
                managedDepartment: { select: { id: true } },
                managedDivision: { select: { id: true } },
                managedSection: { select: { id: true } },
            },
        });
        if (!operator)
            throw new error_1.ForbiddenError("Access Denied: Only staff members can set priority.");
        const targetCase = await database_1.prisma.caseReport.findUnique({ where: { id: caseId } });
        if (!targetCase)
            throw new error_1.NotFoundError("Case report record not found.");
        await (0, exports.assertCanSetPriority)(operator, targetCase);
        const result = await (0, system_support_service_1.updateCasePriority)(caseId, priority, operator.id);
        res.status(200).json({ message: "Case priority updated.", data: result });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.UpdateCasePriority = UpdateCasePriority;
