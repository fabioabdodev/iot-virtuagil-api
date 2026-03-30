ALTER TABLE "Client"
ADD COLUMN "monitoringIntervalSeconds" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN "offlineAlertDelayMinutes" INTEGER NOT NULL DEFAULT 15;

ALTER TABLE "Device"
ADD COLUMN "monitoringIntervalSeconds" INTEGER,
ADD COLUMN "offlineAlertDelayMinutes" INTEGER;
