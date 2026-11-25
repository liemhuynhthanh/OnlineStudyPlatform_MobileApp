# E-Learning Learner Mobile

Expo SDK 58 app for the learner experience. Phases 1-3 mirror the learner web basics on mobile: public browsing, course detail, email verification, profile, cart/checkout/payment, certificates, notification inbox, and push registration.

## Run locally

```powershell
Copy-Item .env.example .env
npm install
npx expo start
```

For a physical device, set `EXPO_PUBLIC_API_URL` to a backend URL reachable from the phone, such as `http://192.168.1.9:3001`. Android emulators use `http://10.0.2.2:3001`; do not use `localhost` from a device.

## Environment

- `EXPO_PUBLIC_API_URL` — backend base URL.
- `EXPO_PUBLIC_WEB_URL` — web app base URL used only by the not-found fallback.

## Phase 1 scope

- Guest landing with latest courses and sign-in/register calls to action.
- Public catalog with debounced search, category chips, clear filters, empty/error states, and pagination.
- Course detail with lessons, suggestions, latest courses, free enrollment, and paid add-to-cart.
- Sign-up handoff to a standalone `/verify-email` screen with OTP validation, resend cooldown, and delivery-unavailable notice.
- Learner profile with avatar upload, name update, and password change.
- Route-aware auth gate: public routes allow guests; dashboard, my learning, profile, learning, and learner payment/certificate/notification routes require a Learner session.

## Phase 2 scope

- Paginated cart with remove action, page-scoped summary, and native handoff from paid-course detail.
- Checkout review with account info, course list, price recheck note, and mutation feedback.
- QR payment screen with 5s polling, 1s countdown, copyable `SEVQR <paymentCode>` memo, cancel confirmation, and paid/terminal states.
- Read-only payment history with status filter and pagination.

## Phase 3 scope

- Certificate list with 10s pending refetch and authenticated PDF download.
- PDF opens through `File.preview()` when supported, otherwise through `expo-sharing`; web uses an anchor download from the returned blob.
- Notification inbox with unread count, mark-one, mark-all, pagination, and safe internal `actionUrl` mapping.
- Native push token registration, rotation listener, foreground notification handler, and deep-link wiring. Permission denial is non-fatal.

## Roadmap

- Phase 4: full layout regression, player/quiz parity polish, deep-link audit.

## Verification

```powershell
npx expo lint
npx tsc --noEmit
npx expo export --platform web
npx expo start --web
```

There is no test framework configured. Manual smoke matrix at 390px, 768px, and 1280px covers loading, empty, error, success, forms, navigation, and mutation states. For Phase 2/3, exercise cart → checkout → QR → history and certificates → notifications. Real payment webhook confirmation, push delivery, and native notification taps require backend infrastructure plus an EAS/dev build and are marked unavailable in local web verification.

## Native notes

Mobile auth uses `/auth/mobile/login`, `/auth/mobile/refresh`, and `/auth/mobile/logout`, with refresh tokens stored in Expo SecureStore. Image upload uses `expo-image-picker`. Push notifications require an EAS development/production build and are unavailable in Expo Go on Android for newer SDKs; the app skips all native push work on web.
