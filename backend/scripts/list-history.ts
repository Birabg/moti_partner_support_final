import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  console.log('Listing last 50 case status history rows');
  const rows = await prisma.caseStatusHistory.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { caseReport: { select: { id: true, caseNumber: true } } }
  });

  if (!rows || rows.length === 0) {
    console.log('No history rows found');
    return;
  }

  for (const r of rows) {
    console.log('---');
    console.log('id:', r.id);
    console.log('caseReportId:', r.caseReportId, 'caseNumber:', (r as any).caseReport?.caseNumber);
    console.log('fromStatus:', r.oldStatus, '-> toStatus:', r.newStatus);
    console.log('actorType:', r.actorType, 'changedById:', r.changedById, 'changedAt:', r.changedAt?.toISOString());
    console.log('note:', r.note || r.reason || r.description || '');
  }
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
