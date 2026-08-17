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
exports.FetchServiceTypeById = exports.FetchAllServiceTypes = exports.ToggleServiceTypeActive = exports.UpdateServiceType = exports.CreateServiceType = void 0;
const ServiceTypeService = __importStar(require("./serviceType.service"));
const error_1 = require("../../utils/error");
const verifyAdminAccess = (req) => {
    const operator = req.user;
    if (!operator || !operator.isSAdmin) {
        throw new error_1.ForbiddenError("Access Denied: Only System Administrators can modify service types.");
    }
};
const CreateServiceType = async (req, res) => {
    try {
        verifyAdminAccess(req);
        const { name } = req.body;
        if (!name)
            throw new error_1.BadRequestError("Service type name parameter is mandatory.");
        const result = await ServiceTypeService.createServiceType(name);
        res
            .status(201)
            .json({ message: "Service type created successfully.", data: result });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.CreateServiceType = CreateServiceType;
const UpdateServiceType = async (req, res) => {
    try {
        verifyAdminAccess(req);
        const id = req.params.id;
        const { name } = req.body;
        if (!name)
            throw new error_1.BadRequestError("Updated name field cannot be empty.");
        const result = await ServiceTypeService.updateServiceType(id, name);
        res
            .status(200)
            .json({ message: "Service type updated successfully.", data: result });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.UpdateServiceType = UpdateServiceType;
const ToggleServiceTypeActive = async (req, res) => {
    try {
        verifyAdminAccess(req);
        const id = req.params.id;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean")
            throw new error_1.BadRequestError("isActive parameter must be a boolean value.");
        const result = await ServiceTypeService.setServiceTypeActiveStatus(id, isActive);
        res.status(200).json({
            message: isActive
                ? "Service type activated successfully."
                : "Service type deactivated successfully.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.ToggleServiceTypeActive = ToggleServiceTypeActive;
const FetchAllServiceTypes = async (req, res) => {
    try {
        const result = await ServiceTypeService.getAllServiceTypes();
        res.status(200).json({ data: result });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.FetchAllServiceTypes = FetchAllServiceTypes;
const FetchServiceTypeById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ServiceTypeService.getServiceTypeById(id);
        res.status(200).json({ data: result });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.FetchServiceTypeById = FetchServiceTypeById;
