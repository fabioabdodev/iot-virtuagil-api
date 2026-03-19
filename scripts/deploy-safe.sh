#!/usr/bin/env bash
set -euo pipefail

cd /opt/iot-virtuagil-api

echo "[1/6] Validando duplicidade de chaves..."
DUP="$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.prod | cut -d= -f1 | sort | uniq -d || true)"
if [[ -n "${DUP}" ]]; then
  echo "ERRO: chaves duplicadas no .env.prod:"
  echo "${DUP}"
  exit 1
fi

echo "[2/6] Validando variaveis obrigatorias..."
for K in DATABASE_URL DIRECT_DATABASE_URL N8N_ONLINE_WEBHOOK_URL N8N_OFFLINE_WEBHOOK_URL N8N_TEMPERATURE_ALERT_WEBHOOK_URL; do
  V="$(grep -m1 "^${K}=" .env.prod | cut -d= -f2- || true)"
  if [[ -z "${V}" ]]; then
    echo "ERRO: ${K} vazio/ausente"
    exit 1
  fi
done

echo "[3/6] Carregando .env.prod..."
set -a
. ./.env.prod
set +a

echo "[4/6] Deploy da stack..."
docker stack deploy -c deploy/swarm/stack.prod.yml iot-monitor --with-registry-auth

echo "[5/6] Validando health..."
sleep 8
curl -fsS https://api-monitor.virtuagil.com.br/health
echo

echo "[6/6] Validando erros criticos (ultimos 2 min)..."
docker service logs iot-monitor_api --since 2m | grep -E "DATABASE_URL e obrigatoria|Invalid URL|prepared statement|PrismaClientUnknownRequestError|status=500" || true

echo "OK: deploy e validacoes concluidos."
