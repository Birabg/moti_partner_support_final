import { BadRequestError, NotFoundError } from "../../utils/error";
import { prisma } from "../../config/database";
import { syncStaffDefaultPermissions } from "./permission";
import { Prisma } from "../../../generated/prisma/client";

export type TargetRoleType = "SYSTEM_ADMIN" | "MANAGER" | "PS_SUPPORT" | "DIRECTOR";

interface RemoveRoleInput {
  staffId: string;
  roleToRemove: TargetRoleType;
  targetStructureId?: string;
  defaultSectionId?: string;
  updatedById?: string;
}

export interface AssignRoleInput {
  staffId: string;
  role: string;
  managerType?: string;
  departmentId?: string;
  divisionId?: string;
  sectionId?: string;
  permissionCodes?: string[];
  updatedById?: string;
  prismaClient?: Prisma.TransactionClient;
}

/* interface AssignRoleInput {
  staffId: string;
  role: TargetRoleType;
  managerType?: "DIVISION" | "DEPARTMENT" | "SECTION";
  departmentId?: string;
  divisionId?: string;
  sectionId?: string;
  updatedById?: string;
  prismaClient?: typeof prisma;
}
 */
export const AssignStaffRole = async (input: AssignRoleInput) => {
  const {
  staffId,
  departmentId,
  divisionId,
  sectionId,
  permissionCodes, // <--- EXTRACT THIS
  updatedById,
  prismaClient,
} = input;

  const db = prismaClient || prisma;

  const role = input.role?.trim().toUpperCase();
  const managerType = input.managerType?.trim().toUpperCase();

  const staff = await db.staff.findUnique({
    where: { id: staffId },
    include: { section: true },
  });
  if (!staff) throw new NotFoundError("Target staff record not found.");
  if (staff.status !== "PENDING_APPROVAL")
    throw new BadRequestError(" This Account is Not Verified");

  let updateStaffData: any = {};
  if (updatedById) updateStaffData.updatedBy = { connect: { id: updatedById } };

  if (role === "MANAGER") {
    if (!managerType) {
      throw new BadRequestError(
        "managerType is required when assigning a MANAGER role."
      );
    }

    const [managedDept, managedDiv, managedSec] = await Promise.all([
      db.department.findFirst({ where: { managerId: staffId } }),
      db.division.findFirst({ where: { managerId: staffId } }),
      db.section.findFirst({ where: { managerId: staffId } }),
    ]);

    if (managedDept || managedDiv || managedSec) {
      const activeRole = managedDept
        ? `Department (${managedDept.id})`
        : managedDiv
        ? `Division (${managedDiv.id})`
        : `Section (${managedSec!.id})`;

      throw new BadRequestError(
        `Hierarchy Violation: This staff member is already actively managing ${activeRole}.`
      );
    }

    updateStaffData.isManager = true;

    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      if (managerType === "DEPARTMENT") {
        if (!departmentId) throw new BadRequestError("Department ID is required.");
        const targetDepartment = await tx.department.findUnique({
          where: { id: departmentId },
        });
        if (!targetDepartment) throw new NotFoundError("Target Department not found.");

        await tx.department.update({
          where: { id: departmentId },
          data: { managerId: staffId, updatedById: updatedById || undefined },
        });
      } else if (managerType === "DIVISION") {
        if (!divisionId) throw new BadRequestError("Division ID is required.");
        const targetDivision = await tx.division.findUnique({
          where: { id: divisionId },
        });
        if (!targetDivision) throw new NotFoundError("Target Division not found.");

        await tx.division.update({
          where: { id: divisionId },
          data: { managerId: staffId },
        });
      } else if (managerType === "SECTION") {
        if (!sectionId) throw new BadRequestError("Section ID is required.");
        const targetSection = await tx.section.findUnique({
          where: { id: sectionId },
        });
        if (!targetSection) throw new NotFoundError("Target Section not found.");

        await tx.section.update({
          where: { id: sectionId },
          data: { managerId: staffId },
        });
      } else {
        throw new BadRequestError(
          `Invalid managerType "${input.managerType}". Must be exactly "DEPARTMENT", "DIVISION", or "SECTION".`
        );
      }

await syncStaffDefaultPermissions(
  tx,
  staffId,
  role,
  managerType,
  permissionCodes 
);
      return tx.staff.update({
        where: { id: staffId },
        data: { ...updateStaffData },
      });
    });
  } else if (role === "PS_SUPPORT") {
    if (!sectionId) {
      throw new BadRequestError(
        "Section ID is required to assign a PS Support member."
      );
    }

    const targetSection = await db.section.findUnique({
      where: { id: sectionId },
    });
    if (!targetSection) throw new NotFoundError("Target Section not found.");

    updateStaffData.isPSsupport = true;
    updateStaffData.section = { connect: { id: sectionId } };

    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      await syncStaffDefaultPermissions(tx, staffId, role);

      return tx.staff.update({
        where: { id: staffId },
        data: { ...updateStaffData },
      });
    });
  } else if (role === "SYSTEM_ADMIN" || role === "SADMIN") {
    updateStaffData.isSAdmin = true;

    return db.$transaction(async (tx: Prisma.TransactionClient) => {
await syncStaffDefaultPermissions(
  tx,
  staffId,
  role,
  managerType,
  permissionCodes
);
      return tx.staff.update({
        where: { id: staffId },
        data: { ...updateStaffData },
      });
    });
  } else if (role === "DIRECTOR") {
  updateStaffData.isDirector = true;

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
await syncStaffDefaultPermissions(
  tx,
  staffId,
  role,
  managerType,
  permissionCodes 
);
    return tx.staff.update({
      where: { id: staffId },
      data: { ...updateStaffData },
    });
  });
}else {
    throw new BadRequestError(
      `Invalid role "${input.role}". Must be exactly "MANAGER", "PS_SUPPORT", or "SYSTEM_ADMIN".`
    );
  }
};

export const updateStaffRole = async (input: AssignRoleInput) => {
  const { staffId, departmentId, divisionId, sectionId, updatedById } = input;

  const role = input.role?.trim().toUpperCase();
  const managerType = input.managerType?.trim().toUpperCase();

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { section: true },
  });
  if (!staff) throw new NotFoundError("Target staff record not found.");

  let isSystemAdmin = false;
  let operatorManagedDeptId: string | null = null;
  let operatorManagedDivId: string | null = null;
  let operatorManagedSecId: string | null = null;

  if (updatedById) {
    const operator = await prisma.staff.findUnique({
      where: { id: updatedById },
      include: {
        managedDepartment: true,
        managedDivision: true,
        managedSection: true,
      },
    });

    if (operator) {
      if (operator.isSAdmin) isSystemAdmin = true;
      if (operator.managedDepartment) operatorManagedDeptId = operator.managedDepartment.id;
      if (operator.managedDivision) operatorManagedDivId = operator.managedDivision.id;
      if (operator.managedSection) operatorManagedSecId = operator.managedSection.id;
    }
  }

  let updateStaffData: any = {};
  if (updatedById) updateStaffData.updatedBy = { connect: { id: updatedById } };

  if (role === "MANAGER") {
    if (!managerType) {
      throw new BadRequestError("managerType is required when assigning a MANAGER role.");
    }

    const [managedDept, managedDiv, managedSec] = await Promise.all([
      prisma.department.findFirst({ where: { managerId: staffId } }),
      prisma.division.findFirst({ where: { managerId: staffId } }),
      prisma.section.findFirst({ where: { managerId: staffId } }),
    ]);

    if (
      (managerType === "DEPARTMENT" && (managedDiv || (managedSec && managedSec.id !== sectionId))) ||
      (managerType === "DIVISION" && (managedDept || (managedSec && managedSec.id !== sectionId))) ||
      (managerType === "SECTION" && (managedDept || managedDiv))
    ) {
      throw new BadRequestError(
        "Hierarchy Violation: Staff member manages a unit at a different structural level. Revoke the existing manager assignment first."
      );
    }

    updateStaffData.isManager = true;

    if (managerType === "DEPARTMENT") {
      if (!departmentId) throw new BadRequestError("Department ID is required.");

      const targetDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!targetDepartment) throw new NotFoundError("Target Department not found.");

      if (updatedById && !isSystemAdmin) {
        const isSameLevelDeptManager = operatorManagedDeptId === departmentId;

        if (!isSameLevelDeptManager) {
          throw new BadRequestError(
            "Unauthorized: Only a System Admin or an existing Department Manager of this department can assign this role."
          );
        }
      }

      return prisma.$transaction(async (tx) => {
        if (managedDept && managedDept.id !== departmentId) {
          await tx.department.update({
            where: { id: managedDept.id },
            data: { managerId: null },
          });
        }

        await tx.department.update({
          where: { id: departmentId },
          data: {
            managerId: staffId,
            updatedById: updatedById || undefined,
          },
        });

        await syncStaffDefaultPermissions(tx, staffId, role, managerType);

        return tx.staff.update({
          where: { id: staffId },
          data: updateStaffData,
        });
      });

    } else if (managerType === "DIVISION") {
      if (!divisionId) throw new BadRequestError("Division ID is required.");

      const targetDivision = await prisma.division.findUnique({
        where: { id: divisionId },
      });
      if (!targetDivision) throw new NotFoundError("Target Division not found.");

      if (updatedById && !isSystemAdmin) {
        const isParentDeptManager = operatorManagedDeptId === targetDivision.departmentId;
        const isSameLevelDivManager = operatorManagedDivId === divisionId;

        if (!isParentDeptManager && !isSameLevelDivManager) {
          throw new BadRequestError(
            "Unauthorized: Only a System Admin, the parent Department Manager, or an existing Division Manager can assign this role."
          );
        }
      }

      return prisma.$transaction(async (tx) => {
        if (managedDiv && managedDiv.id !== divisionId) {
          await tx.division.update({
            where: { id: managedDiv.id },
            data: { managerId: null },
          });
        }

        await tx.division.update({
          where: { id: divisionId },
          data: {
            managerId: staffId,
            updatedBy: updatedById || undefined,
          },
        });

        await syncStaffDefaultPermissions(tx, staffId, role, managerType);

        return tx.staff.update({
          where: { id: staffId },
          data: updateStaffData,
        });
      });

    } else if (managerType === "SECTION") {
      if (!sectionId) throw new BadRequestError("Section ID is required.");

      const targetSection = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { division: true },
      });
      if (!targetSection) throw new NotFoundError("Target Section not found.");

      if (updatedById && !isSystemAdmin) {
        const isGrandparentDeptManager =
          operatorManagedDeptId === targetSection.division.departmentId;
        const isParentDivManager = operatorManagedDivId === targetSection.divisionId;
        const isSameLevelSecManager = operatorManagedSecId === sectionId;

        if (!isGrandparentDeptManager && !isParentDivManager && !isSameLevelSecManager) {
          throw new BadRequestError(
            "Unauthorized: Requires a System Admin, parent Department Manager, parent Division Manager, or an existing Section Manager."
          );
        }
      }

      updateStaffData.section = { connect: { id: sectionId } };

      return prisma.$transaction(async (tx) => {
        if (managedSec && managedSec.id !== sectionId) {
          await tx.section.update({
            where: { id: managedSec.id },
            data: { managerId: null },
          });
        }

        await tx.section.update({
          where: { id: sectionId },
          data: {
            managerId: staffId,
            updatedBy: updatedById || undefined,
          },
        });

        await syncStaffDefaultPermissions(tx, staffId, role, managerType);

        return tx.staff.update({
          where: { id: staffId },
          data: updateStaffData,
        });
      });
    }
  } else if (role === "PS_SUPPORT") {
    if (!sectionId) {
      throw new BadRequestError("Section ID is required to assign a PS Support member.");
    }

    const targetSection = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { division: { include: { department: true } } },
    });
    if (!targetSection) throw new NotFoundError("Target Section not found.");

    if (updatedById && !isSystemAdmin) {
      const isDirectSectionManager = operatorManagedSecId === targetSection.id;
      const isParentDivisionManager = operatorManagedDivId === targetSection.divisionId;
      const isGrandparentDeptManager =
        operatorManagedDeptId === targetSection.division.department.id;

      if (!isDirectSectionManager && !isParentDivisionManager && !isGrandparentDeptManager) {
        throw new BadRequestError(
          "Unauthorized: Only a System Admin, Department Manager, Division Manager, or Section Manager can add support staff to this Section."
        );
      }
    }

    updateStaffData.isPSsupport = true;
    updateStaffData.section = { connect: { id: sectionId } };

    return prisma.$transaction(async (tx) => {
      await syncStaffDefaultPermissions(tx, staffId, role);

      return tx.staff.update({
        where: { id: staffId },
        data: updateStaffData,
      });
    });
  } else if (role === "SYSTEM_ADMIN" || role === "SADMIN") {
    if (updatedById && !isSystemAdmin) {
      throw new BadRequestError(
        "Unauthorized: Only an existing System Admin can assign or promote a user to System Admin."
      );
    }

    updateStaffData.isSAdmin = true;

    return prisma.$transaction(async (tx) => {
      await syncStaffDefaultPermissions(tx, staffId, role);

      return tx.staff.update({
        where: { id: staffId },
        data: updateStaffData,
      });
    });
  }  else if (role === "SYSTEM_ADMIN" || role === "SADMIN") {
  // ...existing unchanged...
} else if (role === "DIRECTOR") {
  if (updatedById && !isSystemAdmin) {
    throw new BadRequestError(
      "Unauthorized: Only an existing System Admin can assign or promote a user to Director."
    );
  }

  updateStaffData.isDirector = true;

  return prisma.$transaction(async (tx) => {
    await syncStaffDefaultPermissions(tx, staffId, role);

    return tx.staff.update({
      where: { id: staffId },
      data: updateStaffData,
    });
  });
} else {
    throw new BadRequestError(
      `Invalid role "${input.role}". Must be exactly "MANAGER", "PS_SUPPORT", or "SYSTEM_ADMIN".`
    );
  }
};


export const removeStaffRolePermission = async (input: RemoveRoleInput) => {
  const {
    staffId,
    roleToRemove,
    targetStructureId,
    updatedById,
  } = input;

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { section: true },
  });
  if (!staff) throw new NotFoundError("Target staff member record could not be found.");

  let isSystemAdmin = false;
  let operatorManagedDeptId: string | null = null;
  let operatorManagedDivId: string | null = null;
  let operatorManagedSecId: string | null = null;

  if (updatedById) {
    const operator = await prisma.staff.findUnique({
      where: { id: updatedById },
      include: {
        managedDepartment: true,
        managedDivision: true,
        managedSection: true,
      }
    });

    if (operator) {
      if (operator.isSAdmin) isSystemAdmin = true;
      if (operator.managedDepartment) operatorManagedDeptId = operator.managedDepartment.id;
      if (operator.managedDivision) operatorManagedDivId = operator.managedDivision.id;
      if (operator.managedSection) operatorManagedSecId = operator.managedSection.id;
    }
  }

  let willBeManager = staff.isManager;
  let willBeAdmin = staff.isSAdmin;
  let willBeSupport = staff.isPSsupport;
  let willBeDirector = staff.isDirector;

  let updateStaffData: any = {};
  if (updatedById) updateStaffData.updatedBy = { connect: { id: updatedById } };

  switch (roleToRemove) {
    case "SYSTEM_ADMIN":
      if (updatedById && !isSystemAdmin) {
        throw new BadRequestError("Unauthorized: Only a System Admin can remove a SYSTEM_ADMIN role.");
      }
      updateStaffData.isSAdmin = false;
      willBeAdmin = false;
      break;
 case "DIRECTOR": 
    if (updatedById && !isSystemAdmin) {
      throw new BadRequestError("Unauthorized: Only a System Admin can remove a DIRECTOR role.");
    }
    updateStaffData.isDirector = false;
    willBeDirector = false;
    break;

    case "PS_SUPPORT":
      if (!staff.isPSsupport) throw new BadRequestError("Target user is not currently assigned a PS_SUPPORT role.");
      if (!staff.sectionId) throw new BadRequestError("Target user has no section assigned.");

      if (updatedById && !isSystemAdmin) {
        const targetSection = await prisma.section.findUnique({
          where: { id: staff.sectionId },
          include: { division: true }
        });

        const isDirectSecManager = operatorManagedSecId === staff.sectionId;
        const isParentDivManager = operatorManagedDivId === targetSection?.divisionId;
        const isGrandparentDeptManager = operatorManagedDeptId === targetSection?.division.departmentId;

        if (!isDirectSecManager && !isParentDivManager && !isGrandparentDeptManager) {
          throw new BadRequestError("Unauthorized: You do not have permission to remove this user's PS_SUPPORT role.");
        }
      }

      updateStaffData.isPSsupport = false;
      updateStaffData.section = { disconnect: true };
      willBeSupport = false;
      break;

    case "MANAGER":
      if (!targetStructureId) {
        throw new BadRequestError("You must supply a targetStructureId to remove a specific management assignment.");
      }

      const [managedDept, managedDiv, managedSec] = await Promise.all([
        prisma.department.findFirst({ where: { id: targetStructureId, managerId: staffId } }),
        prisma.division.findFirst({ where: { id: targetStructureId, managerId: staffId } }),
        prisma.section.findFirst({ where: { id: targetStructureId, managerId: staffId } }),
      ]);

      if (!managedDept && !managedDiv && !managedSec) {
        throw new BadRequestError("Target staff member does not manage the specified structural unit.");
      }

      if (managedDept) {
        if (updatedById && !isSystemAdmin) {
          throw new BadRequestError("Unauthorized: Only a System Admin can remove a Department Manager.");
        }
        await prisma.department.update({
          where: { id: targetStructureId },
          data: { managerId: null, updatedById }
        });
      } 
      
      else if (managedDiv) {
        if (updatedById && !isSystemAdmin && operatorManagedDeptId !== managedDiv.departmentId) {
          throw new BadRequestError("Unauthorized: Only a System Admin or the parent Department Manager can remove this Division Manager.");
        }
        await prisma.division.update({
          where: { id: targetStructureId },
          data: { managerId: null, updatedBy: updatedById || undefined }
        });
      } 
      
      else if (managedSec) {
        const sectDetails = await prisma.section.findUnique({ where: { id: targetStructureId }, include: { division: true } });
        if (updatedById && !isSystemAdmin) {
          const isGrandparentDept = operatorManagedDeptId === sectDetails?.division.departmentId;
          const isParentDiv = operatorManagedDivId === sectDetails?.divisionId;

          if (!isGrandparentDept && !isParentDiv) {
            throw new BadRequestError("Unauthorized: Only a System Admin, parent Department Manager, or parent Division Manager can revoke this Section Manager.");
          }
        }
        await prisma.section.update({
          where: { id: targetStructureId },
          data: { managerId: null, updatedBy: updatedById || undefined }
        });
      }

      updateStaffData.isManager = false;
      willBeManager = false;
      break;
  }

  if (!willBeAdmin && !willBeManager && !willBeSupport) {
    throw new BadRequestError(
      "Operation failed: Staff member roles cannot be empty. A staff user must possess at least one active assignment."
    );
  }

  return prisma.staff.update({ 
    where: { id: staffId }, 
    data: updateStaffData 
  });
};