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
exports.reactivate = exports.deactivate = exports.update = exports.getSingle = exports.getAll = exports.create = void 0;
const OrgService = __importStar(require("./organization.service"));
const create = async (req, res) => {
    try {
        const organization = await OrgService.createOrganization(req.body);
        res.status(201).json({
            message: "Organization space provisioned successfully.",
            data: organization,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "An unexpected processing error occurred.",
        });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const organizations = await OrgService.getAllOrganizations();
        res.status(200).json({ data: organizations });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch organizations" });
    }
};
exports.getAll = getAll;
const getSingle = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await OrgService.getOrganizationById(id);
        res.status(200).json({ data: organization });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "An unexpected processing error occurred.",
        });
    }
};
exports.getSingle = getSingle;
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await OrgService.updateOrganization(id, req.body);
        res.status(200).json({
            message: "Organization configuration modifications saved successfully.",
            data: organization,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "An unexpected processing error occurred.",
        });
    }
};
exports.update = update;
const deactivate = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await OrgService.deactivateOrganization(id);
        res.status(200).json({
            message: "Organization status shifted to inactive.",
            data: organization,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "An unexpected processing error occurred.",
        });
    }
};
exports.deactivate = deactivate;
const reactivate = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await OrgService.reactivateOrganization(id);
        res.status(200).json({
            message: "Organization status shifted to active.",
            data: organization,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "An unexpected processing error occurred.",
        });
    }
};
exports.reactivate = reactivate;
