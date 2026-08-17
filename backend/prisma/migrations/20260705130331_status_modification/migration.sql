/*
  Warnings:

  - The values [PENDING] on the enum `StaffStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffStatus_new" AS ENUM ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');
ALTER TABLE "public"."staffs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "staffs" ALTER COLUMN "status" TYPE "StaffStatus_new" USING ("status"::text::"StaffStatus_new");
ALTER TYPE "StaffStatus" RENAME TO "StaffStatus_old";
ALTER TYPE "StaffStatus_new" RENAME TO "StaffStatus";
DROP TYPE "public"."StaffStatus_old";
ALTER TABLE "staffs" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';
COMMIT;

-- AlterTable
ALTER TABLE "staffs" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';
