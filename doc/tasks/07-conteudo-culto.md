# 07 — Louvores e participantes do culto

## Objetivo

Permitir registrar os louvores e os membros utilizados em cada culto.

## Escopo

- Adicionar/remover itens da lista de louvores do culto.
- Selecionar número e nome a partir do catálogo global.
- Criar automaticamente um louvor global quando o número ainda não existir.
- Registrar participantes nas funções Louvor, Palavra e Portão.
- Permitir que o mesmo membro apareça em mais de uma função, conforme decisão da especificação.
- Persistir cada alteração imediatamente.
- Manter snapshots dos nomes no documento do culto.

## Critérios de aceite

- Um louvor utilizado em um culto permanece no histórico mesmo se seu nome global mudar.
- Membro removido do cadastro permanece no culto histórico.
- Não é necessário salvar o formulário inteiro para persistir uma alteração.
- Requisições inválidas não deixam o culto em estado parcialmente inconsistente.

## Dependências

[05 — Cadastros](./05-cadastros.md) e [06 — Cultos e frequência](./06-cultos-frequencia.md).
