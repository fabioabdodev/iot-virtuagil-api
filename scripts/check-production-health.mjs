#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
Verificacao simples do /health publicado

Uso:
  npm run health:check:prod
  npm run health:check:prod -- --url https://api-monitor.virtuagil.com.br/health
  npm run health:check:prod -- --expect-release sha
  npm run health:check:prod -- --require-feature authLogin --require-feature actuationCommandsRecent

Opcoes:
  --help                       Exibe esta ajuda
  --url <url>                  URL completa do endpoint /health
  --expect-release <valor>     Falha se o campo release nao contiver esse valor
  --require-feature <nome>     Falha se a feature nao existir como true

Variaveis opcionais:
  PRODUCTION_HEALTH_URL        Fallback para a URL quando --url nao for informado
`.trim());
}

function applyEnvFile() {
  const envFile = resolve('.env');
  if (!existsSync(envFile)) return;

  const content = readFileSync(envFile, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] != null) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function getRepeatedArgValues(flag) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag && args[index + 1]) {
      values.push(args[index + 1]);
    }
  }
  return values;
}

async function main() {
  applyEnvFile();

  if (args.includes('--help')) {
    printHelp();
    return;
  }

  const healthUrl =
    getArgValue('--url')?.trim() ||
    process.env.PRODUCTION_HEALTH_URL?.trim() ||
    'https://api-monitor.virtuagil.com.br/health';
  const expectedRelease = getArgValue('--expect-release')?.trim();
  const requiredFeatures = getRepeatedArgValues('--require-feature');

  console.log(`[health-check] consultando ${healthUrl}...`);

  const response = await fetch(healthUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(
      `[health-check] falha HTTP ${response.status} ao consultar ${healthUrl}.`,
    );
    process.exitCode = 1;
    return;
  }

  const payload = await response.json();

  console.log(`[health-check] status: ${payload.status ?? 'desconhecido'}`);
  console.log(`[health-check] environment: ${payload.environment ?? 'desconhecido'}`);
  console.log(`[health-check] release: ${payload.release ?? 'ausente'}`);
  console.log(`[health-check] buildTime: ${payload.buildTime ?? 'ausente'}`);

  const featureEntries = Object.entries(payload.features ?? {});
  if (featureEntries.length === 0) {
    console.log('[health-check] features: nenhuma publicada');
  } else {
    console.log('[health-check] features publicadas:');
    for (const [featureName, enabled] of featureEntries) {
      console.log(`- ${featureName}: ${enabled === true ? 'true' : 'false'}`);
    }
  }

  let hasValidationError = false;

  if (expectedRelease && !String(payload.release ?? '').includes(expectedRelease)) {
    console.error(
      `[health-check] release divergente. Esperado conter "${expectedRelease}", recebido "${payload.release ?? 'ausente'}".`,
    );
    hasValidationError = true;
  }

  for (const featureName of requiredFeatures) {
    if (payload.features?.[featureName] !== true) {
      console.error(
        `[health-check] feature obrigatoria ausente ou false: ${featureName}.`,
      );
      hasValidationError = true;
    }
  }

  if (hasValidationError) {
    process.exitCode = 1;
    return;
  }

  console.log('[health-check] validacao concluida com sucesso.');
}

main().catch((error) => {
  console.error('[health-check] falha na verificacao:', error);
  process.exitCode = 1;
});
