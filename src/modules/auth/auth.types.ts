export type SessionUser = {
  id: string;
  clientId: string | null;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
