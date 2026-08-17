
import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError, ConflictError } from "../../utils/error";

export interface CreateDeptInput {
  name: string;
  adminId: string;
}

export interface UpdateDeptInput {
  name: string;
  adminId: string;
}



export const createDepartment = async (input: CreateDeptInput) => {

  if (!input.name || !input.name.trim()) {
    throw new BadRequestError(
      "Department name is required."
    );
  }

  const existing = await prisma.department.findFirst({
    where: {
      name: {
        equals: input.name.trim(),
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new ConflictError(
      "Department name already exists."
    );
  }

  return prisma.department.create({
    data: {
      name: input.name.trim(),
      isActive: true,
      createdBy: {
        connect: {
          id: input.adminId,
        },
      },
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      },
    },
  });

};
export const updateDepartment = async (
  id: string,
  input: UpdateDeptInput
) => {

  const department =
    await prisma.department.findUnique({
      where: { id },
    });

  if (!department) {
    throw new NotFoundError(
      "Target department reference missing."
    );
  }

  const duplicate =
    await prisma.department.findFirst({
      where: {
        name: {
          equals: input.name.trim(),
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

  if (duplicate) {
    throw new ConflictError(
      "Department name already exists."
    );
  }

  return prisma.department.update({
    where: {
      id,
    },
    data: {
      name: input.name.trim(),
      updatedBy: {
        connect: {
          id: input.adminId,
        },
      },
    },
  });

};

export const setDepartmentStatus = async (
  id: string,
  setActive: boolean,
  adminId: string,
) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw new NotFoundError("Target department reference missing.");
  }

  return prisma.department.update({
    where: { id },
    data: {
      isActive: setActive,
      updatedBy: {
        connect: { id: adminId }
      }
    },
  });
};


export const getAllDepartments = async () => {
  return prisma.department.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { id: true, firstName: true, email: true } },
      _count: {
        select: { divisions: true },
      },
    },
  });
};

export const getDepartmentById = async (id: string) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, firstName: true,middleName: true, lastName: true, email: true } },
      createdBy: { select: { firstName: true, middleName: true, lastName: true } },
      updatedBy: { select: { firstName: true, middleName: true, lastName: true } },
      divisions: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });

  if (!department)
    throw new NotFoundError(
      "Target department reference could not be located.",
    );
  return department;
};


