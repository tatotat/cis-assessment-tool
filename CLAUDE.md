# CLAUDE.md — CIS RAM v2.1 Assessment Tool

This file provides full context for Claude Code instances working on this codebase.

---

## Project Overview

A React + Vite web application implementing the CIS Risk Assessment Method (RAM) v2.1 for multi-tenant cybersecurity risk assessments. Built to be usable by non-technical users with plain-English explanations throughout.

**Location:** `/Users/eq/Downloads/cis_tool/` (adjust to your path)
**Dev server:** `npm run dev` → `http://localhost:5173`

---

## Tech Stack

- **React 18 + Vite 5** — frontend
- **Tailwind CSS v3** — styling
- **Zustand** — global state (`src/stores/assessmentStore.js`)
- **React Router v6** — routing
- **Recharts** — charts (ORI gauge, control score bars)
- **jsPDF + jspdf-autotable** — PDF report export
- **Lucide React** — icons
- **Supabase** — database + auth (PostgreSQL with RLS)
- **clsx** — conditional classnames

---

## Architecture

### Multi-Tenant Model
- `organizations` table with unique `code` (e.g. `DEMO001`)
- Non-admin users identify by **email + org code** — no auth needed
- Admin users use **Supabase email/password auth** with `role='admin'` in `profiles` table

### Session Isolation
- Each assessment gets a UUID `session_id` stored in URL params + localStorage
- Prevents concurrent users from mixing responses

### Demo Mode
When `VITE_SUPABASE_URL` is unset or contains `placeholder`, the app runs with a full **in-memory mock database** defined at the top of `src/lib/supabase.js`.
- Admin credentials: `admin@demo.com` / `demo1234`
- Org codes: `DEMO001`, `ACME001`

### Branding / Settings
Settings (logo, org name, disclaimer) are stored in `localStorage` under key `cis_tool_branding`. Read via `getSettings()` in `src/lib/settings.js`. Set via Admin → Settings page.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/safeguards.js` | All 153 CIS Controls v8.1 safeguards. Each has: `id`, `control`, `title`, `friendlyTitle`, `description`, `whyItMatters`, `assetClass`, `nistFunction`, `ig1/ig2/ig3` flags. Also exports `CONTROL_NAMES`, `VCDB_INDEX`, `VCDB_EXPECTANCY_LOOKUP`, `getSafeguardsForIG()` |
| `src/lib/calculations.js` | All CIS RAM math: `calculateIG1Expectancy()`, `calculateRiskScore()`, `calculateORI()`, `getRiskLevel()`, `getORILevel()`, `getControlScores()`, `getImmediateActions()`, `getRecommendations()` |
| `src/lib/recommendations.js` | `SAFEGUARD_RECOMMENDATIONS` map — per-safeguard `immediate`, `shortTerm`, `longTerm` action items for all 153 safeguards |
| `src/lib/supabase.js` | Supabase client + full demo mode `_db` in-memory store. Contains all CRUD helpers for orgs, assessments, responses, users, auth |
| `src/lib/settings.js` | `getSettings()` / `saveSettings()` — reads/writes branding from `localStorage['cis_tool_branding']` |
| `src/stores/assessmentStore.js` | Zustand store — holds `organization`, `assessment`, `sessionId`, `responses`, `ig`, `adminUser`. Actions: `startAssessment`, `completeScreening`, `saveResponse`, `setAdminUser` |
| `supabase/schema.sql` | Full DB schema with RLS policies for all tables |

---

## CIS RAM v2.1 Scoring Logic

### Risk Score Formula
```
Risk Score = Expectancy × MAX(impact_mission, impact_operational, impact_obligations [, impact_financial])
```

### IG1 (56 safeguards)
- User selects **Maturity Score** (1–5) with labels: "Not in place" / "Partially done" / "Fully in place" / "Tested & verified" / "Automated & assured"
- Expectancy is **auto-calculated** via `calculateIG1Expectancy(assetClass, maturityScore)` using `VCDB_INDEX` + `VCDB_EXPECTANCY_LOOKUP` tables
- Impact dimensions: Mission, Operational, Obligations — 3-point scale
- Impact labels: "Minor inconvenience" / "Significant recovery needed" / "Could destroy us"
- **Max score per safeguard: 9** (expectancy 3 × impact 3)

### IG2 (130 safeguards)
- User directly sets **Expectancy** (1–5): "Very Unlikely" / "Possible but Rare" / "Occasional" / "Common" / "Frequent or Active"
- Impact dimensions: Mission, Operational, Obligations — 5-point scale
- **Max score per safeguard: 25**

### IG3 (153 safeguards)
- Same as IG2 + **Financial** impact dimension (1–5)
- Max score per safeguard: 25

### Risk Levels
- `acceptable` — score ≤ 33% of max
- `unacceptable` — score 34–66% of max
- `high` — score > 66% of max

### ORI Formula
```
ORI = (sum of all risk scores) / (count × max_score_per_ig) × 100
```
Scale 0–100. Levels: Low (0–20), Guarded (21–40), Elevated (41–60), High (61–80), Critical (81–100).

### Compliance Status (Report)
| Risk Level | Max Score? | Status |
|------------|-----------|--------|
| acceptable | — | Compliant |
| unacceptable | — | Needs Improvement |
| high | No | Non-Compliant |
| high | Yes | Critical |
| not scored | — | Not Assessed |

---

## Application Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home.jsx` | Email + org code entry |
| `/screening` | `Screening.jsx` | 5-question IG determination |
| `/assessment` | `Assessment.jsx` | Safeguard-by-safeguard questions |
| `/report` | `Report.jsx` | Executive report + PDF export |
| `/admin/login` | `admin/Login.jsx` | Admin authentication |
| `/admin` | `admin/Dashboard.jsx` | Admin dashboard |
| `/admin/organizations` | `admin/Organizations.jsx` | Org CRUD |
| `/admin/assessments` | `admin/AssessmentsList.jsx` | All assessments |
| `/admin/users` | `admin/Users.jsx` | User management |
| `/admin/settings` | `admin/Settings.jsx` | Branding + disclaimer |

---

## Assessment Page — RiskScoreDisplay Component

Located in `Assessment.jsx`. The expandable panel that shows when all required fields are filled.

```jsx
// Appears when liveRiskScore !== null (all impacts + maturity/expectancy filled)
<RiskScoreDisplay score={liveRiskScore} igLevel={ig} />
```

Expands on click to show 3 columns:
- **What This Score Means** — `RISK_MEANING[level].what`
- **Required Action** — `RISK_MEANING[level].impact`
- **Effect on Your Organization** — `RISK_MEANING[level].orgEffect`

The `RISK_MEANING` object is defined in `Assessment.jsx` with keys `acceptable`, `unacceptable`, `high`.

---

## Report Page — Key Sections

### Safeguard Status Tab
- Component: `SafeguardStatusList` in `Report.jsx`
- Shows ALL safeguards in current IG (not just scored ones)
- Search by title, filter by status
- Expandable rows show: status badge + description, `safeguard.description`, `safeguard.whyItMatters`, risk exposure bar, score breakdown, notes
- Status computed by `getComplianceStatus(riskScore, igLevel)`

### Branding on Report Header
```jsx
const branding = useMemo(() => getSettings(), []);
// In JSX:
{branding.logoUrl ? <img src={branding.logoUrl} ... /> : <Shield ... />}
```

### PDF Export
- Triggered by "Export PDF" button
- Embeds branding logo via HTML Canvas `toDataURL` (handles cross-origin)
- Includes: cover page, executive summary, ORI gauge description, control scores table, immediate actions, safeguards full table with status

---

## Admin Layout Breakpoints

The admin sidebar uses `md:` (768px) breakpoints instead of `lg:` (1024px):
- `hidden md:flex` for desktop sidebar
- `md:hidden` for mobile overlay/header
- `md:ml-64` for main content margin

This was set intentionally to work well in preview viewports (~800px wide).

---

## Database Schema (Supabase)

### Tables
- **`organizations`** — `id`, `name`, `code` (unique), `industry`, `contact_email`, `created_at`, `updated_at`
- **`profiles`** — `id` (= auth.user id), `email`, `organization_id`, `role` ('admin'|'user'), `created_at`
- **`assessments`** — `id`, `session_id` (unique), `organization_id`, `assessor_email`, `assessor_name`, `implementation_group`, `ig_screening_answers`, `ig_screening_score`, `status`, `current_safeguard_index`, `organizational_risk_index`, `total_safeguards`, `completed_safeguards`, `completed_at`, `created_at`, `updated_at`
- **`assessment_responses`** — `id`, `assessment_id`, `safeguard_id`, `maturity_score`, `expectancy_score`, `impact_mission`, `impact_operational`, `impact_obligations`, `impact_financial`, `risk_score`, `notes`, `updated_at`

### RLS
- Users can only read/write their own org's assessments (via `organization_id`)
- Admins have full access
- Schema file: `supabase/schema.sql`

---

## Setup for a New Claude Instance

### 1. Install dependencies
```bash
npm install
```

### 2. Run in demo mode
```bash
npm run dev
```
No environment variables needed. Uses in-memory store automatically.

### 3. Connect Supabase (optional)
Create `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Run `supabase/schema.sql` in Supabase SQL Editor.

### 4. Admin access
- Demo: `http://localhost:5173/admin/login` → `admin@demo.com` / `demo1234`
- Production: Create user via Supabase Auth, set `role='admin'` in profiles table

### 5. Branding settings
Stored in `localStorage['cis_tool_branding']`. Set via Admin → Settings, or manually:
```js
localStorage.setItem('cis_tool_branding', JSON.stringify({
  orgName: 'Your Company',
  logoUrl: 'https://your-logo-url.png',
  primaryColor: '#0f766e',
  disclaimer: 'Optional disclaimer text',
  requireAcceptance: false,
  checkboxLabel: 'I accept'
}));
```

---

## Common Development Notes

- **Tailwind primary color** is defined in `tailwind.config.js` as `primary` extending the default slate with custom shades
- **Demo mode detection**: `IS_DEMO_MODE` exported from `supabase.js` — true when `VITE_SUPABASE_URL` is missing or contains `placeholder`
- **Session storage**: `assessmentStore` uses Zustand's `persist` middleware with `localStorage` under key `cis-assessment-store`
- **PDF generation** uses `jsPDF` with `jspdf-autotable` plugin; the logo embedding uses a canvas `drawImage` + `toDataURL` pattern to handle cross-origin images gracefully
- **Safeguard IDs** follow format `"1.1"`, `"1.2"`, ..., `"18.5"` matching CIS Controls v8.1 numbering
- **VCDB lookup table** in `safeguards.js` maps `(assetClass, maturityScore)` → expectancy for IG1 scoring
