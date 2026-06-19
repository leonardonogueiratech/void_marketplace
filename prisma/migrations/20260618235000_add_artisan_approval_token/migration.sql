-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN "approvalToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_approvalToken_key" ON "ArtisanProfile"("approvalToken");
