import { prisma } from "../config/database";

export const STAFF_NUMBER_PREFIX = "ST-";
export const MEMBER_NUMBER_PREFIX = "ME-";
const NUMBER_PADDING = 6;

export const extractUserNumberSequence = (userNumber?: string | null): number => {
  if (!userNumber) return 0;

  const match = userNumber.match(/(\d+)$/);
  if (!match) return 0;

  return Number(match[1]);
};

export const formatUserNumber = (prefix: string, sequence: number): string =>
  `${prefix}${String(sequence).padStart(NUMBER_PADDING, "0")}`;

const generateNextUserNumberFor = async (
  tx: any,
  model: "staff" | "customer",
  prefix: string,
  numberField: "staffNumber" | "memberNumber"
): Promise<string> => {
  let sequence = 1;

  const latest = await tx[model].findFirst({
    where: {
      [numberField]: { startsWith: prefix },
    },
    orderBy: {
      [numberField]: "desc",
    },
    select: {
      [numberField]: true,
    },
  });

  if (latest?.[numberField]) {
    sequence = extractUserNumberSequence(latest[numberField]) + 1;
  }

  let candidate = formatUserNumber(prefix, sequence);
  while (
    await tx[model].findUnique({ where: { [numberField]: candidate } }).catch(() => null)
  ) {
    sequence += 1;
    candidate = formatUserNumber(prefix, sequence);
  }

  return candidate;
};

export const generateNextStaffNumber = (tx: any = prisma): Promise<string> =>
  generateNextUserNumberFor(tx, "staff", STAFF_NUMBER_PREFIX, "staffNumber");

export const generateNextMemberNumber = (tx: any = prisma): Promise<string> =>
  generateNextUserNumberFor(tx, "customer", MEMBER_NUMBER_PREFIX, "memberNumber");