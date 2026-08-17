import "dotenv/config";
import { prisma } from "./src/config/database";

async function main() {
  const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM notifications;`);
  const countRow = countResult[0] as { count: bigint };
  console.log(JSON.stringify({ count: countRow.count.toString() }, null, 2));

  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM notifications LIMIT 1;`);
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
