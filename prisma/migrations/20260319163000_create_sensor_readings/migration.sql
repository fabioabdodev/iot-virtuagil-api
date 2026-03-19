CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sensorType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SensorReading_deviceId_sensorType_createdAt_idx"
ON "SensorReading"("deviceId", "sensorType", "createdAt");

CREATE INDEX "SensorReading_deviceId_createdAt_idx"
ON "SensorReading"("deviceId", "createdAt");
