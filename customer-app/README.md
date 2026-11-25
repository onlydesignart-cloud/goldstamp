# GoldStamp Mobile Customer App (iOS & Android)

Dedicated React Native & Expo mobile app for GoldStamp customers.

## Core Features
1. **Digital Stamp Wallet**:
   - Live punch card matrix with real gold checkmarks and milestone completion track.
   - Horizontal switcher to view all joined venues (SmashZone, Artisan Roastery, PowerBox, Aurora Spa).
2. **Instant 1-Tap QR Scanner**:
   - Fast counter QR scanner.
   - Built-in token validation & celebratory milestone unlocked modal.
3. **Reward Vouchers**:
   - Single-use redemption code and modal for counter staff verification.
   - Active vouchers vs Redeemed history.
4. **Explore Venues**:
   - Nearby lifestyle arenas, cafés, turfs, and studios.
   - 1-Tap pass join.
5. **Apple Wallet & Google Pay**:
   - Direct integration architecture for native iPhone & Android digital passes.

---

## How to Run & Test

### Option 1: Live on your Physical iPhone / Android Phone (Fastest)
1. Install the free **Expo Go** app from the [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Start the development server:
   ```bash
   cd customer-app
   npx expo start
   ```
3. Scan the terminal QR code with your iPhone camera or Android Expo Go app. The GoldStamp Customer App opens instantly on your phone!

### Option 2: Run in Web Browser
```bash
cd customer-app
npx expo start --web
```

### Option 3: iOS Simulator / Android Emulator
```bash
npx expo run:ios
npx expo run:android
```
