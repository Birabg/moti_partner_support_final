/*
  Warnings:

  - The values [WAITING_CONFIRMATION] on the enum `CaseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CaseStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER_FEEDBACK', 'CLOSED');
ALTER TABLE "public"."case_report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "case_report" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");
ALTER TABLE "case_report_status_histories" ALTER COLUMN "oldStatus" TYPE "CaseStatus_new" USING ("oldStatus"::text::"CaseStatus_new");
ALTER TABLE "case_report_status_histories" ALTER COLUMN "newStatus" TYPE "CaseStatus_new" USING ("newStatus"::text::"CaseStatus_new");
ALTER TYPE "CaseStatus" RENAME TO "CaseStatus_old";
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";
DROP TYPE "public"."CaseStatus_old";
ALTER TABLE "case_report" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;
