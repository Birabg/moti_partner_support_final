import { Request, Response } from "express";
import * as OrgService from "./organization.service";

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const organization = await OrgService.createOrganization(req.body);
    res.status(201).json({
      message: "Organization space provisioned successfully.",
      data: organization,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || "An unexpected processing error occurred.",
    });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await OrgService.getAllOrganizations();
    res.status(200).json({ data: organizations });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};

export const getSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const organization = await OrgService.getOrganizationById(id);
    res.status(200).json({ data: organization });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || "An unexpected processing error occurred.",
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const organization = await OrgService.updateOrganization(id, req.body);
    res.status(200).json({
      message: "Organization configuration modifications saved successfully.",
      data: organization,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || "An unexpected processing error occurred.",
    });
  }
};

export const deactivate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const organization = await OrgService.deactivateOrganization(id);
    res.status(200).json({
      message: "Organization status shifted to inactive.",
      data: organization,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || "An unexpected processing error occurred.",
    });
  }
};

export const reactivate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const organization = await OrgService.reactivateOrganization(id);
    res.status(200).json({
      message: "Organization status shifted to active.",
      data: organization,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || "An unexpected processing error occurred.",
    });
  }
};

