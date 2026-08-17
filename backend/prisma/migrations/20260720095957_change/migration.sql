/*
  Warnings:

  - The values [FEEDBACK_SUBMITTED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'CASE_REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('NEW_CUSTOMER_REGISTRATION', 'NEW_CASE_SUBMITTED', 'CASE_ASSIGNED', 'CASE_REASSIGNED', 'CASE_STATUS_CHANGED', 'CASE_CLOSED', 'CASE_IN_PROGRESS');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
