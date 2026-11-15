# 03 — Acesso administrativo e cadastro de igrejas

## Objetivo

Implementar a criação controlada de acessos para novas igrejas.

## Escopo

- Criar rota administrativa protegida por segredo definido em variável de ambiente, por exemplo `ADMIN_SECRET`.
- Receber nome da igreja, usuário de seis dígitos e senha.
- Validar usuário numérico, unicidade e senha forte.
- Sugerir uma senha forte automaticamente, permitindo confirmação/uso pelo administrador.
- Impedir que a rota administrativa fique disponível sem segredo configurado.
- Não retornar hash ou outros dados sensíveis na resposta.

## Critérios de aceite

- Uma requisição sem o segredo correto é rejeitada.
- Não é possível criar dois acessos com o mesmo usuário.
- Uma igreja criada consegue iniciar autenticação.
- A resposta informa os dados necessários para o primeiro acesso sem expor a senha armazenada.
- A rota possui proteção contra entrada inválida e abuso básico.

## Dependências

[02 — Persistência](./02-persistencia.md).
