# Tarefas de implementação — Flow Services

Este diretório contém o plano de implementação do Flow Services, baseado em `doc/specification/README.md`.

## Ordem sugerida

1. [01 — Fundação do projeto](./01-fundacao.md)
2. [02 — Persistência e modelo de dados](./02-persistencia.md)
3. [03 — Acesso administrativo e igrejas](./03-igrejas-admin.md)
4. [04 — Autenticação da igreja](./04-autenticacao.md)
5. [05 — Catálogo de louvores e membros](./05-cadastros.md)
6. [06 — Cultos e frequência](./06-cultos-frequencia.md)
7. [07 — Louvores e participantes do culto](./07-conteudo-culto.md)
8. [08 — Interface da aplicação](./08-interface.md)
9. [09 — PWA, validação e concorrência](./09-pwa-qualidade.md)
10. [10 — Testes, documentação e deploy](./10-testes-deploy.md)

As tarefas podem ser divididas em subtarefas durante a execução, mas os critérios de aceite devem ser preservados.

## Decisões funcionais consolidadas

- Um acesso representa uma única igreja e pode ser compartilhado pelos responsáveis.
- O usuário da igreja é um código numérico único de seis dígitos.
- A senha deve ter no mínimo oito caracteres, contendo letras, números e caractere especial.
- Um culto é identificado por igreja, data e tipo: Madrugada, Culto ao meio-dia, Culto à Noite ou EBD.
- Não existe mais de um culto do mesmo tipo para a mesma igreja na mesma data.
- Frequência contém Adultos, Visitantes, Crianças e Crianças Visitantes.
- Alterações são persistidas imediatamente; não existe botão geral de salvar.
- Atualização entre dispositivos ocorre mediante ação explícita de atualizar.
- Membros pertencem à igreja, não podem ser duplicados e, quando removidos, deixam de ser sugeridos, mas permanecem no histórico.
- Louvores pertencem a um catálogo global por número, podem ser corrigidos, não podem ser excluídos e alterações futuras não modificam históricos.
- Operações de incremento e decremento de frequência devem ser atômicas.
- O PWA funciona online; não há sincronização offline.
