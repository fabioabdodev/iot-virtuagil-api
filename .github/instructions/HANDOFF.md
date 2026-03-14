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
- politica de acesso definida:
  - administrador da plataforma com acesso total e monitoramento completo
  - administrador do cliente com monitoramento do proprio tenant
  - direcao aprovada para cliente administrar regras operacionais com auditoria futura
- politica de acesso parcialmente implementada no codigo:
  - platform admin manteve acesso total
  - client admin passou a editar apenas faixa de temperatura dos devices
  - operator ficou em modo monitoramento para regras e modulos
  - trilha inicial de auditoria foi criada para mudancas criticas
- seed demo atualizado para incluir um admin global real da plataforma:
  - `plataforma@virtuagil.com.br`
- dashboard web agora possui painel de clientes para admin global:
  - listar tenants
  - criar cliente
  - excluir cliente
  - aplicar `clientId` no dashboard com um clique
- auditoria agora possui consulta no backend e painel inicial no monitor web:
  - endpoint `GET /audit-logs`
  - escopo automatico por tenant para admin de cliente
  - painel de auditoria visivel para administradores no dashboard
- admin do cliente agora pode editar regras de alerta existentes no dashboard:
  - alterar limites
  - ajustar cooldown
  - ajustar tolerancia
  - ativar e pausar regras
- regra-mae de produto consolidada:
  - a plataforma cria a estrutura inicial do cliente
  - o admin do cliente pode ajustar regras operacionais autorizadas
  - essa mesma logica deve valer para todos os modulos futuros

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
- evoluir o produto para refletir a politica de acesso registrada em `.github/instructions/ACCESS_POLICY.md`
- planejar trilha de auditoria para alteracoes de faixa de temperatura e regras de alerta antes de liberar mais autonomia operacional ao cliente
- aplicar a migration `20260314183000_create_audit_logs` no banco real antes de usar a nova auditoria em producao
- decidir se a proxima etapa de permissao vai incluir:
  - tela de consulta de auditoria no monitor web
- alinhar o `README.md` quando o arquivo for normalizado para UTF-8, porque o patch seguro nao conseguiu editar esse arquivo na etapa anterior
- decidir se a auditoria tera filtros mais completos no frontend:
  - por `entityType`
  - por `entityId`
  - por periodo

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

## Politica de acesso aprovada

Direcao validada neste momento:

- o administrador da plataforma deve ter acesso total a tudo
- o administrador da plataforma tambem deve poder monitorar qualquer cliente
- o administrador do cliente deve poder monitorar o proprio tenant
- o administrador do cliente deve evoluir para poder alterar regras de temperatura e alerta do proprio tenant
- o operador deve permanecer focado em monitoramento
- qualquer ampliacao de autonomia operacional do cliente deve vir acompanhada de auditoria
- a mesma direcao deve ser tratada como regra-mae para todos os modulos da plataforma

## Implementacao mais recente

Estado aplicado em codigo nesta etapa:

- `devices`:
  - criacao e exclusao ficaram restritas ao admin da plataforma
  - client admin pode editar apenas `minTemperature` e `maxTemperature`
  - client admin nao pode mais alterar `name`, `location` ou `clientId`
- `alert-rules`:
  - leitura segue liberada para monitoramento
  - escrita exige `admin`
  - criacao, update e delete agora geram auditoria
- `client-modules`:
  - leitura liberada para o dashboard mesmo com operador
  - escrita restrita ao admin da plataforma
- `clients`:
  - update e delete restritos ao admin da plataforma
- `dashboard web`:
  - escondeu acoes estruturais do client admin
  - manteve monitoramento
  - passou a exibir edicao operacional apenas onde faz sentido

Validacao executada nesta etapa:

```bash
npx prisma generate
npm run build
npm test -- --runInBand src/modules/devices/devices.service.spec.ts src/modules/alert-rules/alert-rules.service.spec.ts
npm run test:e2e -- --runInBand test/devices-tenant.e2e-spec.ts test/alert-rules.e2e-spec.ts test/client-modules.e2e-spec.ts test/devices-crud.e2e-spec.ts
cd apps/web && npm run build
```
