import { prisma } from "../../config/database";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/error";

interface CreateOrgInput {
  name: string;
  emailDomain: string;
}

interface UpdateOrgInput {
  name?: string;
  emailDomain?: string;
}

export const createOrganization = async (input: CreateOrgInput) => {
  if (!input.name || !input.emailDomain) {
    throw new BadRequestError(
      "Both organization name and official email domain are required.",
    );
  }

  const normalizedDomain = input.emailDomain.toLowerCase();

  const nameTaken = await prisma.organization.findUnique({
    where: { name: input.name },
  });
  if (nameTaken) {
    throw new ConflictError("An organization with this name already exists.");
  }

  const domainTaken = await prisma.emailDomain.findUnique({
    where: { domain: normalizedDomain },
  });
  if (domainTaken) {
    throw new ConflictError(
      "This email domain is already registered to another tenant.",
    );
  }

  return prisma.organization.create({
    data: {
      name: input.name,
      isActive: true,
      emailDomains: {
        create: {
          domain: normalizedDomain,
          isPrimary: true,
          isActive: true,
        },
      },
    },
    include: {
      emailDomains: true,
    },
  });
};

export const getAllOrganizations = async () => {
  return prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      emailDomains: true, 
      _count: {
        select: {
          customers: true,
        },
      },
    },
  });
};

export const getOrganizationById = async (id: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      emailDomains: true, 
      customers: {
        select: { id: true, firstName: true, email: true, status: true },
      },
    },
  });

  if (!organization) {
    throw new NotFoundError(
      "Requested organization workspace could not be located.",
    );
  }
  return organization;
};

export const updateOrganization = async (id: string, input: UpdateOrgInput) => {
  const existing = await prisma.organization.findUnique({ 
    where: { id },
    include: { emailDomains: true }
  });
  if (!existing) throw new NotFoundError("Organization not found");

  if (input.name && input.name !== existing.name) {
    const nameTaken = await prisma.organization.findUnique({
      where: { name: input.name },
    });
    if (nameTaken) {
      throw new ConflictError("An organization with this name already exists");
    }
  }

  let domainUpdateOperations = {};

  if (input.emailDomain) {
    const normalizedDomain = input.emailDomain.toLowerCase();
    
    const domainTaken = await prisma.emailDomain.findUnique({
      where: { domain: normalizedDomain },
    });

    if (domainTaken) {
      if (domainTaken.organizationId !== id) {
        throw new ConflictError(
          "This email domain is already allocated elsewhere.",
        );
      }
    } else {
      const primaryDomain = existing.emailDomains.find(d => d.isPrimary);

      if (primaryDomain) {
        domainUpdateOperations = {
          emailDomains: {
            update: {
              where: { id: primaryDomain.id },
              data: { domain: normalizedDomain },
            },
          },
        };
      } else {
        domainUpdateOperations = {
          emailDomains: {
            create: {
              domain: normalizedDomain,
              isPrimary: true,
              isActive: true,
            },
          },
        };
      }
    }
  }

  return prisma.organization.update({
    where: { id },
    data: {
      name: input.name,
      ...domainUpdateOperations,
    },
    include: {
      emailDomains: true,
    },
  });
};

export const deactivateOrganization = async (id: string) => {
  const existing = await prisma.organization.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Organization target missing.");

  await prisma.customer.updateMany({
    where: { organizationId: id },
    data: { status: "DEACTIVATED" },
  });

  return prisma.organization.update({
    where: { id },
    data: { isActive: false },
  });
};

export const reactivateOrganization = async (id: string) => {
  const existing = await prisma.organization.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Organization target missing.");

  await prisma.customer.updateMany({
    where: {
      organizationId: id,
      status: "DEACTIVATED",
    },
    data: { status: "ACTIVE" },
  });

  return prisma.organization.update({
    where: { id },
    data: { isActive: true },
  });
};