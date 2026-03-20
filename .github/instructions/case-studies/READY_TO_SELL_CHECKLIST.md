---
description: checklist de fechamento comercial para modulos monitorados no estudo de caso
applyTo: '**'
---

# READY_TO_SELL_CHECKLIST.md

## Objetivo

Garantir fechamento ponta a ponta antes de iniciar venda ativa dos modulos.

## 1. Escopo comercial validado

- cliente do estudo de caso selecionado no Monitor
- modulos contratados e habilitados para o cliente
- fluxo compreensivel para operador sem dependencia de explicacao tecnica longa

## 2. Modulo ambiental validado

- equipamento principal cadastrado e visivel no painel
- leituras normais gravando para os sensores contratados
- regra critica ativa para o sensor priorizado no caso
- evento critico simulado e persistido no historico

## 3. Modulo acionamento validado

- ao menos 1 atuador cadastrado com `id` definitivo
- atuador vinculado ao equipamento correto
- comando `ligar` funcionando
- comando `desligar` funcionando
- historico de comandos visivel no painel

## 4. Integracao n8n validada

- webhooks obrigatorios configurados no ambiente usado no teste
- verificacao estrita com ping respondendo `200`
- execucao correspondente registrada no workflow certo

## 5. Entrega no WhatsApp validada

- mensagem enviada pelo fluxo `API -> n8n -> Evolution -> WhatsApp`
- recebimento confirmado no numero responsavel do caso
- texto final legivel e com contexto suficiente para acao operacional

## 6. Evidencias minimas

- print do painel com leitura/evento critico
- print do painel com comando de acionamento e historico
- print da execucao no n8n
- print da mensagem recebida no WhatsApp

## 7. Criterio de aceite comercial

- operador consegue repetir o roteiro sem apoio tecnico
- fluxo de monitoramento e acao funciona sem erro bloqueante
- demonstracao sustenta narrativa comercial de valor para o cliente

## 8. Regra de continuidade

Ao finalizar cada estudo de caso:

1. anexar evidencias do checklist
2. registrar friccoes de UI/UX encontradas na jornada
3. atualizar handoff com status de pronto para venda
