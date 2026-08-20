import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  console.log('Listing feedback grouped by assignedSupportId (top 50 feedback rows)');

  const rows = await prisma.feedback.findMany({
    take: 50,
    orderBy: { submittedAt: 'desc' },
    include: { caseReport: { select: { id: true, caseNumber: true, assignedSupportId: true, assignedSupport: { select: { id: true, firstName: true, lastName: true, email: true } } } } }
  });

  if (!rows || rows.length === 0) {
    console.log('No feedback rows found');
    return;
  }

  for (const r of rows) {
    console.log('---');
    console.log('feedbackId:', r.id);
    console.log('rating:', r.rating, 'comment:', r.comment);
    const cr = (r as any).caseReport;
    console.log('caseId:', cr?.id, 'caseNumber:', cr?.caseNumber);
    console.log('assignedSupportId:', cr?.assignedSupportId);
    if (cr?.assignedSupport) console.log('assignedSupport:', `${cr.assignedSupport.firstName} ${cr.assignedSupport.lastName} <${cr.assignedSupport.email}>`);
    console.log('submittedAt:', r.submittedAt?.toISOString());
  }
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
