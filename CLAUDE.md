# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build → dist/
npm run lint      # ESLint
npm run preview   # preview production build locally
```

No test suite exists. Verify changes by running the dev server and testing in the browser.

## Environment

Copy `.env.example` to `.env.local` and fill in Firebase config keys (`VITE_FIREBASE_*`). Never commit `.env.local`.

## Architecture

React 19 + Vite SPA. All data lives in **Firebase Firestore**; no REST API, no localStorage. **TanStack React Query v5** handles all data fetching and caching (`staleTime: 60_000`). Forms use **react-hook-form**. UI primitives are **shadcn/ui** (Radix + Tailwind). The `@` alias maps to `src/`.

### Data flow pattern

Every feature follows the same three-layer pattern:

1. **Hook** (`src/hooks/use{X}.js`) — wraps Firestore queries in `useQuery` / `useMutation`. Every mutation calls `queryClient.invalidateQueries` on success.
2. **Components** (`src/components/{feature}/`) — a form dialog + a table/list.
3. **Page** (`src/pages/{feature}/`) — assembles components; routes in `src/App.jsx`.

### Firestore collections

```
profiles/{uid}              role: 'admin' | 'executive'
clients/{id}
vendors/{id}
events/{id}
  /items/{id}               event line items (linked to a vendor)
  /tasks/{id}               checklist tasks
  /transactions/{id}        finance ledger (type: 'in' | 'out')
quotations/{id}
  /items/{id}               quotation line items (copied from event items)
counters/quotations         { year, seq } — for sequential DREM-YYYY-NNN numbering
settings/quotation          company branding used in print template
```

### Key cross-cutting patterns

**Denormalized fields** — Firestore can't join; `clientName` is stored on every event doc, `vendorName` on every item. Update these manually if the parent record changes.

**`totalPrice` is computed in app code** before every write (`quantity × unitPrice`). Firestore has no generated columns.

**Quotation number generation** uses a Firestore transaction on `counters/quotations` to guarantee sequential, collision-free numbers. See `useGenerateQuotation` in [src/hooks/useQuotations.js](src/hooks/useQuotations.js).

**Role-based access** — `useAuth()` returns `{ currentUser, profile, role }`. `role` comes from `profiles/{uid}.role` and defaults to `'executive'`. Admin-only UI (delete buttons, assign-to field) is gated on `role === 'admin'`.

**Finance tab** — `events/{eventId}/transactions` subcollection. `type: 'in'` = payment from client; `type: 'out'` = payment to vendor. Hook: [src/hooks/useTransactions.js](src/hooks/useTransactions.js).

### Utility functions (`src/lib/utils.js`)

- `formatRM(amount)` — formats a number as `RM 1,234.50`
- `formatDate(firestoreTimestamp)` — formats to `23 May 2026`
- `cn(...classes)` — Tailwind class merging via clsx + tailwind-merge

### Constants (`src/lib/constants.js`)

`VENDOR_CATEGORIES`, `EVENT_STATUSES`, `QUOTATION_STATUSES`, `CATEGORY_COLORS`. Add new vendor categories here — they propagate everywhere automatically.

### Print page

`/events/:eventId/quotation/:quotationId/print` renders outside `AppShell` (no sidebar/nav). It reads company settings from `settings/quotation` and renders a print-ready template. Access via browser Print → Save as PDF.
