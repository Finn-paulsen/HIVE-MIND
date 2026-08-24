# HIVE-MIND — Geospatial Intelligence Platform

A professional, enterprise-grade geospatial intelligence map application for monitoring infrastructure, public facilities, and critical assets across Europe. Built with React, Vite, Leaflet, and MUI.

> **Note:** This system is a monitoring and visualization tool only. No real-world intrusive access, unauthorized connectivity, or live system manipulation is implemented or intended.

---

## Architecture Overview

```
src/
├── App.jsx                  # Application shell + modal layout
├── audit/
│   └── auditLogger.js       # Typed event logging (search, layer, asset)
├── assets/
│   └── AssetDrawer.jsx      # Asset detail side panel with skeleton states
├── data/
│   └── assets.js            # Normalized Asset type + SEED_ASSETS (25+ entries)
├── map/
│   └── LayerManager.jsx     # Layer toggle UI driven by categories
├── search/
│   ├── SearchBar.jsx        # Unified search: text + coordinates + codes
│   └── coordinateParser.js  # Pure coordinate parsing utilities
├── state/
│   └── hive.js              # Zustand global state (assets, layers, map focus)
├── ui/
│   └── delays.js            # Artificial delay utilities (400–1200ms jitter)
└── components/              # Map rendering components (markers, heatmap, etc.)
```

---

## Running the Application

```bash
npm install
npm run dev
```

The app opens as a modal via the brain icon. Click it to access the infrastructure monitoring system.

---

## Search Parsing

The unified `SearchBar` supports three query modes:

| Mode | Example | Behavior |
|------|---------|----------|
| Text / Name | `Berlin`, `Heathrow` | Matches asset name, description, tags |
| Code identifier | `LHR`, `EDDF` | Matches IATA or ICAO codes in asset data |
| Decimal coordinates | `52.5, 13.4` or `52.5 13.4` | Navigates map to coordinates |
| Directional decimal | `N52.5 E13.4` | Navigates map to coordinates |
| DMS coordinates | `52°30'N 13°24'E` | Navigates map to coordinates |

Search is debounced (300 ms). Results are grouped by category. Keyboard navigation (Arrow Up/Down, Enter, Escape) is supported.

---

## Layer / Category Model

Layers are managed in the Zustand store (`activeLayers`) and toggled via `LayerManager`. Each asset belongs to a category that maps to a layer:

| Layer Key | Asset Categories |
|-----------|-----------------|
| `airports` | airport |
| `rail` | rail, metro |
| `energy` | energy |
| `datacenters` | datacenter, server |
| `power` | power |
| `water` | water |
| `hospital` | hospital |
| `police` | police |
| `military` | military |
| `banks` | bank |

---

## Asset Data Model

Assets are defined in `src/data/assets.js` with the following normalized structure:

```js
/**
 * @typedef {Object} Asset
 * @property {string} id
 * @property {string} name
 * @property {string} category        // airport | rail | bank | energy | datacenter | ...
 * @property {[number, number]} coordinates  // [lat, lon]
 * @property {string[]} tags
 * @property {string} source          // data provider / attribution
 * @property {string} updatedAt       // ISO date string
 * @property {number} confidence      // 0–1, shown as colored badge in drawer
 * @property {string} [description]
 * @property {string} [status]        // active | critical | offline
 * @property {Object} [codes]         // { iata, icao, ... }
 * @property {string} [country]
 */
```

The `normalizeLocation()` helper converts the legacy `locations.json` format to this schema.

---

## Audit / Event Scaffolding

`src/audit/auditLogger.js` provides a lightweight, extensible audit system:

```js
import { logEvent, AUDIT_EVENTS } from './audit/auditLogger';

logEvent(AUDIT_EVENTS.SEARCH_EXECUTED, { query: 'LHR', resultCount: 3 });
logEvent(AUDIT_EVENTS.ASSET_OPENED, { assetId: 'airport-lhr', assetName: 'London Heathrow' });
logEvent(AUDIT_EVENTS.LAYER_TOGGLED, { layer: 'airports', active: false });
```

Events are:
- Logged to the browser console in development mode
- Stored in a bounded in-memory ring buffer (last 100 events)
- Accessible via the `useAuditLog()` React hook

The API is designed for future backend integration — swap the `logEvent` internals to POST to your audit endpoint.

---

## UX Delay Utility

`src/ui/delays.js` provides controlled delays to ensure transitions feel deliberate rather than instant:

```js
import { simulatedDelay, quickDelay } from './ui/delays';

await simulatedDelay(400, 1200); // 400–1200 ms bounded jitter
await quickDelay();              // 200–400 ms
```

Used in `AssetDrawer` to show skeleton state before revealing asset details.

---

## Phase 2 Follow-ups (Simulation Layer)

The following features are scoped for Phase 2 and are **not** implemented here:

- Simulation engine (state machine: QUEUED → RESOLVING → HANDSHAKE → SESSION_ESTABLISHED)
- Pseudo-terminal overlay with asset-specific scripted command flows
- Simulated telemetry feeds (mock metrics, event streams)
- "Start Simulation Session" action in the asset drawer
- Timeline / playback mode
- Entity relationship graph (operator → asset → supplier links)
- Case management (notes, tasks, attachments)
- Report export (PDF / JSON)
- Watchlists and alert rules
