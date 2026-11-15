# Deploy do Flow Services na Vercel

## Pré-requisitos

- Projeto MongoDB acessível a partir da Vercel.
- Repositório conectado à Vercel.
- Variáveis de ambiente configuradas na Vercel.

## Variáveis de ambiente

Configure em **Project Settings → Environment Variables**:

- `MONGODB_URI`: string de conexão do MongoDB.
- `MONGODB_DB_NAME`: nome do banco, caso não esteja definido na URI.
- `ADMIN_SECRET`: segredo usado na criação administrativa de igrejas.
- `SESSION_SECRET`: segredo longo e aleatório usado nas sessões.

Configure as variáveis nos ambientes Preview e Production conforme necessário. Nunca coloque valores reais no `.env.example` ou no repositório.

## Verificações antes do deploy

Execute localmente:

```bash
npm ci
npm run test:ci
npm run build
```

O build deve gerar o manifesto PWA e o service worker. A aplicação precisa ser servida por HTTPS em produção para instalação do PWA.

## Publicação

O arquivo `vercel.json` define o build como `npm run build`. A Vercel pode publicar o projeto sem configuração adicional de rotas, pois o Nuxt/Nitro gera as páginas e APIs.

Após o deploy, valide:

1. `/login` abre sem autenticação.
2. O login direciona para `/cultos`.
3. Um culto pode ser criado e atualizado.
4. `/api/health` responde com status `ok`.
5. O navegador identifica a aplicação como instalável.
6. A alteração de senha encerra as sessões existentes.

## Criação administrativa pelo Zsh

O segredo `ADMIN_SECRET` pode conter caracteres como `!`, `<` e `>`. No Zsh, o caractere `!` pode ser interpretado como expansão do histórico e gerar o erro `event not found`.

Leia o segredo de forma silenciosa em uma variável e use-o entre aspas duplas:

```bash
printf "Admin secret: "
read -r -s ADMIN_SECRET
printf "\n"

vercel curl /api/admin/churches \
  --deployment https://flowservices-ejeeef8f8-ftesch-8273s-projects.vercel.app \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{"name":"Valparaiso II","username":"061453","password":"061453#VALP2"}'

unset ADMIN_SECRET
```

O comando `vercel curl` permite acessar deployments protegidos pela Vercel Authentication. A rota da aplicação continua exigindo o cabeçalho `x-admin-secret`.

Se o segredo for exposto em um terminal, histórico ou mensagem, gere um novo valor, atualize `ADMIN_SECRET` na Vercel e faça um novo deploy.

```bash

printf "Admin secret: "
read -r -s ADMIN_SECRET
printf "\n"

curl -X POST https://flowservices-ejeeef8f8-ftesch-8273s-projects.vercel.app/api/admin/churches \
-H "Content-Type: application/json" \
-H "x-admin-secret: $ADMIN_SECRET" \
-d '{
"name": "Valparaiso 2",
"username": "061453",
"password": "061453#VALP2"
}'

unset ADMIN_SECRET

```