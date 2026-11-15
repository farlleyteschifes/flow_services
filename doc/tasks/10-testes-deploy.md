# 10 — Testes, documentação e deploy

## Objetivo

Validar o produto e prepará-lo para publicação na Vercel.

## Escopo

- Criar testes unitários para normalização, regras de senha, tipos de culto e validações.
- Criar testes de API para autenticação, autorização, cadastros, cultos e exclusões.
- Testar unicidade sob concorrência para usuário, membro, louvor e culto.
- Testar preservação de históricos após alterações e inativações.
- Testar incrementos atômicos de frequência.
- Documentar variáveis de ambiente, instalação, execução local e criação administrativa.
- Configurar build e variáveis da Vercel sem commitar segredos.
- Validar build de produção e fluxo principal em ambiente publicado.

## Critérios de aceite

- Os testes automatizados passam sem depender de dados reais de produção.
- `npm run build` passa no estado final.
- O README do projeto explica como configurar MongoDB, `ADMIN_SECRET` e execução local.
- Segredos não estão no repositório.
- O fluxo login → selecionar culto → alterar frequência → atualizar → logout funciona em produção.

## Dependências

Todas as tarefas anteriores.
