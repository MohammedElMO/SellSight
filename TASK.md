
---

```markdown
# TASK: Build Customer-Facing Feature Suite (End-to-End)

You are a senior full-stack engineer working on an enterprise-grade multi-seller e-commerce platform. Build the complete customer-facing feature set with full backend + frontend integration. Lean heavily on battle-tested libraries — do NOT reinvent anything the community has already solved.

---

## CONTEXT

**Existing system:**
- Spring Boot backend with DDD + Hexagonal Architecture
- Next.js 14+ frontend (App Router)
- PostgreSQL 18
- Role-based auth (ADMIN / SELLER / CUSTOMER) already exists
- Product CRUD exists
- Cart + Order state machine exists
- Read `CLAUDE.md` in the repo root FIRST to understand current state

---

## ARCHITECTURAL CONSTRAINTS (NON-NEGOTIABLE)

1. **DDD + Hexagonal per bounded context.** Each context has `domain/`, `application/`, `infrastructure/` packages. Domain imports nothing from infrastructure. Use inbound/outbound ports.

2. **Bounded contexts to touch/create:**
   - Identity & Access
   - Catalog Management
   - Commerce Engine
   - Engagement (reviews, wishlist, Q&A, notifications)
   - Promotions (coupons)
   - Loyalty

3. **Database migrations:** Use **Flyway**. All schema changes as versioned SQL files in `src/main/resources/db/migration/V{n}__{name}.sql`. Never modify past migrations.

4. **Vector search:** Install and use **pgvector** extension for semantic search + similar products. Column type `VECTOR(384)` for embeddings (matches `all-MiniLM-L6-v2`).


6. **Events:** Every significant customer action publishes a domain event to Kafka (`user-events` topic). Do NOT write behavioral events (VIEW, CLICK) to Postgres — Kafka only.

---

## LIBRARIES TO USE (DON'T REINVENT)

### Backend (Spring Boot)
- **Spring Security + JWT** (`jjwt` or `nimbus-jose-jwt`) — auth
- **Spring Data JPA + Hibernate** — persistence
- **Flyway** — migrations
- **MapStruct** — DTO ↔ domain mapping
- **Lombok** — boilerplate reduction
- **Springdoc OpenAPI** — auto-generated Swagger docs
- **Spring Kafka** — event publishing
- **Resilience4j** — retries/circuit breakers for FastAPI calls
- **Testcontainers** — integration tests
- **Spring Cache + Caffeine** — in-memory caching for hot reads
- **pgvector-java** — vector column support in JPA
- **Bucket4j** — rate limiting
- **Stripe SDK** — payment processing (test mode)

### Frontend (Next.js)
- **Tailwind CSS + shadcn/ui** — UI components (copy-paste, don't install a heavy lib)
- **TanStack Query (React Query)** — server state
- **Zustand** — client state (cart, UI)
- **React Hook Form + Zod** — forms with validation
- **NextAuth.js** — auth session management
- **Axios** — HTTP client with interceptors
- **date-fns** — date formatting
- **Framer Motion** — micro-interactions
- **Lucide React** — icons
- **Sonner** — toast notifications
- **Embla Carousel** — product rails
- **React Intersection Observer** — lazy loading / event firing
- **next-intl** — i18n (even if only English now, wire it up)
- **Stripe Elements** — checkout UI
- **Nuqs** — URL state for filters

---

## FEATURES TO BUILD

### 1. Authentication & Account
- Email/password signup with email verification flow
- Login with JWT (access + refresh token)
- Forgot password / reset password flow
- Change password
- Account profile page (edit name, DOB, avatar upload)
- Address book (CRUD, set default shipping/billing)
- Delete account (GDPR compliance — soft delete + data export endpoint)

### 2. Product Discovery
- Product listing page with filters: category tree, price range, brand, rating, in-stock
- Sort: relevance, price asc/desc, rating, newest, best-selling
- Search with autocomplete suggestions (semantic via pgvector + prefix match)
- Product detail page: gallery, variants (size/color selector), price, stock, description, specs, seller card
- "Similar products" rail on detail page (pgvector cosine similarity)
- Recently viewed products (Redis-backed, 1h TTL)
- Category landing pages with SEO metadata

### 3. Cart & Checkout
- Persistent cart (DB-backed for logged-in, session for guest)
- Add to cart from listing + detail page
- Cart page: quantity adjust, remove, save-for-later
- Mini-cart dropdown in header
- Apply coupon code (validate against `coupons` table)
- Multi-step checkout: Address → Shipping → Payment → Review
- Shipping method selection (flat-rate options for now)
- Stripe payment integration (test mode, real flow)
- Order confirmation page with tracking info
- Email confirmation (use **Resend** or **SendGrid**)

### 4. Orders
- Order history page with status badges and filters
- Order detail page with timeline (placed → confirmed → shipped → delivered)
- Reorder button (re-adds items to cart)
- Request return/refund (creates `refund` record)
- Download invoice (PDF via **iText** or **OpenPDF**)

### 5. Engagement
- Write product review (1-5 stars + title + body + images, only if verified purchase)
- View reviews with helpful voting, filter by rating, sort by newest/helpful
- Ask a question on product, view answers
- Wishlist (multiple named lists, add/remove, move to cart)
- Notifications center (bell icon, in-app + real-time via SSE or WebSocket)
- Price drop subscription on product
- Back-in-stock alert subscription

### 6. Personalization
- Personalized homepage with rails:
  - "For You" (from `user_recommendations` table, fallback to popular)
  - "Trending Now"
  - "Recently Viewed"
  - "Continue Shopping" (abandoned cart items)
  - Category highlights
- Search results ranked by: semantic match score + user's historical category affinity

### 7. Loyalty & Referrals
- Points balance widget in account
- Earn points on purchase (1pt per $1, configurable)
- Redeem points at checkout (100 pts = $1 off)
- Transaction history
- Tier display (Bronze/Silver/Gold) based on lifetime spend
- Unique referral code, share link, track referrals

### 8. Event Tracking (Fire-and-Forget)
- Frontend auto-fires events on: page view, product view (on scroll-into-view >2s), click, add-to-cart, remove-from-cart, checkout-start, purchase, search, wishlist-add
- Batched in frontend (max 20 events or 5s interval), sent to `POST /api/v1/events`
- Backend publishes to Kafka without Postgres write
- Use a `useTracker()` hook on frontend for easy instrumentation

---
#BEST PRACTICES

- be re-usable build re-usable components for the front
- make re-uasable hooks that u can re-use in other places and 
- and all react/next best practices
- backend make everything not coupled together so it's flexible for future changes
- MAKE A GREAT LOOKING UI 

## DELIVERABLES

### Backend Structure
```
backend/
├── identity/
│   ├── domain/ (User, Role, Session aggregates)
│   ├── application/ (RegisterUser, Login, VerifyEmail use cases)
│   └── infrastructure/ (JPA repos, REST controllers, JWT adapter)
├── catalog/
│   ├── domain/ (Product, Category, Variant, Inventory, Embedding VO)
│   ├── application/
│   └── infrastructure/
├── commerce/
│   ├── domain/ (Cart, Order, OrderLine, Payment, Refund)
│   ├── application/
│   └── infrastructure/ (Stripe adapter, email adapter)
├── engagement/
│   ├── domain/ (Review, Wishlist, Question, Notification)
│   ├── application/
│   └── infrastructure/
├── promotions/
│   ├── domain/ (Coupon, Promotion)
│   └── ...
├── loyalty/
│   └── ...
├── behavioral/
│   └── infrastructure/ (EventController → Kafka producer only)
└── shared/
    ├── kernel/ (Money, Email, UserId, PageResult value objects)
    └── config/
    ...
```

### Frontend Structure
```
frontend/
├── app/
│   ├── (auth)/ (login, signup, forgot-password)
│   ├── (shop)/ (home, products, product/[slug], category/[slug], cart, checkout)
│   ├── (account)/ (profile, orders, addresses, wishlists, loyalty, notifications)
│   └── api/ (NextAuth, event proxy)
├── components/
│   ├── ui/ (shadcn base)
│   ├── product/ (Card, Gallery, VariantSelector, Reviews)
│   ├── cart/
│   ├── checkout/
│   └── common/
├── hooks/ (useCart, useTracker, useAuth, useRecommendations)
├── lib/ (api client, validators, utils)
├── stores/ (cart store, ui store)
└── types/
```

### Database Migrations (Flyway)
Create versioned migrations for every entity in the Identity, Catalog, Commerce, Engagement, Promotions, and Loyalty contexts, Use separate migrations per context for clean history.


## EXECUTION ORDER

Build in this exact order — each step must be runnable before the next:

1. **Migrations first** — all Flyway files for every context, run cleanly from empty DB
2. **Identity enhancements** — email verification, password reset, addresses, OAuth
3. **Catalog enhancements** — variants, inventory, pgvector embeddings, search
4. **Engagement** — reviews, wishlists, Q&A, notifications
5. **Promotions + Loyalty** — coupons, points system
6. **Commerce enhancements** — Stripe, multi-step checkout, refunds, invoices
7. **Event tracking** — Kafka producer + frontend tracker hook
8. **Frontend** — build pages in parallel with backend using mock data, then wire up
9. **Personalization rails** — wire to `user_recommendations` table (with fallback logic)

---

## DEFINITION OF DONE

- [ ] All Flyway migrations apply cleanly from scratch
- [ ] `pgvector` extension installed, embedding column queryable
- [ ] All backend endpoints documented in Swagger UI
- [ ] Frontend has no `any` types, passes `tsc --noEmit`
- [ ] Backend passes `./gradlew test` with >70% coverage on domain
- [ ] User can: sign up → verify → browse → add to cart → checkout with Stripe test card → receive email → view order → leave review → earn points
- [ ] Behavioral events flow to Kafka (verify with Kafka UI)
- [ ] Similar products work via pgvector on product detail page
- [ ] All forms have Zod validation on frontend + Bean Validation on backend
- [ ] Rate limiting active on auth + event endpoints
- [ ] `CLAUDE.md` updated with:
  - New bounded contexts and their responsibilities
  - New entities and relationships
  - New API endpoints (grouped by context)
  - New environment variables
  - New dependencies added (with rationale)
  - Event catalog (what events are published to Kafka)
  - Setup instructions for pgvector and Stripe test keys
  - Known limitations and next steps

---

## IMPORTANT RULES

- **Do not** build admin or seller features in this task — customer-facing only
- **Do not** skip tests for domain logic
- **Do not** write raw SQL in the domain layer — repositories own persistence
- **Do** commit frequently with conventional commit messages
- **Do** use feature flags (via `feature_flags` table) for anything risky
- **Do** ask for clarification if a feature spec is ambiguous — don't guess on business rules
- **Do** update `CLAUDE.md` as a final step, not incrementally

Begin by reading `CLAUDE.md`, then produce an execution plan with time estimates per step before writing code. Wait for approval on the plan, then proceed.
```

---

## Tips for Using This Prompt

**How to feed it to the agent:**
1. Save the prompt as `TASK.md` in your repo
2. Say: `"Read TASK.md and CLAUDE.md, then begin."`
3. The agent will first produce a plan — review it before letting it code
