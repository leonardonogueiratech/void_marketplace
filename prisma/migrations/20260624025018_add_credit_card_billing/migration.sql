-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN "addressNumber" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "creditCardToken" TEXT,
ADD COLUMN "creditCardLast4" TEXT,
ADD COLUMN "creditCardBrand" TEXT;
