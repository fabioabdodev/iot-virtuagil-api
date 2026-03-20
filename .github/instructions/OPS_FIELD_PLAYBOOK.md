---
description: playbook operacional para eventos criticos de campo em clientes iot
applyTo: '**'
---

# OPS_FIELD_PLAYBOOK.md

## Objetivo

Padronizar resposta operacional para eventos que derrubam telemetria em lote, evitando improviso e retrabalho.

## Escopo

Este playbook cobre:

1. rotacao de `deviceApiKey` por cliente
2. troca de Wi-Fi no estabelecimento

## 1. Rotacao de chave do cliente (`deviceApiKey`)

### Risco

Ao gerar nova chave no `Perfil do cliente`, a chave antiga deixa de ser aceita.
Se os dispositivos ainda estiverem com a chave antiga, podem ficar offline.

### Antes de executar

1. mapear todos os devices do cliente e unidades afetadas
2. confirmar se cada device aceita atualizacao remota de chave
3. definir janela operacional com o cliente
4. preparar contato de contingencia por unidade

### Execucao recomendada

1. gerar nova chave no Monitor
2. atualizar dispositivos por lote (unidade por unidade)
3. validar retorno de leitura por device no painel
4. registrar quais devices ja migraram

### Aceite

- 100% dos devices do cliente com leitura recente
- sem alerta de offline residual apos janela de estabilizacao

### Contingencia

Se parte dos devices nao voltar:

1. abrir lista dos devices offline
2. priorizar unidades criticas
3. executar visita tecnica somente onde nao houver acesso remoto

## 2. Troca de Wi-Fi no estabelecimento

### Risco

Mudanca de SSID/senha derruba conectividade dos devices ate reconfiguracao local/remota.

### Antes da troca de rede

1. solicitar ao cliente data e horario da mudanca
2. listar devices por unidade
3. confirmar canal de suporte ativo durante a janela
4. preparar procedimento de reconexao para o modelo de hardware instalado

### Execucao recomendada

1. cliente altera rede
2. equipe atualiza SSID/senha dos devices (remoto quando possivel)
3. validar retorno online por unidade
4. confirmar leitura recente e estabilizacao dos alertas

### Aceite

- devices voltam para online
- leituras novas entram no historico
- alertas de offline cessam apos reconexao

## 3. Padrao de comunicacao com o cliente

Mensagens operacionais devem ser objetivas:

- o que ocorreu
- qual unidade foi afetada
- qual acao esta em andamento
- previsao de normalizacao

## 4. Melhorias de produto recomendadas

Para reduzir visitas e risco operacional futuro:

1. suporte a chave dupla temporaria (`antiga + nova`) por janela de transicao
2. painel de migracao com devices ainda na chave antiga
3. rotina assistida de troca de Wi-Fi por unidade
4. fallback de conectividade (rede secundaria/4G) para equipamentos criticos
