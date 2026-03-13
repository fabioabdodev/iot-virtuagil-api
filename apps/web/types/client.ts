export type ClientStatus = 'active' | 'inactive' | 'delinquent';

export interface ClientSummary {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  billingEmail: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  name?: string;
  document?: string;
  phone?: string;
  billingEmail?: string;
  status?: ClientStatus;
  notes?: string;
}
