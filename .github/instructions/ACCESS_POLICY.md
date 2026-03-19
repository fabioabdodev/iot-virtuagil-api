---
description: politica de acessos, responsabilidades e auditoria do produto
applyTo: '**'
---

# ACCESS_POLICY.md - Politica de acesso e responsabilidade operacional

## Atualizacao de referencia (2026-03-19)

Aplicar a politica por modulo-categoria e por item contratado:

- categorias atuais: `ambiental`, `acionamento`, `energia`
- autorizacao operacional deve considerar itens habilitados por cliente
- o admin da plataforma define categorias e itens disponiveis por cliente
- o cliente administra apenas regras operacionais dos itens autorizados

## Objetivo

Definir com clareza:

- quem administra a plataforma
- quem opera o tenant
- quem apenas monitora
- quem pode alterar parametros operacionais
- como a responsabilidade por mudancas deve ser registrada

## Perfis do produto

### Administrador da plataforma

Representa a Virtuagil.

Regra principal:

- possui acesso total a todos os clientes, devices, regras, usuarios, modulos e atuadores

Permissoes esperadas:

- criar clientes
- editar clientes
- remover clientes quando necessario
- criar e editar devices de qualquer tenant
- criar e editar usuarios de qualquer tenant
- habilitar e desabilitar modulos por cliente
- consultar e monitorar todos os tenants
- editar regras operacionais quando necessario
- emitir comandos de acionamento quando necessario

Representacao tecnica desejada:

- usuario com `clientId = null`

### Administrador do cliente

Representa o responsavel operacional do tenant.

Regra principal:

- pode monitorar tudo do proprio cliente e alterar apenas os parametros operacionais que sao responsabilidade do proprio cliente

Permissoes esperadas:

- monitorar devices, leituras, alertas e historico do proprio tenant
- revisar regras de temperatura e alerta do proprio tenant
- alterar faixas de temperatura e configuracoes de alerta do proprio tenant
- consultar atuadores e historico de comandos do proprio tenant
- gerenciar usuarios do proprio tenant quando esse fluxo continuar habilitado no produto

Restricoes:

- nao cria outros clientes
- nao acessa dados de outros tenants
- nao altera contratacao de outros clientes

### Operador do cliente

Representa o usuario de acompanhamento do dia a dia.

Regra principal:

- monitora a operacao do proprio cliente, mas nao altera configuracoes criticas

Permissoes esperadas:

- monitorar devices, leituras, alertas e historico do proprio tenant
- acompanhar atuadores e comandos do proprio tenant
- usar recursos operacionais liberados explicitamente para esse perfil

Restricoes:

- nao altera regras de temperatura
- nao altera configuracoes de alerta
- nao cria clientes
- nao gerencia usuarios

## Diretriz de responsabilidade

Estrutura e operacao devem permanecer separadas.

Regra-mae da plataforma:

- a Virtuagil monta a estrutura inicial do cliente
- o cliente opera e pode ajustar apenas as regras operacionais que a plataforma decidiu liberar
- esse mesmo padrao deve ser repetido em todos os modulos atuais e futuros

### Estrutura

Responsabilidade principal da plataforma:

- clientes
- contratacao modular
- devices
- credenciais
- vinculos entre entidades

### Operacao

Responsabilidade principal do cliente:

- faixas de temperatura do proprio negocio
- regras de alerta do proprio tenant
- parametros operacionais que dependem da rotina real da operacao
- qualquer outra regra operacional autorizada em modulos futuros

## Boa pratica adotada

Direcao de produto aprovada:

- a Virtuagil administra a estrutura da plataforma
- o cliente administra os parametros operacionais do proprio negocio
- o administrador do cliente tambem pode monitorar o proprio tenant
- o administrador da plataforma pode monitorar e editar tudo
- ao cadastrar um novo cliente, a plataforma cria a base inicial e entrega a operacao pronta
- depois disso, o administrador do cliente pode ajustar apenas as regras que foram autorizadas para aquele modulo

Motivacao:

- reduz ambiguidade sobre quem definiu a regra operacional
- melhora a responsabilizacao por mudancas de parametro
- evita que a plataforma assuma indevidamente a autoria de configuracoes do processo do cliente
- aproxima o produto de uma operacao SaaS madura

## Auditoria obrigatoria

Toda alteracao critica de parametro operacional deve gerar trilha de auditoria.

Campos minimos desejados:

- entidade alterada
- tenant
- usuario responsavel
- data e hora
- campo alterado
- valor anterior
- valor novo
- origem da alteracao

Mudancas que devem entrar primeiro nessa trilha:

- faixa minima e maxima de temperatura do device
- regras de alerta
- habilitacao e desabilitacao de regras

## Regras de interface

Quando uma regra critica for alterada, o dashboard deve buscar no futuro:

- mostrar quem fez a ultima alteracao
- mostrar quando a alteracao ocorreu
- pedir confirmacao extra para mudancas sensiveis
- destacar mudancas muito fora do padrao esperado

## Direcao de implementacao

Estado desejado para evolucao:

1. manter administrador da plataforma com acesso total
2. permitir que administrador do cliente monitore o proprio tenant
3. permitir que administrador do cliente altere regras de temperatura e alerta do proprio tenant
4. impedir que operador altere parametros criticos
5. adicionar trilha de auditoria antes de ampliar liberdade operacional do cliente

## Regra-mae para modulos futuros

Toda nova capacidade da plataforma deve responder a esta pergunta:

- isso e estrutura da plataforma ou regra operacional do cliente?

Padrao esperado:

- estrutura continua com a plataforma
- regra operacional autorizada pode ser ajustada pelo administrador do cliente
- operador continua focado em acompanhamento e execucao do dia a dia
- toda mudanca critica deve continuar auditavel

Exemplos:

- `temperatura`: faixa e limites de alerta podem ser autorizados para o cliente
- `acionamento`: rotinas, agendas e regras operacionais podem ser autorizadas para o cliente
- modulos futuros devem seguir a mesma separacao entre estrutura e operacao
