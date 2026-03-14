# Handoff Atual

Data de referencia: 2026-03-14

## Direcao do produto

O projeto deixou de ser focado apenas em freezer e esta evoluindo para uma plataforma de automacao IoT da Virtuagil.

Identidade tecnica atual escolhida:

- API: `iot-virtuagil-api`
- Web: `iot-virtuagil-web`
- Namespace de imagens: `ghcr.io/fabioabdodev/iot-virtuagil-api`

## O que foi concluido

- modulo `temperatura` validado com cobertura e2e
- modulo `acionamento` validado com cobertura e2e
- regras de isolamento por tenant revisadas
- correcao aplicada no `PATCH /devices/:id` para nao mascarar conflito de `clientId`
- suites e2e antigas alinhadas ao fluxo atual de autenticacao por sessao
- rebranding tecnico iniciado no backend, frontend, deploy e documentacao principal
- `.vscode/mcp.json` preparado para o projeto com `supabase`, `context7`, `filesystem`, `git` e `shell`
- deploy swarm revisado para injetar variaveis obrigatorias de auth, cors e log na API
- endpoint de runtime IoT para acionamento adicionado em `GET /iot/actuators?deviceId=...`
- endpoint de confirmacao do hardware adicionado em `POST /iot/actuators/:id/ack`
- escopo de firmware/hardware separado em `iot-virtuagil-firmware/`

## Validacao feita

Comando executado com sucesso:

```bash
npm run test:e2e -- --runInBand
npm run build
cd apps/web && npm run build
npm run test:e2e -- --runInBand test/actuators.e2e-spec.ts
```

Resultado esperado no ponto atual:

- `13/13` suites passando
- `39/39` testes passando
- build do backend concluido com sucesso
- build do frontend concluido com sucesso
- suite de `actuators.e2e` com `9/9` testes passando apos incluir polling e `ack` de runtime IoT

## Arquivos alterados nesta etapa

- `src/modules/devices/devices.controller.ts`
- `test/alert-rules.e2e-spec.ts`
- `test/devices-dashboard.e2e-spec.ts`
- `test/devices-tenant.e2e-spec.ts`
- `test/readings.e2e-spec.ts`
- `package.json`
- `package-lock.json`
- `apps/web/package.json`
- `apps/web/package-lock.json`
- `.github/workflows/deploy.yml`
- `deploy/swarm/stack.prod.yml`
- `deploy/swarm/.env.prod.example`
- `README.md`

## Pendencias operacionais

- revisar o workflow de deploy ponta a ponta apos o rename para `iot-virtuagil-api`
- alinhar a VPS para usar `/opt/iot-virtuagil-api`
- mover ou recriar `.env.prod` no novo caminho da VPS
- confirmar publicacao das novas imagens no GHCR com o namespace novo
- decidir se a pasta local do repositorio tambem sera renomeada
- configurar no ambiente do projeto `SUPABASE_PROJECT_REF` e `CONTEXT7_API_KEY` quando o uso de MCP no VS Code for desejado
- atualizar o `.env.prod` real da VPS com as chaves novas/obrigatorias que agora estao documentadas em `deploy/swarm/.env.prod.example`
- alinhar qualquer evolucao de firmware em `iot-virtuagil-firmware/`, nao mais dentro deste repositorio

## Escopo local ignorado

- `institucional-site/` e um escopo local do futuro site institucional da Virtuagil
- essa pasta nao deve subir para este repositorio
- a protecao agora existe em `.gitignore`, nao apenas em `.git/info/exclude`
- `iot-virtuagil-firmware/` e um escopo local do futuro projeto separado de firmware
- as regras de hardware, runtime e bancada foram movidas para essa pasta

## Supabase

Objetivo desejado:

- nome visual do projeto: `virtuagil-iot`

Observacao importante:

- o nome exibido do projeto pode ser ajustado no dashboard, mas o `project ref` e o subdominio padrao do Supabase nao devem ser tratados como algo que pode ser renomeado livremente
- se branding publico for necessario, avaliar `custom domains` ou `vanity subdomains`

## Combinado de continuidade

Ao encerrar cada bloco relevante:

1. atualizar este arquivo com o novo ponto de parada
2. rodar a validacao minima pertinente
3. criar commit com mensagem objetiva
