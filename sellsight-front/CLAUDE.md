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
- Spread `{...register('field')}` directly onto `<Input>` or `<Textarea>` (NOT `<Select>` — see below)

**`Select` component (`components/ui/select.tsx`) — Headless UI Listbox:**
- Custom dropdown built on `@headlessui/react` Listbox, anchored via `anchor={{ to, gap }}`. Native `<select>` is no longer used in the app.
- Generic API: `<Select<T> value onChange options={[{ value, label, icon?, description? }]} size align fullWidth prefix label error placeholder triggerClassName />`. Cannot accept `register()` because there is no underlying form element.
- For react-hook-form, wrap with `Controller`:
  ```tsx
  <Controller name="category" control={control} render={({ field }) => (
    <Select fullWidth value={field.value ?? ''} onChange={field.onChange}
      options={PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))}
      error={errors.category?.message} />
  )} />
  ```
- `input.tsx` re-exports `Select` and `SelectOption` for back-compat.

**Utility functions (`lib/utils.ts`):**
- `cn(...classes)` — merge Tailwind classes
- `formatPrice(n)` — formats as USD currency
- `formatDate(isoString)` — uses `date-fns` `parseISO` + `format('MMM d, yyyy')`
- `truncate(str, max)` — truncates with ellipsis
- `initials(firstName, lastName)` — e.g. `"JD"`

**API errors:**
- Cast as `{ response?: { data?: { message?: string } } }` to extract the Spring Boot error message

**State:**
- Auth: `useAuthStore` from `store/auth.ts` (Zustand, persisted to localStorage) — provides `isAuthenticated`, `role`, `emailVerified`, `login()`, `logout()`. **`emailVerified` must be passed through any `login()` call**, including profile-update re-logins in `hooks.ts`.
- Cart: `useCartStore` from `store/cart.ts` (Zustand, in-memory) — `items`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `totalItems()`, `totalPrice()`
- Server data: React Query `useQuery` / `useMutation` via `lib/services.ts`

**Route protection (two layers):**
1. `src/proxy.ts` — Edge runtime, reads `app_token` cookie, decodes JWT (no verification — backend handles that). Redirects unauthenticated, wrong-role, and unverified users before the page loads.
2. Client layouts — e.g. `(account)/layout.tsx` checks Zustand auth state as a second guard.

**Stock rules:**
- `ProductDto.stockQuantity` is the live quantity. Use `product.active && product.stockQuantity > 0` to determine if add-to-cart is allowed.
- Cap quantity stepper at `product.stockQuantity`.
- Do NOT use `product.active` alone — a product can be active but have 0 stock.

## Pages & Route Structure

| Route | File | Access |
|---|---|---|
| `/` | `app/page.tsx` | Public (hero) / redirects by role |
| `/login` | `app/(auth)/login/page.tsx` | Public |
| `/register` | `app/(auth)/register/page.tsx` | Public |
| `/pending-verification` | `app/(auth)/pending-verification/page.tsx` | Public — shown after registration |
| `/verify-email` | `app/(auth)/verify-email/page.tsx` | Public — auto-logs in on success |
| `/products` | `app/(customer)/products/page.tsx` | Public |
| `/products/[id]` | `app/(customer)/products/[id]/page.tsx` | Public |
| `/cart` | `app/(customer)/cart/page.tsx` | CUSTOMER (middleware) |
| `/orders` | `app/(customer)/orders/page.tsx` | CUSTOMER (middleware) |
| `/orders/[id]` | `app/(customer)/orders/[id]/page.tsx` | CUSTOMER (middleware) |
| `/seller/dashboard` | `app/seller/dashboard/page.tsx` | SELLER / ADMIN (middleware) |
| `/seller/inventory` | `app/seller/inventory/page.tsx` | SELLER / ADMIN (middleware) |
| `/seller/products` | `app/seller/products/page.tsx` | SELLER / ADMIN (middleware) |
| `/seller/products/new` | `app/seller/products/new/page.tsx` | SELLER / ADMIN (middleware) |
| `/seller/products/[id]/edit` | `app/seller/products/[id]/edit/page.tsx` | SELLER / ADMIN (middleware) |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | ADMIN (middleware) |
| `/admin/inventory` | `app/admin/inventory/page.tsx` | ADMIN (middleware) — vector search + batch stock update |
| `/admin/orders` | `app/admin/orders/page.tsx` | ADMIN (middleware) |
