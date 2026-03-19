import { DeviceInput, DeviceReading, DeviceSummary } from '@/types/device';
import { AlertRule, AlertRuleInput } from '@/types/alert-rule';
import {
  ActuationCommand,
  ActuationCommandInput,
  ActuationSchedule,
  ActuationScheduleInput,
  ActuatorInput,
  ActuatorSummary,
} from '@/types/actuator';
import { AuthSession, AuthUser, LoginInput } from '@/types/auth';
import { UserInput, UserSummary } from '@/types/user';
import { ClientModule } from '@/types/client-module';
import { ClientInput, ClientSummary, CreateClientInput } from '@/types/client';
import { AuditLogEntry } from '@/types/audit-log';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const DEVICE_REQUEST_TIMEOUT_MS = 15000;

async function extractApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      return payload.message.join(', ');
    }

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Ignora erro de parse e usa mensagem padrao abaixo.
  }

  return fallback;
}

function buildAuthHeaders(authToken?: string) {
  // O token e opcional para permitir uso local e ambientes sem autenticacao no dashboard.
  const headers: HeadersInit = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = DEVICE_REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('A API demorou para responder. Tente novamente.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function normalizeDeviceReadings(rows: unknown): DeviceReading[] {
  if (!Array.isArray(rows)) return [];

  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];

    const record = row as Record<string, unknown>;
    const createdAt = record.createdAt;

    if (typeof createdAt !== 'string') return [];

    if (typeof record.temperature === 'number') {
      return [
        {
          temperature: record.temperature,
          createdAt,
        },
      ];
    }

    if (typeof record.value === 'number') {
      return [
        {
          temperature: record.value,
          createdAt,
        },
      ];
    }

    return [];
  });
}

export async function fetchDevices(
  clientId?: string,
  limit = 50,
  authToken?: string,
): Promise<DeviceSummary[]> {
  // O clientId filtra os dados por tenant sem duplicar endpoints no backend.
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (clientId) query.set('clientId', clientId);

  const response = await fetchWithTimeout(`${API_BASE_URL}/devices?${query.toString()}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao carregar dispositivos'),
    );
  }

  return response.json() as Promise<DeviceSummary[]>;
}

export async function fetchDeviceReadings(
  deviceId: string,
  clientId?: string,
  limit = 48,
  authToken?: string,
): Promise<DeviceReading[]> {
  // Reaproveitamos o mesmo padrao de filtros para manter consistencia com a listagem principal.
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (clientId) query.set('clientId', clientId);
  const headers = buildAuthHeaders(authToken);
  const url = `${API_BASE_URL}/readings/${deviceId}?sensor=temperature&${query.toString()}`;

  const response = await fetch(url, {
    cache: 'no-store',
    headers,
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(
        response,
        'Falha ao carregar historico do device',
      ),
    );
  }

  return normalizeDeviceReadings(await response.json());
}

export async function createDevice(
  input: DeviceInput,
  authToken?: string,
): Promise<DeviceSummary> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao criar device'),
    );
  }

  return response.json() as Promise<DeviceSummary>;
}

export async function updateDevice(
  id: string,
  input: Omit<DeviceInput, 'id'>,
  clientId?: string,
  authToken?: string,
): Promise<DeviceSummary> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/devices/${id}?${query.toString()}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(authToken),
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao atualizar device'),
    );
  }

  return response.json() as Promise<DeviceSummary>;
}

export async function deleteDevice(
  id: string,
  clientId?: string,
  authToken?: string,
): Promise<DeviceSummary> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/devices/${id}?${query.toString()}`,
    {
      method: 'DELETE',
      headers: buildAuthHeaders(authToken),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao remover device'),
    );
  }

  return response.json() as Promise<DeviceSummary>;
}

export async function fetchAlertRules(
  clientId?: string,
  authToken?: string,
): Promise<AlertRule[]> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(
    `${API_BASE_URL}/alert-rules?${query.toString()}`,
    {
      cache: 'no-store',
      headers: buildAuthHeaders(authToken),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(
        response,
        'Falha ao carregar regras de alerta',
      ),
    );
  }

  return response.json() as Promise<AlertRule[]>;
}

export async function createAlertRule(
  input: AlertRuleInput,
  authToken?: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alert-rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao criar regra de alerta'),
    );
  }
}

export async function updateAlertRule(
  id: string,
  input: Partial<AlertRuleInput>,
  authToken?: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alert-rules/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao atualizar regra de alerta'),
    );
  }
}

export async function deleteAlertRule(
  id: string,
  authToken?: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alert-rules/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(
        response,
        'Falha ao remover regra de alerta',
      ),
    );
  }
}

export async function fetchActuators(
  clientId?: string,
  authToken?: string,
): Promise<ActuatorSummary[]> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(`${API_BASE_URL}/actuators?${query.toString()}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao carregar atuadores'),
    );
  }

  return response.json() as Promise<ActuatorSummary[]>;
}

export async function createActuator(
  input: ActuatorInput,
  authToken?: string,
): Promise<ActuatorSummary> {
  const response = await fetch(`${API_BASE_URL}/actuators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao criar atuador'),
    );
  }

  return response.json() as Promise<ActuatorSummary>;
}

export async function updateActuator(
  id: string,
  input: Omit<ActuatorInput, 'id'>,
  authToken?: string,
): Promise<ActuatorSummary> {
  const response = await fetch(`${API_BASE_URL}/actuators/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao atualizar atuador'),
    );
  }

  return response.json() as Promise<ActuatorSummary>;
}

export async function deleteActuator(
  id: string,
  authToken?: string,
): Promise<ActuatorSummary> {
  const response = await fetch(`${API_BASE_URL}/actuators/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao remover atuador'),
    );
  }

  return response.json() as Promise<ActuatorSummary>;
}

export async function issueActuatorCommand(
  actuatorId: string,
  input: ActuationCommandInput,
  authToken?: string,
): Promise<ActuationCommand> {
  const response = await fetch(`${API_BASE_URL}/actuators/${actuatorId}/commands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao enviar comando'),
    );
  }

  return response.json() as Promise<ActuationCommand>;
}

export async function fetchActuatorCommands(
  actuatorId: string,
  authToken?: string,
): Promise<ActuationCommand[]> {
  const response = await fetch(`${API_BASE_URL}/actuators/${actuatorId}/commands`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(
        response,
        'Falha ao carregar historico do atuador',
      ),
    );
  }

  return response.json() as Promise<ActuationCommand[]>;
}

export async function fetchRecentActuationCommands(
  clientId?: string,
  limit = 8,
  authToken?: string,
): Promise<ActuationCommand[]> {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(
    `${API_BASE_URL}/actuators/commands/recent?${query.toString()}`,
    {
      cache: 'no-store',
      headers: buildAuthHeaders(authToken),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(
        response,
        'Falha ao carregar comandos recentes do acionamento',
      ),
    );
  }

  return response.json() as Promise<ActuationCommand[]>;
}

export async function fetchActuationSchedules(
  clientId?: string,
  authToken?: string,
): Promise<ActuationSchedule[]> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(
    `${API_BASE_URL}/actuators/schedules?${query.toString()}`,
    {
      cache: 'no-store',
      headers: buildAuthHeaders(authToken),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao carregar rotinas de acionamento'),
    );
  }

  return response.json() as Promise<ActuationSchedule[]>;
}

export async function createActuationSchedule(
  input: ActuationScheduleInput,
  authToken?: string,
): Promise<ActuationSchedule> {
  const response = await fetch(`${API_BASE_URL}/actuators/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao criar rotina de acionamento'),
    );
  }

  return response.json() as Promise<ActuationSchedule>;
}

export async function updateActuationSchedule(
  id: string,
  input: Partial<ActuationScheduleInput>,
  authToken?: string,
): Promise<ActuationSchedule> {
  const response = await fetch(`${API_BASE_URL}/actuators/schedules/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao atualizar rotina de acionamento'),
    );
  }

  return response.json() as Promise<ActuationSchedule>;
}

export async function deleteActuationSchedule(
  id: string,
  authToken?: string,
): Promise<ActuationSchedule> {
  const response = await fetch(`${API_BASE_URL}/actuators/schedules/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao remover rotina de acionamento'),
    );
  }

  return response.json() as Promise<ActuationSchedule>;
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao autenticar usuario'),
    );
  }

  return response.json() as Promise<AuthSession>;
}

export async function fetchCurrentUser(authToken: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao validar sessao atual'),
    );
  }

  return response.json() as Promise<AuthUser>;
}

export async function fetchUsers(
  clientId?: string,
  authToken?: string,
): Promise<UserSummary[]> {
  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);

  const response = await fetch(`${API_BASE_URL}/users?${query.toString()}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao carregar usuarios'));
  }

  return response.json() as Promise<UserSummary[]>;
}

export async function fetchClient(
  id: string,
  authToken?: string,
): Promise<ClientSummary> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao carregar cliente'));
  }

  return response.json() as Promise<ClientSummary>;
}

export async function fetchClients(authToken?: string): Promise<ClientSummary[]> {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao carregar clientes'));
  }

  return response.json() as Promise<ClientSummary[]>;
}

export async function createClient(
  input: CreateClientInput,
  authToken?: string,
): Promise<ClientSummary> {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao criar cliente'));
  }

  return response.json() as Promise<ClientSummary>;
}

export async function updateClient(
  id: string,
  input: ClientInput,
  authToken?: string,
): Promise<ClientSummary> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao atualizar cliente'));
  }

  return response.json() as Promise<ClientSummary>;
}

export async function deleteClient(
  id: string,
  authToken?: string,
): Promise<ClientSummary> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao remover cliente'));
  }

  return response.json() as Promise<ClientSummary>;
}

export async function createUser(
  input: UserInput,
  authToken?: string,
): Promise<UserSummary> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao criar usuario'));
  }

  return response.json() as Promise<UserSummary>;
}

export async function updateUser(
  id: string,
  input: UserInput,
  authToken?: string,
): Promise<UserSummary> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao atualizar usuario'));
  }

  return response.json() as Promise<UserSummary>;
}

export async function deleteUser(
  id: string,
  authToken?: string,
): Promise<UserSummary> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, 'Falha ao remover usuario'));
  }

  return response.json() as Promise<UserSummary>;
}

export async function fetchClientModules(
  clientId: string,
  authToken?: string,
): Promise<ClientModule[]> {
  const query = new URLSearchParams();
  query.set('clientId', clientId);

  const response = await fetch(`${API_BASE_URL}/client-modules?${query.toString()}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao carregar modulos do cliente'),
    );
  }

  return response.json() as Promise<ClientModule[]>;
}

export async function upsertClientModule(
  input: {
    clientId: string;
    moduleKey: 'ambiental' | 'acionamento' | 'energia';
    itemKey?: string;
    enabled: boolean;
  },
  authToken?: string,
): Promise<ClientModule> {
  const response = await fetch(`${API_BASE_URL}/client-modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(authToken),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao atualizar modulo do cliente'),
    );
  }

  return response.json() as Promise<ClientModule>;
}

export async function fetchAuditLogs(
  filters: {
    clientId?: string;
    entityType?: string;
    entityId?: string;
    from?: string;
    to?: string;
    limit?: number;
  },
  authToken?: string,
): Promise<AuditLogEntry[]> {
  const query = new URLSearchParams();
  if (filters.clientId) query.set('clientId', filters.clientId);
  if (filters.entityType) query.set('entityType', filters.entityType);
  if (filters.entityId) query.set('entityId', filters.entityId);
  if (filters.from) query.set('from', filters.from);
  if (filters.to) query.set('to', filters.to);
  if (filters.limit) query.set('limit', String(filters.limit));

  const response = await fetch(`${API_BASE_URL}/audit-logs?${query.toString()}`, {
    cache: 'no-store',
    headers: buildAuthHeaders(authToken),
  });

  if (!response.ok) {
    throw new Error(
      await extractApiErrorMessage(response, 'Falha ao carregar auditoria'),
    );
  }

  return response.json() as Promise<AuditLogEntry[]>;
}
