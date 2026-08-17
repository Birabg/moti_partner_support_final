import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../utils/error";

interface CreateCategoryInput {
  name: string;
  brandName?: string;
  createdById: string;
}

interface UpdateCategoryInput {
  name?: string;
  brandName?: string;
  updatedById: string;
}

interface CreateSubcategoryInput {
  name: string;
  productCategoryId: string;
  createdById: string;
}

interface UpdateSubcategoryInput {
  name?: string;
  productCategoryId?: string;
  updatedById: string;
}

export const createCategory = async (input: CreateCategoryInput) => {
  const { name, brandName, createdById } = input;

  const existing = await prisma.productCategory.findUnique({ where: { name } });
  if (existing) {
    throw new BadRequestError(`A category named '${name}' already exists.`);
  }

  return await prisma.productCategory.create({
    data: { name, brandName, createdById },
  });
};

export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput
) => {
  const { name, brandName, updatedById } = input;

  const category = await prisma.productCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Target product category not found.");

  if (name && name !== category.name) {
    const existing = await prisma.productCategory.findUnique({
      where: { name },
    });
    if (existing) {
      throw new BadRequestError(`Category name '${name}' is already taken.`);
    }
  }

  return await prisma.productCategory.update({
    where: { id },
    data: { name, brandName, updatedById },
  });
};

export const setCategoryActiveStatus = async (
  id: string,
  isActive: boolean,
  updatedById: string
) => {
  const category = await prisma.productCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Target product category not found.");

  return await prisma.$transaction(async (tx) => {
    if (!isActive) {
      await tx.productSubcategory.updateMany({
        where: { productCategoryId: id },
        data: { isActive: false, updatedById },
      });
    }

    return await tx.productCategory.update({
      where: { id },
      data: { isActive, updatedById },
    });
  });
};

export const getAllCategories = async () => {
  return await prisma.productCategory.findMany({
    include: {
      subcategories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getCategoryById = async (id: string) => {
  const category = await prisma.productCategory.findUnique({
    where: { id },
    include: {
      subcategories: true,
      createdBy: { select: { id: true, firstName: true } },
      updatedBy: { select: { id: true, firstName: true } },
    },
  });
  if (!category) throw new NotFoundError("Product category not found.");
  return category;
};

export const createSubcategory = async (input: CreateSubcategoryInput) => {
  const { name, productCategoryId, createdById } = input;

  const parent = await prisma.productCategory.findUnique({
    where: { id: productCategoryId, isActive: true },
  });
  if (!parent) {
    throw new NotFoundError("Parent category structure could not be verified.");
  }

  const existingSibling = await prisma.productSubcategory.findFirst({
    where: { name, productCategoryId },
  });
  if (existingSibling) {
    throw new BadRequestError(
      `A subcategory named '${name}' already exists inside this category.`
    );
  }

  return await prisma.productSubcategory.create({
    data: { name, productCategoryId, createdById },
  });
};

export const updateSubcategory = async (
  id: string,
  input: UpdateSubcategoryInput
) => {
  const { name, productCategoryId, updatedById } = input;

  const subcategory = await prisma.productSubcategory.findUnique({
    where: { id },
  });
  if (!subcategory) throw new NotFoundError("Target subcategory not found.");

  const targetCategoryId = productCategoryId || subcategory.productCategoryId;

  if (name) {
    const existingSibling = await prisma.productSubcategory.findFirst({
      where: { name, productCategoryId: targetCategoryId, NOT: { id } },
    });
    if (existingSibling) {
      throw new BadRequestError(
        `A subcategory named '${name}' already exists inside the target category.`
      );
    }
  }

  return await prisma.productSubcategory.update({
    where: { id },
    data: { name, productCategoryId, updatedById },
  });
};

export const setSubcategoryActiveStatus = async (
  id: string,
  isActive: boolean,
  updatedById: string
) => {
  const subcategory = await prisma.productSubcategory.findUnique({
    where: { id },
  });
  if (!subcategory) throw new NotFoundError("Target subcategory not found.");

  if (isActive) {
    const parent = await prisma.productCategory.findUnique({
      where: { id: subcategory.productCategoryId },
    });
    if (parent && !parent.isActive) {
      throw new BadRequestError(
        "Cannot activate subcategory while its parent category remains deactivated."
      );
    }
  }

  return await prisma.productSubcategory.update({
    where: { id },
    data: { isActive, updatedById },
  });
};

export const getAllSubcategories = async () => {
  return await prisma.productSubcategory.findMany({
    include: {
      productCategory: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSubcategoryById = async (id: string) => {
  const subcategory = await prisma.productSubcategory.findUnique({
    where: { id },
    include: {
      productCategory: true,
      createdBy: { select: { id: true, firstName: true } },
      updatedBy: { select: { id: true, firstName: true } },
    },
  });
  if (!subcategory) throw new NotFoundError("Subcategory record not found.");
  return subcategory;
};