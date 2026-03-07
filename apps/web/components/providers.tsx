'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/lib/query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
