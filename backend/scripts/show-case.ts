(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const id = '276b9cec-650b-46f7-b087-8cbd03288760';
    const c = await prisma.caseReport.findUnique({ where: { id }, select: { id: true, caseNumber: true, subject: true, status: true, updatedAt: true, createdAt: true } });
    console.log('Case:', c);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
