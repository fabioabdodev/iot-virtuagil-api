# Handoff Atual

Data de referencia: 2026-03-16

## Atualizacao rapida (2026-03-19)

Nota de terminologia ativa:

- para produto e autorizacao, considerar apenas os modulos `ambiental`, `acionamento` e `energia`
- referencias a `temperature` ou `actuation` neste arquivo aparecem como historico tecnico de transicao

## Atualizacao complementar (2026-03-20)

## Atualizacao complementar (2026-03-22)

## Atualizacao complementar (2026-03-23)

Fechamento adicional apos retomada de internet:

- bateria completa dos workflows executada novamente em producao com sucesso:
  - `Carga normal`
  - `Pre-alerta`
  - `Cenario critico`
  - `Ensaio de offline`
  - retorno para `Carga normal`
- pings reais dos webhooks `offline`, `online`, `temperatura` e `acionamento` confirmados com `200`
- ajuste final de copy no workflow de acionamento registrado:
  - humanizacao de `client_id` tecnico para nome amigavel quando `client_name` nao vier
  - `Comando` em `LIGADO`/`DESLIGADO`
  - `Executado em` formatado em `pt-BR` (`America/Sao_Paulo`)
  - remocao de `(<device_id>)` no campo visual de equipamento
- fonte de verdade mantida em:
  - `.github/instructions/N8N_WHATSAPP_PLAYBOOK_2026-03-22.md`

Fechamentos desta rodada para evitar regressao de cadastro e duplicidade:

Referencia obrigatoria para continuidade n8n/WhatsApp desta rodada:

- ler primeiro: `.github/instructions/N8N_WHATSAPP_PLAYBOOK_2026-03-22.md`
- esse arquivo consolida:
  - workflows oficiais
  - campos/fallbacks obrigatorios
  - padrao de `IF Phone Present`
  - regra de mensagens humanizadas
  - ordem oficial de teste do Laboratorio
  - erros recorrentes e correcoes
  - criterios de aceite

- `devices` agora bloqueia cadastro incompleto:
  - `clientId` obrigatorio
  - `name` obrigatorio (com trim)
- `devices` agora bloqueia duplicidade por nome no mesmo cliente
  - comparacao normalizada (sem acento, case-insensitive, `_`/`-` equivalentes)
- `actuators` recebeu a mesma blindagem:
  - `name` obrigatorio (create/update)
  - nome unico por cliente com comparacao normalizada
- `alert-rules` agora exige pelo menos um limite (`minValue` ou `maxValue`)
- `clients` e `users` receberam validacao adicional de campos textuais com trim para nao aceitar payload vazio

Fechamento operacional n8n/Evolution registrado:

- diretriz de validacao de webhook por `POST` (nao por `GET`) consolidada
- resposta de referencia para webhook ativo: `{"message":"Workflow was started"}`
- mapeamento de erros comuns consolidado:
  - `exists:false` no Evolution => numero de destino invalido
  - `undefined` em mensagem => fallback de campos incorreto no template n8n
  - sem execucao no n8n => workflow inativo ou variavel de webhook ausente na API
- ordem oficial de teste do Laboratorio mantida com nomes exatos da UI:
  - `Carga normal`, `Pre-alerta`, `Cenario critico`, `Ensaio de offline`

Regra operacional importante para estudos de caso no Monitor:

- antes de validar fluxo de alertas, remover cadastros duplicados de equipamentos no cliente em foco
- manter apenas os `deviceId` realmente usados no simulador/laboratorio
- se houver duplicado antigo, limpar via botao `Excluir` no UI antes da rodada de testes

Fechamentos e ajustes desta rodada:

- estudo de caso `sabor-serra-restaurante` foi validado novamente com sucesso:
  - ingestao ambiental (`temperature`, `umidade`, `gases`) em `200`
  - leitura critica de gases (`1500 ppm`) persistida
  - acionamento `rele_luzes_salao_01` com `on/off` em `201`
  - historico de comandos retornando no endpoint do atuador
- validacao `n8n` em modo estrito com `PING_OK` para os 3 webhooks esperados
- padrao de documentacao reforcado para evitar erro recorrente de UX:
  - usar nome real dos cards da UI atual
  - nao instruir usuario a procurar um card principal chamado `Ambiental`
- cards corretos do Monitor no layout atual:
  - `Clientes`
  - `Modulos do cliente`
  - `Equipamentos`
  - `Regras de alerta`
  - `Acionamento`
  - `Perfil do cliente`
  - `Laboratorio`
  - `Auditoria`
- melhoria de UX implementada no `Perfil do cliente`:
  - erro de telefone duplicado agora traz nome/id do cliente conflitante
  - campo de telefone com conflito fica destacado em vermelho
  - `Gerar nova chave` agora pede confirmacao explicita antes de rotacionar
- direcao nova validada com usuario para alertas multiunidade:
  - cliente pode ter duas ou mais unidades com gerentes distintos
  - cada unidade pode ter WhatsApp de alerta diferente
  - mensagens de alerta devem citar cliente + unidade + equipamento
  - fase imediata sera roteamento no n8n por `device_id`/`device_location`
  - fase nativa sera modelagem `Client -> Unit -> Device`
- playbook operacional de campo criado para evitar improviso em incidentes de conectividade:
  - arquivo: `.github/instructions/OPS_FIELD_PLAYBOOK.md`
  - cobre rotacao de `deviceApiKey` e troca de Wi-Fi no estabelecimento
- refinamento de template no n8n para conectividade (online + instabilidade):
  - consolidado em expressao unica no workflow `online`
  - com contexto de `cliente + unidade + equipamento`
  - com acentuacao revisada e fallback de datas/campos
  - objetivo: reduzir mensagens com `nao informado` e evitar `Invalid Date`
- preferencia operacional explicita do usuario:
  - nao repetir orientacoes incompletas entre chats
  - nao omitir campos de formulario durante passo a passo
  - manter registro de status de cada bloco para continuidade sem retrabalho
- status atual do estudo multiunidade `cadeia_fria@v1`:
  - dois equipamentos criados no Monitor:
    - `adega_centro_01`
    - `adega_bairro_01`
- backend agora suporta webhook opcional de acionamento para n8n:
  - envs novas:
    - `N8N_ACTUATION_WEBHOOK_URL`
    - `ACTUATION_NOTIFY_ENABLED`
    - `ACTUATION_NOTIFY_SOURCES`
    - `ACTUATION_NOTIFY_COOLDOWN_SECONDS`
  - comportamento padrao seguro:
    - notificacao de acionamento desabilitada por padrao
    - quando habilitada, cooldown por atuador/estado para reduzir ruido
- regra operacional nova consolidada com usuario:
  - ao criar modulo novo, avaliar necessidade de fluxo de alerta no n8n
  - se houver notificacao ao cliente, criar workflow dedicado no n8n
  - incluir URL de webhook de producao no `.env.prod` da VPS antes do go-live
- direcao de produto adicionada para camada comercial de modulos de solucao:
  - objetivo de vender pacotes compostos por itens de modulos base
  - primeira solucao alvo: `cadeia_fria@v1`
  - referencia: `.github/instructions/SOLUTION_MODULES_ARCHITECTURE.md`

Resumo do ponto de parada para retomar no proximo chat/agente:

- caso ativo atual: `sabor-serra-restaurante`
- preferencia explicita do usuario consolidada:
  - conduzir estudo de caso em modo `UI-first` no Monitor
  - fazer cadastros no painel para aprender o fluxo real e mapear melhorias de UI
  - usar API/scripts so para validacao tecnica complementar
- fluxo de validacao ambiental foi executado com sucesso em producao:
  - ingestao em `POST /iot/readings` para `temperature`, `umidade`, `gases`
  - leitura em `GET /readings/:deviceId?sensor=...` com retorno `200`
  - teste critico de gases (`1500 ppm`) persistido no historico
- evidencias de execucao com sucesso confirmadas em terminal PowerShell do usuario
- script operacional criado para evitar repeticao manual:
  - `scripts/lab-sabor-serra.ps1`
  - envia leituras base, consulta historico dos 3 sensores e opcionalmente dispara cenario critico de gases
  - aceita `-Token`, `-DeviceKey`, `-ClientId`, `-DeviceId`, `-TriggerCriticalGas`
- ajuste importante no script:
  - removido bloqueio local de formato de token para deixar a validacao com a propria API
  - corrigida interpolacao de URL de readings no PowerShell

Commits recentes desta etapa:

- `5c596e5` fix(web): trava sensor em seletor e valida catalogo de sensores
- `92e090d` docs(handoff): registrar uso de `;` no PowerShell em vez de `&&`
- `9a14b5b` feat(lab): atualizar comandos de producao e incluir validacao n8n
- `ea7cf63` feat(scripts): adicionar script PowerShell para validacao do caso Sabor Serra
- `6f2ed00` fix(scripts): corrigir URL de readings e validar formato do token JWT
- `056cd4a` fix(scripts): remover bloqueio local de formato de token no lab-sabor-serra

Estado funcional atual do estudo de caso:

- devices confirmados no cliente:
  - `adega_vinhos_01`
  - `camara_fria_01`
  - `freezer_cozinha_01`
- modulo ambiental e regras ja criados pelo usuario
- ingestao e historico de sensores funcionando

Pendencia imediata para fechar demonstracao comercial:

1. no Monitor, confirmar que o atuador existe com `id` exato `rele_luzes_salao_01`
2. se nao existir, cadastrar no painel e vincular em `adega_vinhos_01`
3. repetir acionamento `on/off` e validar historico no painel
4. validar disparo visual no painel para regra critica de gases
5. confirmar entrega no WhatsApp (alerta correspondente)

Observacoes operacionais que evitaram retrabalho:

- no PowerShell local, variaveis de sessao (`$token`, `$key`) se perdem ao abrir novo terminal
- sempre que reiniciar terminal, recarregar credenciais antes dos testes
- usar `;` para encadear comandos (nao usar `&&` neste ambiente)
- placeholders (`SEU_TOKEN...`, `SUA_DEVICE_KEY`) causaram falhas recorrentes; preferir copiar valor real do header `Authorization` no DevTools

## Direcao do produto

O projeto deixou de ser focado apenas em freezer e esta evoluindo para uma plataforma de automacao IoT da Virtuagil.

Identidade tecnica atual escolhida:

- API: `iot-virtuagil-api`
- Web: `iot-virtuagil-web`
- Namespace de imagens: `ghcr.io/fabioabdodev/iot-virtuagil-api`

## O que foi concluido

- modulo `ambiental` (item `temperatura`) validado com cobertura e2e
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
- modulo `acionamento` ganhou rotinas recorrentes por tenant:
  - CRUD em `GET/POST/PATCH/DELETE /actuators/schedules`
  - execucao automatica por janela semanal
  - auditoria em create/update/delete
  - dashboard com painel de rotinas para admin do cliente
- fluxo de migration em producao preparado:
  - imagem da API passou a carregar `prisma` CLI no container final
  - workflow SSH roda `npx prisma migrate deploy` antes do `docker stack deploy`
  - passo manual para Portainer documentado em `.github/instructions/PRODUCTION_MIGRATIONS.md`
- monitor web validado em producao com admin global criado manualmente no banco
- painel de acesso do monitor web refinado:
  - campos maiores
  - login e filtro separados visualmente
  - CTA mais legivel para autenticacao e selecao de tenant
- imagem final da API endurecida para operacao:
  - `openssl` instalado no container
  - pasta `scripts/` copiada para permitir seed e utilitarios em runtime
- login do monitor preparado para Cloudflare Turnstile:
  - backend ja aceitava `turnstileToken`
  - frontend passou a renderizar widget quando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` estiver definido
  - deploy web agora aceita `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no build
- dashboard ganhou header fixo:
  - identidade constante da Virtuagil
  - avatar/sessao do usuario
  - tenant atual
  - links rapidos para secoes principais
- dashboard web passou a usar `app/loading.tsx` com loading nativo do App Router e spinner simples em Tailwind
- widget do Turnstile no frontend recebeu endurecimento:
  - evita crash da pagina quando o script/widget falha
  - usa render por referencia de elemento em vez de seletor por `id`
  - nao remove mais o widget logo apos o primeiro `render`
  - nao faz mais `reset()` indevido no primeiro carregamento
- login com Cloudflare Turnstile foi validado em producao em `15/03/2026`
- regra-mae de produto consolidada:
  - a plataforma cria a estrutura inicial do cliente
  - o admin do cliente pode ajustar regras operacionais autorizadas
  - essa mesma logica deve valer para todos os modulos futuros

## Validacao feita

Comando executado com sucesso:

```bash
npm run test:e2e -- --runInBand
npm run build
cd apps/web; npm run build
npm run test:e2e -- --runInBand test/actuators.e2e-spec.ts
npx prisma generate
```

Resultado esperado no ponto atual:

- `13/13` suites passando
- `39/39` testes passando
- build do backend concluido com sucesso
- build do frontend concluido com sucesso
- suite de `actuators.e2e` com `9/9` testes passando apos incluir polling e `ack` de runtime IoT
- suite de `actuators.e2e` com `11/11` testes passando apos incluir rotinas de acionamento

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

- manter a stack salva no Portainer e o `.env.prod` da VPS alinhados apos mudancas manuais
- decidir quando remover com seguranca a pasta legada `/opt/iot-freezer-api` da VPS depois de confirmar que nenhum script manual ainda depende dela
- avaliar em janela futura se vale girar `TURNSTILE_SECRET_KEY`, `AUTH_SECRET`, `DEVICE_API_KEY` e a credencial/conexao do banco expostas apenas em contexto operacional controlado
- confirmar que a API publicada usa Prisma Client gerado com `binaryTargets = ["native", "debian-openssl-3.0.x"]`, evitando o erro de runtime em containers Node 20 slim
- configurar no ambiente do projeto `SUPABASE_PROJECT_REF` e `CONTEXT7_API_KEY` quando o uso de MCP no VS Code for desejado
- alinhar qualquer evolucao de firmware em `iot-virtuagil-firmware/`, nao mais dentro deste repositorio
- evoluir o produto para refletir a politica de acesso registrada em `.github/instructions/ACCESS_POLICY.md`
- planejar trilha de auditoria para alteracoes de faixa de temperatura e regras de alerta antes de liberar mais autonomia operacional ao cliente
- aplicar a migration `20260314183000_create_audit_logs` no banco real antes de usar a nova auditoria em producao
- decidir se a auditoria tera filtros mais completos no frontend:
  - por `entityType`
  - por `entityId`
  - por periodo

## Escopo local ignorado

- `institucional-site/` e um escopo local do futuro site institucional da Virtuagil
- essa pasta deve ser tratada como outro projeto e possui regras/material proprios em `institucional-site/README.md`
- ela nao deve guiar tarefas deste backend/dashboard sem pedido explicito
- `iot-virtuagil-firmware/` e um escopo local do futuro projeto separado de firmware
- essa pasta deve ser tratada como outro projeto e possui material proprio em `iot-virtuagil-firmware/README.md` e `iot-virtuagil-firmware/handoff/HANDOFF.md`
- as regras de hardware, runtime e bancada foram movidas para essa pasta
- `estudos de caso/` na raiz do projeto e uma pasta local que nao entra no Git
- ela concentra material de proposta comercial, onboarding, implantacao, validacao operacional e revisao de UX
- ao receber tarefa ligada a cliente real, demonstracao, jornada de uso ou estudo de caso, consultar primeiro:
  - `estudos de caso/README.md`
  - o arquivo especifico do cliente, por exemplo `estudos de caso/cuidare.md`
- o objetivo dessa pasta e permitir simulacoes de chegada ao cliente no contexto real de implantacao, ajudando a conhecer as telas atuais do sistema e a sugerir melhorias de UI/UX com base nessa experiencia guiada
- esse material deve orientar analise de UX e operacao, mas nao substitui a documentacao tecnica versionada em `.github/instructions/`
- direcao adicional consolidada a partir dos estudos de caso:
  - novos modulos do dashboard devem nascer com linguagem orientada ao cliente
  - evitar expor `tenant`, `clientId` e outros termos internos como copy principal da interface
  - preferir `cliente`, `conta`, `equipamento`, `codigo interno` e `painel` quando houver equivalente claro para negocio
- direcao operacional consolidada para a VPS:
  - em ciclos com muitos deploys, crescimento de disco tende a vir de imagens Docker acumuladas
  - a primeira verificacao deve ser `docker system df`
  - a limpeza inicial mais segura para imagens antigas e `docker image prune -a`
  - evitar `docker volume prune` sem revisar persistencia de dados
  - no terminal PowerShell deste ambiente, evitar `&&` (gera erro de parser)
  - para encadear comandos no PowerShell local, usar `;`

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
- `actuation schedules`:
  - criacao estrutural de atuadores segue com o admin da plataforma
  - admin do cliente pode criar, editar, pausar, ativar e excluir rotinas do proprio tenant
  - um cron no backend aplica `on/off` automaticamente conforme dia, horario e timezone
  - create, update e delete de rotinas geram auditoria
- `producao`:
  - deploy via SSH passou a executar `prisma migrate deploy` antes do rollout
  - cenarios com Portainer webhook exigem migration manual previa
  - em ambiente IPv4 com Supabase, o `session pooler` foi o caminho funcional para `DATABASE_URL` e `DIRECT_DATABASE_URL`
- `monitor web`:
  - painel de acesso inicial ficou mais usavel para login real em producao
  - ainda vale revisar UX geral depois dos estudos de caso
  - Turnstile foi ligado apenas no login publico; formularios internos autenticados nao usam captcha nesta fase
  - header fixo passou a dar mais contexto de sessao e navegacao entre secoes

Validacao executada nesta etapa:

```bash
npx prisma generate
npm run build
npm test -- --runInBand src/modules/devices/devices.service.spec.ts src/modules/alert-rules/alert-rules.service.spec.ts
npm run test:e2e -- --runInBand test/devices-tenant.e2e-spec.ts test/alert-rules.e2e-spec.ts test/client-modules.e2e-spec.ts test/devices-crud.e2e-spec.ts
cd apps/web; npm run build
npx prisma generate
npm run test:e2e -- --runInBand test/actuators.e2e-spec.ts
```

## Registro final desta rodada

- em `15/03/2026` o login com Cloudflare Turnstile foi validado em producao
- a causa principal no frontend estava no componente `apps/web/components/ui/turnstile-widget.tsx`
- foram corrigidos dois comportamentos que impediam a geracao do token:
  - `reset()` indevido no primeiro carregamento
  - remocao acidental do widget logo apos o `render`
- o deploy final validado para esse ajuste foi publicado apos os commits de estabilizacao do widget
- pendencia operacional que ficou aberta para a proxima sessao:
  - girar a `TURNSTILE_SECRET_KEY` no Cloudflare e atualizar a VPS, porque a chave atual foi exposta em conversa operacional
- em `15/03/2026` a base local foi revalidada apos a estabilizacao recente:
  - `npm run build` ok no backend
  - `cd apps/web; npm run build` ok no frontend
  - `npm test -- --runInBand` ok com `12/12` suites e `42/42` testes
  - `npm run test:e2e -- --runInBand` ok com `14/14` suites e `50/50` testes
- os testes de configuracao de ambiente foram alinhados ao requisito atual de `AUTH_SECRET`
- direcao de frontend registrada para formularios:
  - adotar `React Hook Form + Zod` como padrao progressivo
  - evitar refatoracao geral sem necessidade
  - priorizar esse padrao primeiro nos formularios de cliente e em fluxos com validacao mais rica
- em `16/03/2026` foi identificado em producao que a stack salva no Portainer ainda misturava nomes antigos do rebranding:
  - `ghcr.io/fabioabdodev/iot-freezer-api/*`
- em `16/03/2026` foi validado que o aumento de disco na VPS nao vinha de commits Git:
  - `docker system df` mostrou `91.1GB` ocupados por imagens
  - `docker image prune -a` reduziu o uso total do disco de `103G` para `26G`
  - proximas investigacoes de disco devem comecar por imagens Docker antigas de deploy
  - `ghcr.io/fabioabdodev/iot-virtuagil-api/*`
- em `16/03/2026` a producao foi revalidada apos ajustes operacionais no Portainer:
  - `update_config.order` ficou em `stop-first` para `api` e `web`
  - `/health` confirmou `status: ok`
  - `release` foi alinhado para `latest`
  - `buildTime` foi alinhado manualmente no deploy para refletir a publicacao atual
- em `16/03/2026` a direcao de UX guiada por estudo de caso foi consolidada no dashboard:
  - linguagem da UI ficou menos tecnica e mais orientada a cliente
  - `tenant` deixou de aparecer como copy principal
  - `clientId` passou a aparecer como `codigo interno` quando necessario
  - `device/devices` foram traduzidos para `equipamento/equipamentos` nos principais fluxos visiveis
  - partes de `acionamento` passaram a usar copy mais proxima de operacao real, como `ponto de acionamento` e `recurso`
- em `16/03/2026` essa direcao tambem foi registrada para proximos agentes:
  - novos modulos devem nascer com linguagem orientada ao cliente
  - evitar copiar termos internos de arquitetura para a interface
  - em VPS com muitos deploys, investigar primeiro imagens Docker antigas antes de suspeitar de Git ou banco
- em `16/03/2026` foram publicados no `main` os blocos locais desta rodada:
  - refinamento do painel de atividade operacional
  - limpeza de linguagem tecnica no dashboard
  - onboarding guiado de cliente, equipamento e regra
  - melhoria de copy no laboratorio, auditoria, historico, acionamento e estados vazios
  - registro operacional sobre limpeza de imagens Docker na VPS
- em `16/03/2026` a direcao de trabalho com `estudos de caso/` foi consolidada de forma mais pratica:
  - cada novo caso deve virar um roteiro real de implantacao dentro do dashboard
  - esse roteiro deve ensinar a ordem de uso da plataforma quando um cliente chega
  - o objetivo nao e apenas revisar copy, mas mostrar:
    - o que cadastrar primeiro
    - o que habilitar
    - qual equipamento estruturar
    - qual regra criar
    - como ensaiar a demonstracao sem hardware
  - essa mesma simulacao deve ser usada para revisar layout, onboarding e navegacao
- em `16/03/2026` o dashboard ganhou uma primeira base concreta dessa direcao:
  - painel guiado do caso `Cuidare`
  - bloco de proximo passo da conta
  - contexto mais humano da conta em foco em header, prontidao, atividade, auditoria, acionamento e laboratorio
- ponto de retomada recomendado para o proximo chat:
  - continuar os estudos de caso em `estudos de caso/`
  - transformar cada novo caso em roteiro pratico de implantacao dentro da UI
  - percorrer a plataforma como se o cliente tivesse chegado agora
  - registrar bugs, ajustes de copy, friccoes de onboarding, lacunas de fluxo e melhorias visuais por tela
  - manter `HANDOFF.md`, `PROJECT_RULES.md` e `estudos de caso/README.md` atualizados sempre que essa direcao evoluir
- a API nova tambem falhou ao subir com:
  - `PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "debian-openssl-3.0.x"`
- em `16/03/2026` o `stack.prod.yml` foi ajustado para usar `update_config.order = stop-first` em `api` e `web`
- motivacao:
  - reduzir risco de `exit code 137` em VPS pequena durante rollout com duas replicas temporarias
  - aceitar alguns segundos de indisponibilidade no deploy em troca de mais previsibilidade operacional
- a correcao aplicada no repositorio foi adicionar `binaryTargets = ["native", "debian-openssl-3.0.x"]` em `prisma/schema.prisma`
- no dashboard, o cadastro de clientes foi reorganizado para ficar menos ruidoso:
  - bloco `Novo cliente` em accordion
  - separacao visual entre `Dados principais`, `Contatos` e `Financeiro e observacoes`
  - mensagem de sucesso apos criar cliente
- o painel de auditoria do dashboard agora aceita filtros por `entityType`, `entityId` e periodo recente
  - isso facilita investigar alteracoes operacionais sem depender apenas da lista mais recente
- o painel de prontidao comercial agora traduz a implantacao em fases operacionais mais concretas
  - contratacao e escopo
  - preparacao da plataforma
  - simulacao e alinhamento operacional
  - instalacao tecnica e aceite
- o laboratorio do dashboard agora tambem orienta demonstracao guiada por fases
  - entrar no tenant
  - mostrar operacao normal
  - simular evento real
  - fechar com proximo passo de implantacao
- a direcao operacional atual de notificacao ficou consolidada:
  - dashboard web para monitoramento e historico
  - `WhatsApp` como canal principal de alerta ao cliente
  - fluxo ponta a ponta esperado: `API -> n8n -> Evolution -> WhatsApp`
- o painel de clientes agora ajuda no onboarding guiado de estudo de caso
  - mostra padrao de `name`, `clientId` e `deviceId`
  - resume o primeiro fluxo sugerido: criar tenant, abrir dashboard e estruturar o primeiro device
- proximo passo recomendado:
  - executar os estudos de caso em conjunto e transformar o dashboard em um playbook progressivo de implantacao por cliente
- em `17/03/2026` foi feita uma rodada longa de diagnostico no cadastro de equipamento do dashboard:
  - em producao, o formulario de `Novo equipamento` ficava preso em `Enviando equipamento...`
  - o backend de `POST /devices` foi validado por diagnostico interno no monitor
  - a API tambem recebeu timeout e logs explicitos para `create`, para evitar travamento silencioso
  - foi confirmado que o gargalo nao estava na API em si, mas no fluxo do formulario do dashboard
- em `17/03/2026` o fluxo de criacao de equipamento foi estabilizado no frontend:
  - o cadastro deixou de depender da mutacao anterior que estava causando comportamento inconsistente
  - a criacao passou a usar chamada direta de API no fluxo do formulario
  - o formulario foi simplificado para validar com `zod` via leitura direta dos campos e submit por botao
  - o feedback de erro do formulario passou a aparecer de forma explicita
  - o botao `Atualizar` foi separado do `isFetching` automatico da query, evitando loading enganoso
- em `17/03/2026` o monitor voltou a criar equipamento com sucesso em producao:
  - mensagem validada: `Equipamento Freezer Vacinas 01 criado com sucesso.`
  - o diagnostico interno tambem respondeu com sucesso:
    - `Diagnostico concluido: a API criou e removeu um equipamento temporario.`
- conclusao registrada para proximos agentes:
  - o problema nao era `useEffect`
  - o problema tambem nao era ausencia de `zod`
  - o ponto critico estava no fluxo de submissao do formulario no frontend
  - a validacao segue existindo em duas camadas:
    - frontend com `zod`
    - backend com `class-validator` + `ValidationPipe`
- commits relevantes desta rodada:
  - `42486a2` - `stabilize device creation feedback flow`
  - `9d217e3` - `add device create timeout diagnostics`
  - `bbde8ce` - `add in-app device creation diagnostic`
  - `8b061eb` - `show device form submit errors`
  - `8cc3e91` - `use direct api call for device creation`
  - `76bba3d` - `simplify device form submission flow`
  - `09accea` - `separate manual device refresh state`
- ponto exato de retomada recomendado para a proxima sessao:
  - caso `Cuidare`
  - status atual:
    - cliente selecionado
    - modulo `ambiental` com item `temperatura` habilitado
    - primeiro equipamento criado
  - proximo passo operacional:
    - criar a primeira regra de alerta do `Freezer Vacinas 01`
- em `17/03/2026` a autenticacao de runtime IoT evoluiu de chave global para chave por cliente com fallback de transicao:
  - `Client` ganhou o campo `deviceApiKey`
  - novos clientes agora recebem `deviceApiKey` automaticamente no backend
  - atualizacao de cliente agora pode regenerar essa chave
  - `POST /iot/temperature` passou a aceitar `client_id` opcional no payload
  - no ingest, a ordem de validacao agora e:
    - `deviceApiKey` do cliente informado em `client_id`
    - senao `deviceApiKey` do cliente dono do `device`
    - senao fallback para `DEVICE_API_KEY` global
  - `GET /iot/actuators` e `POST /iot/actuators/:id/ack` seguem a mesma ideia:
    - usam a chave do cliente dono do device/atuador
    - mantem fallback para `DEVICE_API_KEY` global enquanto a base antiga existir
- o simulador IoT tambem foi alinhado a essa mudanca:
  - quando `--client-id` for informado, ele agora envia `client_id` no payload
  - o argumento correto para trocar o host da API continua sendo `--url`, nao `--base-url`
- o laboratorio do dashboard foi corrigido para nao induzir a erro:
  - comandos de simulacao passaram a usar `--url https://api-monitor.virtuagil.com.br`
  - no caso `Cuidare`, os comandos agora usam `freezer_vacinas_01`
  - quando a conta possui `deviceApiKey`, o laboratorio ja renderiza a chave real no comando copiado
- o perfil do cliente agora expoe a `deviceApiKey` operacional:
  - campo somente leitura
  - botao para copiar
  - botao para gerar nova chave
- commit relevante desta rodada:
  - `f09598b` - `fix simulation lab production commands`
- ponto de retomada atualizado:
  - validar em producao a migration `20260317173000_add_client_device_api_key`
  - abrir o perfil da `Cuidare`
  - copiar a `deviceApiKey` da conta
  - disparar simulacao critica com:
    - `freezer_vacinas_01`
    - `--url https://api-monitor.virtuagil.com.br`
    - chave da propria conta
  - confirmar execucao no `n8n` e entrega no `WhatsApp`
- retomada recomendada para o proximo chat:
  - considerar o workflow `IoT - Alerta de Temperatura - WhatsApp` no `n8n` como base ativa
  - considerar a integracao com Evolution validada manualmente na versao `2.3.7`
  - validar se a mensagem real sai da plataforma, nao apenas do teste manual do `n8n`
  - revisar o bloco `Laboratorio` depois do deploy mais recente
  - simplificar ainda mais a UX do laboratorio para cenarios prontos:
    - operacao normal
    - pre-alerta
    - cenario critico
    - offline
  - evitar voltar a comandos com `localhost` ou devices genericos quando a conta em foco for `Cuidare`
- em `17/03/2026` o caso `Cuidare` fechou a primeira validacao ponta a ponta do alerta real saindo da plataforma:
  - perfil do cliente foi atualizado com `WhatsApp` contendo `55`
  - `deviceApiKey` da conta foi gerada e usada no laboratorio
  - simulacao critica da conta `cuidare-vacinas` foi executada com `freezer_vacinas_01`
  - a API recebeu leituras criticas em producao com sucesso
  - o workflow `IoT - Alerta de Temperatura - WhatsApp` no `n8n` recebeu execucoes reais da plataforma
  - a Evolution aceitou o envio e o `WhatsApp` chegou no telefone correto do cliente
- aprendizados operacionais importantes desta validacao:
  - o fluxo real depende de numero salvo com `55`; antes disso a Evolution tratava o destino como inexistente
  - o backend foi corrigido para normalizar telefone brasileiro com `55` ao salvar clientes
  - no `n8n`, o campo `recipient_phone` precisava usar `recipient_phone`, nao `device_id`
  - a mensagem inicial chegou feia para uso real e foi refinada para um tom mais urgente e objetivo
  - houve atraso perceptivel entre o sucesso do workflow no `n8n`/Evolution e a entrega no `WhatsApp`
- alerta operacional que nao pode se perder:
  - cliente nao pode ficar sem receber alerta critico
  - sucesso no `HTTP Request` ou status `PENDING` na Evolution nao deve ser tratado como entrega confirmada
  - sempre que validar alerta critico, confirmar tambem a chegada efetiva no `WhatsApp`
  - a latencia observada nesta rodada deve continuar sendo monitorada em testes futuros
- proximo passo recomendado apos esta validacao:
  - criar workflow de `offline` seguindo o padrao do alerta de temperatura
  - validar se o atraso de entrega tambem aparece no alerta de `offline`
  - revisar se o dashboard/laboratorio precisam destacar melhor que `n8n` e Evolution podem ter atraso operacional antes da chegada no cliente
- em `17/03/2026` o fluxo de `offline` tambem foi validado ponta a ponta:
  - workflow `IoT - Device Offline - WhatsApp` criado no `n8n`
  - webhook de producao `https://webhookworkflow.virtuagil.com.br/webhook/device-offline` validado
  - payload manual publicado acionou o workflow corretamente
  - `WhatsApp` chegou ao destinatario final
- detalhe importante descoberto nesta etapa:
  - a primeira mensagem de `offline` chegou com nome do equipamento como `undefined`
  - a causa provavel foi depender de `device_label` recem-criado no mesmo `Edit Fields`
  - direcao recomendada:
    - montar o nome humano diretamente na expressao de `message`
    - nao depender de campo intermediario quando o comportamento do `n8n` gerar inconsistencias
- estado atual recomendado para continuidade:
  - `temperatura` validado ponta a ponta
  - `offline` validado ponta a ponta
  - backend preparado para webhook de recuperacao `offline -> online`
  - proximo foco deve migrar de integracao basica para:
    - qualidade da mensagem
    - clareza do laboratorio
    - reducao de atrito de demonstracao comercial
- em `17/03/2026` foi adicionada a base de backend para alerta de recuperacao:
  - quando um device que estava `offline` volta a enviar leitura, a ingestao agora pode enfileirar `device_back_online`
  - a nova integracao usa `N8N_ONLINE_WEBHOOK_URL`
  - motivacao operacional:
    - evitar que o cliente se apavore com uma queda breve de internet ou energia local
    - sinalizar por `WhatsApp` que o equipamento voltou a comunicar
  - proximo passo pratico desta frente:
    - criar no `n8n` o workflow do webhook `device-online`
    - validar mensagem humanizada de recuperacao no mesmo padrao de temperatura e offline
- em `17/03/2026` a politica de conectividade foi endurecida para reduzir ruido operacional:
  - a contagem de oscilacao agora considera transicoes de conectividade em janela curta, nao apenas recuperacoes isoladas
  - quando o limiar configurado e atingido, o backend envia `device_connectivity_instability`
  - enquanto esse alerta estiver em cooldown, novos `device_offline` e `device_back_online` do mesmo equipamento ficam silenciosos
  - isso aproxima o comportamento esperado da operacao real:
    - queda real: avisa `offline`
    - recuperacao real: avisa `voltou a comunicar`
    - sobe e cai varias vezes: avisa `ha instabilidade na conectividade`
- a regra de conectividade foi refinada para evitar ruido:
  - o backend agora pode detectar repeticao curta de `offline -> online`
  - quando isso passar do limiar configurado na janela configurada, a fila pode emitir `device_connectivity_instability`
  - objetivo:
    - avisar instabilidade real de internet/conectividade
    - evitar encher o cliente com uma sequencia cansativa de alertas redundantes
  - variaveis novas:
    - `CONNECTIVITY_FLAP_WINDOW_MINUTES`
    - `CONNECTIVITY_FLAP_THRESHOLD`
    - `CONNECTIVITY_INSTABILITY_ALERT_COOLDOWN_MINUTES`


## Incidente de variaveis em producao (19/03/2026)

Resumo do que aconteceu:

- o monitor apresentou `Failed to fetch` no login porque a API ficou indisponivel em alguns rollouts
- em ciclos anteriores, a API caiu no boot com:
  - `N8N_ONLINE_WEBHOOK_URL: Invalid URL`
  - `DATABASE_URL e obrigatoria`
- o problema se repetia por combinacao de:
  - conflito entre valores da stack no Portainer e `.env.prod` na VPS
  - uso de `source .env.prod` com URL contendo `&` sem aspas, quebrando export no shell
  - deploys com ambiente parcial durante rollout

Sinais de diagnostico que confirmaram a causa:

- `docker service inspect iot-monitor_api ...` mostrava env efetivo diferente do `.env.prod`
- `N8N_ONLINE_WEBHOOK_URL` aparecia vazia no servico, mesmo definida no arquivo
- `DATABASE_URL` com query string era truncada quando nao estava entre aspas no `.env.prod`

Correcoes aplicadas no repositorio:

- `998039a`:
  - schema de ambiente passou a tratar webhook vazio/espacos como `undefined` para evitar queda no boot
- `ea0420c`:
  - workflow de deploy ganhou validacoes defensivas:
    - bloqueia chaves duplicadas no `.env.prod`
    - valida formato de URLs opcionais
    - valida `DATABASE_URL` / `DIRECT_DATABASE_URL`
    - garante `DIRECT_DATABASE_URL` quando `DATABASE_URL` for `prisma://`

Padrao operacional que ficou validado:

- fonte unica de verdade para variaveis: `/opt/iot-virtuagil-api/.env.prod`
- evitar editar env diretamente no Portainer para nao divergir do fluxo SSH
- antes do `docker stack deploy`, sempre:
  - `set -a`
  - `. ./.env.prod`
  - `set +a`

Formato estavel validado para banco no estado atual:

- `DATABASE_URL` (pooler 6543) com parametros:
  - `?pgbouncer=true&connection_limit=1`
- `DIRECT_DATABASE_URL` (pooler 5432) como fallback estavel no ambiente atual
- importante:
  - quando `DATABASE_URL` tiver `&`, manter a linha entre aspas simples no `.env.prod`
  - exemplo:
    - `DATABASE_URL='postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1'`

Comando de deploy seguro (passo a passo para iniciante) validado em producao:

```bash
cd /opt/iot-virtuagil-api

set -e

echo "[1/6] Validando duplicidade de chaves..."
DUP="$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.prod | cut -d= -f1 | sort | uniq -d || true)"
if [ -n "$DUP" ]; then
  echo "ERRO: chaves duplicadas no .env.prod:"
  echo "$DUP"
  exit 1
fi

echo "[2/6] Validando variaveis obrigatorias..."
for K in DATABASE_URL DIRECT_DATABASE_URL N8N_ONLINE_WEBHOOK_URL N8N_OFFLINE_WEBHOOK_URL N8N_TEMPERATURE_ALERT_WEBHOOK_URL; do
  V="$(grep -m1 "^$K=" .env.prod | cut -d= -f2- || true)"
  if [ -z "$V" ]; then
    echo "ERRO: $K vazio/ausente"
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
```

Status final deste incidente:

- deploy executando com health `ok`
- sem ocorrencias novas de:
  - `DATABASE_URL e obrigatoria`
  - `Invalid URL`
  - `prepared statement does not exist`
  - `PrismaClientUnknownRequestError`

## Rodada comercial (19/03/2026)

- fluxo de alerta `offline -> online` da conta `cuidare-vacinas` validado novamente em producao
- simulacao aceita com `status=200` para `freezer_vacinas_01`
- `WhatsApp` confirmou mensagem de recuperacao (`equipamento novamente online`)
- direcionamento para proximo chat:
  - manter foco em fechamento do modulo de acionamento (`on/off + historico`) para consolidar gate comercial
- script util criado para proximas rodadas: `scripts/deploy-safe.sh`
  - uso na VPS: `bash /opt/iot-virtuagil-api/scripts/deploy-safe.sh`

## Registro consolidado para novo chat agent (19/03/2026 - fim do dia)

### 1) Modelo de negocio e modulos

- a plataforma migrou de modulos fixos para **categoria + itens dinamicos**
- categorias atuais:
  - `ambiental` (`temperatura`, `umidade`, `gases`)
  - `acionamento` (`rele`, `status_abertura`, `tempo_aberto`)
  - `energia` (`corrente`, `tensao`, `consumo`)
- contratacao e acesso por item ja estão ativos no produto
- historico do device no frontend foi atualizado para leitura por sensor dinamico (nao apenas temperatura)

### 2) Seguranca de credenciais no frontend

- `deviceApiKey` no perfil do cliente:
  - mascarada por padrao
  - botao de copiar
  - botao olho para mostrar/ocultar
- laboratorio:
  - comandos nao exibem chave real por padrao (`SUA_CHAVE_DEVICE`)
  - copia segura com chave no clipboard
  - token admin mascarado com olho e copia segura

### 3) Fluxo de usuarios, primeiro acesso e recuperacao de senha

- admin nao precisa mais criar senha de terceiros
- fluxo implementado:
  - gerar link de primeiro acesso por usuario (`/users/:id/password-setup-link`)
  - `POST /auth/password/forgot`
  - `GET /auth/password/reset/validate`
  - `POST /auth/password/reset`
- token de reset:
  - uso unico
  - expira por TTL
  - tabela dedicada `PasswordResetToken`
- vale para qualquer perfil da conta (`admin` e `operator`)
- tela de login recebeu:
  - `esqueci minha senha`
  - `definir nova senha`
  - orientacao de spam/promotions
  - fallback de link quando permitido por configuracao

### 4) Variaveis novas e deploy de producao

Variaveis adicionadas:

- `AUTH_PASSWORD_RESET_TTL_MINUTES`
- `AUTH_PASSWORD_RETURN_LINK_IN_RESPONSE`
- `WEB_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Importante:

- houve incidente em que `.env.prod` estava correto, mas o container nao recebia as novas vars
- causa: `deploy/swarm/stack.prod.yml` nao repassava as novas variaveis
- correcao ja aplicada no repo (`e5a1c2f`)
- na VPS atual `/opt/iot-virtuagil-api` **nao e clone git**
  - `git pull` ali falha com `not a git repository`
  - ajustes no `stack.prod.yml` local podem precisar ser manuais

Validacao operacional ja confirmada em producao:

- `docker service inspect iot-monitor_api ...` passou a mostrar:
  - `AUTH_PASSWORD_RESET_TTL_MINUTES=60`
  - `AUTH_PASSWORD_RETURN_LINK_IN_RESPONSE=false`
  - `WEB_APP_URL=https://monitor.virtuagil.com.br`
  - `RESEND_API_KEY=`
  - `RESEND_FROM_EMAIL=no-reply@virtuagil.com.br`

### 5) Estado de envio de e-mail (Resend)

- modo atual recomendado e em uso: **manual/fallback**
  - `RESEND_API_KEY` vazio
  - link gerado/copiado pelo painel
- quando quiser envio automatico:
  - preencher `RESEND_API_KEY`
  - manter `RESEND_FROM_EMAIL` valido no dominio configurado
  - redeploy da stack

### 6) Pastas locais fora de versionamento

Pastas abaixo estao no `.gitignore` (escopo local, nao versionadas):

- `estudos de caso/`
- `institucional-site/`
- `iot-virtuagil-firmware/`

Conteudo novo criado localmente em `estudos de caso/`:

- `restaurante-freezer-porta-luzes.md`
- `clube-sauna-quadras.md`

Esses casos sao para treino operacional (ficticio) e podem virar base de onboarding de cliente real.

### 7) Alerta/n8n - utilitario de checagem

- script adicionado no projeto principal:
  - `scripts/check-n8n-alerts.mjs`
- objetivo:
  - verificar se webhooks `N8N_*` estao configurados
  - opcionalmente enviar ping de teste por evento
- estado no momento deste registro:
  - script criado
  - recomendado padronizar uso com script npm (`alerts:check:n8n`) e documentar no README

### 8) Proximo passo recomendado para continuidade

1. consolidar `alerts:check:n8n` no `package.json` e README (com modo `--strict`)
2. executar rodada guiada de venda assistida com um dos estudos ficticios
3. no primeiro cliente real:
   - receber bloco de contexto (nome, clientId, modulos/itens, devices, regras, contatos, usuarios)
   - abrir estudo de caso dedicado e conduzir onboarding no painel

## Registro Jade (2026-03-23)

Objetivo consolidado com usuario:

- criar assistente virtual comercial da Virtuagil chamado `Jade`
- operar via WhatsApp, com OpenAI, Supabase, n8n e Evolution
- suportar texto, imagem e audio
- bloquear video
- usar buffer de mensagens para comportamento humano (evitar resposta por mensagem quebrada)
- usar memoria persistente em Postgres/Supabase
- usar base de conhecimento em Google Docs via gateway

Entregas registradas:

- workflow `Jade` em JSON unico:
  - `tmp/workflows-fix/fixed/Virtuagil - Jade - Assistente Virtual - FIXED.json`
- migration oficial de schema Jade:
  - `prisma/migrations/20260324193000_create_jade_tables/migration.sql`
- documentos base locais para copiar/colar no Google Docs:
  - `docs/jade-knowledge/README.md`
  - `docs/jade-knowledge/JADE_SOBRE_EMPRESA.md`
  - `docs/jade-knowledge/JADE_PRODUTOS_E_PLANOS.md`
  - `docs/jade-knowledge/JADE_PRECOS_E_PROMOCOES.md`

Decisoes operacionais importantes:

- bloquear mensagens de grupo (`@g.us` / `isGroup`) e nao responder grupo
- bloquear video e solicitar texto/audio/imagem
- fluxo com orquestrador + subrotas (`sales`, `followup`, `human_support`)
- follow-up e handoff humano persistidos no Supabase
- memoria de conversa via tabelas (`jade_conversations`, `jade_messages`)
- buffer rapido de entrada com Redis antes da inferencia do agente

Variaveis esperadas no n8n para Jade:

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EVOLUTION_BASE_URL`
- `EVOLUTION_INSTANCE`
- `EVOLUTION_API_KEY`
- `JADE_DOCS_GATEWAY_URL`
- `JADE_DOCS_GATEWAY_KEY`
- `JADE_OPENAI_MODEL`

Processo oficial para manter conteudo da Jade:

1. atualizar arquivos em `docs/jade-knowledge/`
2. copiar/colar para os docs correspondentes no Google Docs
3. manter `versao` e `ultima_atualizacao` no topo
4. em mudanca comercial sensivel, atualizar primeiro precos/promocoes

Diretriz para proximos agentes:

- nao inventar preco/condicao comercial fora de docs
- se faltarem dados em docs, direcionar para suporte humano
- sempre validar fluxo sem responder grupos

Atualizacao operacional (2026-03-24):

- tabelas `jade_*` foram consolidadas em migration Prisma oficial
- o arquivo local `tmp/workflows-fix/fixed/jade-supabase-schema.sql` foi removido para evitar dupla-fonte de verdade
- regra reforcada:
  - schema de banco deve ser mantido via Prisma migration
  - workflow final deve ser preservado na pasta `tmp/workflows-fix/fixed/`
