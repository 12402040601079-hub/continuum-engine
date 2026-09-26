# 🎨 05. UI/UX Design System & Dual-Theme Ergonomics

This document specifies the visual design tokens, HTML5 Canvas 2D ambient aurora engine, WCAG AAA dual-theme ergonomics, responsive breakpoints, and embedded Gemini AI Assistant drawer.

---

## 1. Ambient Aurora Wave Canvas (`ambient_aurora.js`)

Continuum Engine employs a dedicated, lightweight HTML5 2D Canvas ambient engine designed for maximum eye comfort without CPU or GPU thermal overhead.

### Design Principles:
- **Soothing Undulating Sine Waves:** 3 overlapping wave ribbons with fluid cyan (`#00F0FF`), purple (`#8B5CF6`), and emerald (`#00FF88`) color stops.
- **Bioluminescent Stardust Particles:** 50 soft glowing ambient particles that drift gently upwards with sine-wave pulsation.
- **Zero Distraction:** Smooth sub-pixel interpolation at 60 FPS that stays in the visual background without interfering with foreground typography.

---

## 2. Color Tokens & Dual-Theme Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  DARK MODE (Default: Cyber-Vault)                           │
│  --bg-primary: #060911        --text-primary: #f8fafc       │
│  --bg-card: rgba(12,18,32,0.55) --border-glass: rgba(0,240,255,0.18) │
├─────────────────────────────────────────────────────────────┤
│  LIGHT MODE (Ergonomic Crisp Slate)                         │
│  --bg-primary: #f8fafc        --text-primary: #0f172a       │
│  --bg-card: #ffffff           --border-glass: #e2e8f0       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Responsive Breakpoints & Mobile Optimization

- **Desktop Viewport (> 1024px):** Full-width 4-layer architecture cards, dual-pane interactive loan wizard, live EKG oscilloscope, and telemetry matrix terminal.
- **Tablet Viewport (768px - 1023px):** Collapsible sidebars, fluid 2-column card layout, and touch-optimized form sliders.
- **Mobile Smartphone (< 768px):** Single-column stacked layout, touch-friendly large form inputs, responsive table cards, and mobile bottom navigation bar (`Process`, `Telemetry`, `Admin`, `Vault`, `Gemini AI`).

---

## 4. Embedded Gemini AI Assistant Drawer

The floating **Ask Gemini AI** pill opens a diagnostic drawer providing instant contextual assistance:
- **Audit Drift:** Inspects client bundle hash vs active server version.
- **Explain Circuit Breaker:** Describes the 4-layer state resilience pipeline.
- **Suggest Recovery:** Recommends remediation actions for uncommitted inputs.
- **Run Health Check:** Queries `/api/v1/health` and summarizes node status.
