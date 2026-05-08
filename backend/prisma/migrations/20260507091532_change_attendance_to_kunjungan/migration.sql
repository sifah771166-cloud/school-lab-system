/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutTime` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `labId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `attendances` table. All the data in the column will be lost.
  - Added the required column `classTeaching` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherName` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_labId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_scheduleId_fkey";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "checkInTime",
DROP COLUMN "checkOutTime",
DROP COLUMN "labId",
DROP COLUMN "scheduleId",
DROP COLUMN "status",
ADD COLUMN     "classTeaching" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "teacherName" TEXT NOT NULL;
