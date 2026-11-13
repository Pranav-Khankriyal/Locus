# Locus

> **Enterprise Trust, Cryptographic Identity, Biometric Rostering, Payroll Ledger & Asset Custody Platform**
> 
> A modern, unified Next.js 15 full-stack platform providing tamper-evident verification, decentralized identity (DID), fine-grained role-based access control (RBAC), biometric attendance, automated salary structures with EPF synchronization, and physical & digital hardware custody — **completely free of blockchain friction, gas fees, or smart contract overhead.**

---

## 🌟 Overview

**Locus** unites personnel management, operational security, and enterprise custody into a single, cohesive operating system. Built for modern engineering, operations, and compliance teams, Locus provides mathematical certainty and complete operational clarity across every corporate module.

### Core Pillars

1. **Cryptographic Identity Management (DID)**: Every employee is issued a decentralized identifier (`did:locus:<org>:<emp>`) backed by canonical SHA-256 tamper-evident integrity seals.
2. **Biometric Attendance & Rostering**: Granular shift monitoring across work modes (Office, Remote, Hybrid, WFH) with automated status tracking (Present, Late, Half Day, Absent, Overtime).
3. **Payroll Engine & EPF Ledger**: Comprehensive compensation architecture including basic pay, HRA, special allowances, net pay slips, and statutory Employee Provident Fund (EPF) account ledger synchronization.
4. **Hardware Vault & Asset Custody**: Full lifecycle tracking of physical equipment (laptops, monitors, security tokens) and digital infrastructure (SSL certificates, API keys, AWS roles) with custodian assignment and transfer history.
5. **Role-Based Access Control (RBAC)**: Multi-tenant security matrix governing resource capabilities across employees, assets, payroll, settings, audit logs, and cryptographic verification.
6. **Canonical Verification Engine**: Real-time tamper detection using deterministic JSON canonicalization and SHA-256 digest recalculation, eliminating public blockchain volatility while guaranteeing cryptographic truth.
7. **Durable Immutable Audit Trail**: Append-only activity ledger recording every authentication, role assignment, asset transfer, and cryptographic re-issuance.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.18+ (tested on Node v20 & v24 LTS)
- **Package Manager**: `pnpm` (recommended) or `npm`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Pranav6233/Lokus.git
cd Lokus

# Install dependencies
pnpm install

# Run the local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Landing Portal**: `/` — High-performance responsive presentation with 3D canvas and dynamic dissolve gradients
- **Authentication**: `/login` (supports email login, fast demo sign-in, and onboarding)
- **Executive Dashboard**: `/dashboard` — Live operational overview, statistics, and pending actions
- **Employee Directory**: `/employees` — Personnel directory, DID statuses, and profile inspectors
- **Biometric Attendance**: `/attendance` — Daily logs, shift modes, and check-in audit
- **Payroll & EPF Ledger**: `/payroll` — Salary structures, payslip generation, and EPF savings ledger
- **Hardware Vault & Assets**: `/assets` — Asset assignment, custody transfers, and integrity seals
- **Integrity Verification**: `/verification` — On-demand SHA-256 cryptographic proof inspector
- **System Settings**: `/settings` — DID scheme configuration and organization hierarchy

---

## 🔑 Demo Credentials

Locus comes pre-configured with complete enterprise seed data for **Acme Corporation**:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Organisation Administrator** | `admin@locus.io` | `password123` | Full administrative control across all platform modules |
| **Principal Security Architect** | `marcus.chen@locus.io` | `password123` | Technology, Security Policies, Audit Logs & Integrity Verification |
| **Lead DevOps Engineer** | `sarah.connor@locus.io` | `password123` | Cloud Infrastructure, Hardware Vault & Digital Asset Custody |
| **Senior Product Designer** | `david.kim@locus.io` | `password123` | Design Assets, Team Rosters & Personnel Directory |
| **Compliance & Operations Lead** | `aisha.patel@locus.io` | `password123` | Attendance Logs, Leave Approvals & Statutory EPF Compliance |

> **Instant Demo**: Click **"View Demo"** or **"Get started for free"** on the landing page for immediate 1-click access without typing credentials.

---

## 🛡️ Cryptographic Integrity Engine (No Blockchain Overhead)

In place of slow, expensive blockchain networks, Locus employs a high-performance **Deterministic Canonical Cryptographic Engine**:

```
Live Record (Employee / Asset / Payroll)
                  │
                  ▼
   [Sorted Canonical Key Extraction]
                  │
                  ▼
      [Deterministic JSON String]
                  │
                  ▼
       [SHA-256 Cryptographic Digest]
                  │
                  ▼
     LOCUS-SEAL-ASS-A1-DD4E944B49
```

1. **Deterministic Serialization**: When any core record is created or modified, its authoritative attributes are canonicalized (sorted keys, compact separators, normalized types).
2. **SHA-256 Digest**: The engine generates an SHA-256 digest and issues an immutable cryptographic reference (e.g., `LOCUS-SEAL-IDE-...` or `LOCUS-SEAL-ASS-...`).
3. **Instant Tamper Detection**:
   - In the **Verification Center**, clicking **"Verify Cryptographic Seal"** reads the live database record, recalculates the canonical SHA-256 digest on the fly, and matches it with the registered seal.
   - If even a single byte or attribute was altered outside sanctioned workflows, the hash diverges and flags an **Integrity Mismatch / Compromised Record**.
   - If intact, the system confirms **Verified / Valid Seal** with timestamp and cryptographic proof.

---

## 🏗️ Architecture & Project Structure

Locus is built on **Next.js 15 App Router** unifying the full-stack REST API and dynamic client SPA into a performant, zero-config monolith:

```
Locus/
├── data/
│   ├── locus-db.json                 # Persistent local enterprise database (multi-tenant)
│   └── lokus-db.json                 # Migration fallback compatibility store
├── public/
│   ├── locus-logo.png                # Primary Locus brand logo (dark typography)
│   ├── locus-logo-white.png          # High-contrast logo for dark spruce hero backgrounds
│   ├── locus-c-icon.png              # Distinctive Locus C icon badge
│   ├── favicon.ico                   # Multi-resolution browser tab icon (16-256px)
│   ├── icon.png                      # High-res PWA & browser tab icon (512x512)
│   ├── apple-icon.png                # Apple touch mobile icon (180x180)
│   └── login.png                     # Full-bleed 3D artwork for authentication showcase
├── src/
│   ├── app/
│   │   ├── api/v1/                   # Next.js Route Handlers (Complete REST API)
│   │   │   ├── auth/                 # Login, signup, me, refresh, sessions
│   │   │   ├── organization/         # Organization creation, codes, hierarchy
│   │   │   ├── employees/            # Personnel directory & DID management
│   │   │   ├── assets/               # Hardware vault & asset custody
│   │   │   ├── attendance/           # Shift logs & biometric records
│   │   │   ├── payroll/              # Salary structures & EPF accounts
│   │   │   ├── blockchain/           # Cryptographic engine status & seal verification
│   │   │   └── audit-logs/           # Append-only immutable event trail
│   │   ├── [[...slug]]/              # Client SPA Catch-all Page Handler
│   │   ├── layout.tsx                # App root layout with metadata, icons & fonts
│   │   └── globals.css               # Core styling & Tailwind CSS directives
│   ├── components/                   # Modular UI Components
│   │   ├── auth/                     # AuthShowcaseCard, LoginForm, SignupForm
│   │   ├── landing/                  # LandingVisuals, FloatingHeroCards, Pillars
│   │   ├── layout/                   # AppShell, Sidebar, Navbar, MobileMenu
│   │   ├── verification/             # SealCard, VerificationResultModal
│   │   └── ui/                       # Buttons, Badges, Modals, Tables, MetricCards
│   ├── lib/                          # Core Platform Utilities
│   │   ├── crypto-verification.ts    # Deterministic canonicalization & SHA-256 engine
│   │   ├── db.ts                     # Multi-tenant in-memory + file-backed database
│   │   └── enterprise-seed.ts        # Comprehensive enterprise dataset generator
│   ├── services/                     # Client API abstraction layer
│   │   ├── api.ts                    # Fetch client with auto-refresh & bearer auth
│   │   ├── EmployeeService.ts        # Personnel data services
│   │   ├── AssetService.ts           # Asset custody services
│   │   └── VerificationService.ts    # Cryptographic proof services
│   ├── views/                        # Full Page Views
│   │   ├── Landing.tsx               # Spruce-emerald hero, capability strip & showcase
│   │   ├── Login.tsx                 # Edge-to-edge dual column login experience
│   │   ├── Signup.tsx                # Streamlined onboarding registration
│   │   ├── dashboard/                # Operational statistics & role dashboards
│   │   ├── onboarding/               # Create Organisation & Join via Company Code
│   │   └── settings/                 # DID schemes, cryptographic policies & RBAC
│   └── workspace.css                 # Editorial styling, typography & animations
├── package.json                      # Next.js 15 manifest
└── tsconfig.json                     # Strict TypeScript configuration
```

---

## 🎨 Visual Identity & Design System

- **Primary Brand Color**: Spruce Green (`#0C4242`) & Deep Pine (`#082920`)
- **Accent Highlighters**: Mint Green (`#34D399`) & Emerald Glow (`#10B981`)
- **Neutral Canvas**: Warm Ivory (`#FAFBF6`) & Editorial Slate (`#F4F6F8`)
- **Browser Favicon**: Authentic two-tone curved **C** mark from the Locus brand identity
- **Landing Experience**: Full 100vh viewport hero with soft percentage-based gradient dissolves transitioning into capability pillars with zero harsh cutoff boundaries.

---

## 📜 License

Private & Proprietary. All rights reserved © 2026 Locus Enterprise.
