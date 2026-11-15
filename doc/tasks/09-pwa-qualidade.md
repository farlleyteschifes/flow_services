# 09 — PWA, validação e concorrência

## Objetivo

Entregar a aplicação como PWA instalável, mantendo o comportamento online definido na especificação.

## Escopo

- Configurar manifest, nome, ícones, tema e tela de instalação.
- Configurar service worker apenas para os recursos necessários ao carregamento; não implementar sincronização offline.
- Garantir que chamadas de API dependam de conexão ativa.
- Validar entradas no cliente e no servidor.
- Garantir autorização por igreja em todas as operações.
- Implementar operações atômicas para contadores e atualizações concorrentes.
- Revisar índices, limites de payload e tratamento de erros.

## Critérios de aceite

- A aplicação pode ser instalada em celular compatível.
- O sistema informa claramente quando está sem conexão.
- Nenhum endpoint permite acesso cruzado entre igrejas.
- Contadores permanecem consistentes sob requisições concorrentes.
- Dados enviados pelo cliente são validados novamente no servidor.

## Dependências

[08 — Interface](./08-interface.md) e todas as tarefas de backend.
