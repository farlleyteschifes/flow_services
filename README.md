# Flow Services

Aplicação web para registro de cultos, frequência, louvores e participantes.

O plano de implementação está em [`doc/tasks/`](./doc/tasks/README.md) e a especificação funcional em [`doc/specification/README.md`](./doc/specification/README.md).

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Configuração

Copie `.env.example` para `.env` e preencha os segredos necessários. O arquivo `.env` não deve ser versionado.

Variáveis previstas:

- `MONGODB_URI`: conexão com o MongoDB.
- `MONGODB_DB_NAME`: nome do banco, caso não esteja definido na URI.
- `ADMIN_SECRET`: segredo da rota administrativa.
- `SESSION_SECRET`: segredo usado pelo mecanismo de sessão.

## Criação administrativa de igreja

A rota `POST /api/admin/churches` exige o segredo configurado em `ADMIN_SECRET` no cabeçalho `x-admin-secret`.

O corpo recebe `name`, `username` (seis dígitos) e, opcionalmente, `password`. Quando a senha não é enviada, a API gera uma senha forte e a retorna uma única vez como `suggestedPassword`.

## Autenticação

- `POST /api/auth/login`: inicia a sessão com `username` e `password`.
- `GET /api/auth/me`: retorna a igreja autenticada.
- `POST /api/auth/logout`: encerra a sessão; exige o cabeçalho `x-csrf-token`.
- `POST /api/auth/password`: altera a senha; exige autenticação e `x-csrf-token`.

As sessões usam cookies seguros e a alteração da senha invalida todas as sessões existentes.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
