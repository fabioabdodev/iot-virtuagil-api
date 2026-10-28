# Publicação isolada do site Virtuagil — validação 27/10/2026

## Estado comprovado
- PR de código: https://github.com/fabioabdodev/iot-virtuagil-api/pull/34
- CI com testes, lint, build e verificação de catálogo passou: https://github.com/fabioabdodev/iot-virtuagil-api/actions/runs/40577192049
- Pré-flight read-only no host: https://github.com/fabioabdodev/iot-virtuagil-api/actions/runs/40579293171
- Host validado no pré-flight: srv2080409. Serviço Swarm: `virtuagil-site_virtuagil-site`, 1/1.
- Imagem ANTERIOR: `ghcr.io/fabioabdodev/iot-virtuagil-api/institucional-site:sha-54266a4`
- URL raiz e www retornaram HTTP 200 no pré-flight.
- Serviço possui a chave interna e URL do webhook de checkout, mas não existe `/opt/virtuagil-site/.env.prod` nem `/opt/virtuagil-site/portainer-stack.yml` no alvo. Os valores secretos não foram coletados.

## Riscos do workflow de deploy atual
`.github/workflows/deploy.yml` no merge na main publica **API IoT + web IoT + site** e executa `prisma migrate deploy` para o IoT. Isso é inadequado para lançar apenas o checkout do site.

## Critérios para publicação independente
1. Construir e testar apenas `institucional-site/web`, usando o SHA exato da PR.
2. Publicar uma imagem imutável **apenas** de `ghcr.io/fabioabdodev/iot-virtuagil-api/institucional-site`. Não sobrescrever tag `latest` sem rastreabilidade.
3. No host esperado `srv2080409`, comparar serviço, imagem antiga, réplicas 1/1 e destino SSH verificado. Registrar a referência original para rollback.
4. Atualizar exclusivamente `virtuagil-site_virtuagil-site`, preservando secrets, configurações, redes, labels e volumes existentes.
5. Conferir imagem nova efetivamente agendada, réplica 1/1, HTTP 200 na origem e HTTP 200 nos dois domínios.
6. Falhando algum critério, restaurar a imagem anterior e confirmar 1/1 e HTTP 200; não tocar nas outras stacks.
7. Não executar migrations, instalação n8n, criação de checkout, envio WhatsApp nem transações financeiras como smoke test.

## Corte de produção
Esta documentação **não é comprovação de deploy**. A tentativa de criar um workflow de publicação automatizada foi recusada por uma restrição de segurança do ambiente do agente. Não reexecutar por caminho paralelo sem corrigir esse bloqueio legitimamente.
