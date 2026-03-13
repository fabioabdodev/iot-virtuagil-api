---
description: roteiro pratico de testes manuais no Insomnia para fechar os modulos principais
applyTo: '**'
---

# MANUAL_TESTS.md - Testes manuais no Insomnia

Este arquivo existe para dar praticidade.

Objetivo:

- fechar validacao manual dos modulos `temperatura` e `acionamento`
- evitar depender de memoria ou teste improvisado
- dar um roteiro facil de repetir em demo ou revisao operacional

## Preparacao

Base local padrao:

- API: `http://localhost:3000`

Headers importantes:

- login usa `Content-Type: application/json`
- ingestao usa `x-device-key`

Seeds e apoio:

```bash
npm run db:seed
```

Se quiser validar a base do `acionamento` antes:

```bash
npm run db:verify-actuation
```

## 1. Autenticacao

### Login

- metodo: `POST`
- URL: `http://localhost:3000/auth/login`
- body:

```json
{
  "email": "admin@virtuagil.com.br",
  "password": "virtuagil123"
}
```

Esperado:

- `201`
- resposta com `token`
- resposta com `user`

Guardar:

- token para usar como `Bearer`

### Sessao atual

- metodo: `GET`
- URL: `http://localhost:3000/auth/me`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- usuario autenticado retornado

## 2. Modulo temperatura

Se esse modulo ja foi validado anteriormente, use esta parte apenas como revisao rapida.

### Listar devices

- metodo: `GET`
- URL: `http://localhost:3000/devices?clientId=virtuagil`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- lista de devices do tenant

### Listar regras

- metodo: `GET`
- URL: `http://localhost:3000/alert-rules?clientId=virtuagil`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- regras configuradas

### Enviar leitura manual

- metodo: `POST`
- URL: `http://localhost:3000/iot/temperature`
- headers:
  - `Content-Type: application/json`
  - `x-device-key: SUA_CHAVE`
- body:

```json
{
  "device_id": "freezer_01",
  "temperature": -11.2
}
```

Esperado:

- `200`
- `{ "ok": true }`

### Ver historico do device

- metodo: `GET`
- URL: `http://localhost:3000/readings/freezer_01?clientId=virtuagil&sensor=temperature&limit=10`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- leituras retornadas em ordem cronologica

### Revisao de offline

Fluxo:

1. enviar leituras normalmente
2. parar de enviar
3. esperar acima de `DEVICE_OFFLINE_MINUTES`
4. consultar dashboard ou `GET /devices`

Esperado:

- device marcado como `isOffline=true`
- `offlineSince` preenchido

## 3. Modulo acionamento

### Listar atuadores

- metodo: `GET`
- URL: `http://localhost:3000/actuators?clientId=virtuagil`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- lista de atuadores do tenant

### Criar atuador

- metodo: `POST`
- URL: `http://localhost:3000/actuators`
- headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN`
- body:

```json
{
  "id": "sauna_demo_insomnia",
  "clientId": "virtuagil",
  "deviceId": "freezer_01",
  "name": "Sauna demo Insomnia",
  "location": "Area de testes"
}
```

Esperado:

- `201`
- atuador criado com `currentState = "off"`

### Ligar atuador

- metodo: `POST`
- URL: `http://localhost:3000/actuators/sauna_demo_insomnia/commands`
- headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN`
- body:

```json
{
  "desiredState": "on",
  "source": "insomnia",
  "note": "Teste manual de ligacao"
}
```

Esperado:

- `201`
- comando criado
- `actuator.currentState = "on"`

### Desligar atuador

- metodo: `POST`
- URL: `http://localhost:3000/actuators/sauna_demo_insomnia/commands`
- headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN`
- body:

```json
{
  "desiredState": "off",
  "source": "insomnia",
  "note": "Teste manual de desligamento"
}
```

Esperado:

- `201`
- `actuator.currentState = "off"`

### Consultar historico do atuador

- metodo: `GET`
- URL: `http://localhost:3000/actuators/sauna_demo_insomnia/commands`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- historico com comandos `on` e `off`

### Consultar comandos recentes do tenant

- metodo: `GET`
- URL: `http://localhost:3000/actuators/commands/recent?clientId=virtuagil&limit=10`
- header:
  - `Authorization: Bearer SEU_TOKEN`

Esperado:

- `200`
- lista dos ultimos comandos do tenant
- cada item pode trazer o atuador relacionado

## 4. Criterio de fechamento dos modulos

### Temperatura

Considerar fechado quando:

- login funciona
- devices listam corretamente
- leitura entra com sucesso
- historico responde
- online/offline aparece coerente
- regras podem ser revisadas pelo tenant

### Acionamento

Considerar fechado quando:

- atuador pode ser criado
- comando `on` funciona
- comando `off` funciona
- historico do atuador responde
- endpoint de comandos recentes responde
- dashboard reflete o estado sem hardware fisico

## 5. Regra pratica para continuidade

Enquanto nao houver hardware:

- usar Insomnia, dashboard e simulador como trilha principal
- tratar `currentState` como estado operacional registrado na plataforma
- nao prometer confirmacao eletrica real da carga
