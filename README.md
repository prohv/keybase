# KeyBase: Secure Team API Vault

A high-performance, secure credential management platform designed for teams to store, encrypt, and share sensitive API keys through administrative access controls and unique join codes.

Built as a full-stack technical assignment focusing on security-first architecture, utilizing Next.js 16.1.6 (App Router), Drizzle ORM, and the Bun runtime.

---

## Features

* **Advanced Security**: API keys are encrypted using AES-256-CBC before database entry. Keys are never stored or logged in plain text.
* **Team-Based Access Control**: Admins manage team creation and generate unique 8-character hex join codes. Users gain access to shared vaults only after joining a team via valid code.
* **Full CRUD Lifecycle**: Secure management for API keys including creation, listing, secure reveal, and deletion.
* **Robust Authentication**: Secure user registration and login powered by JWT (7-day expiry) and bcrypt password hashing (12 salt rounds).
* **Type-Safe Validation**: End-to-end schema validation using Zod for API requests, server actions, and database operations.
* **Provider Detection**: Automatic detection of API providers (OpenAI, Anthropic, Google Cloud, AWS, Azure, etc.) from key names.
* **Modern Performance**: Built with Bun for rapid installation, execution, and optimized development workflow.
* **API Documentation**: Full Swagger/OpenAPI documentation available at `/api/docs`.

---

## Tech Stack

* **Framework**: Next.js 16.1.6 (App Router)
* **Runtime & Package Manager**: Bun
* **Database & ORM**: PostgreSQL + Drizzle ORM
* **UI & Styling**: Tailwind CSS v4 + shadcn/ui (new-york theme)
* **State Management**: @tanstack/react-query (60s stale time, infinite queries for pagination)
* **Security**: Node.js Crypto (AES-256-CBC), JWT (jsonwebtoken), bcryptjs
* **Validation**: Zod, React Hook Form
* **Documentation**: Swagger UI / OpenAPI 3.0

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Login Form  │  │ Dashboard   │  │ API Key Management UI   │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Query Hooks (Client State)            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Server Actions │  │   REST API      │  │   Middleware    │
│  (Form submits) │  │  (Bearer auth)  │  │  (Auth check)   │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   lib/jwt.ts    │  ← Verify/Sign tokens
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  lib/encryption │  ← AES-256-CBC (32-byte key)
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Drizzle ORM   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

### Data Flow

1. **Authentication Flow**: User submits credentials → Server Action validates → JWT signed → httpOnly cookie set → Session retrieved via `getSession()` on subsequent requests.

2. **API Key Creation**: User submits key name + value → Server action encrypts with AES-256-CBC → Stores `encrypted_key` + `iv` (base64) in database → Key never stored in plaintext.

3. **Key Reveal**: Authorized user requests reveal → Server verifies team membership → Decrypts using stored IV → Returns plaintext once (not persisted in client state).

4. **Team Management**: Admin creates team → 8-char hex code generated (`crypto.randomBytes(4)`) → Users join via code → `team_members` junction table links users to teams.

---

## Database Schema

### Tables (Drizzle ORM)

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| email | text | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL (bcrypt, 12 rounds) |
| role | text | 'admin' \| 'user', default 'user' |
| created_at | timestamp | default now() |

#### `teams`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| name | text | NOT NULL |
| team_code | text | UNIQUE, NOT NULL (8-char uppercase hex) |
| created_by | integer | FK → users.id |
| created_at | timestamp | default now() |

#### `team_members` (Junction Table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| user_id | integer | FK → users.id |
| team_id | integer | FK → teams.id |
| joined_at | timestamp | default now() |

#### `api_keys`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| name | text | NOT NULL |
| encrypted_key | text | NOT NULL (AES-256-CBC encrypted) |
| iv | text | NOT NULL (base64 encoded, 16 bytes) |
| team_id | integer | FK → teams.id |
| created_by | integer | FK → users.id |
| created_at | timestamp | default now() |

---

## Project Structure

```text
keybase/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API Endpoints
│   │   ├── auth/             # /api/auth/login, /api/auth/register
│   │   ├── team/             # /api/team/create, /api/team/join
│   │   ├── api-key/          # /api/api-key/{create,list,reveal,delete}
│   │   ├── docs/             # Swagger UI endpoint
│   │   └── openapi.json/     # OpenAPI specification
│   ├── auth/                 # Auth pages (login, register, logout)
│   ├── dashboard/            # Protected dashboard (team vault UI)
│   ├── team/                 # Team pages (create, join)
│   ├── api-key/              # Server actions for API keys
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing page
│   └── providers.tsx         # React Query provider
├── components/
│   ├── ui/                   # shadcn/ui components (18 total)
│   ├── api-key/              # ApiKeyForm, ApiKeyTable
│   └── landing/              # Header, HeroSection, FeatureGrid
├── hooks/                    # React Query hooks
│   ├── use-api-keys.ts       # Infinite query for paginated keys
│   ├── use-auth.ts           # Login/register mutations
│   ├── use-team.ts           # Join team mutation
│   └── use-mobile.ts         # Mobile detection
├── lib/
│   ├── api/
│   │   └── fetch.ts          # Server-side fetch helpers
│   ├── encryption.ts         # AES-256-CBC encrypt/decrypt
│   ├── jwt.ts                # JWT sign/verify, getSession, getCurrentUser
│   ├── providers.ts          # API provider detection (logos, names)
│   └── utils.ts              # cn() utility for class merging
├── src/db/
│   ├── schema.ts             # Drizzle schema definitions
│   └── index.ts              # Database connection
├── drizzle/
│   └── migrations/           # SQL migrations
├── proxy.ts                  # Middleware (auth check - currently disabled)
├── drizzle.config.ts         # Drizzle ORM configuration
├── components.json           # shadcn/ui configuration
└── package.json              # Dependencies
```

---

## API Endpoints

All API routes use **Bearer token authentication** via `Authorization: Bearer <token>` header.

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | No | Login, returns JWT token |
| `/api/auth/register` | POST | No | Register new user |
| `/api/team/create` | POST | Yes | Create team, returns team code |
| `/api/team/join` | POST | Yes | Join team via code |
| `/api/api-key/create` | POST | Yes | Create encrypted API key |
| `/api/api-key/list?teamId=X` | GET | Yes | List keys for team (paginated) |
| `/api/api-key/reveal` | POST | Yes | Decrypt and reveal key |
| `/api/api-key/delete` | DELETE | Yes | Delete key permanently |
| `/api/docs` | GET | No | Swagger UI documentation |
| `/api/openapi.json` | GET | No | OpenAPI 3.0 specification |

---

## Quick Start

### 1. Prerequisites

* Bun installed (`curl -fsSL https://bun.sh/install | bash`)
* PostgreSQL instance (Local or Docker)

### 2. Installation

```bash
git clone https://github.com/prohv/keybase.git
cd keybase
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/keybase
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_base64_key
```

*Note: To generate a secure encryption key, run:*
```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

```bash
bun drizzle:push      # Sync schema changes instantly
# OR
bun drizzle:generate  # Generate migration files
bun drizzle:migrate   # Apply migrations
```

### 5. Run Development Server

```bash
bun dev
```

The application will be available at http://localhost:3000.

API documentation available at http://localhost:3000/api/docs.

---

## Security Implementation

### Encryption Details

* **Algorithm**: AES-256-CBC
* **Key Length**: 32 bytes (derived from `ENCRYPTION_KEY` env var, base64 decoded)
* **IV**: 16 bytes, randomly generated per encryption (`crypto.randomBytes(16)`)
* **Storage**: Both `encrypted_key` and `iv` stored separately in database (base64 encoded)

### Security Features

1. **Zero-Knowledge Architecture**: Plaintext keys are only decrypted on the server during an authorized "Reveal" request and are never persisted in browser state or React Query cache.

2. **Team-Based Access Control**: Membership verification on every operation. Users can only access keys from teams they belong to.

3. **Secure Cookie Handling**: JWT stored in httpOnly cookie with `secure` flag (production), `sameSite=lax`, 7-day expiry.

4. **Password Security**: bcryptjs with 12 salt rounds for password hashing.

5. **Input Validation**: All inputs validated with Zod schemas before processing.

6. **One-Time Reveal**: Keys displayed only when explicitly requested, encouraging immediate secure storage by users.

---

## State Management

### React Query Configuration

* **Stale Time**: 60 seconds
* **Retry**: 1 attempt
* **Refetch on Window Focus**: Disabled
* **Infinite Queries**: Used for paginated API key lists (4 keys per page)

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useApiKeys(teamId)` | Infinite query for paginated keys |
| `useUserTeams()` | Fetch user's teams |
| `useCreateApiKeyMutation()` | Create key with automatic invalidation |
| `useDeleteApiKeyMutation(teamId)` | Delete key |
| `useLoginMutation()`, `useRegisterMutation()` | Auth mutations |
| `useJoinTeamMutation()` | Join team mutation |

---

## Server Actions

The app uses **Next.js Server Actions** for form submissions:

| Action | Location | Purpose |
|--------|----------|---------|
| `loginAction` | `app/auth/login/action.ts` | Form-based login |
| `registerAction` | `app/auth/register/action.ts` | Form-based registration |
| `logoutAction` | `app/auth/logout/action.ts` | Clear session cookie |
| `createApiKeyAction` | `app/api-key/create/action.ts` | Create encrypted key |
| `revealApiKeyAction` | `app/api-key/reveal/action.ts` | Decrypt and reveal key |
| `deleteApiKeyAction` | `app/api-key/delete/action.ts` | Delete key permanently |
| `createTeamAction` | `app/team/create/action.ts` | Create team |
| `joinTeamAction` | `app/team/join/action.ts` | Join team via code |

---

## Useful Commands

| Command | Action |
|---------|--------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bunx shadcn@latest add` | Add new UI components |
| `bun drizzle:push` | Push schema changes to DB |
| `bun drizzle:generate` | Generate migration files |
| `bun drizzle:migrate` | Apply migrations |
| `bunx eslint .` | Run ESLint |

---

## Scalability & Future Roadmap

* **Redis Integration**: Implementation of a caching layer for high-frequency credential lookups.
* **Audit Logging**: Comprehensive tracking of "Reveal" actions for enterprise security trails.
* **Secrets Management**: Integration support for HashiCorp Vault or AWS Secrets Manager.
* **Middleware Activation**: Enable `proxy.ts` for route-level authentication.
* **Key Rotation**: Automated key rotation reminders and versioning.
* **Multi-Factor Authentication**: TOTP-based 2FA for enhanced security.

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ENCRYPTION_KEY` | 32-byte base64 key for AES encryption | Yes |

---

**Developed by prohv**
