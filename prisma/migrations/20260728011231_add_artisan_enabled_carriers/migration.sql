-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN     "enabledCarriers" TEXT[] DEFAULT ARRAY['Correios']::TEXT[];
