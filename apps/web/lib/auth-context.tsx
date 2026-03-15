'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchCurrentUser, loginUser } from '@/lib/api';
import { AuthUser } from '@/types/auth';

const TOKEN_STORAGE_KEY = 'iot_web_auth_token';
const USER_STORAGE_KEY = 'iot_web_auth_user';

type AuthContextValue = {
  authToken: string;
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (input: {
    email: string;
    password: string;
    turnstileToken?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
      const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);

      if (!savedToken) {
        setIsReady(true);
        return;
      }

      setAuthToken(savedToken);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser) as AuthUser);
        } catch {
          window.localStorage.removeItem(USER_STORAGE_KEY);
        }
      }

      try {
        const currentUser = await fetchCurrentUser(savedToken);
        setUser(currentUser);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } catch {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setAuthToken('');
        setUser(null);
      } finally {
        setIsReady(true);
      }
    }

    void restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authToken,
      isReady,
      isAuthenticated: Boolean(authToken),
      user,
      login: async ({ email, password, turnstileToken }) => {
        const session = await loginUser({ email, password, turnstileToken });
        window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
        setAuthToken(session.token);
        setUser(session.user);
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setAuthToken('');
        setUser(null);
      },
    }),
    [authToken, isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
