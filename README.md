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
- `GET /api/songs?search=...`: busca louvores do catálogo global.
- `POST /api/songs`: reutiliza ou cria um louvor pelo número.
- `PATCH /api/songs/:id`: corrige o nome de um louvor global.
- `GET /api/members?search=...`: busca membros ativos da igreja autenticada.
- `POST /api/members`: cadastra ou reativa um membro da igreja autenticada.
- `DELETE /api/members/:id`: inativa um membro sem removê-lo do histórico.
- `GET /api/services?date=AAAA-MM-DD&type=noite`: consulta um culto da igreja autenticada.
- `POST /api/services`: cria ou reutiliza um culto pela data e tipo.
- `PATCH /api/services/:id/frequency`: incrementa ou decrementa uma categoria de frequência com `category` e `delta` (`1` ou `-1`).
- `DELETE /api/services/:id`: exclui um culto da igreja autenticada.
- `POST /api/services/:id/songs`: adiciona um louvor ao culto usando `songId`.
- `DELETE /api/services/:id/songs/:songId`: remove um louvor do culto.
- `POST /api/services/:id/participants`: adiciona um membro usando `role` e `memberId`.
- `DELETE /api/services/:id/participants/:role/:memberId`: remove um participante da função informada.

As sessões usam cookies seguros e a alteração da senha invalida todas as sessões existentes.

## PWA e conectividade

O Flow Services pode ser instalado como PWA em dispositivos compatíveis. O aplicativo não mantém uma fila offline: consultar e alterar dados exige conexão ativa. Nenhum endpoint da API é armazenado em cache pelo service worker.

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
