# Especificação da Aplicação Flow Services

## O que é?
O Flow Services é uma aplicação web que será usada para registrar algumas informações de cultos na Igreja:

- Registrar frequencia
- Registrar os membros que foram usados no Louvor e Palavra
- Registrar a lista de louvores

## Fluxo de funcionamento

O usuário (a igreja) vai selecionar uma data, apos isso irá apresentar um formulario para que faça o registro:

### Frequencia:

- Membros Adultos
- Membros Visitantes
- Membros Crianças
- Crianças Visitantes

### Lista de Louvores

- Numero do Louvor
- Nome do Louvor

### membros usados no cultos

- Nome do membro usado no Louvor
- Nome do membro usado na Palavra
- Nome do membro usado no Portão

## Requisitos não funcionais

- O Flow Services é uma aplicação Nuxt e vai usar um banco de dados no-sql
- A aplicação deve ter suporte PWA para ser instalado no celular
- O banco de daos não relacional MongoBD, será fornecido as credenciais de acesso atraves da variavel .env
- A autenticção não será por email e senha, haverá um usuário e uma senha, o usuário vai representar uma igreja especiifca
- Deve haver uma forma de criar um acesso a uma igreja especifica que vai criar um usuario e um segredo de acesso, esse acesso será compartilhado entre os responsaveis
- A tabela de Louvores deve ser populada a medida que for sendo informada, ou seja se um numero já existir na base não deve ser criado um novo
- A tabela de membros que são usados no culto a mesma coisa a medida que vão sendo informados será feito o registro, o input deve sugerir então o nome dos membros existenes e permitir que novos membros sejam cadastrados
- Os input de frequencia devem ter opção para soma e subtração, assim a contagem fica facilitada, sendo que o responsavel vai apenas clicar no bitão (+) e será feito a soma e a mesma coisa caso tenha errado poder'usar o botão (-) para reduzir o numero da frequencia
- A tabela de cultos (services) deve registrar a data, frequencia, a lista de louvores e os membros usados no cultos 


## Respostas

- Na frequência aparecem “Membros Visitantes” duas vezes. O quarto grupo seria “Membros Adolescentes” ou outra categoria?

Fiz a correção na lista são Crianças Visitantes

- Cada igreja terá apenas um usuário e senha compartilhados, ou poderá haver vários usuários por igreja?

Cada igreja poderá ter apenas um unico usuário

- Quem poderá criar o acesso de uma nova igreja? Haverá um usuário administrador separado?

Não há necessidade de um usuário administrador, poderá haver algum comando por exemplo que crie ou uma rota especifam com uma senha especifica que só o administardor vai ter para que ele possa criar um acesso

- O “segredo de acesso” será uma senha tradicional? Deve ser possível alterá-lo ou recuperá-lo?

Sim será possível altera-la, qualquer usuário que tiver acesso poderá sim alterar a senha
O segredo de acesso deve ter pelo menos 8 caracteres, letras, numeros e caracter especial.

- O número do louvor é único por igreja? O nome poderá ser atualizado caso o mesmo número seja informado com outro nome?

Não o numero do louvor é compartilhado

- Os membros usados no louvor e na palavra devem vir de uma única lista de membros? Um mesmo membro pode participar das duas áreas no mesmo culto?

Não, os membros não são compartilhadas, cada membros pertence a uma igreja

- O cadastro de membros será apenas pelo nome ou também terá outros dados, como telefone, status ativo etc.?

Apenas o nome

- Um culto será identificado apenas pela data? Pode existir mais de um culto no mesmo dia?

A sim poderá habver mais de um culto no dia, os cultos são especificados da seguinte forma:

- Madrugada
- Culto ao meio-dia
- Cultos a Noite
- EBD

- Após salvar um culto, será possível editar ou excluir seus dados?

Sim, os dados rão sofrer alteração durante o culto, exemplo

O primeiro membro chega para o culto, ele abre a aplicação, informa data e o tipo de culto, ali se incia
Outro membro que vai ficar no portão ele pode iniciar a contagem
Outro membro vai informar a lista de louvores
Outro membro vai informar os membros usados

Pode ser a mesma messoa no mesmo acesso ou pode ser pessoas diferentes em momento diferentes

- A aplicação precisa funcionar offline no celular, sincronizando os dados posteriormente, ou o PWA será apenas instalável com acesso online?

A aplicação pode funcionar apenas online, então o PWA tera acesso onoine

- A frequência precisa registrar somente os totais ou também identificar individualmente quais membros compareceram?

Apenas os numeros

- Deve haver uma tela para consultar filtros e relatórios de cultos anteriores?

O formulário pode servir para ambos os casos, quando eu seleciono um data se ela já existir apenas vai mostrar as informações daquele dia, caso não exista crie e os dados passam a ficar disponiveis para serem informados.

- Existe algum padrão esperado para os nomes dos campos e telas: português (“Cultos”, “Louvores”) ou inglês (services, songs)?

Apenas Portugues Brasil

- O MongoDB já está criado, incluindo banco, coleções e índices, ou a aplicação deverá criar essa estrutura automaticamente?

Já está criado um banco mongodb na plataforma Vercel onde será feito o deploy

- O tipo de culto será obrigatório junto com a data? A identificação única seria: igreja + data + tipo de culto

Sim o tipo de culto será obrigatorio informar

- Poderá existir mais de um culto do mesmo tipo no mesmo dia? Por exemplo, dois “Cultos à Noite”.

Não poderá haver mais de um culto no mesmo dia do mesmo tipo

- A lista de louvores é realmente compartilhada entre todas as igrejas? Nesse caso, uma igreja poderá visualizar ou alterar louvores cadastrados por outra?

A lista de louvores não é compartilhada entre as igrejas, mas o banco de loivureos sim, por exmeplo
Imagine que a minha igreja é a primeira a usar, no primeiro culto eu ifnormo o louor "40 - Oque Sagngue Poderoso", ele entra na lista daquele dia, mas poderá haver um registro compartilhado com todas as igrejas que a proxima igreja quando informar 40 já pode buscar o nome do louvor

- Sobre os membros: eles são separados por igreja, mas as listas de membros do Louvor, Palavra e Portão são independentes? Ou existe uma lista única de membros da igreja que pode ser usada nos três campos?

A lista de membros da igreja vai sendo criada a medida que os dias vão passando, hoje é um membro amanha é outro, vai registrabdo por igreja e por membro
Um membro pode ser usado hoje no portão, amanha no louvor e depois de amanha na Palavra.

- Um mesmo membro pode ser selecionado simultaneamente para Louvor, Palavra e Portão no mesmo culto?

Sim, um memso membro pode ficar no Loivuro e na Palavra, não conseguiria tambem ficar tambem no portão, mas não precisa criar essa regra 

- O cadastro de um novo membro deve ser salvo imediatamente ao digitá-lo ou somente quando o culto for salvo?

Imediatamente, da mesma forma quando uma frequencia for alterada, ou uma lista for criada
Não deve haver uma botão de "salvar dados", quando um culto for criado, a medida que os dados forem informados já serão persistidos no banco

- Quando o formulário for aberto por várias pessoas ao mesmo tempo, as alterações devem aparecer automaticamente para os demais usuários? Isso é importante para evitar que uma pessoa sobrescreva os dados da outra.

Sim, as informações devem aparecer para todos, poderá haver um botão de atualizar, para buscar os dados novos caso exista

- A exclusão de um culto será permitida? E a exclusão de um louvor ou membro já cadastrado?

Sim poderá haver a exclusão de um culto, e de um membro cadastrado

- Como será protegido o acesso administrativo usado para criar novas igrejas? Essa senha ficará em variável de ambiente, e a criação ocorrerá por uma rota específica?

Pode ser uma rota especifica com uma senha especifica

- A senha da igreja poderá ser alterada sem confirmação da senha atual? Como todos compartilham o mesmo acesso, isso pode permitir que qualquer pessoa altere a senha.

Sim isso pode ser permitido, a alteração de senha sem informar a antiga, mas só será possível autentciado na igreja

- Ao selecionar apenas uma data, o sistema deverá mostrar uma lista dos tipos de culto existentes naquele dia ou já abrir algum tipo padrão?

Não precisa, o usuario vai informar a igreja e o tipo, seja não existir na base, crie com dados em braqnco, se existir, carregue com os dados

- O banco MongoDB da Vercel já possui uma string de conexão definida, ou devemos escolher e configurar o nome do banco e das coleções na aplicação?

Sim já possui uma string de conexão

- Ao excluir um membro que já foi usado em cultos anteriores, o nome deve continuar aparecendo no histórico desses cultos ou a exclusão também remove suas referências antigas?

Sim o nome deve permanecer no historico

- Ao informar um número de louvor que já existe no catálogo global, o sistema deve sempre reutilizar o nome existente. O usuário poderá corrigir/editar o nome desse louvor depois?

O sistema deve sim reutilizar um numero existente, mas poderá alterar o nome corringdo

- A exclusão de um louvor também será permitida? Se for excluído do catálogo, ele deve permanecer registrado nos cultos antigos?

Um louvor só poderá ser alterado não poderá ser excluido,uma vez que foi alterado seu nome não há necessidade de corigir o histórico  

- Na atualização simultânea, podemos usar operações atômicas no MongoDB para os contadores, garantindo que dois cliques ao mesmo tempo não percam incrementos?

Sim as operações devem ser atómicas 

- A data do culto deve considerar o fuso horário de Brasília e ser armazenada como uma data de calendário, sem horário?

Os hoararios do culto são padronizdos, não precisam ser registrado na aplicação, somente o tipo mesmo

- A rota administrativa deverá receber também o nome da igreja, usuário e senha para criar o acesso? O usuário da igreja precisa ser único?

Sim deve receber os tres campos, nome, usuario e senha, a senha deve ser sugerida conforme o padrão
O usuario da igreja será um codigo de 6 digitos, e deve ser único

- A “senha específica” da rota administrativa pode ficar em uma variável de ambiente, como ADMIN_SECRET?
Exato

- A alteração da senha da igreja deve encerrar as sessões/dispositivos atualmente autenticados ou eles continuam acessando até expirar a sessão?

Sim caso a senha seja alterada todas as seções devem ser encerradas

- Como o catálogo de louvores é global, quando uma igreja alterar o nome do louvor, essa alteração deverá aparecer para todas as igrejas?

Sim a alteração fica disponivel para todas as igrejas

- Nos cultos antigos, o nome do louvor deve acompanhar a alteração global ou o sistema deve preservar o nome que existia no momento do culto?

Não, uma vez o nome alterado, essa alteração vale para os proximos uso, não retorne nas listas anteriores alterando o nome, preservando os nome antigo

- A senha sugerida para uma nova igreja será gerada automaticamente pelo sistema, seguindo as regras de 8 caracteres, letras, números e caracteres especiais?

Sim, faça a sugestão conforme o padrão

- Ao excluir um membro, ele deve deixar de aparecer nas sugestões para novos cultos, mas continuar visível nos cultos históricos?

Exato, deixa de aparecer nas listas, mas mantem o nome no historico

- O sistema permitirá que o mesmo membro seja cadastrado apenas uma vez por igreja, evitando duplicidades com diferenças de maiúsculas, minúsculas ou espaços?

Sim não permita duplicidade de nomes na mesma igreja 

- A atualização entre usuários será feita somente por um botão “Atualizar”, sem atualização automática em tempo real?

Exato, não havera atualização em tempo real, apenas se o usuario clicar em atualizar


