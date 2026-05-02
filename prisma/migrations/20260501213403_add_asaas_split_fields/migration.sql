-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN     "asaasAccountId" TEXT,
ADD COLUMN     "asaasWalletId" TEXT,
ADD COLUMN     "cpfCnpj" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "asaasTransferId" TEXT;
