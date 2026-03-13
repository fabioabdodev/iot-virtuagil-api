---
description: regras e metodos para simulacao de dispositivos IoT sem hardware fisico
applyTo: '**'
---

# SIMULATED_DEVICE.md - Simulacao de dispositivos IoT

Enquanto os dispositivos fisicos nao chegam, o comportamento do device deve ser
simulado via HTTP para validar backend, banco, alertas e dashboard.

## Endpoint usado

- `POST /iot/temperature`
- header obrigatorio: `x-device-key`

Payload:

```json
{
  "device_id": "freezer_01",
  "temperature": -12.3
}
```

Resposta esperada:

```json
{
  "ok": true
}
```

## Ferramentas aceitas

- script Node.js do proprio repositorio
- Insomnia
- curl

O caminho preferido hoje e o script oficial:

```bash
npm run simulate:iot -- --device freezer_01 --api-key CHANGE_ME
```

## Capacidades atuais do simulador

O script `scripts/iot-simulator.mjs` suporta:

- device unico com `--device`
- varios devices com `--devices`
- presets `normal`, `alerta`, `critico` e `geladeira`
- modos `random`, `ramp` e `spike`
- encerramento por quantidade com `--count`
- cadastro/atualizacao automatica com `--ensure-devices`

## Fluxos de teste recomendados

### Operacao normal

```bash
npm run simulate:iot -- --devices freezer_01,freezer_02 --preset normal --api-key CHANGE_ME
```

### Temperatura em alerta

```bash
npm run simulate:iot -- --devices freezer_01 --preset alerta --api-key CHANGE_ME
```

### Cenario critico

```bash
npm run simulate:iot -- --devices freezer_01 --preset critico --api-key CHANGE_ME
```

### Cadastro automatico antes da simulacao

```bash
npm run simulate:iot -- --devices freezer_01,freezer_02 --client-id virtuagil --ensure-devices --preset normal --api-key CHANGE_ME
```

## Simulacao de offline

Para testar offline:

1. envie leituras normalmente
2. interrompa o simulador
3. espere o tempo maior que `DEVICE_OFFLINE_MINUTES`

Resultado esperado:

- monitor marca o device como offline
- alerta e enfileirado
- webhook e enviado se configurado

## Seed de dados

Para criar base demo antes da simulacao:

```bash
npm run db:seed
```

O seed cria clients, devices, regras e historico inicial sem duplicar o que ja
existir.

No estado atual, o seed tambem prepara:

- atuadores demo
- historico inicial de comandos do modulo `acionamento`

## Simulacao atual do modulo acionamento

Enquanto nao houver hardware fisico:

- o modulo `acionamento` nao depende de ESP32 ou rele real
- o estado do atuador e alterado manualmente pelo dashboard ou API
- o historico e registrado no backend para validar fluxo operacional

Endpoints uteis:

- `POST /actuators`
- `GET /actuators`
- `POST /actuators/:id/commands`
- `GET /actuators/:id/commands`

Fluxo recomendado sem hardware:

1. criar um atuador para um `clientId`
2. opcionalmente vincular o atuador a um `deviceId`
3. enviar comandos `on` e `off`
4. validar a mudanca de estado e o historico no dashboard
