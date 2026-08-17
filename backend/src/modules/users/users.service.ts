import { prisma } from "../../config/database";
import bcrypt from "bcrypt";
import { NotFoundError } from "../../utils/error";

export const findAccountById = async (
  accountId: string
) => {
  const staff =
    await prisma.staff.findUnique({
      where: { id: accountId },
    });

  if (staff) {
    return {
      account: staff,
      type: "STAFF" as const,
    };
  }

  const customer =
    await prisma.customer.findUnique({
      where: { id: accountId },
    });

  if (customer) {
    return {
      account: customer,
      type: "CUSTOMER" as const,
    };
  }

  return null;
};

export const updateSelfProfile = async (
  accountId: string,
  accountType: "STAFF" | "CUSTOMER",
  updates: Record<string, any>
) => {
  if (updates.password) {
    updates.passwordHash =
      await bcrypt.hash(
        updates.password,
        10
      );

    delete updates.password;
  }

  if (accountType === "STAFF") {
    return prisma.staff.update({
      where: { id: accountId },
      data: {
        ...updates,
        updatedById: accountId,
      },
    });
  }

  return prisma.customer.update({
    where: { id: accountId },
    data: {
      ...updates,
      updatedById: accountId,
      updatedByType: "CUSTOMER",
    },
  });
};

export const updateEmailByAdmin =
  async (
    id: string,
    email: string,
    adminId: string,
    reason: string
  ) => {
    const found =
      await findAccountById(id);

    if (!found) {
      throw new NotFoundError(
        "User not found."
      );
    }

    if (found.type === "STAFF") {
      return prisma.staff.update({
        where: { id },
        data: {
          email,
          emailChangeReason: reason,
          updatedById: adminId,
        },
      });
    }

    return prisma.customer.update({
      where: { id },
      data: {
        email,
        emailChangeReason: reason,
        updatedById: adminId,
        updatedByType: "STAFF",
      },
    });
  };

export const getAllApprovedUsers =
  async () => {
    const staff =
      await prisma.staff.findMany({
        where: {
          status: {
            in: [
              "ACTIVE",
              "DEACTIVATED",
            ],
          },
        },
      });

    const customers =
      await prisma.customer.findMany({
        where: {
          status: {
            in: [
              "ACTIVE",
              "DEACTIVATED",
            ],
          },
        },
      });

    return [
      ...staff.map((s) => ({
        ...s,
        type: "STAFF",
      })),

      ...customers.map((c) => ({
        ...c,
        type: "CUSTOMER",
      })),
    ];
  };

export const getUserById =
  async (id: string) => {
    const staff =
      await prisma.staff.findUnique({
        where: { id },

        include: {
          section: {
            include: {
              division: {
                include: {
                  department: true,
                },
              },
            },
          },

          staffPermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

    if (staff) {
      return {
        ...staff,
        type: "STAFF",
      };
    }

    const customer =
      await prisma.customer.findUnique({
        where: { id },

        include: {
          organization: true,
        },
      });

    if (customer) {
      return {
        ...customer,
        type: "CUSTOMER",
      };
    }

    throw new NotFoundError(
      "User not found."
    );
  };

export const updateUserByAdmin = async (
  id: string,
  data: any
) => {
  const found = await findAccountById(id);

  if (!found) {
    throw new NotFoundError("User not found.");
  }

  delete data.email;

  if (found.type === "STAFF") {
    const updateData = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      
    };

    return prisma.staff.update({
      where: { id },
      data: updateData,
    });
  }

  const updateData = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    position: data.position,
    
  };

  return prisma.customer.update({
    where: { id },
    data: updateData,
  });
};
export const getUserPermissions =
  async (id: string) => {
    return prisma.staff.findUnique({
      where: { id },

      include: {
        staffPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  };