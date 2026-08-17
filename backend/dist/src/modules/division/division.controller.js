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
exports.getSingle = exports.getAll = exports.reactivate = exports.deactivate = exports.update = exports.create = void 0;
const error_1 = require("../../utils/error");
const database_1 = require("../../config/database");
const DivisionService = __importStar(require("./division.service"));
/**
 * Scoped check: Ensures System Admins or Department Managers can only manipulate
 * divisions belonging to their authorized scope.
 */
const verifyDivisionAccess = async (operatorId, targetDepartmentId) => {
    const staff = await database_1.prisma.staff.findUnique({
        where: { id: operatorId },
        include: { managedDepartment: true },
    });
    if (!staff) {
        throw new error_1.ForbiddenError("Access Denied: Staff record not found.");
    }
    if (staff.isSAdmin)
        return;
    const isAuthorizedDeptManager = staff.managedDepartment && staff.managedDepartment.id === targetDepartmentId;
    if (!isAuthorizedDeptManager) {
        throw new error_1.ForbiddenError("Access Denied: Only System Administrators or authorized Department Managers can manage divisions in this scope.");
    }
};
const create = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { name, departmentId } = req.body;
        if (!departmentId) {
            throw new error_1.BadRequestError("Parent departmentId is a required parameter.");
        }
        await verifyDivisionAccess(adminId, departmentId);
        const division = await DivisionService.createDivision({
            name,
            departmentId,
            adminId,
        });
        res.status(201).json({
            message: "Division context initialized successfully.",
            data: division,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.user.userId;
        const division = await database_1.prisma.division.findUnique({ where: { id } });
        if (!division)
            throw new error_1.NotFoundError("Target division missing.");
        await verifyDivisionAccess(adminId, division.departmentId);
        const updatedRecord = await DivisionService.updateDivision(id, {
            name: req.body.name,
            adminId,
        });
        res.status(200).json({
            message: "Division changes processed smoothly.",
            data: updatedRecord,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.update = update;
const deactivate = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.user.userId;
        const division = await database_1.prisma.division.findUnique({ where: { id } });
        if (!division)
            throw new error_1.NotFoundError("Target division missing.");
        await verifyDivisionAccess(adminId, division.departmentId);
        await DivisionService.setDivisionStatus(id, false, adminId);
        res.status(200).json({ message: "Division visibility flags set to inactive state." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.deactivate = deactivate;
const reactivate = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.user.userId;
        const division = await database_1.prisma.division.findUnique({ where: { id } });
        if (!division)
            throw new error_1.NotFoundError("Target division missing.");
        await verifyDivisionAccess(adminId, division.departmentId);
        await DivisionService.setDivisionStatus(id, true, adminId);
        res.status(200).json({ message: "Division workspace activation pipeline restored." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.reactivate = reactivate;
const getAll = async (req, res) => {
    try {
        const records = await DivisionService.getAllDivisions();
        res.status(200).json({ data: records });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to assemble division listings arrays." });
    }
};
exports.getAll = getAll;
const getSingle = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await DivisionService.getDivisionById(id);
        res.status(200).json({ data: record });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.getSingle = getSingle;
