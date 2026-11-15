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
