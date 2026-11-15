# 04 — Autenticação da igreja

## Objetivo

Permitir login compartilhado por igreja e controlar sessões.

## Escopo

- Criar tela e API de login com usuário de seis dígitos e senha.
- Criar sessão segura, com cookie `httpOnly`, `secure` em produção e proteção contra CSRF conforme a estratégia escolhida.
- Proteger páginas e endpoints que exigem igreja autenticada.
- Implementar logout.
- Permitir alteração da senha sem exigir a senha anterior, somente para sessão autenticada.
- Invalidar todas as sessões quando a senha for alterada, usando versão de sessão ou mecanismo equivalente.
- Evitar mensagens que revelem se um usuário existe.

## Critérios de aceite

- Usuário não autenticado não acessa dados de nenhuma igreja.
- Uma igreja só consulta e altera seus próprios cultos e membros.
- Login inválido não revela qual campo está incorreto.
- Alterar a senha encerra sessões existentes em outros dispositivos.
- A senha nunca aparece em logs ou respostas da API.

## Dependências

[03 — Acesso administrativo](./03-igrejas-admin.md).
