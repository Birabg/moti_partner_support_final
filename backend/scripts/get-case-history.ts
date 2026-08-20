import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  const caseId = process.argv[2] || '2bc52c83-1c0c-4d55-8751-7979a2bc97a4';
  console.log('Fetching case and its status history for caseReportId:', caseId);

  const cr = await prisma.caseReport.findUnique({
    where: { id: caseId },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } }, assignedSupport: true }
  });

  if (!cr) {
    console.log('Case not found');
    return;
  }

  console.log('Case:', cr.caseNumber, 'assignedSupport:', cr.assignedSupport ? `${cr.assignedSupport.firstName} ${cr.assignedSupport.lastName}` : 'none');
  console.log('Status history rows:', cr.statusHistory.length);
  for (const h of cr.statusHistory) {
    console.log('---');
    console.log('id:', h.id);
    console.log('fromStatus:', h.fromStatus, 'toStatus:', h.toStatus, 'note:', h.note);
    console.log('oldAgentName:', h.oldAgentName, 'newAgentName:', h.newAgentName, 'resolutionSnapshot:', h.resolutionSnapshot);
    console.log('actorType:', h.actorType, 'actorId:', h.actorId, 'changedById:', h.changedById, 'createdAt:', h.createdAt?.toISOString());
  }
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
