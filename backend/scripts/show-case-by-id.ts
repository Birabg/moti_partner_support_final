(async ()=>{
  try{
    const { prisma } = require('../src/config/database');
    const id = '0ccf752d-fd57-46d1-8d66-e4f9ffb532ef';
    const c = await prisma.caseReport.findUnique({ where: { id }, select: { id: true, caseNumber: true, subject: true, status: true, updatedAt: true, createdAt: true } });
    console.log('Case:', c);
  }catch(e){ console.error(e); process.exit(1);} })();
