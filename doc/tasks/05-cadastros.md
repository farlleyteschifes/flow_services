# 05 — Catálogo de louvores e membros

## Objetivo

Implementar os cadastros usados como sugestões durante o preenchimento dos cultos.

## Escopo

- Criar busca e cadastro de louvores no catálogo global por número e nome.
- Reutilizar o nome existente quando o número já estiver cadastrado.
- Permitir correção do nome de um louvor, refletindo a alteração em usos futuros, sem alterar snapshots históricos.
- Não permitir exclusão de louvores.
- Criar busca, cadastro e exclusão lógica de membros por igreja.
- Normalizar nomes para impedir duplicidade por diferenças de espaços e capitalização.
- Não sugerir membros inativos em novos cultos.
- Salvar imediatamente cada criação, alteração ou inativação.

## Critérios de aceite

- Igrejas conseguem consultar louvores globais, mas membros de uma igreja nunca aparecem para outra.
- Dois cadastros concorrentes do mesmo número de louvor resultam em um único registro.
- Membro inativado não aparece em sugestões, mas continua visível no histórico.
- Membros podem ser usados em Louvor, Palavra e Portão, inclusive em mais de uma função no mesmo culto.

## Dependências

[04 — Autenticação](./04-autenticacao.md) e [02 — Persistência](./02-persistencia.md).
