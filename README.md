# Gold Stamp — Multi-Tenant Digital Loyalty & Stamp SaaS Platform

**Gold Stamp** is an enterprise-grade, multi-tenant SaaS platform built for local businesses — such as cafés, restaurants, pickleball courts, box cricket arenas, gyms, salons, gaming zones, and entertainment venues — to launch customizable digital loyalty programs, digital stamp cards, points systems, and automated milestone rewards.

Customers register once with a universal account and participate across multiple merchant programs.

---

## 🚀 Key Platform Features

### 1. Multi-Tenant Architecture & RBAC
- **Super Admin (`/admin/*`)**: Platform-wide metrics (MRR, ARR), business approval/suspension, dynamic industry manager, user directory moderation, and real-time security audit logs.
- **Business Client Portal (`/client/*`)**: Executive SaaS dashboard, 6-step campaign creation wizard, dynamic 60s rotating QR code kiosk, staff accounts management, customer directory with visit filters, and deep retention analytics with Recharts.
- **Customer Loyalty Portal (`/*`)**: Mobile-first digital stamp cards with real-time visual slots grid, 60s dynamic QR scanner, points ledger, verified visit timeline, unlocked reward voucher codes, and personal Customer Pass QR.

### 2. High-Security QR Check-In Engine
- Generates cryptographically signed, short-lived HMAC QR tokens with 60-second rotating lifetimes.
- Configurable check-in cooldowns (e.g., 30m / 60m) to eliminate rapid duplicate scans.
- Atomic PostgreSQL transactions ensure visits, stamps, points, and milestone reward unlocking execute seamlessly and safely.

### 3. Flexible Campaign & Reward Engine
- Supports **VISIT**, **STAMP**, **POINT**, **SPEND**, and **REFERRAL** campaign types.
- Automatic milestone reward unlocking upon reaching card capacity (e.g. 10/10 visits or 5/5 stamps).
- Unique human-readable voucher codes (e.g. `SMASH-7F92K`) verified by cashiers in an atomic transaction to prevent double redemption.

### 4. Supporting Abstractions
- **Payments**: Razorpay service abstraction with checkout order creation and signature verification.
- **Storage**: Cloudflare R2 / AWS S3 abstraction.
- **Notifications**: In-app real-time notification engine with WhatsApp Business API and Email interfaces.
- **Background Jobs**: BullMQ and Redis scheduler with built-in in-memory fallback.

---

## 📂 Directory Structure

```
├── frontend/         # Next.js 14 (App Router) + React + Tailwind CSS (Deploy to Vercel)
├── backend/          # Node.js + Express + TypeScript + Prisma ORM + MySQL (Deploy to stamp.harshaicreations.com)
├── packages/         # Shared libraries (types, config, validation)
├── infra/            # Docker deployment & container configs
└── docs/             # ARCHITECTURE.md, API_REFERENCE.md, SECURITY_ANTI_FRAUD.md, RUNBOOK.md
```

---

## 🚀 Deployment Guide

### 1. Frontend on Vercel
- **GitHub Repository**: Select this repository in Vercel.
- **Root Directory**: Select `frontend` (or type `frontend`).
- **Framework Preset**: Next.js (automatically detected).
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://stamp.harshaicreations.com`

### 2. Backend on Subdomain (`stamp.harshaicreations.com`):
- **Deployment Folder**: `backend`
- **Database (MySQL / phpMyAdmin)**:
  - Create database in cPanel / phpMyAdmin: e.g. `digitalstamp`
  - In `backend/.env`, set:
    ```bash
    DATABASE_URL="mysql://<user>:<password>@localhost:3306/<database_name>"
    PORT=4000
    FRONTEND_URL="https://your-app.vercel.app"
    ```
  - Run Prisma DB sync:
    ```bash
    npm run db:push
    npm run db:seed
    ```

---

## ⚡ Local Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Database client generation
npm run db:generate

# 3. Start Development Servers
npm run dev:api    # Backend API on http://localhost:4000
npm run dev:web    # Frontend Web on http://localhost:3000
```

---

## 🛡️ Pre-Configured Demo Credentials

Switch roles in 1 click using the top floating **Live Multi-Tenant Demo Bar**:
- **Platform Super Admin**: `admin@example.com` / `admin123`
- **SmashZone Pickleball**: `owner@smashzone.com` / `owner123`
- **Artisan Roastery & Café**: `owner@cafeartisan.com` / `owner123`
- **Customer Alex Rivera**: `alex@example.com` / `customer123`
