import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CaseStatus } from '../generated/prisma/client';

async function main(){
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try{
    const staffData = await prisma.staff.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isPSsupport: true,
        assignedCases: { select: { id: true, status: true, feedback: { select: { rating: true } } } }
      }
    });

    const supportProfiles = staffData.map((agent: any) => {
      const assignedCases = agent.assignedCases || [];
      const totalReceived = assignedCases.length;

      const inProgressCount = assignedCases.filter((c: any) => c.status === CaseStatus.IN_PROGRESS).length;
      const closedCount = assignedCases.filter((c: any) => c.status === CaseStatus.CLOSED).length;

      const reviewedCases = assignedCases.filter((c: any) => c.status === CaseStatus.CLOSED && typeof (c.feedback?.rating) === 'number');
      const ratingScoreSum = reviewedCases.reduce((sum: number, c: any) => sum + (c.feedback?.rating || 0), 0);
      const agentAverageCsat = reviewedCases.length > 0 ? parseFloat((ratingScoreSum / reviewedCases.length).toFixed(2)) : null;

      return {
        agentId: agent.id,
        name: `${agent.firstName} ${agent.lastName}`,
        email: agent.email,
        isPSsupport: agent.isPSsupport ?? true,
        metrics: {
          totalCasesReceived: totalReceived,
          inProgressCasesCount: inProgressCount,
          closedCasesCount: closedCount,
          averageFeedbackRatingReceived: agentAverageCsat
        }
      };
    });

    console.log(JSON.stringify(supportProfiles, null, 2));
  }catch(e){ console.error(e); }
  finally{ await prisma.$disconnect(); }
}

main();