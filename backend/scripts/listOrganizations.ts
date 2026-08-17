import { prisma } from "../src/config/database";

async function main() {
  const orgs = await prisma.organization.findMany({ take: 10 });
  console.log(JSON.stringify(orgs, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
