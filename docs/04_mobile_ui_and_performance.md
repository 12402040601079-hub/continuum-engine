# 📱 Mobile UI/UX & Loading Performance Architecture

This document specifies the technical design, responsive mobile UI/UX, and performance optimization architecture implemented in **Continuum Engine**.

---

## 1. Mobile UI/UX Design System

### 1.1. Native Mobile App Header & Status Bar
- **Mobile Status Bar**: On smartphone viewports (< 768px), displays a native status bar with live auto-updating clock (`09:41`), notch design, 5G status icon, and 100% battery indicator.
- **Desktop Phone Simulator Mode**: Click the `📱` button in the top HUD on desktop to toggle a realistic smartphone container frame mode with curved device borders and shadow depth.

### 1.2. Mobile Bottom Navigation Bar
- Pinned to the bottom of the screen on mobile devices with safe-area-inset support:
  - 📝 **Process**: Form wizard steps.
  - 📊 **Telemetry**: Live incident logs and metrics.
  - 🛡️ **Admin**: Enterprise console & snapshots audit.
  - 🔐 **Vault**: Decrypted session payload inspector.
  - ✨ **Gemini AI**: AI Underwriting assistant drawer.

### 1.3. Responsive Data Tables → Mobile Cards
- Standard data tables (`.data-table`) squeeze or overflow on small phone screens.
- **Mobile Card Transformation**: On screens <= 768px, rows render as clean, stacked **Mobile Cards** with badge tags, key-value rows, and full-width touch buttons (`Inspect`, `Purge`).

---

## 2. High-Performance Loading & Caching Strategy

### 2.1. Stale-While-Revalidate (SWR) Memory Cache
- Telemetry logs and session snapshots are cached in client memory (`telemetryLogsCache` and `allAdminSnapshotsCache`).
- Switching tabs or clicking refresh renders cached data in **0ms**, while fetching background updates asynchronously.

### 2.2. Glassmorphism Shimmer Skeleton Loaders
- Upgraded CSS `.skeleton` to use glowing gradient shimmer animations (`skeletonShimmer`) instead of static dark boxes.

### 2.3. Mobile Three.js GPU Scaling
- Auto-detects screen width <= 768px in `three_core.js`.
- Scales 3D particle count down to **800** (from 3500) and caps `devicePixelRatio` at **1.25** to eliminate GPU thermal throttling and save battery life.

---

## 3. Progressive Web App (PWA) Integration
- `manifest.json`: Mobile standalone app parameters (`display: standalone`, `theme_color: #00f0ff`, `orientation: portrait-primary`).
- Service Worker (`sw.js`): Offline asset caching for instant repeat loads and home screen installation on iOS and Android.
