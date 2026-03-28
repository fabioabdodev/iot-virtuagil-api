#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: bash scripts/diagnose-deploy-vps.sh <api-image> <web-image>"
  echo "Exemplo:"
  echo "  bash scripts/diagnose-deploy-vps.sh ghcr.io/fabioabdodev/iot-virtuagil-api/api:sha-abcdef1 ghcr.io/fabioabdodev/iot-virtuagil-api/web:sha-abcdef1"
  exit 1
fi

API_IMAGE="$1"
WEB_IMAGE="$2"
APP_DIR="/opt/iot-virtuagil-api"
ENV_FILE="$APP_DIR/.env.prod"
STACK_FILE="$APP_DIR/deploy/swarm/stack.prod.yml"

echo "== Diagnostico de deploy Virtuagil =="
echo "API_IMAGE=$API_IMAGE"
echo "WEB_IMAGE=$WEB_IMAGE"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERRO: diretorio $APP_DIR nao encontrado."
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERRO: arquivo $ENV_FILE nao encontrado."
  exit 1
fi

if [[ ! -f "$STACK_FILE" ]]; then
  echo "ERRO: arquivo $STACK_FILE nao encontrado."
  exit 1
fi

echo
echo "== Validando chaves duplicadas em .env.prod =="
DUPLICATED_KEYS="$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | cut -d= -f1 | sort | uniq -d || true)"
if [[ -n "$DUPLICATED_KEYS" ]]; then
  echo "ERRO: chaves duplicadas encontradas:"
  echo "$DUPLICATED_KEYS"
  exit 1
fi
echo "OK: sem chaves duplicadas."

set -a
. "$ENV_FILE"
set +a

trim_var() {
  local key="$1"
  local value="${!key:-}"
  local trimmed
  trimmed="$(printf '%s' "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  export "$key=$trimmed"
}

validate_optional_url() {
  local key="$1"
  local value="${!key:-}"
  if [[ -n "$value" ]] && ! printf '%s' "$value" | grep -Eq '^https?://'; then
    echo "ERRO: $key invalida: $value"
    exit 1
  fi
}

trim_var DATABASE_URL
trim_var DIRECT_DATABASE_URL
trim_var N8N_OFFLINE_WEBHOOK_URL
trim_var N8N_ONLINE_WEBHOOK_URL
trim_var N8N_TEMPERATURE_ALERT_WEBHOOK_URL

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERRO: DATABASE_URL vazia."
  exit 1
fi

if ! printf '%s' "$DATABASE_URL" | grep -Eq '^(postgresql|postgres|prisma)://'; then
  echo "ERRO: DATABASE_URL deve iniciar com postgresql://, postgres:// ou prisma://"
  exit 1
fi

if [[ -n "${DIRECT_DATABASE_URL:-}" ]] && ! printf '%s' "$DIRECT_DATABASE_URL" | grep -Eq '^(postgresql|postgres)://'; then
  echo "ERRO: DIRECT_DATABASE_URL deve iniciar com postgresql:// ou postgres://"
  exit 1
fi

if printf '%s' "$DATABASE_URL" | grep -Eq '^prisma://'; then
  if [[ -z "${DIRECT_DATABASE_URL:-}" ]]; then
    echo "ERRO: DATABASE_URL usa prisma:// e DIRECT_DATABASE_URL nao foi definida."
    exit 1
  fi
fi

validate_optional_url N8N_OFFLINE_WEBHOOK_URL
validate_optional_url N8N_ONLINE_WEBHOOK_URL
validate_optional_url N8N_TEMPERATURE_ALERT_WEBHOOK_URL

if [[ -z "${GHCR_USERNAME:-}" || -z "${GHCR_TOKEN:-}" ]]; then
  echo "ERRO: GHCR_USERNAME/GHCR_TOKEN nao disponiveis no ambiente atual da VPS."
  echo "Defina antes de rodar, por exemplo:"
  echo "  export GHCR_USERNAME=seu_usuario"
  echo "  export GHCR_TOKEN=seu_token"
  exit 1
fi

echo
echo "== Login no GHCR =="
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

echo
echo "== Pull das imagens =="
docker pull "$API_IMAGE"
docker pull "$WEB_IMAGE"

MIGRATE_DATABASE_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"
if [[ -z "$MIGRATE_DATABASE_URL" ]]; then
  echo "ERRO: DATABASE_URL/DIRECT_DATABASE_URL ausentes para migration."
  exit 1
fi

echo
echo "== Prisma migrate deploy =="
docker run --rm \
  -e DATABASE_URL="$MIGRATE_DATABASE_URL" \
  -e DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-}" \
  "$API_IMAGE" npx prisma migrate deploy

echo
echo "== Docker stack deploy =="
export API_IMAGE
export WEB_IMAGE
export IMAGE_TAG="${API_IMAGE##*:}"
export APP_RELEASE="${IMAGE_TAG}"
export APP_BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
docker stack deploy -c "$STACK_FILE" iot-monitor --with-registry-auth

echo
echo "== Servicos da stack =="
docker service ls | grep iot-monitor || true

echo
echo "== Diagnostico concluido =="
