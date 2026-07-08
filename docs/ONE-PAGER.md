# CIS RAM v2.1 Assessment Tool — One-Pager

**What it is:** A free, open-source (AGPL-3.0) web application that guides non-technical users through a full cybersecurity risk assessment using the CIS Risk Assessment Method (RAM) v2.1, aligned with CIS Controls v8.1, and produces an executive-ready PDF report.

---

## The Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite 5 | Single-page app |
| Styling | Tailwind CSS v3 | Primary color configurable per deployment |
| State | Zustand (persisted to localStorage) | Survives page refresh |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Optional — falls back to in-memory demo mode |
| i18n | i18next + HTTP backend | Language packs load at runtime, no rebuild |
| Reports | jsPDF + jspdf-autotable, Recharts | PDF export + ORI gauge / control charts |

No server of its own: the app is a static build (`npm run build` → `dist/`) served from any web host, talking directly to Supabase.

---

## How the System Works

### 1. Assessment flow (anonymous users — no account needed)
```
Home ──► Screening ──► Assessment ──► Report
email +   5 questions    56/130/153      ORI gauge, control scores,
org code  determine      safeguards,     immediate actions,
          IG1/IG2/IG3    scored 1-by-1   recommendations, PDF export
```

- Users identify with **email + organization code** (e.g. `DEMO001`) — no password.
- Each assessment gets a **crypto-random session ID** that acts as its resume token: save the ID, come back later, pick up where you left off.
- Every answer autosaves; progress is tracked per safeguard and per CIS Control.

### 2. Risk scoring (CIS RAM v2.1)
```
Risk Score = Expectancy × MAX(Mission, Operational, Obligations [, Financial])
```
- **IG1** (56 safeguards): you rate implementation maturity (1–5); expectancy is auto-derived from Verizon VCDB incident statistics by asset class. 3-point impact scales, max score 9.
- **IG2/IG3** (130/153): expectancy rated directly (1–5), 5-point impact scales, IG3 adds a financial dimension, max score 25.
- Scores roll up into the **Organizational Risk Index (ORI, 0–100, lower is better)** shown on a gauge with low / moderate / elevated / critical bands.

### 3. Multi-tenancy & security model
- **Organizations** are isolated tenants, each with a unique access code.
- **Admins** authenticate via Supabase email/password (`role='admin'` in profiles) and manage organizations, assessments, users, branding, and language packs at `/admin`.
- Database access is locked down with Row Level Security: direct table access is **admin-only** (org members get read-only views of their own org). The anonymous assessment flow goes exclusively through `SECURITY DEFINER` RPC functions that require the session ID as a bearer token — no session ID, no data.
- The translation storage bucket is public-read, admin-only-write.

### 4. Runtime internationalization
- English ships built-in; admins add languages by uploading a translated JSON pack via **Admin → Languages** — it goes to Supabase Storage and is live immediately, no rebuild.
- Users pick their language from a globe menu in the header; the choice persists.

### 5. Demo mode
With no Supabase credentials configured, the entire app runs from an in-memory store: org codes `DEMO001` / `ACME001`, admin `admin@demo.com` / `demo1234`. Ideal for evaluation; data does not survive a page reload.

---

## Deploying in 5 Steps

1. `npm install && npm run build` → upload `dist/` to any static host.
2. Create a Supabase project, run `supabase/schema.sql` in the SQL Editor.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, rebuild.
4. Create your admin user (Supabase Auth → set `role='admin'` in `profiles`, or use the in-app first-admin bootstrap).
5. Add your organizations and share their codes with assessors.

---

## Licensing

Code: **AGPL-3.0** (network copyleft — hosted modifications must publish source). CIS Controls v8.1 and CIS RAM are © Center for Internet Security, available for non-commercial use under CIS Terms; VCDB data © Verizon VERIS project. See `LICENSE`, `NOTICE`, and the in-app "License & Credits" link.
