import { NextFunction, Request, Response } from "express";
import * as ApprovalService from "./approval.service";

type UserType = "STAFF" | "CUSTOMER"

export const getPendingList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pendingData = await ApprovalService.getPendingUsers();
    res.status(200).json({ data: pendingData });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res
      .status(statusCode)
      .json({ message: error.message || "Failed to retrieve pending users." });
  }
};


export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      userId, 
      staffId, 
      userType = "STAFF", 
      role, 
      managerType, 
      departmentId, 
      divisionId, 
      sectionId 
    } = req.body;

    const userContext = (req as any).user;
    const adminId = userContext?.id || userContext?.userId;
    const targetId = userId || staffId; 

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized: Administrator identification context missing from request token.",
      });
      return;
    }

    if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only system administrators are authorized to approve user accounts.",
      });
      return;
    }

    if (!targetId) {
      res.status(400).json({
        message: "userId (or staffId) is required.",
      });
      return;
    }

    if (userType === "STAFF" && !role) {
      res.status(400).json({
        message: "role is a required parameter when approving staff accounts.",
      });
      return;
    }

    const approvedUser = await ApprovalService.approveUserAccount({
      userId: targetId,
      userType: userType.toUpperCase() as "STAFF" | "CUSTOMER",
      role,
      managerType,
      departmentId,
      divisionId,
      sectionId,
      approvedById: adminId,
    });

    res.status(200).json({
      success: true,
      message: `${userType === "STAFF" ? "Staff" : "Customer"} account approved successfully.`,
      data: approvedUser,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) {
      next(error); 
    } else {
      res.status(statusCode).json({ message: error.message });
    }
  }
};
export const rejectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, userType } = req.body;
    const userContext = (req as any).user;
    const adminId = userContext?.id || userContext?.userId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized: Administrator identification missing from request context.",
      });
      return;
    }

    if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only system administrators are authorized to perform user rejections.",
      });
      return;
    }

    if (!userId || !userType) {
      res.status(400).json({ message: "Both userId and userType are required fields." });
      return;
    }

    const removedUser = await ApprovalService.rejectUserAccount(
      userId,
      userType.toUpperCase() as UserType,
      adminId
    );

    res.status(200).json({
      success: true,
      message: `${userType} application registration has been rejected.`,
      data: removedUser,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) next(error);
    else res.status(statusCode).json({ message: error.message });
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, userType } = req.body;
    const userContext = (req as any).user;
    const adminId = userContext?.id || userContext?.userId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized: Administrator identification missing from request context.",
      });
      return;
    }

    if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only system administrators are authorized to deactivate accounts.",
      });
      return;
    }

    if (!userId || !userType) {
      res.status(400).json({ message: "Both userId and userType are required fields." });
      return;
    }

    const updatedUser = await ApprovalService.deactivateUserAccount(
      userId,
      userType.toUpperCase() as UserType,
      adminId
    );

    res.status(200).json({
      success: true,
      message: `${userType} account access has been suspended successfully.`,
      data: updatedUser,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) next(error);
    else res.status(statusCode).json({ message: error.message });
  }
};

export const reactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, userType } = req.body;
    const userContext = (req as any).user;
    const adminId = userContext?.id || userContext?.userId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized: Administrator identification missing from request context.",
      });
      return;
    }

    if (userContext?.isSAdmin === false && userContext?.role !== "SYSTEM_ADMIN") {
      res.status(403).json({
        message: "Forbidden: Only system administrators are authorized to reactivate accounts.",
      });
      return;
    }

    if (!userId || !userType) {
      res.status(400).json({ message: "Both userId and userType are required fields." });
      return;
    }

    const restoredUser = await ApprovalService.reactivateUserAccount(
      userId,
      userType.toUpperCase() as UserType,
      adminId
    );

    res.status(200).json({
      success: true,
      message: `${userType} account status restored to active operational mode.`,
      data: restoredUser,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) next(error);
    else res.status(statusCode).json({ message: error.message });
  }
};