
import { prisma } from "../config/database";

export const getPrivilegedStaffEmails = async (): Promise<string[]> => {
  const staffWithPermission = await prisma.staff.findMany({
    where: {
      status: "ACTIVE", 
      OR: [
        { isSAdmin: true }, 
        {
          staffPermissions: {
            some: {
              permission: {
                code: "RECEIVE_NEW_CASE",
              },
            },
          },
        },
      ],
    },
    select: { email: true },
  });

  return staffWithPermission.map((s) => s.email);
};