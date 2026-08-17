"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCaseTimeoutWorker = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const client_1 = require("../../generated/prisma/client");
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
const startCaseTimeoutWorker = () => {
    // Production: run daily. For testing you can change schedule to a short interval.
    node_cron_1.default.schedule("0 */1 * * *", async () => {
        console.log("[Cron Worker] Starting automated 1-hour resolution-expiration sweep...");
        try {
            // 2 days ago
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const expiredCases = await database_1.prisma.caseReport.findMany({
                where: {
                    status: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
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
                    await database_1.prisma.$transaction(async (tx) => {
                        await tx.caseReport.update({
                            where: { id: targetCase.id },
                            data: {
                                status: client_1.CaseStatus.IN_PROGRESS,
                                updatedById: SYSTEM_BOT_ID,
                            },
                        });
                        await tx.caseStatusHistory.create({
                            data: {
                                caseReportId: targetCase.id,
                                changedById: SYSTEM_BOT_ID,
                                fromStatus: client_1.CaseStatus.CUSTOMER_CONFIRMATION,
                                toStatus: client_1.CaseStatus.IN_PROGRESS,
                                oldPriority: targetCase.priority,
                                newPriority: targetCase.priority,
                                oldAgentId: targetCase.assignedSupportId,
                                newAgentId: targetCase.assignedSupportId,
                            },
                        });
                    });
                    console.log(`[Cron Worker] Successfully reopened Case ID: ${targetCase.id} to IN_PROGRESS`);
                }
                catch (individualError) {
                    console.error(`[Cron Worker] Failed to reopen specific case ${targetCase.id}:`, individualError);
                }
            }
        }
        catch (error) {
            console.error("[Cron Worker] Critical error running case expiration task routine loop:", error);
        }
    });
    console.log("[Cron Worker] Case Resolution Expiration tracking worker initialized.");
};
exports.startCaseTimeoutWorker = startCaseTimeoutWorker;
