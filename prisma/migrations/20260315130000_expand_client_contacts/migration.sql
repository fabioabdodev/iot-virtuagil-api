ALTER TABLE "Client"
ADD COLUMN "adminPhone" TEXT,
ADD COLUMN "billingPhone" TEXT;

UPDATE "Client"
SET "adminPhone" = "phone"
WHERE "phone" IS NOT NULL
  AND "adminPhone" IS NULL;
