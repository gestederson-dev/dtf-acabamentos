# DTF Acabamentos — CLAUDE.md

## Stack
- Next.js 14 App Router (RSC + Server Actions)
- Prisma 7 + Neon PostgreSQL (`@prisma/adapter-neon`)
- NextAuth.js (credentials + Google)
- Tailwind CSS + Geist fonts

## Arquitetura
```
app/(app)/          → páginas autenticadas (layout com sidebar/bottom-nav)
app/login/          → página pública de login
app/o/[shareToken]/ → orçamento público (sem auth)
app/api/            → rotas de API (PDF, etc.)
components/ui/      → átomos de UI (button, card, input, badge…)
components/layout/  → sidebar, bottom-nav, dark-mode-toggle
components/charts/  → gráficos Recharts
components/pdf/     → botão e template PDF
lib/                → pricing, actions, auth, prisma, dados-dashboard
```

## Roles
- `SOCIO` — vê lucro, margem, gráficos, configurações, calculadora
- `VENDEDOR` — vê apenas suas vendas, comissão, ticket médio

## Design system
- Brand black: `#232021`
- Borders sobre shadows, zero zinc, dark mode via `darkMode: "class"`
- KpiCard com accent bar esquerda `w-[3px] bg-[#232021]`
- Badges: `rounded-sm border px-2 py-0.5 text-xs font-medium`
- Valores monetários: `font-mono tabular-nums`

## Convenções
- Server components buscam dados direto via Prisma
- Mutations via Server Actions em `lib/actions/`
- `export const dynamic = "force-dynamic"` em layouts que acessam DB
- Navegação em tabelas: `<Link legacyBehavior><tr>` (não onClick)

## Comandos
```bash
pnpm dev          # desenvolvimento
pnpm build        # build (inclui prisma migrate deploy)
pnpm typecheck    # tsc --noEmit
```

## Variáveis de ambiente necessárias
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
