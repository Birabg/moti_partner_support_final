import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  const staffId = 'af63cef8-5e1c-41b4-bc98-7db592deb0d6';
  console.log('Checking staff analytics for', staffId);
  const rows = await prisma.caseReport.findMany({
    where: {
      assignedSupportId: staffId,
      status: { in: ['CUSTOMER_CONFIRMATION','CLOSED'] },
      feedback: { isNot: null },
    },
    select: { id: true, caseNumber: true, feedback: { select: { rating: true, comment: true } }, closedAt: true },
    orderBy: { closedAt: 'desc' }
  });

  console.log('Found', rows.length, 'rows');
  for (const r of rows) console.log(r.caseNumber, r.feedback?.rating, r.feedback?.comment);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
