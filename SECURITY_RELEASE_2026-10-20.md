# Release de seguranca pre-campanha - 20/10/2026

Este repositorio recebeu o hotfix de seguranca do site comercial:

- Next.js 15.5.28 (linha 15.5 com correcoes de seguranca de outubro/2026).
- React / React DOM 19.1.10 (versoes de correcao).
- package-lock.json regenerado pelo npm, apos suite de testes e build.
- O deployment e a verificacao de dependencias devem ser checados no GitHub Actions antes de divulgar o checkout.

O dashboard Virtuagil foi auditado no repositorio irmao `fabioabdodev/virtuagil-atendente`.
Nenhum pagamento nem webhook financeiro foi disparado durante esta atualizacao.

- PostCSS 8.5.31 fixado via overrides, validado por npm audit sem alertas altos/criticos na etapa de hotfix.
- Revisao publicada novamente para executar CI e deploy com os lockfiles atualizados (commit com token do GitHub Actions nao dispara novo pipeline sozinho).
