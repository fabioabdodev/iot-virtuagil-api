'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const TOKEN_STORAGE_KEY = 'iot_web_auth_token';

type AuthContextValue = {
  authToken: string;
  isReady: boolean;
  saveToken: (token: string) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
    setAuthToken(savedToken);
    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authToken,
      isReady,
      saveToken: (token: string) => {
        const normalizedToken = token.trim();
        window.localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
        setAuthToken(normalizedToken);
      },
      clearToken: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken('');
      },
    }),
    [authToken, isReady],
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
