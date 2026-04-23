ALTER TABLE "ContactMessage" ADD COLUMN "reply" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "repliedAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "token" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "ContactMessage_token_key" ON "ContactMessage"("token");
