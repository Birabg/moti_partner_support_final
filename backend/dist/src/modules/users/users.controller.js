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
exports.getUserPermissions = exports.updateUserByAdmin = exports.getUserById = exports.getAllApprovedUsers = exports.adminUpdateUserEmail = exports.updateMyProfile = void 0;
const error_1 = require("../../utils/error");
const ProfileService = __importStar(require("./users.service"));
const updateMyProfile = async (req, res) => {
    try {
        const actor = req.user;
        const actorId = actor.id || actor.userId;
        const accountData = await ProfileService.findAccountById(actorId);
        if (!accountData) {
            throw new error_1.NotFoundError("User account profile not found.");
        }
        const { type } = accountData;
        const { firstName, middleName, lastName, password, phoneNumber, position, } = req.body;
        const allowedUpdates = {};
        if (firstName !== undefined)
            allowedUpdates.firstName = firstName;
        if (middleName !== undefined)
            allowedUpdates.middleName = middleName;
        if (lastName !== undefined)
            allowedUpdates.lastName = lastName;
        if (password !== undefined)
            allowedUpdates.password = password;
        if (type === "CUSTOMER") {
            if (phoneNumber !== undefined)
                allowedUpdates.phoneNumber = phoneNumber;
            if (position !== undefined)
                allowedUpdates.position = position;
        }
        if (Object.keys(allowedUpdates).length === 0) {
            throw new error_1.BadRequestError("No valid fields provided for update.");
        }
        const result = await ProfileService.updateSelfProfile(actorId, type, allowedUpdates);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.updateMyProfile = updateMyProfile;
const adminUpdateUserEmail = async (req, res) => {
    try {
        const actor = req.user;
        if (!actor.isSAdmin) {
            throw new error_1.ForbiddenError("Only System Admin can update emails.");
        }
        const adminId = actor.id || actor.userId;
        const { email, reason } = req.body;
        if (!email) {
            throw new error_1.BadRequestError("Email is required.");
        }
        const result = await ProfileService.updateEmailByAdmin(req.params.id, email, adminId, reason);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.adminUpdateUserEmail = adminUpdateUserEmail;
const getAllApprovedUsers = async (req, res) => {
    try {
        const data = await ProfileService.getAllApprovedUsers();
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.getAllApprovedUsers = getAllApprovedUsers;
const getUserById = async (req, res) => {
    try {
        const user = await ProfileService.getUserById(req.params.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.getUserById = getUserById;
const updateUserByAdmin = async (req, res) => {
    try {
        const result = await ProfileService.updateUserByAdmin(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.updateUserByAdmin = updateUserByAdmin;
const getUserPermissions = async (req, res) => {
    try {
        const result = await ProfileService.getUserPermissions(req.params.id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("UPDATE USER ERROR:");
        console.error(error);
        res
            .status(error.statusCode || 500)
            .json({
            message: error.message,
        });
    }
};
exports.getUserPermissions = getUserPermissions;
