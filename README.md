# Real Estate Management System — Frontend

A React single-page application for managing properties, rentals, sales, leads, maintenance, and AI-powered tools. Built with React 18, Context API, and React Router v6. Styled with a custom luxury dark theme.

---

## Architecture Overview

The frontend communicates exclusively with the backend REST API over HTTP. There is no server-side rendering. All state management is handled through React Context and local component state. The application is fully role-aware — each user role (ADMIN, AGENT, CLIENT) sees a different set of routes and UI components.

```
Browser
  |
  | HTTP (JWT Bearer)
  v
Axios Instance (api/axios.js)
  |
  | Interceptors: attach token, handle 401
  v
API Layer (direct calls in components/pages)
  |
  v
React Components
  |
  v
Context Providers (AuthContext)
  |
  v
React Router (role-based routing)
```

---

## Technology Stack

| Concern | Technology |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 |
| State Management | Context API + useState/useEffect |
| HTTP Client | Axios |
| Build Tool | Vite |
| Styling | CSS Variables + Inline Styles |
| Fonts | Cormorant Garamond, DM Sans (Google Fonts) |
| AI Integration | Groq API via backend proxy |

---

## Core Concepts

### Authentication Flow

`AuthProvider` wraps the entire application and manages authentication state. On login, the backend returns an access token, refresh token, and user metadata. These are stored in `localStorage`. The Axios instance reads the token on every request through a request interceptor. A response interceptor catches 401 responses and redirects to login.

```
Login form
  -> POST /api/auth/login
  -> store { access_token, refresh_token, user } in localStorage
  -> set AuthContext state
  -> redirect to role-based dashboard
```

The `AuthContext` exposes `user`, `token`, `login()`, and `logout()`. Components access auth state with `useContext(AuthContext)`.

### Role-Based Routing

`AppRoutes.jsx` defines three sets of protected routes. A `ProtectedRoute` wrapper checks the current user's role against the allowed roles for each route. If the role does not match, the user is redirected to their own dashboard. Unauthenticated users are redirected to `/login`.

Each role has a distinct URL namespace:
- Admin routes live under `/admin/**`
- Agent routes live under `/agent/**`
- Client routes live under `/client/**`

### Axios Instance

`api/axios.js` exports a configured Axios instance with:
- `baseURL` pointing to the backend
- A request interceptor that reads the token from `localStorage` and attaches it as `Authorization: Bearer <token>`
- A response interceptor that catches 401 errors, clears local storage, and redirects to login

All API calls throughout the application use this instance, never the raw `fetch` or a plain `axios` call.

### State Management Pattern

The application uses local component state (`useState`) for UI-specific state such as form values, loading flags, modal visibility, and pagination. Cross-component state that needs to survive navigation — authentication — is managed in `AuthContext`.

There is no global state library. Each page fetches its own data on mount using `useEffect` and `useCallback`. This keeps components self-contained and predictable.

---

## Design System

The application uses a luxury real estate aesthetic throughout. All styling is driven by CSS custom properties defined on `:root` in the global stylesheet.

### Typography

- **Headings and display text**: Cormorant Garamond — a refined serif typeface used for titles, stat numbers, modal headers, and brand elements
- **Body and UI text**: DM Sans — a clean geometric sans-serif used for labels, descriptions, buttons, and form inputs

### Color Palette

| Token | Value | Usage |
|---|---|---|
| --color-dark | #1a1714 | Primary background, navbar, dark surfaces |
| --color-gold | #c9b87a | Primary brand accent, CTAs, active states |
| --color-gold-light | #e8d9a0 | Hover states, light gold accents |
| --color-surface | #faf7f2 | Card backgrounds, form containers |
| --color-border | #e8e2d6 | Card borders, dividers, input borders |
| --color-muted | #9a8c6e | Secondary text, labels, placeholders |

### Component Patterns

**Cards** — All content sections use a consistent card pattern with a header row (title + subtitle or action), a content area, and an optional footer with pagination or totals.

**Status Badges** — Property status, contract status, application status, and lead status all use a shared badge pattern with consistent color coding: green for active/available/approved, amber for pending/warning, red for rejected/overdue, grey for inactive.

**Modals** — A reusable `Modal` component handles all overlay dialogs. It accepts `title`, `onClose`, and an optional `wide` prop for wider content. The overlay closes on backdrop click.

**Toast Notifications** — A `Toast` component appears in the top-right corner for operation feedback. It auto-dismisses after 3.5 seconds. Type can be `success` or `error`.

---

## AI Features

All six AI components are exported from `pages/shared/AiFeatures.jsx` as named exports. They communicate with the backend `/api/ai/**` endpoints, which proxy requests to the Groq API.

| Export | Used In | Purpose |
|---|---|---|
| AiDescriptionGenerator | PropertyForm | Generate title and description from property details |
| AiPriceEstimator | PropertyForm | Suggest market price from property specs and city |
| AiChatWidget | BrowseProperties | Floating chat assistant for clients |
| AiContractSummaryButton | AgentContracts | Summarize a lease contract in plain language |
| AiPaymentRiskPanel | AgentDashboard | Analyze client payment behavior and risk score |
| AiLeadMatcher | AgentLeadMatching | Match client preferences to available properties |

The `AiDescriptionGenerator` and `AiPriceEstimator` are integrated directly into `PropertyForm`. The AI buttons are disabled until the required fields (type, city, area) are filled. When the user clicks Generate, the AI reads the already-filled form fields and returns a result that pre-fills the title, description, and optionally the price — eliminating the need for a separate form.

---

## Notification System

The `Navbar` component polls `GET /api/notifications/unread/count` every 60 seconds and displays the count as a badge on the notification bell. Clicking the bell opens a panel showing the five most recent unread notifications fetched from `GET /api/notifications/unread`.

Clicking a notification marks it as read (`PATCH /api/notifications/{id}/read`) and navigates to the `action_url` associated with that notification. A "Mark all read" action is available in the panel.

Each role has a dedicated notifications page (`/agent/notifications`, `/admin/notifications`, `/client/notifications`) showing the full paginated history with tabs for All and Unread.

---

## Setup and Running

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend running on port 8080

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application starts on `http://localhost:5173` by default.

### Environment

The backend URL is configured in `src/api/axios.js`. Change the `baseURL` to point to the backend:

```js
const api = axios.create({
  baseURL: "http://localhost:8080",
});
```

---

## Key Design Decisions

**Single Axios instance** — All HTTP communication goes through one configured instance. This centralizes token handling, error handling, and base URL configuration. Changing the backend URL or token strategy requires editing one file.

**Role-based page separation** — Admin, agent, and client pages are separated into distinct folders rather than conditionally rendering based on role within shared pages. This makes each role's experience independently maintainable and reduces the risk of accidental cross-role data exposure in the UI.

**AI components integrated into existing forms** — Rather than opening a separate AI panel or wizard, the AI features are embedded directly into the forms where they are needed. The user fills out what they know, then asks AI to fill in the rest. This eliminates redundant data entry and makes the AI feel like a natural part of the workflow rather than a separate tool.

**CSS variables over a component library** — The design system is implemented with CSS custom properties rather than a third-party component library. This gives full control over the visual language and eliminates bundle size overhead from unused components. The luxury aesthetic would be difficult to achieve within the constraints of a generic component library.

**Polling over WebSockets for notifications** — The notification badge uses a 60-second polling interval rather than a persistent WebSocket connection. For a real estate application where notification volume is low, polling is simpler to implement and operate, avoids connection management complexity, and the 60-second delay is acceptable for the use case.
