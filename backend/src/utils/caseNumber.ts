import { prisma } from "../config/database";

const CASE_NUMBER_PREFIX = "MOTI-10000-M0C";

export const extractCaseSequence = (caseNumber?: string | null) => {
  if (!caseNumber) return 0;

  const match = caseNumber.match(/^MOTI-10000-M0C(\d+)$/);
  if (!match) return 0;

  return Number(match[1]);
};

export const generateNextCaseNumber = async (tx: any = prisma) => {
  let nextSequence = 0;
  let candidate = `${CASE_NUMBER_PREFIX}${String(nextSequence).padStart(2, "0")}`;

  const latestCase = await tx.caseReport.findFirst({
    where: {
      caseNumber: {
        startsWith: CASE_NUMBER_PREFIX,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      caseNumber: true,
    },
  });

  if (latestCase?.caseNumber) {
    nextSequence = extractCaseSequence(latestCase.caseNumber) + 1;
  }

  candidate = `${CASE_NUMBER_PREFIX}${String(nextSequence).padStart(2, "0")}`;

  while (await tx.caseReport.findUnique({ where: { caseNumber: candidate } }).catch(() => null)) {
    nextSequence += 1;
    candidate = `${CASE_NUMBER_PREFIX}${String(nextSequence).padStart(2, "0")}`;
  }

  return candidate;
};
