# Contratação iniciada pela Jade — aceite no site, volta ao WhatsApp

## Experiência
1. Jade identifica o plano e envia `/contratar-assistente-ia?plano=<codigo>&origem=jade`.
2. Página do site apresenta o plano pré-selecionado e coleta nome, empresa, WhatsApp e e-mail.
3. O contrato e a política de privacidade podem ser lidos na mesma página, sem troca de aba.
4. Cliente marca **Li e aceito** e escolhe **Aceitar contrato e voltar à Jade**.
5. Backend valida campos e aceite (versão `2026-09-30-v2`), cria a preferência oficial do Mercado Pago e registra a origem `checkout_site_via_whatsapp_jade`.
6. Navegador tenta retornar ao WhatsApp pelo `NEXT_PUBLIC_WHATSAPP_URL`, com mensagem contendo o link oficial do pagamento; há botões alternativos **Voltar à conversa** e **Pagar agora** na tela.
7. A pessoa envia a mensagem pré-preenchida pelo WhatsApp e pode pagar pelo link. A Jade não cria outra preferência.
8. Aprovação de pagamento e provisionamento continuam pelo webhook já existente.

## Infra e segurança
- Nenhuma chave adicional é necessária; `VIRTUAGIL_INTERNAL_KEY` fica **apenas no servidor**.
- A consulta ao contrato e o checkbox são processados no frontend, mas o backend valida `aceite_termos` e `termos_versao` e o webhook do n8n valida o aceite novamente.
- A versão e a origem do aceite ficam no metadata da preferência do Mercado Pago e persistem no registro do pagamento após a aprovação.
- Dados de cliente não são passados em query string. Apenas o código público do plano e a indicação de entrada via Jade.
- Sem novas chamadas de agentes para ler ou aceitar contratos.
- Confirme que `NEXT_PUBLIC_WHATSAPP_URL` leva à mesma conversa WhatsApp da Jade antes do go-live.

## Ordem obrigatória de publicação (sem indisponibilizar o checkout atual)
1. Fazer backup do módulo n8n `MODULO - Pagamentos Mercado Pago - Virtuagil Jade`.
2. Importar/publicar a versão atualizada do módulo. Ela aceita a versão antiga `2026-09-24-v1` e a nova `2026-09-30-v2` para garantir compatibilidade durante a transição; preserva validação de pagamentos antigos.
3. Confirmar que o checkout já existente do site continua aceitando o contrato antigo.
4. Publicar as mudanças do site em `main`. O workflow `.github/workflows/deploy.yml` faz build, envio da imagem e deploy em Swarm a cada push.
5. Verificar contrato `/termos-de-contratacao`, preços de três planos, fluxo por `?origem=jade` e retorno ao número da Jade.
6. Importar/publicar as versões atualizadas do Atendente e do Follow-up da Jade, que removem a ferramenta `Criar Checkout Virtuagil`.
7. Testar contratação de ponta a ponta sem pagamento real; no Mercado Pago confirmar código e valor antes de qualquer pagamento.

## Limites
O WhatsApp não permite garantir que uma página web feche/abra o aplicativo automaticamente em todos os navegadores. O botão de retorno é fallback. O cliente precisa tocar **Enviar** na mensagem pré-preenchida ao voltar. 

## Plano de reversão
- Site: fazer revert do commit do site; contratos antigos seguem aceitos temporariamente.
- n8n: fazer backup antes de importar e reverter as versões dos agentes se necessário. Não remover suporte a `2026-09-24-v1` do módulo financeiro enquanto houver preferências antigas pendentes.

## Testes de backend
- Aceite site e Jade com versão v2.
- Aceite legado v1 durante migração.
- Recusa, origem inválida, sem telefone/e-mail, sem data.
- Webhook de pagamento legado v1 e novo v2 com validação de origem.
