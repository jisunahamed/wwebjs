/*
  Warnings:

  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- AlterEnum
ALTER TYPE "MessageStatus" ADD VALUE 'RECEIVED';

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'CHAT';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "direction" "MessageDirection" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Message_direction_idx" ON "Message"("direction");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
