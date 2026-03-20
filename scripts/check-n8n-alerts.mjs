#!/usr/bin/env node

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));

function getOption(name, fallback) {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  if (!match) return fallback;
  const value = match.slice(prefix.length).trim();
  return value.length > 0 ? value : fallback;
}

const shouldPing = flags.has('--ping');
const strictMode = flags.has('--strict');
const timeoutMs = Number(getOption('--timeout-ms', '10000'));

const targets = [
  {
    key: 'N8N_OFFLINE_WEBHOOK_URL',
    eventType: 'device_offline',
    sample: {
      type: 'device_offline',
      device_id: 'check_freezer_01',
      offline_since: new Date().toISOString(),
      created_at: new Date().toISOString(),
      client_id: 'check-client',
    },
  },
  {
    key: 'N8N_ONLINE_WEBHOOK_URL',
    eventType: 'device_back_online',
    sample: {
      type: 'device_back_online',
      event_type_alias: 'device_online',
      device_id: 'check_freezer_01',
      came_online_at: new Date().toISOString(),
      offline_since: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      cameOnlineAt: new Date().toISOString(),
      offlineSince: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      client_id: 'check-client',
    },
  },
  {
    key: 'N8N_TEMPERATURE_ALERT_WEBHOOK_URL',
    eventType: 'temperature_out_of_range',
    sample: {
      type: 'temperature_out_of_range',
      device_id: 'check_freezer_01',
      temperature: 12.3,
      min_temperature: 2,
      max_temperature: 8,
      created_at: new Date().toISOString(),
      client_id: 'check-client',
    },
  },
];

function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

async function pingWebhook(url, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-virtuagil-check': 'n8n-alerts',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      bodyPreview: text.slice(0, 140),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      bodyPreview: (error instanceof Error ? error.message : String(error)).slice(
        0,
        140,
      ),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log('== Verificacao N8N/Alertas ==');
  console.log(`modo_ping=${shouldPing ? 'on' : 'off'} strict=${strictMode ? 'on' : 'off'} timeout_ms=${timeoutMs}`);

  let hasMissing = false;
  let hasPingFailure = false;

  for (const target of targets) {
    const url = process.env[target.key]?.trim();
    if (!url) {
      hasMissing = true;
      console.log(`[MISSING] ${target.key} (evento=${target.eventType})`);
      continue;
    }

    console.log(`[OK] ${target.key}=${maskUrl(url)} (evento=${target.eventType})`);

    if (!shouldPing) continue;

    const result = await pingWebhook(url, target.sample);
    if (!result.ok) {
      hasPingFailure = true;
      console.log(
        `[PING_FAIL] ${target.key} status=${result.status} detalhe="${result.bodyPreview}"`,
      );
    } else {
      console.log(
        `[PING_OK] ${target.key} status=${result.status} resposta="${result.bodyPreview}"`,
      );
    }
  }

  if (strictMode && (hasMissing || hasPingFailure)) {
    process.exitCode = 1;
    console.log('Resultado: falhou em modo estrito.');
    return;
  }

  console.log('Resultado: verificacao concluida.');
}

main().catch((error) => {
  console.error('Falha ao executar verificacao de alertas n8n:', error);
  process.exitCode = 1;
});
