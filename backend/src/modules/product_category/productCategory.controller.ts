import { Request, Response, NextFunction } from "express";
import * as CatalogService from "./productCategory.service";
import { BadRequestError } from "../../utils/error";

// Helper to reliably retrieve authenticated user ID from request
const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?.userId;
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { name, brandName } = req.body;
    if (!name) throw new BadRequestError("Category name parameter missing.");

    const result = await CatalogService.createCategory({
      name,
      brandName,
      createdById: userId,
    });

    res.status(201).json({
      message: "Product category created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;
    const { name, brandName } = req.body;

    const result = await CatalogService.updateCategory(id, {
      name,
      brandName,
      updatedById: userId,
    });

    res.status(200).json({
      message: "Product category updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new BadRequestError("isActive parameter must be a boolean flag.");
    }

    const result = await CatalogService.setCategoryActiveStatus(
      id,
      isActive,
      userId
    );

    res.status(200).json({
      message: isActive
        ? "Category activated successfully."
        : "Category deactivated.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CatalogService.getAllCategories();
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const fetchCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const result = await CatalogService.getCategoryById(id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const createSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { name, productCategoryId } = req.body;
    if (!name || !productCategoryId) {
      throw new BadRequestError("Missing required payload parameters.");
    }

    const result = await CatalogService.createSubcategory({
      name,
      productCategoryId,
      createdById: userId,
    });

    res.status(201).json({
      message: "Subcategory registered successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;
    const { name, productCategoryId } = req.body;

    const result = await CatalogService.updateSubcategory(id, {
      name,
      productCategoryId,
      updatedById: userId,
    });

    res.status(200).json({
      message: "Subcategory context updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSubcategoryActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new BadRequestError("isActive parameter must be a boolean flag.");
    }

    const result = await CatalogService.setSubcategoryActiveStatus(
      id,
      isActive,
      userId
    );

    res.status(200).json({
      message: `Subcategory active flag toggled to ${isActive}.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CatalogService.getAllSubcategories();
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const fetchSubcategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const result = await CatalogService.getSubcategoryById(id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};