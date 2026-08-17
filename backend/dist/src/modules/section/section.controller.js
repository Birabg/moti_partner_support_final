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
const SectionService = __importStar(require("./section.service"));
const verifySectionAccess = async (operatorId, divisionId) => {
    const staff = await database_1.prisma.staff.findUnique({
        where: { id: operatorId },
        include: {
            managedDepartment: true,
            managedDivision: true,
            managedSection: true,
        },
    });
    if (!staff) {
        throw new error_1.ForbiddenError("Access Denied: Operating user record not found.");
    }
    if (staff.isSAdmin)
        return;
    const divisionContext = await database_1.prisma.division.findUnique({
        where: { id: divisionId },
        select: { id: true, departmentId: true },
    });
    if (!divisionContext) {
        throw new error_1.NotFoundError("The specified parent division configuration does not exist.");
    }
    const managesDivision = staff.managedDivision && staff.managedDivision.id === divisionId;
    const managesDepartment = staff.managedDepartment && staff.managedDepartment.id === divisionContext.departmentId;
    if (managesDivision || managesDepartment)
        return;
    throw new error_1.ForbiddenError("Access Denied: You do not have hierarchical clearance (Section/Division/Dept Manager or System Admin) for this operation.");
};
const create = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { name, divisionId } = req.body;
        if (!divisionId) {
            throw new error_1.BadRequestError("Parent divisionId parameter is mandatory.");
        }
        await verifySectionAccess(adminId, divisionId);
        const section = await SectionService.createSection({
            name,
            divisionId,
            adminId,
        });
        res.status(201).json({
            message: "Operational section partition successfully created.",
            data: section,
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
        const section = await database_1.prisma.section.findUnique({ where: { id } });
        if (!section)
            throw new error_1.NotFoundError("Target section missing.");
        const staff = await database_1.prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
        const isDirectSectionManager = staff?.managedSection && staff.managedSection.id === id;
        if (!isDirectSectionManager) {
            await verifySectionAccess(adminId, section.divisionId);
        }
        const updatedRecord = await SectionService.updateSection(id, {
            name: req.body.name,
            adminId,
        });
        res.status(200).json({
            message: "Section data mapping profile updated.",
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
        const section = await database_1.prisma.section.findUnique({ where: { id } });
        if (!section)
            throw new error_1.NotFoundError("Target section missing.");
        const staff = await database_1.prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
        const isDirectSectionManager = staff?.managedSection && staff.managedSection.id === id;
        if (!isDirectSectionManager) {
            await verifySectionAccess(adminId, section.divisionId);
        }
        await SectionService.setSectionStatus(id, false, adminId);
        res.status(200).json({ message: "Section configuration safely set to inactive." });
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
        const section = await database_1.prisma.section.findUnique({ where: { id } });
        if (!section)
            throw new error_1.NotFoundError("Target section missing.");
        const staff = await database_1.prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
        const isDirectSectionManager = staff?.managedSection && staff.managedSection.id === id;
        if (!isDirectSectionManager) {
            await verifySectionAccess(adminId, section.divisionId);
        }
        await SectionService.setSectionStatus(id, true, adminId);
        res.status(200).json({
            message: "Section functional mapping reactivated for ticketing workflows.",
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.reactivate = reactivate;
const getAll = async (req, res) => {
    try {
        const records = await SectionService.getAllSections();
        res.status(200).json({ data: records });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to assemble systemic section matrices." });
    }
};
exports.getAll = getAll;
const getSingle = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await SectionService.getSectionById(id);
        res.status(200).json({ data: record });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.getSingle = getSingle;
