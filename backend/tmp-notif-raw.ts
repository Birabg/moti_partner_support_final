import "dotenv/config";
import { prisma } from "./src/config/database";

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, recipient_id, recipient_type, message, created_at FROM notifications ORDER BY created_at DESC LIMIT 10;`
  );
  console.log(JSON.stringify(rows, null, 2));
  const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM notifications;`);
  console.log(JSON.stringify(count, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
