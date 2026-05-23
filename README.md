# DREM — Dokoh Ratna Event Manager

An internal web app for event executives at **Dokoh Ratna** to manage clients, vendors, events, checklists, and quotations.

---

## For Users (Event Executives & Admins)

### Logging In
- Open the app URL in your browser.
- Enter your email and password. Accounts are created by the admin — there is no self-signup.
- You will be redirected to the Dashboard automatically after login.

### Dashboard
- Shows 4 summary cards: total clients, total vendors, upcoming events (next 30 days), and events this month.
- Lists the next 10 upcoming events. Click any card to open the event detail.

### Clients
- View all clients in a searchable table.
- Search by name, phone, or email using the search bar.
- **Add Client** — click the button top-right, fill in the form, click Save.
- **Edit** — click the pencil icon on any row.
- **Delete** — admin only; click the trash icon. A client cannot be deleted if they have events linked.
- Click the external link icon to open the Client Detail page, which shows all their linked events.

### Vendors
- View all vendors, filter by category (Pelamin, Catering, Photography, etc.).
- **Add / Edit Vendor** — same as clients. Category is required.
- **Delete** — admin only.

### Events
- Filter events by status (Upcoming, Ongoing, Completed, Cancelled).
- **Add Event** — fill in title, date, time, venue, client, status, and remarks.
- Assigned-to field (for assigning an executive) is visible to admins only.
- Click the external link icon to open the **Event Detail** page.

### Event Detail — 4 Tabs

**Info tab**
: Full event details. Click Edit Event to update any field.

**Items tab**
: Add services/products for this event. Each item can be linked to a vendor (auto-fills category). Shows quantity × unit price with a running subtotal in RM.

**Checklist tab**
: Task list for the event. Type a task and press the + button or Enter to add. Tick the checkbox to mark done. Hover over a task to reveal the delete button. Progress shown as X/Y completed.

**Quotation tab**
: Click **Generate Quotation** to create a quotation — it auto-populates line items from the Items tab and assigns a sequential number (e.g. `DREM-2026-001`).
- Edit line items inline; click the green tick to save each row.
- Set discount and deposit amounts; Balance Due updates automatically.
- Change quotation status (Draft → Sent → Accepted / Rejected).
- Click **Print / PDF** to open the print-ready page, then use your browser's Print dialog (Ctrl+P / Cmd+P) and choose "Save as PDF".

### Roles
| Action | Executive | Admin |
|--------|-----------|-------|
| View all data | ✅ | ✅ |
| Create & edit | ✅ | ✅ |
| Delete clients / vendors / events | ❌ | ✅ |
| Assign events to executives | ❌ | ✅ |

---

## For Developers

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Vite), React Router v6 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State / data | TanStack React Query v5 |
| Forms | react-hook-form |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication (Email/Password) |
| Icons | Lucide React |

### Prerequisites
- Node.js 20+
- A Firebase project (free Spark plan is sufficient for internal use)

---

### 1. Clone & Install

```bash
git clone https://github.com/lvd1999/drem_event_management.git
cd drem_event_management
npm install
```

### 2. Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. **Authentication** → Sign-in method → Enable **Email/Password**.
3. **Firestore Database** → Create database → Start in **production mode**.
4. **Project Settings** → Your apps → Add a Web app → copy the config object.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

`.env.local` is gitignored — never commit it.

### 4. Firestore Security Rules

In **Firestore → Rules**, paste and publish:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function isAdmin() {
      return isAuth() &&
        get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /profiles/{uid} {
      allow read: if isAuth();
      allow write: if request.auth.uid == uid || isAdmin();
    }
    match /counters/{doc} {
      allow read, write: if isAuth();
    }
    match /clients/{id} {
      allow read, create, update: if isAuth();
      allow delete: if isAdmin();
    }
    match /vendors/{id} {
      allow read, create, update: if isAuth();
      allow delete: if isAdmin();
    }
    match /events/{eventId} {
      allow read, create, update: if isAuth();
      allow delete: if isAdmin();
      match /items/{itemId} {
        allow read, create, update, delete: if isAuth();
      }
      match /tasks/{taskId} {
        allow read, create, update, delete: if isAuth();
      }
    }
    match /quotations/{quotationId} {
      allow read, create, update: if isAuth();
      allow delete: if isAdmin();
      match /items/{itemId} {
        allow read, create, update, delete: if isAuth();
      }
    }
  }
}
```

### 5. Firestore Indexes

Some queries require composite indexes. Firestore will prompt you with a link in the browser console the first time a query fails — click it to auto-create the index. The indexes needed are:

| Collection | Fields | Order |
|------------|--------|-------|
| `events` | `eventDate` ASC | for dashboard upcoming query |
| `events` | `status`, `eventDate` ASC | for upcoming events filtered by status |
| `events` | `clientId`, `eventDate` DESC | for client detail page |
| `events/*/items` | `sortOrder` ASC | for event items |
| `events/*/tasks` | `sortOrder` ASC | for checklist |
| `quotations/*/items` | `sortOrder` ASC | for quotation items |

### 6. Create the First Admin User

**Step 1** — In Firebase Console → Authentication → Users → **Add User**.
Enter an email and password.

**Step 2** — In Firestore → Data → Create collection `profiles` → Add document with ID = the user's UID (copy from the Authentication tab):

```
profiles / {uid}
  fullName: "Patrick"
  email: "patmagictrick@gmail.com"
  role: "admin"
  createdAt: (server timestamp)
```

Subsequent users created by the admin will need their profile doc created the same way, with `role: "executive"`.

### 7. Run Locally

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### 8. Build for Production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

### 9. Deploy to Vercel

```bash
npx vercel --prod
```

Set the environment variables in the Vercel dashboard (Project → Settings → Environment Variables) — same keys as `.env.local`.

---

### Project Structure

```
src/
├── lib/
│   ├── firebase.js       # Firebase app singleton (db, auth)
│   ├── utils.js          # cn(), formatRM(), formatDate()
│   └── constants.js      # VENDOR_CATEGORIES, EVENT_STATUSES, etc.
├── context/
│   └── AuthContext.jsx   # Session, profile, role, signOut
├── hooks/                # React Query + Firestore CRUD hooks
│   ├── useAuth.js
│   ├── useClients.js
│   ├── useVendors.js
│   ├── useEvents.js
│   ├── useEventItems.js
│   ├── useChecklist.js
│   ├── useQuotations.js
│   └── useProfiles.js
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # AppShell, Sidebar, Topbar, ProtectedRoute
│   ├── common/           # LoadingSpinner, EmptyState, ConfirmDialog, etc.
│   ├── clients/          # ClientTable, ClientForm
│   ├── vendors/          # VendorTable, VendorForm, VendorCategoryBadge
│   ├── events/           # EventTable, EventForm, EventCard, EventStatusBadge
│   ├── event-items/      # EventItemsTable, EventItemForm
│   ├── checklist/        # ChecklistPanel, ChecklistItem
│   └── quotations/       # QuotationForm, QuotationLineItem, QuotationPreview
└── pages/
    ├── auth/             # LoginPage
    ├── dashboard/        # DashboardPage
    ├── clients/          # ClientsPage, ClientDetailPage
    ├── vendors/          # VendorsPage
    ├── events/           # EventsPage, EventDetailPage
    └── quotations/       # QuotationPrintPage
```

### Firestore Data Model

```
profiles/{uid}              role: admin | executive
clients/{id}
vendors/{id}                category: Pelamin | Catering | Photography | ...
events/{id}
  /items/{id}               subcollection — event line items
  /tasks/{id}               subcollection — checklist tasks
quotations/{id}
  /items/{id}               subcollection — quotation line items
counters/quotations         { year, seq } — sequential quotation numbers
```

### Key Patterns

**Quotation number generation** uses a Firestore transaction on `counters/quotations` to guarantee sequential, collision-free numbers (`DREM-2026-001`).

**Denormalized fields** — `clientName` is stored on each event document and `vendorName` on each item, since Firestore cannot join collections.

**`totalPrice`** is computed in the app (`quantity × unitPrice`) before every write — Firestore has no generated columns.

**React Query** is used for all data fetching. `staleTime: 60_000`. Every mutation calls `queryClient.invalidateQueries` on success to keep the UI fresh.

---

### Adding a New Module (pattern to follow)

1. Add a hook in `src/hooks/use{Module}.js` — Firestore CRUD wrapped in `useQuery` / `useMutation`.
2. Add form and table components in `src/components/{module}/`.
3. Add page(s) in `src/pages/{module}/`.
4. Add route in `src/App.jsx`.
5. Add nav link in `src/components/layout/Sidebar.jsx` if it needs a top-level nav entry.

---

### Vendor Categories

`Pelamin · Catering · Photography · Videography · Florist · Sound & Lighting · MC · Wardrobe · Makeup · Others`

To add a new category, update the `VENDOR_CATEGORIES` array in [src/lib/constants.js](src/lib/constants.js).

---

### Support

For issues or feature requests, contact the developer or open an issue on the [GitHub repository](https://github.com/lvd1999/drem_event_management).
