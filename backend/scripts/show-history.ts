(async ()=>{
  try{
    const { prisma } = require('../src/config/database');
    const id = '0ccf752d-fd57-46d1-8d66-e4f9ffb532ef';
    const hist = await prisma.caseStatusHistory.findMany({ where: { caseReportId: id }, orderBy: { createdAt: 'asc' } });
    console.log('History entries:');
    hist.forEach(h=> console.log(h.id, h.fromStatus, '->', h.toStatus, h.actorType, h.changedById, h.reason, h.createdAt));
  }catch(e){ console.error(e); process.exit(1);} })();
