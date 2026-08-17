/*
  Warnings:

  - You are about to drop the column `fullName` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `staffs` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('ADMIN_EMAIL_UPDATE');

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "fullName",
ADD COLUMN     "emailChangeReason" TEXT,
ADD COLUMN     "firstName" VARCHAR(100) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(100) NOT NULL,
ADD COLUMN     "middleName" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "staffs" DROP COLUMN "fullName",
ADD COLUMN     "emailChangeReason" TEXT,
ADD COLUMN     "firstName" VARCHAR(100) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(100) NOT NULL,
ADD COLUMN     "middleName" VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE "profile_audit_logs" (
    "id" TEXT NOT NULL,
    "targetAccountId" VARCHAR(255) NOT NULL,
    "targetType" "PartyType" NOT NULL,
    "changedById" VARCHAR(255) NOT NULL,
    "changeType" "ChangeType" NOT NULL,
    "reason" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_audit_logs_pkey" PRIMARY KEY ("id")
);
