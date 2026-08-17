import { prisma } from "../../config/database";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../utils/error";

export interface CreateDivisionInput {
  name: string;
  departmentId: string;
  adminId: string;
}

export interface UpdateDivisionInput {
  name?: string;
  adminId: string;
}

export const createDivision = async (
  input: CreateDivisionInput
) => {

  if (!input.name || !input.name.trim()) {
    throw new BadRequestError(
      "Division title cannot be empty."
    );
  }

  const department = await prisma.department.findUnique({
    where: {
      id: input.departmentId,
    },
  });

  if (!department) {
    throw new NotFoundError(
      "Parent department not found."
    );
  }

  if (!department.isActive) {
    throw new BadRequestError(
      "Cannot add divisions to an inactive department."
    );
  }

  // Check duplicate division name (case-insensitive)
  const duplicate = await prisma.division.findFirst({
    where: {
      name: {
        equals: input.name.trim(),
        mode: "insensitive",
      },
    },
  });

  if (duplicate) {
    throw new ConflictError(
      "Division name already exists."
    );
  }

  return prisma.division.create({
    data: {
      name: input.name.trim(),
      department: {
        connect: {
          id: input.departmentId,
        },
      },
      isActive: true,
      createdBy: input.adminId,
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

};
export const updateDivision = async (
  id: string,
  input: UpdateDivisionInput
) => {

  const division = await prisma.division.findUnique({
    where: {
      id,
    },
  });

  if (!division) {
    throw new NotFoundError(
      "Target division missing."
    );
  }

  if (input.name) {

    const duplicate = await prisma.division.findFirst({
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
        "This name is already occupied."
      );
    }

  }

  return prisma.division.update({
    where: {
      id,
    },
    data: {
      ...(input.name && {
        name: input.name.trim(),
      }),
      updatedBy: input.adminId,
    },
  });

};

export const setDivisionStatus = async (id: string, setActive: boolean, adminId: string) => {
  const division = await prisma.division.findUnique({ where: { id } });
  if (!division) throw new NotFoundError("Target division missing.");

  return prisma.division.update({
    where: { id },
    data: {
      isActive: setActive,
      updatedBy: adminId,
    },
  });
};

export const getAllDivisions = async () => {
  return prisma.division.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      department: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, email: true } },
      _count: {
        select: { sections: true },
      },
    },
  });
};

export const getDivisionById = async (id: string) => {
  const divisionRecord = await prisma.division.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, email: true } },
      sections: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });

  if (!divisionRecord) {
    throw new NotFoundError("Target division record not found.");
  }

  return {
    id: divisionRecord.id,
    name: divisionRecord.name,
    isActive: divisionRecord.isActive,
    departmentId: divisionRecord.department?.id || null,
    departmentName: divisionRecord.department?.name || "Unassigned / Independent Tiers",
    manager: divisionRecord.manager
      ? {
          id: divisionRecord.manager.id,
          firstName: divisionRecord.manager.firstName,
          email: divisionRecord.manager.email,
        }
      : null,
    sections: divisionRecord.sections || [],
  };
};