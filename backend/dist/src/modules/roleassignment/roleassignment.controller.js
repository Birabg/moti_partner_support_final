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
exports.revokeRole = exports.assignRole = void 0;
const RoleService = __importStar(require("./roleassignment.service"));
const assignRole = async (req, res) => {
    try {
        const { staffId, role, managerType, departmentId, divisionId, sectionId } = req.body;
        const adminId = req.user?.userId;
        if (!staffId || !role) {
            res.status(400).json({
                message: "Both staffId and targeted role fields are required parameters.",
            });
            return;
        }
        const updatedStaff = await RoleService.updateStaffRole({
            staffId,
            role,
            managerType,
            departmentId,
            divisionId,
            sectionId,
            updatedById: adminId,
        });
        res.status(200).json({
            message: `Account privileges updated successfully to ${role}.`,
            data: updatedStaff,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
};
exports.assignRole = assignRole;
const revokeRole = async (req, res) => {
    try {
        const { staffId, roleToRemove, targetStructureId, defaultSectionId } = req.body;
        const adminId = req.user?.userId;
        if (!staffId || !roleToRemove) {
            res.status(400).json({
                message: "Both staffId and roleToRemove fields are required parameters.",
            });
            return;
        }
        const updatedStaff = await RoleService.removeStaffRolePermission({
            staffId,
            roleToRemove,
            targetStructureId,
            defaultSectionId,
            updatedById: adminId,
        });
        res.status(200).json({
            message: `Role assignment '${roleToRemove}' has been successfully stripped.`,
            data: updatedStaff,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
};
exports.revokeRole = revokeRole;
