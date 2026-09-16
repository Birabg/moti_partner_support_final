import cron from "node-cron";
import { prisma } from "../config/database";
import { CaseStatus } from "../../generated/prisma/client";
import { triggerAutoCloseEmail, triggerResolutionReminderEmail } from "../utils/email";
import { createStatusHistory } from "../modules/cases/statusHistory.service";

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

            await createStatusHistory(tx, {
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
  cron.schedule("0 */1 * * *", async () => {
    console.log("[Cron Worker] Starting resolution confirmation sweep...");

    try {
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const autoCloseThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const reminderCases = await prisma.caseReport.findMany({
        where: {
          status: CaseStatus.RESOLVED,
          resolvedAt: { lte: reminderThreshold },
        },
        include: { customer: true },
      });

      for (const targetCase of reminderCases) {
        try {
          const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
          await prisma.$transaction(async (tx) => {
            await tx.caseReport.update({
              where: { id: targetCase.id },
              data: {
                status: CaseStatus.CUSTOMER_CONFIRMATION,
                updatedById: SYSTEM_BOT_ID,
              },
            });

            await createStatusHistory(tx, {
              caseReportId: targetCase.id,
              changedById: SYSTEM_BOT_ID,
              actorType: "SYSTEM",
              actorId: null,
              fromStatus: CaseStatus.RESOLVED,
              toStatus: CaseStatus.CUSTOMER_CONFIRMATION,
              oldPriority: targetCase.priority,
              newPriority: targetCase.priority,
              oldAgentId: targetCase.assignedSupportId,
              newAgentId: targetCase.assignedSupportId,
            });
          });

          await triggerResolutionReminderEmail(targetCase);
          console.log(`[Cron Worker] Sent reminder and moved case ${targetCase.caseNumber} to CUSTOMER_CONFIRMATION.`);
        } catch (individualError) {
          console.error(`[Cron Worker] Failed to remind case ${targetCase.id}:`, individualError);
        }
      }

      const autoCloseCases = await prisma.caseReport.findMany({
        where: {
          status: CaseStatus.CUSTOMER_CONFIRMATION,
          resolvedAt: { lte: autoCloseThreshold },
        },
        include: { customer: true },
      });

      for (const targetCase of autoCloseCases) {
        try {
          const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
          await prisma.$transaction(async (tx) => {
            await tx.caseReport.update({
              where: { id: targetCase.id },
              data: {
                status: CaseStatus.CLOSED,
                closedAt: new Date(),
                updatedById: SYSTEM_BOT_ID,
              },
            });

            await createStatusHistory(tx, {
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
            });
          });

          await triggerAutoCloseEmail(targetCase);
          console.log(`[Cron Worker] Auto-closed case ${targetCase.caseNumber} due to inactivity.`);
        } catch (individualError) {
          console.error(`[Cron Worker] Failed to auto-close case ${targetCase.id}:`, individualError);
        }
      }
    } catch (error) {
      console.error("[Cron Worker] Critical error running confirmation workflow:", error);
    }
  });

  console.log("[Cron Worker] Resolution confirmation workflow initialized.");
};