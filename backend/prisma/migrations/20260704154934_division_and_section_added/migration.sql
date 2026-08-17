/*
  Warnings:

  - You are about to drop the column `uploadedById` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `staffs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[managerId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailDomain]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploaderType` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailDomain` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "staffs" DROP CONSTRAINT "staffs_departmentId_fkey";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "uploadedById",
ADD COLUMN     "uploadedByCustomerId" TEXT,
ADD COLUMN     "uploadedByStaffId" TEXT,
ADD COLUMN     "uploaderType" "PartyType" NOT NULL;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "managerId" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "emailDomain" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "staffs" DROP COLUMN "departmentId",
ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "managerId" TEXT,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "divisionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "managerId" TEXT,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisions_managerId_key" ON "divisions"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "sections_managerId_key" ON "sections"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_managerId_key" ON "departments"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_emailDomain_key" ON "organizations"("emailDomain");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedByCustomerId_fkey" FOREIGN KEY ("uploadedByCustomerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedByStaffId_fkey" FOREIGN KEY ("uploadedByStaffId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
