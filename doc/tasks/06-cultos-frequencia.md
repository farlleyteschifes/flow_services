# 06 — Cultos e frequência

## Objetivo

Criar e manter o registro principal de cada culto.

## Escopo

- Implementar seleção de data e tipo de culto.
- Validar os quatro tipos permitidos.
- Criar o culto vazio na primeira alteração, sem botão geral de salvar.
- Carregar culto existente pela combinação igreja, data e tipo.
- Implementar os contadores de Adultos, Visitantes, Crianças e Crianças Visitantes.
- Implementar incremento e decremento atômicos, nunca permitindo valor negativo.
- Permitir exclusão do culto com confirmação explícita.
- Persistir data como data de calendário, sem horário específico do culto.

## Critérios de aceite

- É impossível criar dois cultos do mesmo tipo na mesma data para uma igreja.
- Dois usuários incrementando simultaneamente não perdem alterações.
- O decremento de um contador em zero mantém o valor em zero.
- Ao reabrir um culto, todos os valores persistidos são carregados.
- A exclusão remove o culto e seus dados associados sem afetar membros, louvores ou outros cultos.

## Dependências

[04 — Autenticação](./04-autenticacao.md) e [02 — Persistência](./02-persistencia.md).
