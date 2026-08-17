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
exports.getAllPermissions = exports.getDefaultPermissionsForRole = exports.sync = exports.revoke = exports.grant = void 0;
const StaffPermissionService = __importStar(require("./staff.permission"));
const error_1 = require("../../utils/error");
const default_permission_1 = require("../../config/default.permission");
const database_1 = require("../../config/database");
const grant = async (req, res) => {
    try {
        const operatorId = req.user.userId;
        const { targetStaffId, permissionCodes } = req.body;
        if (!targetStaffId || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
            throw new error_1.BadRequestError("targetStaffId and an array of permissionCodes are required.");
        }
        const updatedUser = await StaffPermissionService.grantPermissions(operatorId, targetStaffId, permissionCodes);
        res.status(200).json({
            message: "Permissions granted successfully.",
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.grant = grant;
const revoke = async (req, res) => {
    try {
        const operatorId = req.user.userId;
        const { targetStaffId, permissionCodes } = req.body;
        if (!targetStaffId || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
            throw new error_1.BadRequestError("targetStaffId and an array of permissionCodes are required.");
        }
        const updatedUser = await StaffPermissionService.revokePermissions(operatorId, targetStaffId, permissionCodes);
        res.status(200).json({
            message: "Permissions revoked successfully.",
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.revoke = revoke;
const sync = async (req, res) => {
    try {
        const operatorId = req.user.userId;
        const { targetStaffId, permissionCodes } = req.body;
        if (!targetStaffId || !Array.isArray(permissionCodes)) {
            throw new error_1.BadRequestError("targetStaffId and an array of permissionCodes are required.");
        }
        const updatedUser = await StaffPermissionService.syncPermissions(operatorId, targetStaffId, permissionCodes);
        res.status(200).json({
            message: "Staff permissions synchronized successfully.",
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.sync = sync;
const getDefaultPermissionsForRole = async (req, res) => {
    try {
        const { role, managerType } = req.query;
        if (!role) {
            res.status(400).json({ message: "role query parameter is required." });
            return;
        }
        const defaultCodes = (0, default_permission_1.getDefaultPermissionCodes)(role, managerType);
        res.status(200).json({
            success: true,
            data: {
                role,
                managerType,
                defaultPermissions: defaultCodes,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDefaultPermissionsForRole = getDefaultPermissionsForRole;
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await database_1.prisma.permission.findMany({
            orderBy: { category: "asc" },
        });
        res.status(200).json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllPermissions = getAllPermissions;
