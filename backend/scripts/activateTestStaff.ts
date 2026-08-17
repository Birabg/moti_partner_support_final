import { prisma } from "../src/config/database";

async function main() {
  const email = "teststaff1@motiengineering.com";
  const user = await prisma.staff.findUnique({ where: { email } });
  console.log(
    JSON.stringify(
      user
        ? { found: true, id: user.id, status: user.status }
        : { found: false },
    ),
  );
  if (user) {
    const updated = await prisma.staff.update({
      where: { id: user.id },
      data: { status: "ACTIVE" },
    });
    console.log(JSON.stringify({ updated: true, status: updated.status }));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
