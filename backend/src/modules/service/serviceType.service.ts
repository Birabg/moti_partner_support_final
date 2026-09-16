import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../utils/error";

export const createServiceType = async (name: string) => {
  const existing = await prisma.serviceType.findUnique({ where: { name } });
  if (existing) {
    throw new BadRequestError(`A service type named '${name}' already exists.`);
  }

  return await prisma.serviceType.create({
    data: { name },
  });
};

export const updateServiceType = async (id: string, name: string) => {
  const serviceType = await prisma.serviceType.findUnique({ where: { id } });
  if (!serviceType) throw new NotFoundError("Target service type not found.");

  if (name !== serviceType.name) {
    const existing = await prisma.serviceType.findUnique({ where: { name } });
    if (existing)
      throw new BadRequestError(
        `Service type name '${name}' is already taken.`,
      );
  }

  return await prisma.serviceType.update({
    where: { id },
    data: { name },
  });
};

export const setServiceTypeActiveStatus = async (
  id: string,
  isActive: boolean,
) => {
  const serviceType = await prisma.serviceType.findUnique({ where: { id } });
  if (!serviceType) throw new NotFoundError("Target service type not found.");

  return await prisma.serviceType.update({
    where: { id },
    data: { isActive },
  });
};

export const getAllServiceTypes = async () => {
 return prisma.serviceType.findMany({
   orderBy: {
     createdAt: "desc",
   },
 });
};


export const getServiceTypeById = async (id: string) => {
  const serviceType = await prisma.serviceType.findUnique({
    where: { id },
    include: {
      _count: { select: { cases: true } },
    },
  });
  if (!serviceType) throw new NotFoundError("Service type record not found.");
  return serviceType;
};
