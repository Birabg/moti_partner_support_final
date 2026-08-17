import { Request, Response } from "express";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "../../utils/error";

import * as ProfileService from "./users.service";

export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const actor = (req as any).user;
    const actorId = actor.id || actor.userId;

    const accountData =
      await ProfileService.findAccountById(actorId);

    if (!accountData) {
      throw new NotFoundError(
        "User account profile not found."
      );
    }

    const { type } = accountData;

    const {
      firstName,
      middleName,
      lastName,
      password,
      phoneNumber,
      position,
    } = req.body;

    const allowedUpdates: Record<string, any> = {};

    if (firstName !== undefined)
      allowedUpdates.firstName = firstName;

    if (middleName !== undefined)
      allowedUpdates.middleName = middleName;

    if (lastName !== undefined)
      allowedUpdates.lastName = lastName;

    if (password !== undefined)
      allowedUpdates.password = password;

    if (type === "CUSTOMER") {
      if (phoneNumber !== undefined)
        allowedUpdates.phoneNumber = phoneNumber;

      if (position !== undefined)
        allowedUpdates.position = position;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw new BadRequestError(
        "No valid fields provided for update."
      );
    }

    const result =
      await ProfileService.updateSelfProfile(
        actorId,
        type,
        allowedUpdates
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

export const adminUpdateUserEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const actor = (req as any).user;

    if (!actor.isSAdmin) {
      throw new ForbiddenError(
        "Only System Admin can update emails."
      );
    }

    const adminId =
      actor.id || actor.userId;

    const { email, reason } = req.body;

    if (!email) {
      throw new BadRequestError(
        "Email is required."
      );
    }

    const result =
      await ProfileService.updateEmailByAdmin(
        req.params.id as string,
        email,
        adminId,
        reason
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

export const getAllApprovedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data =
      await ProfileService.getAllApprovedUsers();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user =
      await ProfileService.getUserById(
        req.params.id as string
      );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await ProfileService.updateUserByAdmin(
        req.params.id as string,
        req.body
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

export const getUserPermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await ProfileService.getUserPermissions(
        req.params.id as string
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
  console.error("UPDATE USER ERROR:");
  console.error(error);

  res
    .status(error.statusCode || 500)
    .json({
      message: error.message,
    });
}}