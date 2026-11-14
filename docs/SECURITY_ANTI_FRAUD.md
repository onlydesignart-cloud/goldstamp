# Gold Stamp Security Architecture & Anti-Fraud Engine

## 1. Dynamic Rotating QR Codes (Short-Lived HMAC Tokens)
- **Problem**: In basic loyalty systems, businesses display a printed static QR code containing just their ID. Customers photograph this QR once and scan it repeatedly from home to farm rewards.
- **Gold Stamp Solution**:
  - The business kiosk screen displays a dynamically generated QR code that refreshes every 60 seconds.
  - Every QR contains a signed HMAC token embedding the `businessId`, `branchId`, `campaignId`, `nonce`, and an epoch expiration timestamp `exp`.
  - Backend verifies cryptographic signature and ensures token is not expired.
  - Expired or tampered tokens are rejected with `INVALID_TOKEN`.

---

## 2. Configurable Check-In Cooldowns
- **Problem**: A customer at the venue attempts to scan the QR 10 times consecutively within 2 minutes to cheat the 10/10 milestone.
- **Gold Stamp Solution**:
  - Configurable cooldown window (default: 30 or 60 minutes) per business tenant.
  - Before issuing any stamp, the backend queries:
    ```sql
    SELECT * FROM "Visit"
    WHERE "userId" = :userId AND "businessId" = :businessId
    AND "createdAt" >= NOW() - INTERVAL ':cooldownMinutes minutes';
    ```
  - If a recent visit is found, the transaction is rejected with `COOLDOWN_ACTIVE` informing the customer of the exact remaining wait minutes.

---

## 3. Strict Server-Side Multi-Tenant Authorization
- **Never Trust Frontend Context**: All operations check tenant ownership on the backend.
- `requireBusinessAccess` middleware validates that the authenticated user either owns the business or is an active authorized staff member before modifying campaigns, viewing customer data, or verifying redemptions.
- Customers cannot invoke staff endpoints; staff cannot access platform administration or modify subscriptions.

---

## 4. Atomic PostgreSQL Transactions
- Check-ins and Reward Redemptions are wrapped inside `prisma.$transaction()`:
  - Check-in TX: Create Visit + Create Stamp + Credit Points + Increment Customer Stats + Evaluate Milestone + Generate Redemption code.
  - Redemption TX: Verify Code + Check Expired / Already Redeemed + Update Status to REDEEMED with timestamp and verifying staff ID.
- Prevents race conditions and double redemption of the same voucher.

---

## 5. Audit Logging
- Every high-impact event is recorded into the `AuditLog` table with `actorId`, `actorRole`, `action`, `entityType`, `metadata`, and `ipAddress`.
- Platform admins can inspect the immutable audit trail in real-time under `/admin/settings`.
