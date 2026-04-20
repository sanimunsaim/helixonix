# HelixOnix Buyer Hub — Technical Specification

## Dependencies

### Production

| Package | Version | Purpose |
|---|---|---|
| `react` | `^19.0.0` | UI framework |
| `react-dom` | `^19.0.0` | DOM renderer |
| `react-router-dom` | `^7.0.0` | Client-side routing (multi-page SPA) |
| `zustand` | `^5.0.0` | Lightweight global state management |
| `@tanstack/react-query` | `^5.0.0` | Server state caching, data fetching |
| `framer-motion` | `^12.0.0` | Declarative animations, layout transitions, AnimatePresence |
| `three` | `^0.172.0` | Dual-helix wave 3D background on hero/login |
| `@types/three` | `^0.172.0` | Three.js TypeScript definitions |
| `lucide-react` | `^0.460.0` | Icon library (200+ icons) |
| `zod` | `^3.24.0` | Runtime schema validation for forms |
| `react-hook-form` | `^7.54.0` | Form state management with validation |
| `@hookform/resolvers` | `^3.9.0` | Zod resolver for react-hook-form |
| `@fontsource/orbitron` | `^5.0.0` | Self-hosted Google Font (Display) |
| `@fontsource/rajdhani` | `^5.0.0` | Self-hosted Google Font (Heading) |
| `@fontsource-variable/dm-sans` | `^5.0.0` | Self-hosted Google Font (Body) |
| `@fontsource/jetbrains-mono` | `^5.0.0` | Self-hosted Google Font (Mono) |
| `clsx` | `^2.1.0` | Conditional className utility |
| `tailwind-merge` | `^2.6.0` | Merge Tailwind classes without conflicts |

### Dev

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^6.0.0` | Build tool (bundled with React init script) |
| `@vitejs/plugin-react` | `^4.0.0` | React Fast Refresh for Vite |
| `tailwindcss` | `^3.4.0` | Utility-first CSS (bundled with init script) |
| `postcss` | `^8.4.0` | CSS processing (bundled) |
| `autoprefixer` | `^10.4.0` | CSS vendor prefixes (bundled) |
| `typescript` | `^5.7.0` | Type system (bundled) |
| `@types/react` | `^19.0.0` | React type defs (bundled) |
| `@types/react-dom` | `^19.0.0` | ReactDOM type defs (bundled) |

### Already bundled with webapp-building init

- `tailwindcss`, `postcss`, `autoprefixer`
- `typescript`, `@types/react`, `@types/react-dom`
- `vite`, `@vitejs/plugin-react`

### Install command (after init)

```bash
npm install react-router-dom zustand @tanstack/react-query framer-motion three @types/three lucide-react zod react-hook-form @hookform/resolvers clsx tailwind-merge
```

Font packages (self-hosted via npm instead of Google Fonts CDN for reliability):

```bash
npm install @fontsource/orbitron @fontsource/rajdhani @fontsource-variable/dm-sans @fontsource/jetbrains-mono
```

---

## Component Inventory

### Layout (shared across pages)

| Component | Source | Reuse |
|---|---|---|
| `Navbar` | Custom | All pages — glassmorphism nav with scroll-aware opacity |
| `Footer` | Custom | All public pages |
| `MobileMenuDrawer` | Custom (Framer Motion) | Triggered from Navbar hamburger |
| `SearchOverlay` | Custom | Global — triggered by search icon or `/` key |
| `NotificationDropdown` | Custom | From Navbar bell icon |
| `UserMenuDropdown` | Custom | From Navbar avatar |
| `AuthGuard` | Custom HOC | Wraps all authenticated routes |
| `PageLayout` | Custom | Wrapper: Navbar + main content + Footer (conditional) |

### Sections (page-specific, used once)

**Home:**
| Component | Source |
|---|---|
| `HeroSection` | Custom — Three.js helix + starfield + floating cards |
| `CategoryNavSection` | Custom — horizontal scrollable chips |
| `TrendingAssetsSection` | Custom — AssetCard grid with skeleton loading |
| `AIStudioShowcaseSection` | Custom — 4×2 AIToolCard grid |
| `FeaturedCollectionsSection` | Custom — 3 editorial collection cards |
| `ServicePreviewSection` | Custom — SellerCard row |
| `WhyHelixonixSection` | Custom — stats + feature pillars + logo strip |
| `PricingPreviewSection` | Custom — 3 plan cards |

**Explore:**
| Component | Source |
|---|---|
| `FilterSidebar` | Custom — collapsible accordion filters |
| `ExploreToolbar` | Custom — search, view toggle, active filter chips |
| `AssetGrid` | Custom — responsive grid with infinite scroll |

**Asset Detail:**
| Component | Source |
|---|---|
| `AssetPreview` | Custom — image zoom / video player / audio waveform |
| `ThumbnailStrip` | Custom — horizontal scroll |
| `PurchasePanel` | Custom — sticky sidebar, price, license, CTA |
| `ReviewsSection` | Custom — ReviewCard list |

**AI Studio:**
| Component | Source |
|---|---|
| `AIStudioHero` | Custom — compact hero + credit badge |
| `AIToolGrid` | Custom — 4×2 large AIToolCards |
| `RecentGenerationsStrip` | Custom — horizontal scroll thumbnails |

**AI Tool Workspace:**
| Component | Source |
|---|---|
| `GenerationControls` | Custom — prompt, parameters, generate button |
| `OutputCanvas` | Custom — empty/progress/complete/error states |
| `GenerationHistoryStrip` | Custom — last 5 generations |
| `ProTipBox` | Custom — contextual guidance |

**Services:**
| Component | Source |
|---|---|
| `ServicesHeader` | Custom — title + search |
| `CategoryTabs` | Custom — pill-style filter tabs |
| `GigGrid` | Custom — GigCard responsive grid |

**Gig Detail:**
| Component | Source |
|---|---|
| `GigGallery` | Custom — image slider with drag |
| `GigDescription` | Custom — rich text + FAQ accordion |
| `OrderPanel` | Custom — sticky, package tabs, add-ons, total |

**Seller Profile:**
| Component | Source |
|---|---|
| `SellerHero` | Custom — banner + avatar overlap |
| `SellerStats` | Custom — icon+number stat row |
| `TabbedContent` | Custom — Portfolio/Gigs/Reviews tabs |

**Dashboard:**
| Component | Source |
|---|---|
| `WelcomeHeader` | Custom — personalized greeting |
| `StatsRow` | Custom — 4 stat cards |
| `QuickActions` | Custom — 3 large CTA buttons |
| `RecentActivity` | Custom — vertical timeline |
| `ActiveOrdersWidget` | Custom — horizontal OrderStatusCard scroll |
| `LibraryView` | Custom — search + filters + AssetCard grid |
| `OrdersListView` | Custom — tabs + OrderStatusCard list |
| `GenerationHistoryView` | Custom — filters + GenerationCard grid |
| `CollectionsView` | Custom — board grid + board detail |
| `BillingView` | Custom — plan card + credits + history table |

**Auth:**
| Component | Source |
|---|---|
| `AuthLayout` | Custom — split screen (branded left / form right) |
| `LoginForm` | Custom — email/password + Google + validation |
| `SignupForm` | Custom — full registration + role selector |
| `ForgotPasswordForm` | Custom — email + success state |

**Marketing:**
| Component | Source |
|---|---|
| `PricingTable` | Custom — 3 plan cards + feature matrix |
| `BlogGrid` | Custom — featured post + post grid + sidebar |
| `BlogPostView` | Custom — MDX-style rich content + TOC |
| `PostProjectWizard` | Custom — 4-step form with progress |

### Reusable Components (used 3+ times across pages)

| Component | Source | Used By |
|---|---|---|
| `Button` | Custom | Every page — 5 variants (primary/secondary/ghost/danger/glow) |
| `Card` | Custom | Every page — glassmorphism base wrapper |
| `Badge` | Custom | AssetCard, GigCard, OrderStatusCard — variants: free/paid/new/trending/pro |
| `Modal` | Custom (Framer Motion portal) | Credit purchase, create board, share, requirements |
| `Toast` | Custom (Framer Motion) | Global feedback — success/error/info |
| `SkeletonCard` | Custom | Explore, Home trending, Dashboard — shimmer loading |
| `AssetCard` | Custom | Home, Explore, Asset Detail, Dashboard Library, Seller |
| `GigCard` | Custom | Services, Seller Profile |
| `SellerCard` | Custom | Home preview, Services marketplace |
| `AIToolCard` | Custom | Home AI Studio, AI Studio hub |
| `GenerationCard` | Custom | Dashboard generations, AI Studio recent |
| `OrderStatusCard` | Custom | Dashboard orders, Dashboard home widget |
| `ReviewCard` | Custom | Asset Detail, Gig Detail, Seller Profile |
| `ProgressBar` | Custom | AI generation, order status |
| `CreditsBadge` | Custom | Navbar, AI Studio hero |
| `PriceDisplay` | Custom | AssetCard, PurchasePanel, GigCard |
| `LicenseSelector` | Custom | Asset Detail purchase panel |
| `PackageSelector` | Custom | Gig Detail order panel |
| `SearchBar` | Custom | Explore, Services, Blog, Library |
| `FilterChips` | Custom | Explore toolbar |
| `Avatar` | Custom | Navbar, SellerCard, ReviewCard — with fallback initials + online dot |
| `StarRating` | Custom | ReviewCard, GigCard, Asset Detail — read-only + interactive modes |
| `Tabs` | Custom | Dashboard orders, Gig Detail, Seller Profile — pill-style |
| `Accordion` | Custom | FAQ, Filter sidebar, License info — chevron toggle |
| `Slider` | Custom | Price range filter, Budget slider — dual-handle |
| `Input` | Custom | All forms — with icon support, validation states |
| `Textarea` | Custom | AI prompt, project description — auto-resize |
| `Select` | Custom | Category, sort, tool type dropdowns |
| `Breadcrumb` | Custom | Asset Detail, Gig Detail — navigation trail |
| `Tooltip` | Custom | Icon buttons, info hints |

### Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Auth state, login/logout/register, session check |
| `useAssets` | Fetch assets with filters (React Query) |
| `useAsset` | Fetch single asset by slug |
| `useGigs` | Fetch gigs with filters |
| `useGig` | Fetch single gig |
| `useOrders` | Fetch user orders |
| `useOrder` | Fetch single order |
| `useGenerations` | Fetch AI generation history |
| `useCredits` | Fetch/refresh credit balance |
| `useCollections` | Fetch user's saved collections/boards |
| `useScrollReveal` | IntersectionObserver for section reveal animations |
| `useMediaQuery` | Responsive breakpoint detection |
| `useToast` | Global toast notification trigger |

---

## Animation Implementation

| # | Animation | Library | Implementation Approach | Complexity |
|---|---|---|---|---|
| 1 | **Dual-Helix Wave Field** | Three.js (vanilla) | Custom class with own renderer, scene, camera. Two `TubeGeometry` ribbons with `CatmullRomCurve3` paths. 300 instanced `Points` for sparkles. Mouse parallax on camera. Cleanup on unmount. | **High** 🔒 |
| 2 | **Starfield Particle Background** | CSS + JS | 200 absolutely positioned `div` dots with randomized CSS custom properties. `@keyframes drift` and `@keyframes twinkle`. JS generates random positions and animation params. `pointer-events: none`. | Low |
| 3 | **Section Reveal (scroll-triggered)** | CSS + IntersectionObserver | `.section-reveal` class starts at `opacity: 0; translateY(20px)`. IntersectionObserver at threshold 0.1 adds `.revealed` class triggering `transition: 0.6s ease-out`. Grid children staggered via `transition-delay: calc(var(--child-index) * 0.05s)`. | Low |
| 4 | **Card Hover Elevation** | CSS | `transition` on `border-color`, `box-shadow`, `transform`. Hover: cyan border glow + `translateY(-2px)`. Thumbnail child scales 1.05 via overflow-hidden container. | Low |
| 5 | **Neon Border Pulse** | CSS | `@keyframes neonPulse` cycling `border-color` and `box-shadow` between 0.3 and 0.6 opacity. `animation: neonPulse 2s ease-in-out infinite`. | Low |
| 6 | **Floating Card Orbits** | CSS | Per-card `@keyframes` with elliptical `translate` + `rotate` path. `animation: orbitN 25s ease-in-out infinite`. Hover pauses animation via `animation-play-state: paused`. | Low |
| 7 | **Hero Content Fade on Scroll** | Framer Motion `useScroll` | `useTransform` on scroll Y to map `opacity: 1→0` and `translateY: 0→-40px` as user scrolls past hero. | Low |
| 8 | **Mobile Menu Drawer** | Framer Motion | `motion.div` with `AnimatePresence`. Backdrop fade. Panel spring animation: `type: 'spring', damping: 25, stiffness: 200`, `x: '-100%' → 0`. | Medium |
| 9 | **Modal Entry/Exit** | Framer Motion + Portal | `AnimatePresence` wraps modal. Backdrop: `opacity: 0→1` (0.2s). Content: `scale: 0.95→1` with spring (0.3s). Exit reverses. | Medium |
| 10 | **Toast Notifications** | Framer Motion | `AnimatePresence` for enter/exit. Slide-in from right (`x: 100→0`). Auto-dismiss after 4s via `setTimeout`. | Low |
| 11 | **Form Validation Shake** | CSS | `@keyframes shake` with `translateX: ±4px`, 3 cycles, 0.4s. Applied to invalid field on submit attempt. | Low |
| 12 | **Progress Bar (indeterminate)** | CSS | `@keyframes progressShimmer` moving `background-position` of a gradient. `background-size: 200% 100%`. 1.5s infinite. | Low |
| 13 | **Skeleton Shimmer Loading** | CSS | `@keyframes shimmer` translating a gradient pseudo-element. Applied to placeholder card shapes. | Low |
| 14 | **Category Nav Scroll Snap** | CSS | `scroll-snap-type: x mandatory` on container. `scroll-snap-align: start` on chips. Fade gradients on edges via pseudo-elements. | Low |
| 15 | **Asset Thumbnail Zoom** | CSS | `overflow: hidden` container. Image `transition: transform 0.3s ease`. On card hover: `scale(1.05)`. | Low |
| 16 | **AI Generation Progress** | CSS + Framer Motion | Progress bar width animates via `transition: width 0.3s ease`. Helix spinner: rotating logo icon with CSS `animation: spin 1s linear infinite` + cyan glow. Streaming preview: blur filter decreases as progress increases. | Medium |
| 17 | **Search Overlay** | Framer Motion | Full-screen overlay: backdrop `opacity: 0→1`, content `scale: 0.95→1` + `y: 20→0`. Escape key handler to close. | Medium |
| 18 | **Notification Dropdown** | Framer Motion | `AnimatePresence`. `opacity: 0→1`, `y: -10→0`, 0.2s ease-out. | Low |
| 19 | **Stat Counter (scroll-triggered)** | Framer Motion + JS | `useInView` to detect viewport entry. Custom hook animates number from 0 to target over 1.5s using `requestAnimationFrame` with ease-out curve. | Medium |
| 20 | **Sticky Purchase Panel** | CSS | `position: sticky; top: 80px`. No animation library needed. | Low |

---

## State & Logic Plan

### State Architecture

**Zustand stores** (4 atomic stores, no slices):

1. **`useAuthStore`** — `{ user, isAuthenticated, isLoading, login(), logout(), register(), checkSession() }`
   - Persisted to `localStorage` (JWT token)
   - `checkSession()` validates token on app mount
   - All authenticated routes depend on this store

2. **`useUIStore`** — `{ sidebarOpen, searchOpen, activeModal, toasts[], addToast(), removeToast(), openModal(), closeModal() }`
   - Modal stack: only one modal open at a time
   - Toast queue: FIFO, auto-dismiss after 4s
   - Mobile menu state

3. **`useCartStore`** — `{ items[], addItem(), removeItem(), clearCart(), total }`
   - Items: `{ assetId, licenseType, price }`
   - Computed `total` from items array
   - Persisted to `localStorage`

4. **`useGenerationStore`** — `{ currentJob, progress, status, outputUrl, startGeneration(), setProgress(), complete(), fail(), reset() }`
   - State machine: `idle → generating → complete/failed`
   - Progress updates simulate SSE streaming

**TanStack Query** for server state:
- `useAssets(filters)` — `['assets', filters]`
- `useAsset(slug)` — `['asset', slug]`
- `useGigs(filters)` — `['gigs', filters]`
- `useGig(id)` — `['gig', id]`
- `useOrders()` — `['orders']`
- `useOrder(id)` — `['order', id]`
- `useGenerations()` — `['generations']`
- `useCredits()` — `['credits']`
- `useCollections()` — `['collections']`

### Data Flow

```
User Action → Zustand Store / React Query → Mock API → Response → Cache Update → UI Re-render
```

- **Read operations**: React Query with caching. All listing pages use infinite scroll pagination.
- **Write operations**: Optimistic updates where possible (save/unsave asset), then invalidate relevant query keys.
- **Real-time simulation**: `setInterval`-based polling for order status and generation progress (since no real backend/Socket.io).

### Mock API Layer

A centralized `mockApi` module with async functions that return Promises with `setTimeout` delays (200–800ms) to simulate network latency. All data is stored in-memory with module-level state, so mutations persist during the session.

Key modules:
- `mockApi/assets.ts` — `getAssets(filters)`, `getAsset(slug)`, `getTrending()`, `getRelated(id)`, `getSimilar(id)`
- `mockApi/gigs.ts` — `getGigs(filters)`, `getGig(id)`, `getSellerGigs(sellerId)`
- `mockApi/orders.ts` — `getOrders()`, `getOrder(id)`, `createOrder(data)`, `updateStatus(id, status)`
- `mockApi/generations.ts` — `getGenerations()`, `createGeneration(data)`, `simulateProgress(id, onProgress)`
- `mockApi/collections.ts` — `getCollections()`, `createBoard(data)`, `addToBoard(boardId, assetId)`, `removeFromBoard(boardId, assetId)`
- `mockApi/auth.ts` — `login(credentials)`, `register(data)`, `getSession()`, `logout()`
- `mockApi/credits.ts` — `getBalance()`, `deduct(amount)`, `purchasePack(packId)`

### Auth Flow

1. App mounts → `checkSession()` in auth store
2. If token in localStorage → validate → set user → mark authenticated
3. If invalid/missing → mark unauthenticated
4. `AuthGuard` HOC checks `isAuthenticated`:
   - If true → render children
   - If false → redirect to `/login` with `?redirect=` param
5. After successful login → redirect to original intended page or `/dashboard`
6. Logout → clear token, clear user, invalidate all queries, redirect to `/`

### Routing Structure

```
/                           → Home (public)
/explore                    → Asset Catalog (public)
/explore/:category          → Category Page (public)
/asset/:slug                → Asset Detail (public)
/ai-studio                  → AI Studio Hub (public)
/ai-studio/:tool            → AI Tool Workspace (public)
/services                   → Services Marketplace (public)
/services/:category         → Service Category (public)
/gig/:seller/:slug          → Gig Detail (public)
/seller/:username           → Seller Profile (public)
/pricing                    → Pricing (public)
/blog                       → Blog (public)
/blog/:slug                 → Blog Post (public)
/login                      → Login (public, redirect if auth)
/signup                     → Sign Up (public, redirect if auth)
/forgot-password            → Forgot Password (public)
/dashboard                  → Dashboard Home (auth required)
/dashboard/library          → Downloads Library (auth required)
/dashboard/orders           → My Orders (auth required)
/dashboard/orders/:id       → Order Detail (auth required)
/dashboard/generations      → AI Generation History (auth required)
/dashboard/favorites        → Collections & Boards (auth required)
/dashboard/billing          → Subscription & Billing (auth required)
/post-project               → Post Project (auth required)
```

### Key Logic Decisions

1. **No Next.js** — The webapp-building skill uses Vite+React. Despite the user's Next.js request, I must follow the skill's stack. Routing is handled by `react-router-dom`. SEO concerns (SSG/SSR) are deferred — this is a client-side SPA.

2. **No real backend** — All API calls hit mock functions. Data persists in module-level variables during the session. Auth uses mock JWT tokens stored in localStorage.

3. **Three.js helix is page-specific** — The dual-helix canvas mounts only on pages that need it (Home hero, Login, Signup). It does not persist across route changes. A simpler starfield CSS animation runs globally as a fixed background.

4. **Image assets are generated, not uploaded** — The user's uploaded images (logo, banner, bg) are used as reference for style only. All asset thumbnails, avatars, and collection covers are AI-generated to match the design document's asset catalog.

5. **AI generation is fully simulated** — No real AI backend. The workspace shows a progress bar that fills over 5–10 seconds, then reveals a pre-generated image. Credit deduction is simulated.

6. **Payment flows are UI-only** — Stripe integration is mocked. Checkout modals show success states without real payment processing.

---

## Project File Structure

```
/mnt/agents/output/app/
├── public/
│   └── images/              # Generated image assets (thumbnails, avatars, backgrounds)
├── src/
│   ├── main.tsx             # Entry point: React root, providers, font imports
│   ├── App.tsx              # Router setup, route definitions, layout composition
│   ├── index.css            # Tailwind directives, CSS variables, global styles, keyframes
│   ├── components/
│   │   ├── ui/              # Primitive reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── FilterChips.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   ├── MobileMenuDrawer.tsx
│   │   │   ├── SearchOverlay.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   └── UserMenuDropdown.tsx
│   │   ├── shared/
│   │   │   ├── AssetCard.tsx
│   │   │   ├── GigCard.tsx
│   │   │   ├── SellerCard.tsx
│   │   │   ├── AIToolCard.tsx
│   │   │   ├── GenerationCard.tsx
│   │   │   ├── OrderStatusCard.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── CreditsBadge.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── LicenseSelector.tsx
│   │   │   └── PackageSelector.tsx
│   │   └── sections/
│   │       ├── home/
│   │       │   ├── HeroSection.tsx
│   │       │   ├── CategoryNavSection.tsx
│   │       │   ├── TrendingAssetsSection.tsx
│   │       │   ├── AIStudioShowcaseSection.tsx
│   │       │   ├── FeaturedCollectionsSection.tsx
│   │       │   ├── ServicePreviewSection.tsx
│   │       │   ├── WhyHelixonixSection.tsx
│   │       │   └── PricingPreviewSection.tsx
│   │       ├── explore/
│   │       │   ├── FilterSidebar.tsx
│   │       │   └── ExploreToolbar.tsx
│   │       ├── asset/
│   │       │   ├── AssetPreview.tsx
│   │       │   ├── ThumbnailStrip.tsx
│   │       │   └── PurchasePanel.tsx
│   │       ├── ai/
│   │       │   ├── GenerationControls.tsx
│   │       │   ├── OutputCanvas.tsx
│   │       │   ├── GenerationHistoryStrip.tsx
│   │       │   └── ProTipBox.tsx
│   │       ├── services/
│   │       │   ├── ServicesHeader.tsx
│   │       │   └── CategoryTabs.tsx
│   │       ├── gig/
│   │       │   ├── GigGallery.tsx
│   │       │   └── OrderPanel.tsx
│   │       ├── seller/
│   │       │   ├── SellerHero.tsx
│   │       │   └── SellerStats.tsx
│   │       └── dashboard/
│   │           ├── WelcomeHeader.tsx
│   │           ├── StatsRow.tsx
│   │           ├── QuickActions.tsx
│   │           ├── RecentActivity.tsx
│   │           ├── ActiveOrdersWidget.tsx
│   │           ├── LibraryView.tsx
│   │           ├── OrdersListView.tsx
│   │           ├── GenerationHistoryView.tsx
│   │           ├── CollectionsView.tsx
│   │           └── BillingView.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Explore.tsx
│   │   ├── AssetDetail.tsx
│   │   ├── AIStudio.tsx
│   │   ├── AIToolWorkspace.tsx
│   │   ├── Services.tsx
│   │   ├── GigDetail.tsx
│   │   ├── SellerProfile.tsx
│   │   ├── Pricing.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashboardLibrary.tsx
│   │   ├── DashboardOrders.tsx
│   │   ├── DashboardOrderDetail.tsx
│   │   ├── DashboardGenerations.tsx
│   │   ├── DashboardFavorites.tsx
│   │   ├── DashboardBilling.tsx
│   │   └── PostProject.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAssets.ts
│   │   ├── useGigs.ts
│   │   ├── useOrders.ts
│   │   ├── useGenerations.ts
│   │   ├── useCredits.ts
│   │   ├── useCollections.ts
│   │   ├── useScrollReveal.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useToast.ts
│   │   └── useDebounce.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   ├── cartStore.ts
│   │   └── generationStore.ts
│   ├── lib/
│   │   ├── utils.ts               # cn() helper, formatPrice, formatDate, truncate
│   │   ├── constants.ts           # Colors, breakpoints, routes, API endpoints
│   │   └── mockApi/
│   │       ├── index.ts           # Axios-like mock client with interceptors
│   │       ├── assets.ts
│   │       ├── gigs.ts
│   │       ├── orders.ts
│   │       ├── generations.ts
│   │       ├── collections.ts
│   │       ├── auth.ts
│   │       ├── credits.ts
│   │       └── data/              # Mock data arrays (seed data)
│   │           ├── assets.ts
│   │           ├── gigs.ts
│   │           ├── sellers.ts
│   │           ├── orders.ts
│   │           ├── generations.ts
│   │           ├── collections.ts
│   │           └── blog.ts
│   ├── effects/
│   │   ├── HelixWaves.ts          # Three.js class (vanilla, not R3F)
│   │   └── Starfield.tsx          # CSS starfield React component
│   └── types/
│       ├── asset.ts
│       ├── gig.ts
│       ├── order.ts
│       ├── user.ts
│       ├── generation.ts
│       └── index.ts
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## CSS Architecture

### Tailwind Config Extensions

```js
// tailwind.config.js — key extensions
{
  theme: {
    extend: {
      colors: {
        'hx-bg': {
          primary: '#050815',
          section: '#0A0F2E',
          card: '#0D1233',
        },
        'hx-accent': {
          cyan: '#00D4FF',
          purple: '#8B2FFF',
          magenta: '#E040FB',
        },
        'hx-text': {
          muted: '#8892B0',
        },
        'hx-border': {
          subtle: 'rgba(0, 212, 255, 0.15)',
          active: 'rgba(0, 212, 255, 0.5)',
        },
        'hx-success': '#00E676',
        'hx-warning': '#FFD600',
        'hx-error': '#FF1744',
      },
      fontFamily: {
        display: ['"Orbitron"', '"Exo 2"', 'sans-serif'],
        heading: ['"Rajdhani"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
        'button': '8px',
        'panel': '16px',
      },
      spacing: {
        'page-gutter': 'clamp(16px, 4vw, 64px)',
      },
      animation: {
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'progress-shimmer': 'progressShimmer 1.5s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        neonPulse: { /* ... */ },
        shimmer: { /* ... */ },
        progressShimmer: { /* ... */ },
        shake: { /* ... */ },
      },
    },
  },
}
```

### Global CSS (`index.css`)

- Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`
- CSS custom properties (design tokens) in `:root`
- All `@keyframes` definitions (starfield drift/twinkle, card orbits, neon pulse, shimmer, shake, progress)
- Glass surface utility classes
- Scrollbar styling (thin, dark, cyan thumb)
- Selection color (cyan background, dark text)
- `scroll-behavior: smooth`
- `font-display: swap` for all font families
