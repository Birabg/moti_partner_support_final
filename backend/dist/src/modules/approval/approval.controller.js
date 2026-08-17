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
exports.reactivateUser = exports.deactivateUser = exports.rejectUser = exports.approveUser = exports.getPendingList = void 0;
const ApprovalService = __importStar(require("./approval.service"));
const getPendingList = async (req, res) => {
    try {
        const pendingData = await ApprovalService.getPendingUsers();
        res.status(200).json({ data: pendingData });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res
            .status(statusCode)
            .json({ message: error.message || "Failed to retrieve pending users." });
    }
};
exports.getPendingList = getPendingList;
const approveUser = async (req, res, next) => {
    try {
        const { userId, staffId, userType = "STAFF", role, managerType, departmentId, divisionId, sectionId } = req.body;
        const userContext = req.user;
        const adminId = userContext?.id || userContext?.userId;
        const targetId = userId || staffId;
        if (!adminId) {
            res.status(401).json({
                message: "Unauthorized: Administrator identification context missing from request token.",
            });
            return;
        }
        if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
            res.status(403).json({
                message: "Forbidden: Only system administrators are authorized to approve user accounts.",
            });
            return;
        }
        if (!targetId) {
            res.status(400).json({
                message: "userId (or staffId) is required.",
            });
            return;
        }
        if (userType === "STAFF" && !role) {
            res.status(400).json({
                message: "role is a required parameter when approving staff accounts.",
            });
            return;
        }
        const approvedUser = await ApprovalService.approveUserAccount({
            userId: targetId,
            userType: userType.toUpperCase(),
            role,
            managerType,
            departmentId,
            divisionId,
            sectionId,
            approvedById: adminId,
        });
        res.status(200).json({
            success: true,
            message: `${userType === "STAFF" ? "Staff" : "Customer"} account approved successfully.`,
            data: approvedUser,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 500) {
            next(error);
        }
        else {
            res.status(statusCode).json({ message: error.message });
        }
    }
};
exports.approveUser = approveUser;
const rejectUser = async (req, res, next) => {
    try {
        const { userId, userType } = req.body;
        const userContext = req.user;
        const adminId = userContext?.id || userContext?.userId;
        if (!adminId) {
            res.status(401).json({
                message: "Unauthorized: Administrator identification missing from request context.",
            });
            return;
        }
        if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
            res.status(403).json({
                message: "Forbidden: Only system administrators are authorized to perform user rejections.",
            });
            return;
        }
        if (!userId || !userType) {
            res.status(400).json({ message: "Both userId and userType are required fields." });
            return;
        }
        const removedUser = await ApprovalService.rejectUserAccount(userId, userType.toUpperCase(), adminId);
        res.status(200).json({
            success: true,
            message: `${userType} application registration has been rejected.`,
            data: removedUser,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 500)
            next(error);
        else
            res.status(statusCode).json({ message: error.message });
    }
};
exports.rejectUser = rejectUser;
const deactivateUser = async (req, res, next) => {
    try {
        const { userId, userType } = req.body;
        const userContext = req.user;
        const adminId = userContext?.id || userContext?.userId;
        if (!adminId) {
            res.status(401).json({
                message: "Unauthorized: Administrator identification missing from request context.",
            });
            return;
        }
        if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
            res.status(403).json({
                message: "Forbidden: Only system administrators are authorized to deactivate accounts.",
            });
            return;
        }
        if (!userId || !userType) {
            res.status(400).json({ message: "Both userId and userType are required fields." });
            return;
        }
        const updatedUser = await ApprovalService.deactivateUserAccount(userId, userType.toUpperCase(), adminId);
        res.status(200).json({
            success: true,
            message: `${userType} account access has been suspended successfully.`,
            data: updatedUser,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 500)
            next(error);
        else
            res.status(statusCode).json({ message: error.message });
    }
};
exports.deactivateUser = deactivateUser;
const reactivateUser = async (req, res, next) => {
    try {
        const { userId, userType } = req.body;
        const userContext = req.user;
        const adminId = userContext?.id || userContext?.userId;
        if (!adminId) {
            res.status(401).json({
                message: "Unauthorized: Administrator identification missing from request context.",
            });
            return;
        }
        if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
            res.status(403).json({
                message: "Forbidden: Only system administrators are authorized to reactivate accounts.",
            });
            return;
        }
        if (!userId || !userType) {
            res.status(400).json({ message: "Both userId and userType are required fields." });
            return;
        }
        const restoredUser = await ApprovalService.reactivateUserAccount(userId, userType.toUpperCase(), adminId);
        res.status(200).json({
            success: true,
            message: `${userType} account status restored to active operational mode.`,
            data: restoredUser,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 500)
            next(error);
        else
            res.status(statusCode).json({ message: error.message });
    }
};
exports.reactivateUser = reactivateUser;
