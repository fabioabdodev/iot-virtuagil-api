export type DeviceSummary = {
  id: string;
  clientId: string | null;
  name: string | null;
  location: string | null;
  isOffline: boolean;
  lastSeen: string | null;
  offlineSince: string | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  lastTemperature: number | null;
  lastReadingAt: string | null;
};

export type DeviceReading = {
  value: number;
  sensorType: string;
  unit: string | null;
  createdAt: string;
};

export type DeviceInput = {
  id: string;
  clientId?: string;
  name?: string;
  location?: string;
  minTemperature?: number;
  maxTemperature?: number;
};
