# Lokus

> **Enterprise Trust, Cryptographic Identity, RBAC & Asset Management Platform**
> A modern, unified Next.js full-stack system providing tamper-evident verification, identity management, role-based access control, and complete asset custody — **completely free of blockchain complexity, wallets, gas fees, or smart contract overhead.**

---

## 🌟 Overview

**Lokus** is an enterprise-grade platform that unites:

1. **Cryptographic Identity Management (DID)**: Decentralized identifiers (`did:lokus:<org>:<emp>`) paired with canonical SHA-256 tamper-evident integrity seals.
2. **Role-Based Access Control (RBAC)**: Fine-grained permission matrices controlling resource-action capabilities (`employees`, `assets`, `organisation`, `roles`, `audit`, `verification`, `settings`).
3. **Physical & Digital Asset Management**: Complete asset lifecycle tracking (assignments, transfers, returns, maintenance, and serial registration).
4. **Cryptographic Integrity & Verification Engine**: Real-time tamper detection using deterministic JSON canonicalization and SHA-256 hash digests, eliminating any need for public blockchain networks or crypto wallets.
5. **Durable Audit Trail**: Append-only activity logging capturing every administrative, custodial, and integrity event.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.18+ (tested on Node v20 & v24)
- **Package Manager**: `pnpm` (recommended) or `npm`

### Installation & Run

From the project root:

```bash
# Run from repository root
pnpm dev

# Or directly inside the Lokus project folder
cd Lokus
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Landing Page**: `/` — Interactive 3D network portal
- **Sign In**: `/login`
- **Dashboard**: `/dashboard`
- **Verification Center**: `/verification`

---

## 🔑 Demo Credentials

Lokus comes pre-seeded with enterprise organization data (**Acme Corporation**):

| Role | Email | Password | Access Scope |
| --- | --- | --- | --- |
| **Organisation Administrator** | `admin@lokus.io` | `password123` | Complete system access across all modules |
| **Principal Security Architect** | `marcus.chen@lokus.io` | Any password | Technology, Security & Audit |
| **Lead DevOps Engineer** | `sarah.connor@lokus.io` | Any password | Cloud Infrastructure & Digital Assets |
| **Senior Product Designer** | `david.kim@lokus.io` | Any password | Design Assets & Team Profile |

> **Quick Demo**: You can also click the **"Quick Demo Sign In (Administrator)"** button on the landing page for instant 1-click access.

---

## 🛡️ The Cryptographic Integrity Engine (No Blockchain)

In place of costly and volatile blockchain smart contracts, Lokus uses a high-performance **Canonical Cryptographic Verification Engine**:

1. **Deterministic Serialization**: When an identity or asset is registered, Lokus canonicalizes the record's core fields (sorted JSON keys with compact separators).
2. **SHA-256 Digest**: The system generates a cryptographic SHA-256 digest and issues a unique seal (`LOKUS-SEAL-...`).
3. **Instant Tamper Detection**:
   - When **"Verify Cryptographic Seal"** is clicked, the system reads the live database record, recalculates its canonical SHA-256 hash, and compares it against the registered integrity seal.
   - If any attribute has been altered in the database (e.g. employee title, serial number, condition), the digest immediately diverges and reports **Integrity Mismatch / Compromised Record**.
   - If pristine, it returns **Verified / Valid Seal** with timestamp and seal reference.
4. **Issue New Seals**: Administrators can issue or re-issue seals with a single click.

---

## 📁 System Architecture

Lokus merges the previous multi-tier Python backend and Vite frontend into a single, cohesive **Next.js App Router** project:

```
Lokus/
├── src/
│   ├── app/
│   │   ├── api/v1/                   # Next.js Route Handlers (Complete REST API)
│   │   │   ├── auth/                 # Login, register, me, logout, refresh
│   │   │   ├── organization/         # Organization management
│   │   │   ├── organization-units/   # Org units and hierarchy tree
│   │   │   ├── employees/            # Employee directory & profiles
│   │   │   ├── assets/               # Physical & digital assets
│   │   │   ├── asset-categories/     # Asset classification
│   │   │   ├── roles/                # RBAC & permission matrices
│   │   │   ├── audit-logs/           # Full audit event trail
│   │   │   ├── identities/           # DID & identity status
│   │   │   └── verification/         # Cryptographic verification engine
│   │   ├── [[...slug]]/              # Client SPA page route (Catch-all)
│   │   ├── layout.tsx                # App root layout with Geist fonts & dark theme
│   │   └── globals.css               # Core styling
│   ├── components/                   # Modular UI components (Cards, Tables, Modals, Forms)
│   │   ├── assets/                   # Asset assignment, return, transfer, tree
│   │   ├── employees/                # Directory, editor, bulk import, profile
│   │   ├── organisation/             # Tree visualization and unit nodes
│   │   ├── roles/                    # Permission matrix & role editors
│   │   ├── verification/             # Verification form & seal card
│   │   └── layout/                   # Header, Sidebar, AppShell
│   ├── contexts/                     # AuthContext, NotificationContext
│   ├── lib/                          # Database (db.ts) & Cryptographic Engine (crypto-verification.ts)
│   ├── views/                        # Page views (Dashboard, Assets, Employees, Roles, etc.)
│   ├── services/                     # Client API adapters
│   └── types/                        # TypeScript domain definitions
├── data/                             # Persistent JSON data store
├── package.json                      # Next.js 15 project manifest
└── tsconfig.json                     # TypeScript configuration
```

---

## 🛠️ Key Capabilities

- **Organization Hierarchy**: Arbitrary-depth organizational trees (Divisions, Departments, Teams) with visual node navigation.
- **Employee Directory**: Full personnel records, designations, reporting manager links, and DID records.
- **Bulk Import**: Drag-and-drop CSV or XLSX file import with client-side header mapping, row validation, error reports, and partial import support.
- **Asset Custody Workflow**: Assign physical or digital assets to employees, transfer custody directly, return to inventory, and review full assignment history.
- **Fine-Grained RBAC**: Configurable roles with granular matrix: View, Manage, Assign, and Audit permissions across resources.
- **Security & Integrity**: 100% self-contained, zero cloud database or blockchain gas requirement.

---

## 📜 License

Private & Proprietary. All rights reserved.
