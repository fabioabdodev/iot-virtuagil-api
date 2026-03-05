-- CreateTable
CREATE TABLE "TemperatureLog" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemperatureLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemperatureLog_deviceId_createdAt_idx" ON "TemperatureLog"("deviceId", "createdAt");
