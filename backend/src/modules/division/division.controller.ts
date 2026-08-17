import { Request, Response } from "express";
import { ForbiddenError, BadRequestError, NotFoundError } from "../../utils/error";
import { prisma } from "../../config/database";
import * as DivisionService from "./division.service";

/**
 * Scoped check: Ensures System Admins or Department Managers can only manipulate
 * divisions belonging to their authorized scope.
 */
const verifyDivisionAccess = async (operatorId: string, targetDepartmentId: string): Promise<void> => {
  const staff = await prisma.staff.findUnique({
    where: { id: operatorId },
    include: { managedDepartment: true },
  });

  if (!staff) {
    throw new ForbiddenError("Access Denied: Staff record not found.");
  }

  if (staff.isSAdmin) return;

  const isAuthorizedDeptManager = staff.managedDepartment && staff.managedDepartment.id === targetDepartmentId;

  if (!isAuthorizedDeptManager) {
    throw new ForbiddenError(
      "Access Denied: Only System Administrators or authorized Department Managers can manage divisions in this scope."
    );
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { name, departmentId } = req.body;

    if (!departmentId) {
      throw new BadRequestError("Parent departmentId is a required parameter.");
    }

    await verifyDivisionAccess(adminId, departmentId);

    const division = await DivisionService.createDivision({
      name,
      departmentId,
      adminId,
    });

    res.status(201).json({
      message: "Division context initialized successfully.",
      data: division,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw new NotFoundError("Target division missing.");

    await verifyDivisionAccess(adminId, division.departmentId);

    const updatedRecord = await DivisionService.updateDivision(id, {
      name: req.body.name,
      adminId,
    });

    res.status(200).json({
      message: "Division changes processed smoothly.",
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

    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw new NotFoundError("Target division missing.");

    await verifyDivisionAccess(adminId, division.departmentId);

    await DivisionService.setDivisionStatus(id, false, adminId);
    res.status(200).json({ message: "Division visibility flags set to inactive state." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const reactivate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw new NotFoundError("Target division missing.");

    await verifyDivisionAccess(adminId, division.departmentId);

    await DivisionService.setDivisionStatus(id, true, adminId);
    res.status(200).json({ message: "Division workspace activation pipeline restored." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const records = await DivisionService.getAllDivisions();
    res.status(200).json({ data: records });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to assemble division listings arrays." });
  }
};

export const getSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const record = await DivisionService.getDivisionById(id);
    res.status(200).json({ data: record });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};