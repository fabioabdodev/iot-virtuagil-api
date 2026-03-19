---
description: regras para desenvolvimento de dispositivos IoT e firmware do projeto.
applyTo: '**'
---

# IOT_DEVICE_RULES.md — Regras de dispositivos IoT

Este projeto utiliza dispositivos físicos baseados em **ESP32** para coletar dados de sensores e enviar para a API do sistema.

O primeiro sensor suportado será **temperatura**, mas a arquitetura deve permitir suportar outros sensores no futuro.

---

# Ferramenta de desenvolvimento

Firmware deve ser desenvolvido utilizando:

- PlatformIO
- VS Code

Regras:

- Preferir PlatformIO em vez de Arduino IDE
- Estrutura de firmware deve ser compatível com PlatformIO
- Código deve ser organizado em módulos reutilizáveis
- Evitar sketches monolíticos grandes

---

# Situação atual do hardware

Os equipamentos físicos ainda **não chegaram**.

Status atual:

- ESP32 ainda não disponível fisicamente
- sensores ainda não disponíveis fisicamente
- protoboard ainda não disponível fisicamente
- kit starter ainda não disponível fisicamente

Durante esta fase o desenvolvimento deve focar em:

- backend
- banco de dados
- monitoramento
- dashboard
- arquitetura do sistema
- contratos de API

---

# Simulação de dispositivos

Enquanto o hardware não estiver disponível, o comportamento dos dispositivos deve ser **simulado via HTTP**.

Exemplo de requisição que simula um device:

POST /iot/temperature

Payload:

{
  "device_id": "freezer_01",
  "temperature": -12.3
}

Ferramentas de simulação possíveis:

- Insomnia
- curl
- scripts Node.js
- scripts Python

---

# Comunicação do dispositivo

Os dispositivos devem enviar dados via **HTTP POST**.

Formato atual da API:

POST /iot/temperature

Payload:

{
  "device_id": "freezer_01",
  "temperature": -12.3
}

Resposta esperada:

{
  "ok": true
}

---

# Frequência de envio

Os dispositivos devem enviar dados periodicamente.

Exemplo:

- a cada 30 segundos
- a cada 60 segundos

A frequência pode ser configurável no firmware.

---

# Controle de conexão

Dispositivos devem implementar:

- reconexão automática de WiFi
- retry em caso de erro HTTP
- timeout de requisição

Caso o envio falhe:

- tentar novamente
- registrar erro no log serial

---

# Identificação do dispositivo

Cada dispositivo deve possuir um identificador único.

Exemplo:

device_id = "freezer_01"

No futuro o dispositivo poderá também usar:

- API key
- token de autenticação

---

# Segurança futura

Próxima etapa de segurança:

Adicionar autenticação por API Key.

Exemplo de header:

x-device-key: DEVICE_SECRET

---

# Sensores suportados (futuro)

O sistema deve permitir suporte a múltiplos sensores.

Exemplos:

- temperatura
- umidade
- consumo de energia
- sensores de porta
- sensores industriais

Firmware deve ser projetado para permitir adicionar sensores facilmente.

---

# Estrutura sugerida do firmware (futuro)

Estrutura recomendada em PlatformIO:

src/

  main.cpp

  wifi/
    wifi_manager.cpp

  sensors/
    temperature_sensor.cpp

  api/
    api_client.cpp

  config/
    device_config.h

Separação de responsabilidades:

- conexão WiFi
- leitura de sensores
- envio de dados para API

---

# Logs do dispositivo

Durante desenvolvimento, o dispositivo deve registrar logs no Serial Monitor.

Exemplos de logs:

- conexão WiFi
- envio de leitura
- erro de comunicação
- tentativa de reconexão

---

# Objetivo final

Dispositivos ESP32 devem enviar leituras confiáveis para o sistema de monitoramento.

O backend será responsável por:

- armazenar dados
- detectar falhas
- gerar alertas
- integrar com sistemas externos (n8n / WhatsApp)
---

## Atualizacao de referencia (2026-03-19)

Direcao atual do runtime IoT:

- endpoint principal de ingestao: `POST /iot/readings`
- payload recomendado: `device_id`, `sensor_type`, `value`, `unit` opcional
- endpoint legado mantido: `POST /iot/temperature`
- firmware permanece em repositorio/projeto separado: `iot-virtuagil-firmware/`
