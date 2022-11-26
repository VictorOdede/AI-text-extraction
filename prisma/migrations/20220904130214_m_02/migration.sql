/*
  Warnings:

  - Added the required column `updatedAt` to the `mpesaStatements` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `mpesaStatements` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "mpesaStatements_receipt_key";

-- AlterTable
ALTER TABLE "mpesaStatements" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET NOT NULL;
