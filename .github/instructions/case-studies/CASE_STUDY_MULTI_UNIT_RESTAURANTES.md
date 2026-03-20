---
description: estudo de caso para cliente com dois restaurantes e contatos de whatsapp distintos
applyTo: '**'
---

# CASE_STUDY_MULTI_UNIT_RESTAURANTES.md

## Cenario

Cliente unico (mesmo CNPJ) com duas unidades:

- Unidade 1: restaurante centro
- Unidade 2: restaurante bairro

Cada unidade possui gerente operacional com WhatsApp proprio.

## Objetivo do ensaio

Validar que:

1. os alertas identificam qual unidade gerou o evento
2. cada unidade recebe alerta no numero correto
3. fallback para contato principal funciona quando faltarem regras de roteamento

## Preparacao (UI-first)

No Monitor:

1. selecionar cliente
2. confirmar `ambiental` e `acionamento` habilitados em `Modulos do cliente`
3. cadastrar/ajustar equipamentos com `location` distinta por unidade

Exemplo de equipamentos:

- `adega_centro_01` com `location = restaurante-centro`
- `adega_bairro_01` com `location = restaurante-bairro`

## Roteamento no n8n (fase imediata)

Criar regra de destino:

- se `device_id == adega_centro_01` -> WhatsApp gerente centro
- se `device_id == adega_bairro_01` -> WhatsApp gerente bairro
- senao -> `recipient_phone` do payload

## Execucao do teste

1. disparar evento critico para unidade centro
2. confirmar recebimento no WhatsApp do gerente centro
3. disparar evento critico para unidade bairro
4. confirmar recebimento no WhatsApp do gerente bairro
5. confirmar que a mensagem inclui:
   - cliente
   - unidade
   - equipamento
   - horario

## Aceite

Considerar aprovado quando:

- nao houver envio cruzado entre unidades
- texto permitir acao imediata sem duvida de origem
- trilha `API -> n8n -> Evolution -> WhatsApp` estiver estavel nas duas unidades
