(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const { updateStatus } = require('../src/modules/cases/caseStatus.service');
    const { CaseStatus } = require('../generated/prisma/client');

    const targetExternal = '141d6daa-d2c8-40b4-a7ae-617bf0164ad2';

    const admin = await prisma.staff.findFirst({ where: { isSAdmin: true } });
    if (!admin) {
      console.log('No system admin found');
      process.exit(0);
    }
    console.log('Using system admin:', admin.id, admin.firstName, admin.lastName);

    let c = await prisma.caseReport.findFirst({ where: { caseNumber: targetExternal }, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });
    if (!c) {
      // try by id
      c = await prisma.caseReport.findUnique({ where: { id: targetExternal }, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });
    }

    if (!c) {
      console.log('Case not found:', targetExternal);
      process.exit(0);
    }

    console.log('Found case:', c.id, c.caseNumber, c.subject, c.status, c.updatedAt);

    const updated = await updateStatus(c.id, CaseStatus.OPEN, { id: admin.id, isSAdmin: true }, { reason: 'Reopen to OPEN per user request' });

    console.log('Updated case:', { id: updated.id, caseNumber: updated.caseNumber, status: updated.status, updatedAt: updated.updatedAt });
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
