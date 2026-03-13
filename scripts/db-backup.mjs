#!/usr/bin/env node

import { mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';

const args = new Set(process.argv.slice(2));

function printHelp() {
  console.log(`
Backup do banco PostgreSQL

Uso:
  npm run backup:db
  npm run backup:db -- --output-dir backups/db
  npm run backup:db:dry-run

Opcoes:
  --help                 Exibe esta ajuda
  --dry-run              Mostra o comando sem executar
  --output-dir <dir>     Diretorio de saida dos dumps

Variaveis opcionais:
  DIRECT_DATABASE_URL    Preferida para backup e restore
  DATABASE_URL           Fallback quando a conexao direta nao estiver definida
  PG_DUMP_PATH           Caminho completo do pg_dump, se ele nao estiver no PATH
  BACKUP_OUTPUT_DIR      Diretorio padrao para salvar backups

Saida:
  Arquivo .dump em formato custom do pg_dump
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
  const argv = process.argv.slice(2);
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  return argv[index + 1];
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function sanitizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol === 'prisma:' || url.protocol === 'prisma+postgres:') {
    throw new Error(
      'Use DIRECT_DATABASE_URL ou uma DATABASE_URL PostgreSQL real para backups. URLs prisma:// nao funcionam com pg_dump.',
    );
  }
  return url;
}

function resolvePgDumpBinary() {
  return process.env.PG_DUMP_PATH?.trim() || 'pg_dump';
}

function buildDumpFilename(url) {
  const dbName = url.pathname.replace(/^\//, '') || 'postgres';
  const host = url.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${host}_${dbName}_${timestamp()}.dump`;
}

function buildPgDumpArgs(url, outputFile) {
  const dbName = url.pathname.replace(/^\//, '') || 'postgres';
  const args = [
    '--format=custom',
    '--no-owner',
    '--no-privileges',
    '--host',
    url.hostname,
    '--port',
    url.port || '5432',
    '--username',
    decodeURIComponent(url.username),
    '--dbname',
    dbName,
    '--file',
    outputFile,
  ];

  return args;
}

function main() {
  applyEnvFile();

  if (args.has('--help')) {
    printHelp();
    return;
  }

  const rawDatabaseUrl =
    process.env.DIRECT_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!rawDatabaseUrl) {
    throw new Error(
      'DIRECT_DATABASE_URL ou DATABASE_URL precisa estar definida para gerar backup.',
    );
  }

  const url = sanitizeUrl(rawDatabaseUrl);
  const outputDir = resolve(
    getArgValue('--output-dir') ||
      process.env.BACKUP_OUTPUT_DIR ||
      'backups/db',
  );

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = resolve(outputDir, buildDumpFilename(url));
  const pgDumpBinary = resolvePgDumpBinary();
  const pgDumpArgs = buildPgDumpArgs(url, outputFile);

  const sanitizedCommand = [
    pgDumpBinary,
    ...pgDumpArgs.map((arg) =>
      /\s/.test(arg) ? `"${arg}"` : arg,
    ),
  ].join(' ');

  console.log(`[backup:db] destino: ${outputFile}`);
  console.log(
    `[backup:db] origem: ${url.hostname}:${url.port || '5432'}/${url.pathname.replace(/^\//, '') || 'postgres'}`,
  );

  if (args.has('--dry-run')) {
    console.log('[backup:db] dry-run ativo. Comando preparado:');
    console.log(sanitizedCommand);
    console.log(
      '[backup:db] lembrete: guarde esse arquivo fora da VPS principal.',
    );
    return;
  }

  const result = spawnSync(pgDumpBinary, pgDumpArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: decodeURIComponent(url.password),
      PGSSLMODE: url.searchParams.get('sslmode') || process.env.PGSSLMODE || 'require',
    },
  });

  if (result.error) {
    throw new Error(
      `Falha ao executar pg_dump. Verifique se o binario existe no PATH ou configure PG_DUMP_PATH. Detalhe: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    throw new Error(`pg_dump encerrou com codigo ${result.status}.`);
  }

  console.log('[backup:db] backup concluido com sucesso.');
  console.log(
    '[backup:db] proximo passo: copiar o arquivo gerado para fora da VPS e testar restauracao quando possivel.',
  );
}

main();
