(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const { updateStatus } = require('../src/modules/cases/caseStatus.service');
    const { CaseStatus } = require('../generated/prisma/client');

    const admin = await prisma.staff.findFirst({ where: { isSAdmin: true } });
    if (!admin) {
      console.log('No system admin found');
      process.exit(0);
    }
    console.log('System admin:', admin.id, admin.firstName, admin.lastName);

    const recentMatches = await prisma.caseReport.findMany({
      where: {
        OR: [
          { subject: { contains: 'test', mode: 'insensitive' } },
          { description: { contains: 'test', mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, caseNumber: true, subject: true, description: true, status: true, createdAt: true, customerId: true }
    });

    if (recentMatches.length > 0) {
      console.log('Found candidate cases by "test" match:');
      recentMatches.forEach(c => console.log(c.id, c.caseNumber, c.status, c.createdAt, c.subject));
    } else {
      console.log('No "test" matches found; listing most recent cases');
      const recent = await prisma.caseReport.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, caseNumber: true, subject: true, status: true, createdAt: true, customerId: true, description: true } });
      recent.forEach(c => console.log(c.id, c.caseNumber, c.status, c.createdAt, c.subject));
    }

    const allCandidates = recentMatches.length > 0 ? recentMatches : (await prisma.caseReport.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }));
    const target = allCandidates.find(c => c.status !== 'CANCELLED') || allCandidates[0];
    if (!target) {
      console.log('No case available to cancel');
      process.exit(0);
    }

    console.log('Targeting case to cancel:', target.id, target.caseNumber, target.status, target.subject);

    const updated = await updateStatus(target.id, CaseStatus.CANCELLED, { id: admin.id, isSAdmin: true });
    console.log('Update result:', updated.id, updated.caseNumber || updated.caseNumber, updated.status, updated.updatedAt);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
