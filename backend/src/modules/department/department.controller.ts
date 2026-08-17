// src/controllers/department.controller.ts
import { Request, Response } from "express";
import * as DeptService from "./department.service";

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;

    const department = await DeptService.createDepartment({
      name: req.body.name,
      adminId,
    });

    res.status(201).json({
      message: "Department structure initialized successfully.",
      data: department,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    const updatedRecord = await DeptService.updateDepartment(id, {
      name: req.body.name,
      adminId,
    });

    res.status(200).json({
      message: "Department configurations modified successfully.",
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

    await DeptService.setDepartmentStatus(id, false, adminId);

    res.status(200).json({ 
      message: "Department structural status shifted to inactive." 
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const reactivate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user!.userId;

    await DeptService.setDepartmentStatus(id, true, adminId);

    res.status(200).json({ 
      message: "Department operational access restored cleanly." 
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const records = await DeptService.getAllDepartments();
    res.status(200).json({ data: records });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to assemble structural database tracking tables.",
    });
  }
};

export const getSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const record = await DeptService.getDepartmentById(id);
    res.status(200).json({ data: record });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};