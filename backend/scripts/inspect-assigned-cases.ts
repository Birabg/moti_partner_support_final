import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  try {
    const cases = await prisma.caseReport.findMany({
      where: { assignedSupportId: { not: null } },
      select: { id: true, caseNumber: true, assignedSupportId: true, status: true },
      take: 50,
    });

    console.log('Found', cases.length, 'assigned cases (sample up to 50)');
    for (const c of cases) {
      console.log(c.caseNumber, c.assignedSupportId, c.status);
    }

    // show counts per assignedSupportId
    const counts = await prisma.$queryRawUnsafe(
      `SELECT "assignedSupportId", count(*) as cnt FROM "case_report" WHERE "assignedSupportId" IS NOT NULL GROUP BY "assignedSupportId" ORDER BY cnt DESC LIMIT 20;`
    );

    console.log('Counts per assignedSupportId (top 20):');
    console.table(counts as any);

    // fetch staff ids for these assignedSupportIds
    const ids = counts.map((r: any) => r.assignedSupportId);
    if (ids.length) {
      const staff = await prisma.staff.findMany({ where: { id: { in: ids } }, select: { id: true, email: true, firstName: true, isPSsupport: true } });
      console.log('Staff records for top assignedSupportIds:');
      console.table(staff as any);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });