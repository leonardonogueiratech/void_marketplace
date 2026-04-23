/*
  Warnings:

  - You are about to drop the column `mpPaymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mpPreferenceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mpSubscriptionId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "mpPaymentId",
DROP COLUMN "mpPreferenceId",
ADD COLUMN     "asaasPaymentId" TEXT,
ADD COLUMN     "asaasPaymentLink" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "mpSubscriptionId",
ADD COLUMN     "asaasSubscriptionId" TEXT;
