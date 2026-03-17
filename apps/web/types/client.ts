export type ClientStatus = 'active' | 'inactive' | 'delinquent';

export interface ClientSummary {
  id: string;
  name: string;
  document: string | null;
  adminName: string | null;
  adminPhone: string | null;
  alertPhone: string | null;
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
  document?: string;
  adminPhone?: string;
  alertPhone?: string;
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
  document: string;
  adminPhone: string;
  alertPhone?: string;
  billingName?: string;
  billingPhone: string;
  billingEmail: string;
}
