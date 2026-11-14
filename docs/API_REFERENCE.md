# Gold Stamp API Reference (`/api/v1`)

All endpoints return a standardized payload format:

```json
// Success Response
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 45 }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "COOLDOWN_ACTIVE",
    "message": "You have already checked in recently. Please wait 24 minute(s)."
  }
}
```

---

## 1. Authentication (`/api/v1/auth`)
- `POST /register`: Create a customer or business owner account.
- `POST /login`: Authenticate with email/password; returns JWT access & refresh tokens.
- `POST /refresh`: Refresh expired access token with valid refresh token.
- `POST /logout`: Stateless session invalidation.
- `GET /me`: Get authenticated user profile with owned business or customer memberships.

---

## 2. Businesses (`/api/v1/businesses`)
- `GET /`: Search and filter businesses by industry category or query.
- `GET /:slug`: Fetch public merchant profile, cover image, hours, and active campaigns.
- `GET /mine`: Fetch authenticated owner's business and quick stats.
- `PATCH /:businessId`: Update business profile or anti-fraud cooldown settings.
- `GET /:businessId/branches`: List all physical venue branches.
- `POST /:businessId/branches`: Register a new branch location.

---

## 3. Dynamic QR Engine (`/api/v1/qr`)
- `POST /generate/:businessId`: Issue a signed short-lived HMAC QR token with 60s expiration and check-in URL.
- `GET /customer-pass`: Retrieve customer's permanent loyalty QR pass for staff desk scanning.

---

## 4. Check-In & Stamp Issuance (`/api/v1/checkin`)
- `POST /`: Customer scans dynamic QR. Executes atomic PostgreSQL transaction verifying token signature, expiration, business status, and cooldown. Creates `Visit`, issues `StampTransaction`, adds points, and unlocks milestone `RewardRedemption` when completed.
- `POST /staff/:businessId`: Staff member scans customer loyalty pass and validates visit.

---

## 5. Rewards & Redemptions
- `GET /api/v1/rewards/my-rewards`: Customer views available, redeemed, and expired rewards.
- `POST /api/v1/rewards/claim`: Customer claims unlocked reward, generating a unique human-readable voucher code (e.g. `SMASH-7F92K`).
- `GET /api/v1/redemptions/:businessId`: Business views redemption audit log.
- `POST /api/v1/redemptions/verify/:businessId`: Cashier/Staff verifies voucher code and marks status as `REDEEMED` in an atomic transaction.

---

## 6. Customers (`/api/v1/customers`)
- `GET /me/loyalty`: Returns all joined stamp cards with progress (e.g. 7/10), targets, and remaining counts.
- `POST /join/:businessId`: Customer joins a merchant's digital loyalty program.
- `GET /me/visits`: Chronological timeline of verified visits.
- `GET /me/points`: Points balance and ledger.
- `GET /business/:businessId`: Business owner browses patron directory with search and filters.

---

## 7. Platform Admin (`/api/v1/admin`)
- `GET /businesses`: Filter all businesses (PENDING, ACTIVE, SUSPENDED, REJECTED).
- `PATCH /businesses/:id/status`: Approve or suspend business tenant.
- `GET /users`: Platform-wide user directory with role filters.
- `PATCH /users/:id/status`: Suspend or reactivate user account.
- `GET /audit-logs`: Immutable system audit trail.
- `GET /visits`: Platform-wide visits ledger.
- `GET /redemptions`: Platform-wide redemptions ledger.

---

## 8. Subscriptions (`/api/v1/subscriptions`)
- `GET /plans`: List SaaS tiers (STARTER, GROWTH, PRO, ENTERPRISE).
- `GET /:businessId`: Current active subscription.
- `POST /checkout`: Create Razorpay checkout order.
- `POST /verify`: Verify Razorpay payment signature and activate plan.
