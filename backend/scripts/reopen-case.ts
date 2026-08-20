(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const { updateStatus } = require('../src/modules/cases/caseStatus.service');
    const { CaseStatus } = require('../generated/prisma/client');

    const targetId = '141d6daa-d2c8-40b4-a7ae-617bf0164ad2';

    const admin = await prisma.staff.findFirst({ where: { isSAdmin: true } });
    if (!admin) {
      console.log('No system admin found');
      process.exit(0);
    }
    console.log('Using system admin:', admin.id, admin.firstName, admin.lastName);

    const c = await prisma.caseReport.findUnique({ where: { id: targetId }, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });
    if (!c) {
      console.log('Case not found:', targetId);
      process.exit(0);
    }

    console.log('Current case status:', c.status, 'subject:', c.subject);

    const updated = await updateStatus(targetId, CaseStatus.IN_PROGRESS, { id: admin.id, isSAdmin: true }, { reason: 'Reopening test case per user request' });

    console.log('Updated case:', { id: updated.id, caseNumber: updated.caseNumber, status: updated.status, updatedAt: updated.updatedAt });
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
