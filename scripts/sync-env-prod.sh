#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="${STACK_NAME:-iot-monitor}"
STACK_FILE="${STACK_FILE:-deploy/swarm/stack.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
HEALTH_URL="${HEALTH_URL:-https://monitor.virtuagil.com.br/api/health}"

APPLY=false
STRICT=false
QUIET=false

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    --strict) STRICT=true ;;
    --quiet) QUIET=true ;;
    --help|-h)
      cat <<'EOF'
Uso:
  bash scripts/sync-env-prod.sh [--apply] [--strict] [--quiet]

Descricao:
  Audita variaveis do .env.prod contra o ambiente efetivo dos servicos Swarm.
  Opcionalmente reaplica o deploy usando somente .env.prod.

Flags:
  --apply   Reaplica stack com APP_RELEASE/APP_BUILD_TIME automaticos.
  --strict  Falha com exit 1 se encontrar divergencias.
  --quiet   Saida resumida.

Variaveis opcionais:
  STACK_NAME   (padrao: iot-monitor)
  STACK_FILE   (padrao: deploy/swarm/stack.prod.yml)
  ENV_FILE     (padrao: .env.prod)
  HEALTH_URL   (padrao: https://monitor.virtuagil.com.br/api/health)
EOF
      exit 0
      ;;
    *)
      echo "Parametro invalido: $arg"
      exit 2
      ;;
  esac
done

say() {
  if [[ "$QUIET" != "true" ]]; then
    echo "$@"
  fi
}

fail() {
  echo "ERRO: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio ausente: $1"
}

require_cmd docker
require_cmd awk
require_cmd grep
require_cmd sort
require_cmd sed

[[ -f "$ENV_FILE" ]] || fail "arquivo nao encontrado: $ENV_FILE"
[[ -f "$STACK_FILE" ]] || fail "arquivo nao encontrado: $STACK_FILE"

say "[1/7] Validando chaves duplicadas em $ENV_FILE..."
DUP_KEYS="$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | cut -d= -f1 | sort | uniq -d || true)"
if [[ -n "$DUP_KEYS" ]]; then
  echo "$DUP_KEYS"
  fail "chaves duplicadas detectadas no $ENV_FILE"
fi

say "[2/7] Carregando $ENV_FILE..."
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  fail "DATABASE_URL ausente no $ENV_FILE"
fi

service_env_tmp="$(mktemp)"
env_prod_tmp="$(mktemp)"
drift_tmp="$(mktemp)"
extra_tmp="$(mktemp)"
missing_tmp="$(mktemp)"
managed_keys_tmp="$(mktemp)"
trap 'rm -f "$service_env_tmp" "$env_prod_tmp" "$drift_tmp" "$extra_tmp" "$missing_tmp" "$managed_keys_tmp"' EXIT

extract_service_env() {
  local service="$1"
  docker service inspect "$service" \
    --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' 2>/dev/null \
    | awk -F= '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1"="$2}'
}

say "[3/7] Coletando env efetivo do Swarm..."
for svc in "${STACK_NAME}_api" "${STACK_NAME}_web"; do
  if docker service inspect "$svc" >/dev/null 2>&1; then
    extract_service_env "$svc" >> "$service_env_tmp"
  else
    say "  aviso: servico nao encontrado: $svc"
  fi
done

sort -u "$service_env_tmp" -o "$service_env_tmp"

# Chaves realmente gerenciadas pela stack (placeholders ${VAR}).
grep -oE '\$\{[A-Za-z_][A-Za-z0-9_]*(:-[^}]*)?\}' "$STACK_FILE" \
  | sed -E 's/^\$\{([A-Za-z_][A-Za-z0-9_]*).*/\1/' \
  | sort -u > "$managed_keys_tmp"

# APP_RELEASE/APP_BUILD_TIME sao dinâmicos por deploy, nao devem falhar strict.
grep -vE '^(APP_RELEASE|APP_BUILD_TIME)$' "$managed_keys_tmp" > "${managed_keys_tmp}.filtered" || true
mv "${managed_keys_tmp}.filtered" "$managed_keys_tmp"

grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | sed -E 's/[[:space:]]+$//' \
  | awk -F= 'NR==FNR {k[$1]=1; next} ($1 in k) {print $0}' "$managed_keys_tmp" - \
  | sort -u > "$env_prod_tmp"

say "[4/7] Comparando env.prod x ambiente efetivo..."

# chaves gerenciadas pela stack que estao ausentes no servico
comm -23 <(cut -d= -f1 "$env_prod_tmp" | sort) <(cut -d= -f1 "$service_env_tmp" | sort) > "$missing_tmp" || true

# chaves extras no servico (fora do gerenciamento da stack + runtime esperadas)
comm -13 <(cut -d= -f1 "$env_prod_tmp" | sort) <(cut -d= -f1 "$service_env_tmp" | sort) \
  | grep -vE '^(NODE_ENV|PORT)$' > "$extra_tmp" || true

# chaves com valor divergente
awk -F= '
NR==FNR {a[$1]=$0; next}
{
  k=$1
  if (k in a && a[k] != $0) {
    print k
  }
}
' "$env_prod_tmp" "$service_env_tmp" | sort -u > "$drift_tmp"

MISSING_COUNT="$(wc -l < "$missing_tmp" | tr -d ' ')"
EXTRA_COUNT="$(wc -l < "$extra_tmp" | tr -d ' ')"
DRIFT_COUNT="$(wc -l < "$drift_tmp" | tr -d ' ')"

say "  ausentes no servico: $MISSING_COUNT"
say "  extras no servico:    $EXTRA_COUNT"
say "  divergencias valor:   $DRIFT_COUNT"

if [[ "$QUIET" != "true" ]]; then
  if [[ "$MISSING_COUNT" -gt 0 ]]; then
    echo "---- chaves ausentes no ambiente efetivo ----"
    cat "$missing_tmp"
  fi
  if [[ "$EXTRA_COUNT" -gt 0 ]]; then
    echo "---- chaves extras no ambiente efetivo (possivel Portainer/stack) ----"
    cat "$extra_tmp"
  fi
  if [[ "$DRIFT_COUNT" -gt 0 ]]; then
    echo "---- chaves com valor divergente ----"
    cat "$drift_tmp"
  fi
fi

if [[ "$STRICT" == "true" ]] && { [[ "$MISSING_COUNT" -gt 0 ]] || [[ "$DRIFT_COUNT" -gt 0 ]]; }; then
  fail "modo --strict: divergencias detectadas"
fi

if [[ "$APPLY" == "true" ]]; then
  say "[5/7] Aplicando deploy com fonte unica ($ENV_FILE)..."
  if git rev-parse --short HEAD >/dev/null 2>&1; then
    APP_RELEASE="${APP_RELEASE:-$(git rev-parse --short HEAD)}"
  else
    APP_RELEASE="${APP_RELEASE:-manual-$(date +%s)}"
  fi
  APP_BUILD_TIME="${APP_BUILD_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
  export APP_RELEASE APP_BUILD_TIME

  say "  APP_RELEASE=$APP_RELEASE"
  say "  APP_BUILD_TIME=$APP_BUILD_TIME"

  docker stack deploy -c "$STACK_FILE" "$STACK_NAME" --with-registry-auth
  sleep 5
else
  say "[5/7] --apply nao informado: deploy nao executado."
fi

say "[6/7] Validando release/build nos servicos..."
for svc in "${STACK_NAME}_api" "${STACK_NAME}_web"; do
  if docker service inspect "$svc" >/dev/null 2>&1; then
    echo "[$svc]"
    docker service inspect "$svc" \
      --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' \
      | grep -E 'APP_RELEASE=|APP_BUILD_TIME=|NEXT_PUBLIC_API_BASE_URL=' || true
  fi
done

say "[7/7] Health check: $HEALTH_URL"
curl -fsS "$HEALTH_URL" || true
echo

cat <<'EOF'

Resumo:
- Fonte oficial de configuracao deve ser somente .env.prod.
- Evite "Update stack" manual no Portainer com variaveis customizadas.
- Se usar Portainer, mantenha as variaveis da stack vazias e rode deploy por este script.

Recomendacao operacional:
  bash scripts/sync-env-prod.sh --strict
  bash scripts/sync-env-prod.sh --apply --strict
EOF
