(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const { updateStatus } = require('../src/modules/cases/caseStatus.service');
    const { CaseStatus } = require('../generated/prisma/client');

    const target = '141d6daa-d2c8-40b4-a7ae-617bf0164ad2';

    const admin = await prisma.staff.findFirst({ where: { isSAdmin: true } });
    if (!admin) {
      console.log('No system admin found');
      process.exit(0);
    }
    console.log('Using system admin:', admin.id, admin.firstName, admin.lastName);

    // Try find by id
    let c = await prisma.caseReport.findUnique({ where: { id: target }, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });

    // Try find by caseNumber
    if (!c) {
      c = await prisma.caseReport.findFirst({ where: { caseNumber: target }, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });
    }

    // Try fuzzy match on subject/description
    if (!c) {
      const candidates = await prisma.caseReport.findMany({ where: { OR: [{ subject: { contains: target, mode: 'insensitive' } }, { description: { contains: target, mode: 'insensitive' } }] }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, updatedAt: true } });
      if (candidates.length > 0) {
        console.log('Found candidates by fuzzy match:');
        candidates.forEach(x => console.log(x.id, x.caseNumber, x.subject, x.status, x.createdAt));
        c = candidates[0];
      }
    }

    if (!c) {
      console.log('Case not found by id, caseNumber or fuzzy match for:', target);
      process.exit(0);
    }

    console.log('Found case:', c.id, c.caseNumber, c.subject, c.status, c.updatedAt);

    if (c.status === 'IN_PROGRESS') {
      console.log('Case already IN_PROGRESS');
      process.exit(0);
    }

    const updated = await updateStatus(c.id, CaseStatus.IN_PROGRESS, { id: admin.id, isSAdmin: true }, { reason: 'Reopening per user request' });

    console.log('Reopened case:', updated.id, updated.caseNumber, updated.status, updated.updatedAt);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
