import { Request, Response } from "express";
import * as ServiceTypeService from "./serviceType.service";
import { ForbiddenError, BadRequestError } from "../../utils/error";

const verifyAdminAccess = (req: Request): void => {
  const operator = (req as any).user;
  if (!operator || !operator.isSAdmin) {
    throw new ForbiddenError(
      "Access Denied: Only System Administrators can modify service types.",
    );
  }
};

export const CreateServiceType = async (req: Request, res: Response) => {
  try {
    verifyAdminAccess(req);
    const { name } = req.body;
    if (!name)
      throw new BadRequestError("Service type name parameter is mandatory.");

    const result = await ServiceTypeService.createServiceType(name);
    res
      .status(201)
      .json({ message: "Service type created successfully.", data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const UpdateServiceType = async (req: Request, res: Response) => {
  try {
    verifyAdminAccess(req);
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name) throw new BadRequestError("Updated name field cannot be empty.");

    const result = await ServiceTypeService.updateServiceType(id, name);
    res
      .status(200)
      .json({ message: "Service type updated successfully.", data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const ToggleServiceTypeActive = async (req: Request, res: Response) => {
  try {
    verifyAdminAccess(req);
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean")
      throw new BadRequestError("isActive parameter must be a boolean value.");

    const result = await ServiceTypeService.setServiceTypeActiveStatus(
      id,
      isActive,
    );
    res.status(200).json({
      message: isActive
        ? "Service type activated successfully."
        : "Service type deactivated successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const FetchAllServiceTypes = async (req: Request, res: Response) => {
  try {
    const result = await ServiceTypeService.getAllServiceTypes();
    res.status(200).json({ data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const FetchServiceTypeById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await ServiceTypeService.getServiceTypeById(id);
    res.status(200).json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
