"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHierarchyScope = void 0;
const error_1 = require("../../utils/error");
const database_1 = require("../../config/database");
const validateHierarchyScope = async (operator, caseScope, targetAgentId) => {
    // 1. Super Admins and Directors bypass all checks
    if (operator.isSAdmin || operator.managerType === "DIRECTOR") {
        return;
    }
    // FIX: was `if (!operator.isManager || !operator.managerType)`. Removed
    // the isManager boolean from this check entirely — managerType is
    // already derived directly from a real managedDepartment/
    // managedDivision/managedSection relation in the controller (an actual
    // Division/Section/Department row with managerId pointing at this
    // staff member), which is the authoritative signal. The separate
    // isManager flag on Staff can drift out of sync with that if any role-
    // assignment code path updates one without the other — trusting
    // managerType alone removes that whole class of bug.
    if (!operator.managerType) {
        throw new error_1.ForbiddenError("You do not have permission to manage this case.");
    }
    // 3. IF THE CASE IS ALREADY ASSIGNED: Check if the existing case is in the operator's hierarchy
    const isCaseAssigned = Boolean(caseScope.sectionId || caseScope.divisionId || caseScope.departmentId);
    if (isCaseAssigned) {
        let isCaseInScope = false;
        if (operator.managerType === "DEPARTMENT") {
            isCaseInScope = Boolean(operator.departmentId && caseScope.departmentId === operator.departmentId);
        }
        else if (operator.managerType === "DIVISION") {
            isCaseInScope = Boolean(operator.divisionId && caseScope.divisionId === operator.divisionId);
        }
        else if (operator.managerType === "SECTION") {
            isCaseInScope = Boolean(operator.sectionId && caseScope.sectionId === operator.sectionId);
        }
        if (!isCaseInScope) {
            throw new error_1.ForbiddenError(`Access Denied: This case is currently assigned to staff outside your ${operator.managerType.toLowerCase()}.`);
        }
    }
    // 4. IF ASSIGNING TO A NEW AGENT: Check if the target agent is in the operator's hierarchy
    if (targetAgentId) {
        const targetAgent = await database_1.prisma.staff.findUnique({
            where: { id: targetAgentId },
            select: {
                id: true,
                sectionId: true,
                section: {
                    select: {
                        id: true,
                        divisionId: true,
                        division: {
                            select: {
                                id: true,
                                departmentId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!targetAgent) {
            throw new error_1.NotFoundError("Target support agent not found.");
        }
        let isAgentInScope = false;
        if (operator.managerType === "DEPARTMENT") {
            const agentDeptId = targetAgent.section?.division?.departmentId;
            isAgentInScope = Boolean(operator.departmentId && agentDeptId === operator.departmentId);
        }
        else if (operator.managerType === "DIVISION") {
            const agentDivId = targetAgent.section?.divisionId;
            isAgentInScope = Boolean(operator.divisionId && agentDivId === operator.divisionId);
        }
        else if (operator.managerType === "SECTION") {
            isAgentInScope = Boolean(operator.sectionId && targetAgent.sectionId === operator.sectionId);
        }
        if (!isAgentInScope) {
            throw new error_1.ForbiddenError(`Access Denied: You can only assign cases to staff within your own ${operator.managerType.toLowerCase()}.`);
        }
    }
};
exports.validateHierarchyScope = validateHierarchyScope;
