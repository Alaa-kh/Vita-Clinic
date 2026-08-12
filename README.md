# BARQ

Lightning delivery marketplace + e-commerce on **D:\\vita clinic**.

Dispatch-board visual identity (ink + signal lime), live courier tracking, Stripe checkout, WebSockets, AI, analytics, Docker.

## Quick start

```bash
npm install
npm run dev
```

- Storefront: http://localhost:5174
- Shop: http://localhost:5174/shop
- Platform modules: http://localhost:5174/platform
- API: http://localhost:4001/api/health

## Demo accounts

| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Customer | customer@barq.app   | Password123!  |
| Merchant | merchant@barq.app   | Password123!  |
| Courier  | courier@barq.app    | Password123!  |
| Admin    | admin@barq.app      | Password123!  |

## Commerce flow

1. Browse `/shop` → product detail → **Add to cart**
2. `/checkout` → pay (Stripe / Apple Pay / Google Pay / PayPal methods)
3. `/orders/:id/track` → live map tracking + ETA

## Platform features (kept)

Maps & geofencing, payments/refunds/invoices, realtime chat + WebRTC, AI, analytics exports, notifications, storage, security (OTP/2FA/RBAC), booking slots, offline queue, Docker/Nginx/GitHub Actions.

## Docker

```bash
docker compose up --build
```
