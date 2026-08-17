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
exports.deleteField = exports.getBySubcategory = exports.toggleStatus = exports.updateField = exports.createField = void 0;
const Service = __importStar(require("./productField.service"));
const createField = async (req, res) => {
    try {
        const result = await Service.createField(req.body);
        res.status(201).json({
            message: "Custom field created successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.createField = createField;
const updateField = async (req, res) => {
    try {
        const result = await Service.updateField(req.params.id, req.body);
        res.json({
            message: "Custom field updated",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.updateField = updateField;
const toggleStatus = async (req, res) => {
    try {
        const result = await Service.changeStatus(req.params.id, req.body.isActive);
        res.json({
            message: "Status updated",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.toggleStatus = toggleStatus;
const getBySubcategory = async (req, res) => {
    try {
        const result = await Service.getFieldsBySubcategory(req.params.id);
        res.json({
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getBySubcategory = getBySubcategory;
const deleteField = async (req, res) => {
    try {
        await Service.deleteField(req.params.id);
        res.json({
            message: "Custom field deleted"
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.deleteField = deleteField;
