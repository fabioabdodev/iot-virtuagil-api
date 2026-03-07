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
