export type ClientStatus = 'active' | 'inactive' | 'delinquent';

export interface ClientSummary {
  id: string;
  name: string;
  document: string | null;
  adminName: string;
  alertContactName: string;
  adminPhone: string;
  alertPhone: string;
  actuationNotifyCooldownMinutes: number | null;
  deviceApiKey: string | null;
  monitoringIntervalSeconds: number;
  offlineAlertDelayMinutes: number;
  billingName: string | null;
  billingPhone: string | null;
  phone: string | null;
  billingEmail: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  name?: string;
  adminName?: string;
  alertContactName?: string;
  document?: string;
  adminPhone?: string;
  alertPhone?: string;
  actuationNotifyCooldownMinutes?: number;
  deviceApiKey?: string;
  regenerateDeviceApiKey?: boolean;
  monitoringIntervalSeconds?: number;
  offlineAlertDelayMinutes?: number;
  billingName?: string;
  billingPhone?: string;
  billingEmail?: string;
  status?: ClientStatus;
  notes?: string;
}

export interface CreateClientInput extends ClientInput {
  id: string;
  name: string;
  adminName: string;
  alertContactName: string;
  document: string;
  adminPhone: string;
  alertPhone: string;
  actuationNotifyCooldownMinutes?: number;
  deviceApiKey?: string;
  monitoringIntervalSeconds?: number;
  offlineAlertDelayMinutes?: number;
  billingName?: string;
  billingPhone: string;
  billingEmail: string;
}
