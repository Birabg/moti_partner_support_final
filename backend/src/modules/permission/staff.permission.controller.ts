import { Request, Response } from "express";
import * as StaffPermissionService from "./staff.permission";
import { BadRequestError } from "../../utils/error";
import { getDefaultPermissionCodes } from "../../config/default.permission";
import { prisma } from "../../config/database";

export const grant = async (req: Request, res: Response): Promise<void> => {
  try {
    const operatorId = req.user!.userId;
    const { targetStaffId, permissionCodes } = req.body;

    if (!targetStaffId || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      throw new BadRequestError("targetStaffId and an array of permissionCodes are required.");
    }

    const updatedUser = await StaffPermissionService.grantPermissions(operatorId, targetStaffId, permissionCodes);

    res.status(200).json({
      message: "Permissions granted successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const revoke = async (req: Request, res: Response): Promise<void> => {
  try {
    const operatorId = req.user!.userId;
    const { targetStaffId, permissionCodes } = req.body;

    if (!targetStaffId || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      throw new BadRequestError("targetStaffId and an array of permissionCodes are required.");
    }

    const updatedUser = await StaffPermissionService.revokePermissions(operatorId, targetStaffId, permissionCodes);

    res.status(200).json({
      message: "Permissions revoked successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const sync = async (req: Request, res: Response): Promise<void> => {
  try {
    const operatorId = req.user!.userId;
    const { targetStaffId, permissionCodes } = req.body;

    if (!targetStaffId || !Array.isArray(permissionCodes)) {
      throw new BadRequestError("targetStaffId and an array of permissionCodes are required.");
    }

    const updatedUser = await StaffPermissionService.syncPermissions(operatorId, targetStaffId, permissionCodes);

    res.status(200).json({
      message: "Staff permissions synchronized successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};



export const getDefaultPermissionsForRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role, managerType } = req.query;

    if (!role) {
      res.status(400).json({ message: "role query parameter is required." });
      return;
    }

    const defaultCodes = getDefaultPermissionCodes(
      role as string,
      managerType as string
    );

    res.status(200).json({
      success: true,
      data: {
        role,
        managerType,
        defaultPermissions: defaultCodes,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { category: "asc" },
    });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};