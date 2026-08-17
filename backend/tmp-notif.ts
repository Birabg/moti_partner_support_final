import "dotenv/config";
import { prisma } from "./src/config/database";

async function main() {
  const rows = await prisma.notification.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
