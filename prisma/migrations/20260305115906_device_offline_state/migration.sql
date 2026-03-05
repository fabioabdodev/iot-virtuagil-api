-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "isOffline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAlertAt" TIMESTAMP(3),
ADD COLUMN     "offlineSince" TIMESTAMP(3);
