# Gold Stamp Runbook & Getting Started Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.x
- PostgreSQL 17 (or Docker)
- npm 10+ / 11+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build Shared Packages
```bash
npm run build --workspace=@goldstamp/types
npm run build --workspace=@goldstamp/validation
npm run build --workspace=@goldstamp/config
```

### Step 3: Setup PostgreSQL & Seed Database
Configure `.env` at root with your PostgreSQL connection:
```bash
DATABASE_URL="postgresql://postgres:1234@localhost:5432/digitalstamp?schema=public"
```
Generate Prisma client, sync schema, and run seed script:
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma db push --schema=apps/api/prisma/schema.prisma
npx tsx apps/api/src/prisma/seed.ts
```

### Step 4: Run API & Web App
In terminal 1 (API Server on port 4000):
```bash
npm run dev:api
```
In terminal 2 (Next.js Web on port 3000):
```bash
npm run dev:web
```

### Step 5: Test Docker Deployment (Optional)
```bash
docker compose up --build
```
This boots up PostgreSQL, Redis, Backend API (`:4000`), and Next.js Web (`:3000`).

---

## Pre-Configured Demo Credentials

Use the top floating **Live Multi-Tenant Demo Bar** to switch between personas with 1 click, or sign in manually:

| Persona | Email | Password | Role |
|---|---|---|---|
| **Platform Super Admin** | `admin@example.com` | `admin123` | SUPER_ADMIN |
| **SmashZone Pickleball** | `owner@smashzone.com` | `owner123` | BUSINESS_OWNER |
| **Artisan Roastery & Café** | `owner@cafeartisan.com` | `owner123` | BUSINESS_OWNER |
| **PowerBox Cricket Arena** | `owner@boxcricket.com` | `owner123` | BUSINESS_OWNER (Pending Approval) |
| **Front Desk Staff** | `staff@smashzone.com` | `staff123` | BUSINESS_STAFF |
| **Customer Alex Rivera** | `alex@example.com` | `customer123` | CUSTOMER |
| **Customer Priya Sharma** | `priya@example.com` | `customer123` | CUSTOMER (Has Unlocked Reward) |
