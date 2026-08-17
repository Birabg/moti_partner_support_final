import 'dotenv/config';
import { assignCaseSupport } from '../src/modules/system_support/system_support.service';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  // manager who currently has assigned cases (found earlier)
  const fromStaffEmail = 'solomonyehualashet30@gmail.com';
  // target PS support staff (you)
  const toStaffEmail = 'selomonyehualashet@gmail.com';

  try {
    const fromStaff = await prisma.staff.findUnique({ where: { email: fromStaffEmail } });
    const toStaff = await prisma.staff.findUnique({ where: { email: toStaffEmail } });
    if (!fromStaff) throw new Error('Source staff not found: ' + fromStaffEmail);
    if (!toStaff) throw new Error('Target staff not found: ' + toStaffEmail);

    const activeCases = await prisma.caseReport.findMany({
      where: {
        assignedSupportId: fromStaff.id,
        status: { notIn: ['RESOLVED', 'CLOSED'] as any },
      },
      select: { id: true, caseNumber: true, status: true },
    });

    console.log('Found', activeCases.length, 'active case(s) assigned to', fromStaffEmail);

    for (const c of activeCases) {
      console.log('Reassigning', c.caseNumber, '(', c.status, ') to', toStaffEmail);
      try {
        const result = await assignCaseSupport(c.id, toStaff.id, toStaff.id, false);
        console.log('Reassigned. New assignedSupportId:', result.assignedSupportId);
      } catch (e:any) {
        console.error('Failed to reassign', c.caseNumber, e.message || e);
      }
    }

  } catch (err:any) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });