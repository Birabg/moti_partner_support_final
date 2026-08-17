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
const DeptService = __importStar(require("./department.service"));
const create = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const department = await DeptService.createDepartment({
            name: req.body.name,
            adminId,
        });
        res.status(201).json({
            message: "Department structure initialized successfully.",
            data: department,
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
        const updatedRecord = await DeptService.updateDepartment(id, {
            name: req.body.name,
            adminId,
        });
        res.status(200).json({
            message: "Department configurations modified successfully.",
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
        await DeptService.setDepartmentStatus(id, false, adminId);
        res.status(200).json({
            message: "Department structural status shifted to inactive."
        });
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
        await DeptService.setDepartmentStatus(id, true, adminId);
        res.status(200).json({
            message: "Department operational access restored cleanly."
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.reactivate = reactivate;
const getAll = async (req, res) => {
    try {
        const records = await DeptService.getAllDepartments();
        res.status(200).json({ data: records });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to assemble structural database tracking tables.",
        });
    }
};
exports.getAll = getAll;
const getSingle = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await DeptService.getDepartmentById(id);
        res.status(200).json({ data: record });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.getSingle = getSingle;
