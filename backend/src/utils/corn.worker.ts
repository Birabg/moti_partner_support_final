import cron from "node-cron";
import { prisma } from "../config/database";
import { CaseStatus } from "../../generated/prisma/client";
import { triggerAutoCloseEmail } from "../utils/email";

const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";

/* 
export const startCaseTimeoutWorker = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron Worker] Starting automated 3-day case expiration sweep...");

    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const expiredCases = await prisma.caseReport.findMany({
        where: {
          status: CaseStatus.CUSTOMER_CONFIRMATION,
          resolvedAt: {
            lte: threeDaysAgo,
          },
        },
        include: {
          customer: true,
        },
      });

      if (expiredCases.length === 0) {
        console.log("[Cron Worker] Sweep completed. No expired cases found.");
        return;
      }

      console.log(`[Cron Worker] Found ${expiredCases.length} expired case profiles. Processing closures...`);

      for (const targetCase of expiredCases) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.caseReport.update({
              where: { id: targetCase.id },
              data: { status: CaseStatus.CLOSED },
            });

            await tx.caseStatusHistory.create({
              data: {
                caseReportId: targetCase.id,
                changedById: SYSTEM_BOT_ID,
                actorType: "SYSTEM",
                actorId: null,
                fromStatus: CaseStatus.CUSTOMER_CONFIRMATION,
                toStatus: CaseStatus.CLOSED,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
              },
            });
          });

          await triggerAutoCloseEmail(targetCase);
          console.log(`[Cron Worker] Successfully auto-closed Case ID: ${targetCase.id}`);
          
        } catch (individualError) {
          console.error(`[Cron Worker] Failed to close specific case ${targetCase.id}:`, individualError);
        }
      }

    } catch (error) {
      console.error("[Cron Worker] Critical error running case expiration task routine loop:", error);
    }
  });
  
  console.log("[Cron Worker] Case Resolution Expiration tracking worker initialized.");
}; */

export const startCaseTimeoutWorker = () => {

  // Production: run daily. For testing you can change schedule to a short interval.
  cron.schedule("0 */1 * * *", async () => {
    console.log("[Cron Worker] Starting automated 1-hour resolution-expiration sweep...");

    try {
      // 2 days ago
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const expiredCases = await prisma.caseReport.findMany({
        where: {
          status: CaseStatus.CUSTOMER_CONFIRMATION,
          resolvedAt: {
            lte: twoDaysAgo,
          },
        },
        include: {
          customer: true,
        },
      });

      if (expiredCases.length === 0) {
        console.log("[Cron Worker] Sweep completed. No expired cases found.");
        return;
      }

      console.log(`[Cron Worker] Found ${expiredCases.length} expired case profiles. Reopening to IN_PROGRESS...`);

      for (const targetCase of expiredCases) {
        try {
          const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
          await prisma.$transaction(async (tx) => {
            await tx.caseReport.update({
              where: { id: targetCase.id },
              data: {
                status: CaseStatus.IN_PROGRESS,
                updatedById: SYSTEM_BOT_ID,
              },
            });

            await tx.caseStatusHistory.create({
              data: {
                caseReportId: targetCase.id,
                changedById: SYSTEM_BOT_ID,
                actorType: "SYSTEM",
                actorId: null,
                fromStatus: CaseStatus.CUSTOMER_CONFIRMATION,
                toStatus: CaseStatus.IN_PROGRESS,
                oldPriority: targetCase.priority,
                newPriority: targetCase.priority,
                oldAgentId: targetCase.assignedSupportId,
                newAgentId: targetCase.assignedSupportId,
              },
            });
          });

          console.log(`[Cron Worker] Successfully reopened Case ID: ${targetCase.id} to IN_PROGRESS`);

        } catch (individualError) {
          console.error(`[Cron Worker] Failed to reopen specific case ${targetCase.id}:`, individualError);
        }
      }

    } catch (error) {
      console.error("[Cron Worker] Critical error running case expiration task routine loop:", error);
    }
  });

  console.log("[Cron Worker] Case Resolution Expiration tracking worker initialized.");
};