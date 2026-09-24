import { prisma } from "../src/config/database";
import {
  generateNextMemberNumber,
  generateNextStaffNumber,
} from "../src/utils/userNumber";

const run = async () => {
  const missingStaffNumbers = await prisma.staff.findMany({
    where: { staffNumber: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });

  for (const staff of missingStaffNumbers) {
    const staffNumber = await generateNextStaffNumber(prisma);
    await prisma.staff.update({
      where: { id: staff.id },
      data: { staffNumber },
    });
    console.log(`Staff ${staff.email} -> ${staffNumber}`);
  }

  const missingMemberNumbers = await prisma.customer.findMany({
    where: { memberNumber: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });

  for (const customer of missingMemberNumbers) {
    const memberNumber = await generateNextMemberNumber(prisma);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { memberNumber },
    });
    console.log(`Customer ${customer.email} -> ${memberNumber}`);
  }

  console.log(
    `Backfill complete. Assigned ${missingStaffNumbers.length} staff numbers and ${missingMemberNumbers.length} member numbers.`
  );
  await prisma.$disconnect();
};

run().catch(async (error) => {
  console.error("Backfill failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});