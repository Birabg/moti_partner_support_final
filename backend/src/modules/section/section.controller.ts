

import { Request, Response } from "express";
import { ForbiddenError, BadRequestError, NotFoundError } from "../../utils/error";
import { prisma } from "../../config/database";
import * as SectionService from "./section.service";


const verifySectionAccess = async (operatorId: string, divisionId: string): Promise<void> => {
  const staff = await prisma.staff.findUnique({
    where: { id: operatorId },
    include: {
      managedDepartment: true,
      managedDivision: true,
      managedSection: true,
    },
  });

  if (!staff) {
    throw new ForbiddenError("Access Denied: Operating user record not found.");
  }

  if (staff.isSAdmin) return;

  const divisionContext = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { id: true, departmentId: true },
  });

  if (!divisionContext) {
    throw new NotFoundError("The specified parent division configuration does not exist.");
  }

  const managesDivision = staff.managedDivision && staff.managedDivision.id === divisionId;

  const managesDepartment = staff.managedDepartment && staff.managedDepartment.id === divisionContext.departmentId;

  if (managesDivision || managesDepartment) return;

  throw new ForbiddenError(
    "Access Denied: You do not have hierarchical clearance (Section/Division/Dept Manager or System Admin) for this operation."
  );
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { name, divisionId } = req.body;

    if (!divisionId) {
      throw new BadRequestError("Parent divisionId parameter is mandatory.");
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundError("Target section missing.");

    const staff = await prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deactivate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundError("Target section missing.");

    const staff = await prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
    const isDirectSectionManager = staff?.managedSection && staff.managedSection.id === id;

    if (!isDirectSectionManager) {
      await verifySectionAccess(adminId, section.divisionId);
    }

    await SectionService.setSectionStatus(id, false, adminId);
    res.status(200).json({ message: "Section configuration safely set to inactive." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const reactivate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundError("Target section missing.");

    const staff = await prisma.staff.findUnique({ where: { id: adminId }, select: { managedSection: true } });
    const isDirectSectionManager = staff?.managedSection && staff.managedSection.id === id;

    if (!isDirectSectionManager) {
      await verifySectionAccess(adminId, section.divisionId);
    }

    await SectionService.setSectionStatus(id, true, adminId);
    res.status(200).json({
      message: "Section functional mapping reactivated for ticketing workflows.",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const records = await SectionService.getAllSections();
    res.status(200).json({ data: records });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to assemble systemic section matrices." });
  }
};

export const getSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const record = await SectionService.getSectionById(id);
    res.status(200).json({ data: record });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
