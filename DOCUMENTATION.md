# Flow Force – Tap-to-Dance Telegram Web App

## 1. Product Snapshot
- **Platform:** Telegram Web App, optimized for mobile devices
- **Core Loop:** Tap on the dancer to earn Flow, level up, unlock moves, and curate dance events
- **Tech Stack:** React 19, TypeScript, Vite, Telegram Web App API, modular CSS, custom i18n (RU)

## 2. Gameplay & Features
### 2.1 Tap & Progression
- `handleTap` increments Flow balance, lifetime score, and spawns floating score chips (auto-cleared via `useEffect`)
- Tap power scales with purchased moves (`tapPower` memoized with diminishing returns)
- Level curve uses exponential thresholds (`level` memoized on `lifetimeScore`)

### 2.2 Shop & Moves
- Three move families defined in `MOVE_STYLES`
- Shop view (`renderShop`) lists moves with Flow pricing; invoices routed through Telegram for authenticated users

### 2.3 Events Module
- `EventModal` collects: poster image, name, description, country/city, category, date, time, price range, Instagram handle
- Basic validation ensures required fields before `onAddEvent`
- Events persist to `localStorage` (`STORAGE_KEY_EVENTS`); legacy entries are normalized on load
- Cards rendered in a responsive two-column grid with badges, emoji metadata, price band, and Instagram link

### 2.4 Localization
- All UI strings resolved from `src/i18n/ru.ts` (URL-encoded to avoid source encoding issues)
- Components reference `RU` helpers instead of hard-coded text; extendable by mirroring the `decode` strategy

## 3. Architecture Overview
```
src/
|-- App.tsx                # Root component: game loop, navigation, auth, events
|-- main.tsx               # React entry point
|-- i18n/ru.ts             # Russian translation catalog
|-- components/
|   |-- EventModal.tsx     # Event creation modal
|   |-- EventModal.css     # Modal styling
|   `-- EventModalExample.tsx # Standalone modal demo
|-- assets/images/         # Static imagery (logo, hero)
|-- App.css                # Global styles
public/
`-- index.html             # Vite HTML shell + Telegram script
```

### 3.1 State & Storage
- React state slices: balances, owned moves, events, modal toggles, view routing
- `sessionStorage`: caches Telegram session token
- `localStorage`: stores event catalog (normalized on boot)
- refs: `floatingIdRef` for score IDs, `fileInputRef` to reset uploads

### 3.2 External Touchpoints
- **Auth:** POST `/api/auth/telegram` with `initData`
- **Payments:** POST `/api/telegram/payments/invoice`, process via `webApp.openInvoice`
- **Telegram shell:** `webApp.ready()` and `webApp.expand()` ensure viewport control

## 4. Development Workflow
### 4.1 Tooling
- `npm install`
- `npm run dev` – start Vite
- `npm run build` – TS build + production bundle
- `npm run lint` – ESLint (TS + React)

### 4.2 Environment Assumptions
- Requires Telegram Web App context for full auth/payment flow
- `VITE_API_BASE_URL` must point to backend handling auth + invoices

### 4.3 Testing Pointers
- Manual: verify tap loop, move purchase (with/without auth), event creation (required-field guard)
- Persisted data: inspect `localStorage` (`bot-dance:events`) and `sessionStorage` (`bot-dance:session`)

## 5. Known Gaps & Next Steps
1. **Internationalization:** RU catalog only; consider `en`, `ro`, etc.
2. **Validation UX:** Add inline hints for invalid fields, file-size limits.
3. **Data:** No backend sync for events; currently local storage only.
4. **Accessibility:** Expand keyboard/touch feedback, aria labels for controls.
5. **Testing:** Introduce component/unit tests for tap logic and modal validation.

## 6. Quick Reference
- **Main views:** `View` union -> stage / styles / shop / events
- **Key constants:** `BASE_TAP_POINTS`, `LEVEL_SCALING_FACTOR`, `FLOATING_DURATION_MS`
- **Storage keys:** `STORAGE_KEY_SESSION`, `STORAGE_KEY_EVENTS`
- **Modal helpers:** file upload preview, country suggestions capped at 12 results

Use this doc as the baseline when extending features or delegating tasks to other agents; it flags the integration points, shared state, and pain areas that need deliberate attention.
