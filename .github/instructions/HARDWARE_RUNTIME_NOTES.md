# Runtime IoT para Acionamento

## Estado atual

Foi adicionado um endpoint simples para o hardware consultar o estado desejado
dos atuadores associados a um `deviceId`.

Endpoint:

```bash
GET /iot/actuators?deviceId=...
```

Header obrigatorio:

```bash
x-device-key
```

Resposta esperada:

```json
[
  {
    "id": "relay_freezer",
    "deviceId": "device_a",
    "name": "Rele freezer",
    "currentState": "on",
    "lastCommandAt": "2026-03-14T12:00:00.000Z",
    "lastCommandBy": "dashboard"
  }
]
```

## Uso esperado no ESP32

Fluxo inicial sugerido:

1. o dispositivo autentica com `x-device-key`
2. faz polling periodico em `/iot/actuators?deviceId=...`
3. aplica fisicamente o `currentState` de cada rele
4. envia telemetria de temperatura normalmente em `POST /iot/temperature`

## Limite atual

Ainda nao existe um endpoint de confirmacao explicita de comando executado.

Hoje o sistema registra:

- comando emitido pelo painel
- estado atual persistido do atuador

Mas ainda nao registra:

- confirmacao do hardware
- falha fisica ao executar
- divergencia entre estado desejado e estado real

## Proximo passo possivel

Se a bancada com ESP32 mostrar necessidade, criar depois:

- `POST /iot/actuators/:id/ack`

Campos candidatos:

- `appliedState`
- `executedAt`
- `success`
- `message`

