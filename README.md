# ⚡ InstantAPI

**Describe it. Deploy it. Done.**

Turn natural language into live REST APIs with documentation, a playground, and database hosting — instantly.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

---

## Architecture Overview

```
User Prompt → Architect Engine (Claude AI) → Schema (JSONB)
                                                ↓
                                          Project Created
                                                ↓
                                    Universal API Router
                                     /api/v1/[apiKey]/[resource]
                                                ↓
                                    ┌──────────────────┐
                                    │  data_records     │
                                    │  (universal JSONB) │
                                    └──────────────────┘
```

**Key Design Decision**: No `CREATE TABLE` for user APIs. All user data lives in a single `data_records` table using JSONB payloads, validated against the project's `schema_definition`.

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd instantapi
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project credentials

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-your-key   # For AI schema generation
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## File Tree

```
instantapi/
├── app/
│   ├── api/
│   │   ├── v1/[apiKey]/[resource]/
│   │   │   └── route.ts              ← Universal API Router (GET/POST/PUT/DELETE)
│   │   ├── architect/
│   │   │   └── route.ts              ← Schema generation endpoint
│   │   └── usage/
│   │       └── route.ts              ← Usage stats endpoint
│   ├── (dashboard)/
│   │   ├── layout.tsx                ← Dashboard shell with sidebar
│   │   ├── overview/page.tsx         ← API overview + resource manager
│   │   ├── playground/page.tsx       ← Interactive API playground
│   │   ├── docs/page.tsx             ← Auto-generated documentation
│   │   └── settings/page.tsx         ← Usage, billing, account
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── docs/[apiKey]/
│   │   ├── page.tsx                  ← Public shareable API docs (SSR)
│   │   └── PublicDocsClient.tsx
│   ├── globals.css                   ← Global styles, glassmorphism, utilities
│   ├── layout.tsx                    ← Root layout
│   └── page.tsx                      ← Landing page with Magic Input
├── lib/
│   ├── services/
│   │   ├── architect-engine.ts       ← AI schema generation (Claude API)
│   │   └── rate-limiter.ts           ← Rate limiting + usage tracking
│   ├── validators/
│   │   └── schema-validator.ts       ← JSONB payload validation engine
│   ├── utils/
│   │   ├── code-snippets.ts          ← curl/JS/Python snippet generator
│   │   └── constants.ts              ← Pricing tiers, app config
│   └── supabase.ts                   ← Supabase client (anon + admin)
├── types/
│   └── index.ts                      ← Full TypeScript type definitions
├── supabase/
│   └── schema.sql                    ← Complete database schema + RLS
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── package.json
├── .env.example
└── README.md
```

---

## Core Systems

### 1. Architect Engine (`lib/services/architect-engine.ts`)

Converts natural language → JSONB schema using Claude API.

```
Input:  "I need a bookstore API with authors and books"
Output: {
  "books": { "title": "string", "isbn": "string", "price": "number", ... },
  "authors": { "name": "string", "bio": "string", "email": "email", ... }
}
```

Falls back to a deterministic pattern matcher if AI is unavailable.

### 2. Universal API Router (`app/api/v1/[apiKey]/[resource]/route.ts`)

Single dynamic route handles ALL user APIs:

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/{key}/{resource}` | List records (paginated) |
| `GET` | `/api/v1/{key}/{resource}?id={uuid}` | Get single record |
| `POST` | `/api/v1/{key}/{resource}` | Create record (validated) |
| `PUT` | `/api/v1/{key}/{resource}?id={uuid}` | Update record (partial) |
| `DELETE` | `/api/v1/{key}/{resource}?id={uuid}` | Delete record |

Every request is: rate-limited → credit-checked → validated → logged.

### 3. Schema Validator (`lib/validators/schema-validator.ts`)

Validates POST/PUT payloads against the project's `schema_definition`:

- **string**: Non-empty, max 10,000 chars
- **number**: Valid number, not NaN
- **boolean**: true/false only
- **uuid**: UUID v4 format
- **email**: Valid email format
- **url**: Starts with http(s)://
- **date**: ISO 8601 parseable
- **array**: Must be JSON array
- **object**: Must be JSON object

### 4. Rate Limiter (`lib/services/rate-limiter.ts`)

- Tracks requests per project per minute via `request_log` table
- Configurable per-project limits (60/min free, 300/min pro, 1000/min enterprise)
- Increments user credit usage
- Returns 429 with reset time when exceeded

---

## Database Schema

Three core tables (no dynamic DDL):

- **`profiles`** — User accounts, plan, credit tracking
- **`projects`** — API definitions with JSONB `schema_definition`
- **`data_records`** — Universal data store with JSONB `payload`
- **`request_log`** — Every API call logged for usage/rate limiting

Row Level Security enabled on all tables. API routes use the service role key.

---

## Pricing Tiers

| Feature | Free | Pro ($29/mo) | Enterprise ($149/mo) |
|---------|------|-------------|---------------------|
| Requests/month | 1,000 | 50,000 | 500,000 |
| Projects | 3 | 25 | Unlimited |
| Rate limit | 60/min | 300/min | 1,000/min |
| Support | Community | Priority | Dedicated |

---

## Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The app works out of the box on Vercel's Edge Runtime.

---

## License

MIT
