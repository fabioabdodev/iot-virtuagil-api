---
description: regras do frontend web do sistema de monitoramento inteligente.
applyTo: '**'
---

# FRONTEND_RULES.md — Regras do frontend

O frontend do sistema deve ser desenvolvido em:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide icons

**atenção** caso tenha outras bibliotecas UI e outras de desenvolvimento que você queria usar, pode aplicar. Apenas me avise.

Objetivo do frontend:

fornecer um dashboard moderno, responsivo e escalável para o sistema de monitoramento inteligente.

---

# Estrutura do projeto frontend

O frontend deve ficar separado do backend dentro do mesmo repositório.

Estrutura preferida:

apps/
  api/
  web/

Onde:

- apps/api = backend NestJS
- apps/web = frontend Next.js

O frontend não deve ficar dentro da pasta src do backend.

---

# Domínios

Frontend do sistema:

monitor.virtuagil.com.br

Backend da API:

api-monitor.virtuagil.com.br

O frontend deve consumir a API via domínio próprio.

---

# Stack obrigatória do frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Recharts
- Lucide React
- date-fns

---

# Objetivo do frontend

O frontend deve fornecer:

- dashboard principal
- status online/offline dos devices
- última leitura de temperatura
- histórico de leituras
- gráficos
- configuração de devices
- configuração de limites e alertas

---

# Organização de componentes

Preferir componentes reutilizáveis e organizados por domínio.

Estrutura sugerida:

apps/web/
  app/
  components/
  lib/
  hooks/
  types/

---

# Padrão visual

Interface deve ter aparência de SaaS moderno.

Preferências visuais:

- layout limpo
- boa hierarquia visual
- dashboard com cards
- tabelas organizadas
- gráficos simples e claros
- dark mode preparado
- uso de componentes do shadcn/ui

Evitar:

- visual poluído
- excesso de cores
- componentes muito customizados sem necessidade

---

# Consumo da API

O frontend deve consumir a API do backend via HTTP.

Preferir:

- TanStack Query para cache e sincronização
- validação com Zod
- serviços centralizados para chamadas da API

---

# Regras de arquitetura frontend

- Componentes de UI devem ser reutilizáveis.
- Lógica de API não deve ficar espalhada em páginas.
- Formulários devem usar React Hook Form + Zod.
- Gráficos devem usar Recharts.
- Ícones devem usar Lucide React.
- Utilidades e funções compartilhadas devem ficar em lib/.

---

# Evolução futura

O frontend deverá evoluir para suportar:

- autenticação de usuários
- múltiplos clientes
- dashboards por cliente
- múltiplos dispositivos
- múltiplos sensores
- relatórios
- planos SaaS

A arquitetura do frontend deve permitir essa evolução.