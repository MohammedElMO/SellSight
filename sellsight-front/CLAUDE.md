# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the `sellsight-front/` directory.

See the root `/CLAUDE.md` for full project context (backend, shared types, CI/CD pipeline).

## Commands

```bash
# Dev server
pnpm dev

# Production build (also type-checks)
pnpm build

# Type-check only
npx tsc --noEmit

# Lint
pnpm lint
```

## Next.js 16 Notes

- This project uses **Next.js 16.2.3** (not 15). App Router is the default.
- All interactive components need `'use client'` — pages with `useState`, `useEffect`, hooks, or event handlers are all client components.
- Route groups `(auth)` and `(customer)` affect folder structure only, not URLs.
- Dynamic segments: `[id]` — use `useParams<{ id: string }>()` from `next/navigation`.

## Key Conventions

**Forms — always use react-hook-form + Zod:**
- `useForm<T>({ resolver: zodResolver(schema), defaultValues: {...} })`
- Schemas live in `lib/schemas.ts`, typed with `satisfies z.ZodType<SharedType>`
- Numeric inputs: use `z.number()` + `register('field', { valueAsNumber: true })` — never `z.coerce.number()` (causes resolver type mismatch with react-hook-form)
- Enum fields with defaults: do NOT put `.default()` in the Zod schema — use `useForm defaultValues` instead (`.default()` makes the input type optional, breaking the resolver generic)
- Password toggle: keep `useState` for show/hide, rest of form through react-hook-form

**Shared types:**
- Import request/response types from `@shared/types`, never redefine locally
- Path alias `@shared/*` → `../shared/*` (configured in `tsconfig.json`)

**Styling:**
- Tailwind v4 — `@import "tailwindcss"` in `globals.css`, no `tailwind.config.js` needed
- Design tokens as CSS variables in `globals.css`: `--background`, `--surface`, `--surface-hover`, `--border`, `--border-hover`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-fg`, `--danger`, `--success`, `--warning`
- Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for all conditional classNames

**`Input` component (`components/ui/input.tsx`):**
- `InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'>` — intentional, HTML's `prefix` is `string` but we need `ReactNode`
- Spread `{...register('field')}` directly onto `<Input>`, `<Textarea>`, or `<Select>`

**Utility functions (`lib/utils.ts`):**
- `cn(...classes)` — merge Tailwind classes
- `formatPrice(n)` — formats as USD currency
- `formatDate(isoString)` — uses `date-fns` `parseISO` + `format('MMM d, yyyy')`
- `truncate(str, max)` — truncates with ellipsis
- `initials(firstName, lastName)` — e.g. `"JD"`

**API errors:**
- Cast as `{ response?: { data?: { message?: string } } }` to extract the Spring Boot error message

**State:**
- Auth: `useAuthStore` from `store/auth.ts` (Zustand, persisted to localStorage) — provides `isAuthenticated`, `role`, `user`, `login()`, `logout()`
- Cart: `useCartStore` from `store/cart.ts` (Zustand, in-memory) — `items`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `totalItems()`, `totalPrice()`
- Server data: React Query `useQuery` / `useMutation` via `lib/services.ts`

## Pages & Route Structure

| Route | File | Access |
|---|---|---|
| `/` | `app/page.tsx` | Public (hero) / redirects by role |
| `/login` | `app/(auth)/login/page.tsx` | Public |
| `/register` | `app/(auth)/register/page.tsx` | Public |
| `/products` | `app/(customer)/products/page.tsx` | Public |
| `/products/[id]` | `app/(customer)/products/[id]/page.tsx` | Public |
| `/cart` | `app/(customer)/cart/page.tsx` | CUSTOMER |
| `/orders` | `app/(customer)/orders/page.tsx` | CUSTOMER |
| `/orders/[id]` | `app/(customer)/orders/[id]/page.tsx` | CUSTOMER |
| `/seller/dashboard` | `app/seller/dashboard/page.tsx` | SELLER / ADMIN |
| `/seller/products` | `app/seller/products/page.tsx` | SELLER / ADMIN |
| `/seller/products/new` | `app/seller/products/new/page.tsx` | SELLER / ADMIN |
| `/seller/products/[id]/edit` | `app/seller/products/[id]/edit/page.tsx` | SELLER / ADMIN |
| `/admin/orders` | `app/admin/orders/page.tsx` | ADMIN |
