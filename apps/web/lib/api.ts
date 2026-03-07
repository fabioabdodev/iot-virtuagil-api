import { DeviceSummary } from '@/types/device';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function fetchDevices(
  clientId?: string,
  limit = 50,
): Promise<DeviceSummary[]> {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(`${API_BASE_URL}/devices?${query.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar dispositivos');
  }

  return response.json() as Promise<DeviceSummary[]>;
}
