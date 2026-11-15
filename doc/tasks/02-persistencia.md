# 02 — Persistência e modelo de dados

## Objetivo

Conectar o Nuxt ao MongoDB fornecido pela Vercel e definir os modelos persistidos.

## Escopo

- Criar conexão reutilizável com MongoDB a partir da variável de ambiente de conexão.
- Definir as coleções para igrejas, membros, louvores e cultos.
- Criar índices e restrições de unicidade:
  - usuário da igreja: único;
  - membro ativo por igreja e nome normalizado: único;
  - louvor por número: único global;
  - culto por igreja, data e tipo: único.
- Armazenar senha somente como hash.
- Definir timestamps e campos de status necessários.
- Armazenar nos cultos snapshots dos nomes usados, para preservar o histórico mesmo após alterações cadastrais.

## Critérios de aceite

- A conexão é reutilizada entre requisições e não cria uma conexão nova desnecessariamente.
- Índices impedem duplicidades mesmo em requisições concorrentes.
- Dados de um culto antigo não mudam quando um membro é removido ou um louvor global é renomeado.
- Falhas de conexão não expõem credenciais nem detalhes sensíveis ao cliente.

## Dependências

[01 — Fundação](./01-fundacao.md).
