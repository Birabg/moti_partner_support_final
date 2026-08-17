/*
  Warnings:

  - The values [ASSIGNED,RESOLVED] on the enum `CaseStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CASE_RESOLVED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CaseStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'CLOSED');
ALTER TABLE "public"."case_report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "case_report" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");
ALTER TABLE "case_report_status_histories" ALTER COLUMN "oldStatus" TYPE "CaseStatus_new" USING ("oldStatus"::text::"CaseStatus_new");
ALTER TABLE "case_report_status_histories" ALTER COLUMN "newStatus" TYPE "CaseStatus_new" USING ("newStatus"::text::"CaseStatus_new");
ALTER TYPE "CaseStatus" RENAME TO "CaseStatus_old";
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";
DROP TYPE "public"."CaseStatus_old";
ALTER TABLE "case_report" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('NEW_CUSTOMER_REGISTRATION', 'NEW_CASE_SUBMITTED', 'CASE_ASSIGNED', 'CASE_REASSIGNED', 'CASE_STATUS_CHANGED', 'CASE_CLOSED', 'CASE_IN_PROGRESS', 'FEEDBACK_SUBMITTED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "case_report" ADD COLUMN     "creationReason" TEXT;

-- CreateTable
CREATE TABLE "email_domains" (
    "id" TEXT NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "email_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_domains_domain_key" ON "email_domains"("domain");

-- AddForeignKey
ALTER TABLE "email_domains" ADD CONSTRAINT "email_domains_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
