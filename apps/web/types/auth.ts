export type AuthUser = {
  id: string;
  clientId: string | null;
  name: string;
  email: string;
  role: 'operator' | 'admin';
  phone?: string | null;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};
