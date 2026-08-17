import 'dotenv/config';
import { prisma } from '../src/config/database';
import { assignCaseSupport } from '../src/modules/system_support/system_support.service';
import CaseStatusService from '../src/modules/cases/caseStatus.service';
import { CaseStatus } from '../generated/prisma/client';

async function main() {
  // find a candidate case in OPEN status
  let targetCase = await prisma.caseReport.findFirst({ where: { status: CaseStatus.OPEN } });
  if (!targetCase) {
    targetCase = await prisma.caseReport.findFirst({ where: { status: { not: CaseStatus.CLOSED } } });
  }
  if (!targetCase) {
    console.log('No suitable case found to run smoke test.');
    process.exit(0);
  }

  const staff = await prisma.staff.findFirst();
  if (!staff) {
    console.log('No staff record present; cannot simulate assignment.');
    process.exit(1);
  }

  console.log(`Using case ${targetCase.id} (${targetCase.caseNumber}) and staff ${staff.id}`);

  // Assign case to staff (this will set status to IN_PROGRESS)
  const assigned = await assignCaseSupport(targetCase.id, staff.id, staff.id, false);
  console.log('Assigned result status:', assigned.status);

  // Now mark as RESOLVED (will require resolutionSummary)
  const updated = await CaseStatusService.updateStatus(targetCase.id, CaseStatus.RESOLVED, { id: staff.id }, { resolutionSummary: 'Automated smoke test resolution summary.' });
  console.log('After resolve step, immediate returned status:', updated.status);

  // Fetch latest case from DB
  const fresh = await prisma.caseReport.findUnique({ where: { id: targetCase.id }, include: { statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 }, customer: true } });
  console.log('Final case status:', fresh?.status);
  console.log('Recent history:');
  console.log(JSON.stringify(fresh?.statusHistory || [], null, 2));

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });