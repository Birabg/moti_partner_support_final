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
exports.getCustomField = exports.getAllCustomFields = exports.toggleStatus = exports.updateCustomField = exports.createCustomField = void 0;
const service = __importStar(require("./productCustomField.service"));
const createCustomField = async (req, res, next) => {
    try {
        const result = await service.createCustomField(req.body);
        res.status(201).json({
            message: "Custom field created successfully",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomField = createCustomField;
const updateCustomField = async (req, res, next) => {
    try {
        const result = await service.updateCustomField(req.params.id, req.body);
        res.json({
            message: "Custom field updated successfully",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomField = updateCustomField;
const toggleStatus = async (req, res, next) => {
    try {
        const result = await service.toggleCustomFieldStatus(req.params.id, req.body.isActive);
        res.json({
            message: "Custom field status updated",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleStatus = toggleStatus;
const getAllCustomFields = async (req, res, next) => {
    try {
        const result = await service.getAllCustomFields();
        res.json({
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCustomFields = getAllCustomFields;
const getCustomField = async (req, res, next) => {
    try {
        const result = await service.getCustomFieldById(req.params.id);
        res.json({
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomField = getCustomField;
