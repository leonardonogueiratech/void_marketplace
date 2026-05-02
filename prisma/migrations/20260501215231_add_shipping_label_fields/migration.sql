-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "labelUrl" TEXT,
ADD COLUMN     "melhorEnvioOrderId" TEXT,
ADD COLUMN     "shippingServiceId" INTEGER;
