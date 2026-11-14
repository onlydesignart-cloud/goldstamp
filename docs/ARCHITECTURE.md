# Gold Stamp System Architecture

## Overview
Gold Stamp is a production-ready, multi-tenant SaaS platform for digital loyalty, digital stamps, points, rewards, customer visits, and business engagement. It empowers businesses such as cafés, restaurants, pickleball courts, box cricket arenas, gyms, salons, gaming zones, and entertainment venues to launch digital stamp cards.

---

## 1. Domain Roles & Authorization
The platform enforces strict server-side RBAC across three primary personas:

| Role | Key Permissions | Target URLs |
|---|---|---|
| **SUPER_ADMIN** | Platform governance, industry manager, tenant approval/suspension, audit trail | `/admin/*` |
| **BUSINESS_OWNER** | Manage tenant loyalty campaigns, generate dynamic QR codes, view customer list & visits, staff accounts, subscription | `/client/*` |
| **BUSINESS_STAFF** | Front desk kiosk, scan customer QR pass, verify check-ins, verify and redeem vouchers | `/client/redemptions`, `/client/qr` |
| **CUSTOMER** | Universal loyalty wallet, participate in multiple merchants, collect digital stamps & points, redeem unlocked vouchers | `/`, `/discover`, `/loyalty`, `/rewards`, `/points`, `/profile`, `/checkin` |

---

## 2. Multi-Tenant Data Isolation
- Single unified customer identity across all businesses.
- Every business-specific entity (`Campaign`, `CampaignRule`, `Reward`, `Visit`, `StampTransaction`, `PointTransaction`, `RewardRedemption`, `QRCode`, `Subscription`, `BusinessBranch`, `BusinessStaff`) is strictly scoped by `businessId`.
- Server-side middleware `requireBusinessAccess` verifies that the requesting actor belongs to the business tenant before processing any modifications or private reads.

---

## 3. High-Security QR Check-In Engine
```
┌──────────────┐         1. Generate Kiosk QR          ┌───────────────────────────┐
│ Business Desk│ ────────────────────────────────────► │ Backend API /qr/generate  │
└──────────────┘                                       └─────────────┬─────────────┘
       │                                                             │ Signed HMAC
       ▼                                                             ▼ Token (60s exp)
  Counter Screen                                              ┌─────────────┴─────────────┐
 [ Rotating QR ]                                              │ Customer Phone Camera     │
       │                                                      └─────────────┬─────────────┘
       │ 2. Scans QR                                                        │
       └────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼ 3. POST /api/v1/checkin
                               ┌───────────────────┐
                               │  Check-In Engine  │
                               └─────────┬─────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                 Cooldown Check                 Atomic PostgreSQL TX
             (e.g. 30/60 min window)             - Create Visit record
                                                 - Create Stamp record
                                                 - Credit Loyalty Points
                                                 - Update CustomerBusiness
                                                 - Evaluate Milestone Target
                                                 - Unlock Reward if Cycle Reached
```

---

## 4. Technology Stack
- **Frontend (`apps/web`)**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend (`apps/api`)**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Zod validation, JWT with refresh tokens, Helmet, CORS, Rate Limiters.
- **Supporting Infrastructure**: Redis / in-memory task runner fallback, BullMQ scheduler, Docker & Docker Compose, Razorpay abstraction, Cloudflare R2 / S3 abstraction.
