<div align="center">

# VARNA COLLECTIVE
### Enterprise Sustainability Intelligence for Ethical Procurement

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Visuals-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

<p align="center">
  <em>"quiet. slow. intentional."</em>
</p>

<p align="center">
  India's first sustainability credentialing standard and enterprise intelligence platform engineered specifically for small, micro, and artisanal craft producers and luxury hospitality procurement buyers.
</p>

---

</div>

##  Overview

**Varna** is a high-precision enterprise sustainability intelligence dashboard and credentialing standard. Built for luxury hospitality groups, boutique properties, and ethical procurement leaders, Varna bridges the divide between corporate ESG mandates and the authentic realities of small, micro, and artisanal producers.

Conventional ESG frameworks are built for multinational industrial supply chains and rely heavily on self-declared questionnaires or cost-prohibitive compliance audits that marginalize craft and micro-enterprises. Varna replaces unverified check-the-box claims with an **empirical, evidence-calibrated evaluation standard** that measures genuine environmental regeneration, fair wages, cultural preservation, and statutory readiness.

---

##  The Varna Framework & Evaluation Methodology

The Varna Framework assesses enterprises through a rigorous mathematical synthesis combining multidimensional pillar evaluation with an **Evidence Confidence Multiplier Pipeline**.

### 1. The Core Scoring Formula

$$\text{Final Varna Score} = (0.50 \times \text{Impact}) + (0.30 \times \text{Readiness}) + (0.20 \times \text{Risk})$$

The final score is evaluated on a normalized scale of **0 to 100**, establishing the verified performance tier of the enterprise.

### 2. The Three Evaluation Pillars

| Pillar | Weight | Focus Areas | Description |
| :--- | :---: | :--- | :--- |
| **01. Impact** | **50%** | Environmental, Social, Governance, Cultural | Measures raw material circularity, carbon absorption, waste diversion, fair living craft wages, and living heritage preservation. |
| **02. Readiness** | **30%** | Traceability, Systems, Management, Disclosures | Evaluates operational systems, supply chain visibility, management protocols, and transparent disclosures. |
| **03. Risk** | **20%** | Compliance, Verification, Legal Integrity, Labor Law | Assesses statutory registrations (e.g., GSTIN, Udyam), labor standard adherence, third-party audit verification, and compliance integrity. |

### 3. The Evidence Multiplier Pipeline

Raw metric values are adjusted dynamically through confidence multipliers based on verifiable evidentiary backing:

$$\text{Effective Score} = \text{Raw Score} \times \text{Evidence Multiplier}$$

```
[Actual Data] ──> [Band Lookup] ──> [Raw Score] ──> [Evidence Multiplier] ──> [Effective Score]
```

* **0.50× (Proxy / Unverified Data)**: Generic benchmark or unverified claims carry a 50% discount until supporting documentation is presented.
* **0.75× (Self-Reported Disclosures)**: Formal internal declarations and documented policies on file receive a 75% evidentiary weight.
* **1.00× (Third-Party Verified Evidence)**: Statutory filings, accredited lab testing, and third-party audited certifications receive full 100% evidentiary credit.

### 4. Performance Bands

| Performance Band | Score Range | Description |
| :--- | :---: | :--- |
| 🛡️ **Varna Leader** | `85 – 100` | Demonstrates exceptional verified impact, robust circularity, and transparent institutional systems. |
| 🌿 **Advanced** | `70 – 84` | Substantial verified practices with documented compliance and ongoing circular initiatives. |
| 🌱 **Emerging** | `55 – 69` | Meaningful sustainability foundations with formalization and verification opportunities underway. |
| 🪵 **Foundational** | `40 – 54` | Early-stage operational alignment with baseline statutory compliance in place. |
| ⏳ **Not Ready** | `< 40` | Insufficient verifiable documentation or fundamental gaps in statutory/environmental criteria. |

---

##  Key Features & Modules

###  Enterprise Property Dashboard
* **Real-Time ESG Metrics**: Aggregate carbon absorption, verified procurement spend, artisan livelihoods supported, and plastic reduction figures.
* **Impact Pillars Breakdown**: Deep-dive inspection into Environmental, Social, Governance, and Cultural criteria with confidence checklist hover cards.
* **Spend Analytics**: Visual spend breakdown across categories (Amenities, F&B, Textiles, Decor, Packaging) mapped against verified sustainability scores.
* **Supplier Directory & Profiles**: Comprehensive supplier dossiers detailing provenance, materials, craft techniques, certifications, and audit histories.
* **Exportable PDF Reports**: Enterprise-grade sustainability impact summaries generated dynamically using `@react-pdf/renderer`.

###  Multi-Property Group Portfolio Intelligence
* **Portfolio Rollup**: Multi-property executive overview aggregating sustainability performance across luxury hotel chains and corporate groups.
* **Property Benchmarking**: Side-by-side comparative analysis of individual hotel properties within a brand group.
* **Group ESG Reports**: Automated consolidated impact dossiers prepared for corporate governance and investor stakeholder presentations.

###  SuperAdmin Command Center
* **Client & Property Provisioning**: Onboard and configure enterprise hotel accounts, group portfolios, and access controls.
* **Supplier Verification Pipeline**: Review submitted evidence, approve audit documentation, and recalibrate confidence multipliers.
* **Dynamic Assessment Generator**: Create secure, expirable tokenized assessment links for prospective supplier onboarding.
* **Master Data Management**: Administer raw assessment inputs, scoring matrices, and certificate repositories.

###  Supplier Self-Service Assessment Portal
* **Structured Assessment Submissions**: Guided onboarding workflows for micro and small suppliers to submit qualitative and quantitative operational data.
* **Certificate Vault**: Direct document uploads with categorization across labor compliance, organic sourcing, and fair trade accreditations.

###  AI Sustainability Co-Pilot (Gemini Powered)
* **Real-Time Streaming Assistant**: Integrated conversational copilot leveraging Google Gemini (`gemini-3.6-flash`) via the Vercel AI SDK.
* **Context-Aware Recommendations**: Analyzes live supplier scores, identifies missing or lapsed documentation, and delivers concrete, actionable roadmaps to elevate tier ratings.

###  Visual & Sensory Design System
* **Curated Earth-Toned Aesthetic**: Tailored color palette (`#FAF8F5`, `#7D3F1E`, `#6E8471`, `#121316`) designed for quiet luxury.
* **Dark & Light Mode**: Seamless theme switching powered by `next-themes` and Tailwind CSS v4.
* **Spatial & 3D Visuals**: Three.js / React Three Fiber interactive components alongside Leaflet geographical sourcing maps.

---

##  Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Framework & Runtime** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/), `next-themes` |
| **3D & Spatial Visualization** | [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/), [@react-three/drei](https://github.com/pmndrs/drei), [Leaflet](https://leafletjs.com/) |
| **Analytics & Charts** | [Recharts](https://recharts.org/), Custom SVG Gauge & Bar visualizations |
| **Artificial Intelligence** | [Vercel AI SDK (`ai`)](https://sdk.vercel.ai/), [@ai-sdk/google](https://www.npmjs.com/package/@ai-sdk/google) (Gemini 3.6 Flash) |
| **Database & Auth** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`), PostgreSQL (`pg`), Row-Level Security (RLS) |
| **Data Ingestion & Integration** | [Google Sheets API](https://developers.google.com/sheets/api) (`google-spreadsheet`, `googleapis`), [Google Drive](https://developers.google.com/drive) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/), [React Dropzone](https://react-dropzone.js.org/) |
| **Reporting & Communication** | [@react-pdf/renderer](https://react-pdf.org/), [Nodemailer](https://nodemailer.com/), [@vercel/analytics](https://vercel.com/analytics) |

---

##  Repository Structure

```
varna/
├── public/                     # Static assets, branding crystal marks, and login illustrations
├── scripts/                    # Database seeding, migration utilities, and schema audit scripts
│   ├── seed_varna_database.js  # Database bootstrap & schema initialization
│   ├── migrate-to-supabase.js  # Supabase migration pipeline
│   └── sync-confidence-data.js # Confidence scores synchronization
├── src/
│   ├── app/                    # Next.js App Router routes & API endpoints
│   │   ├── (auth)/login/       # Client authentication & onboarding
│   │   ├── algorithm/          # The Varna Framework documentation & methodology page
│   │   ├── api/                # Backend API routes
│   │   │   ├── auth/           # Authentication endpoints & session validation
│   │   │   ├── chat/           # Gemini AI streaming endpoint
│   │   │   ├── export-report/  # PDF report export handler
│   │   │   └── submit-assessment/ # Assessment submission endpoint
│   │   ├── assessment/         # Public/tokenized supplier assessment portal
│   │   ├── dashboard/          # Enterprise hotel property dashboard
│   │   │   ├── impact/         # Detailed impact pillar views
│   │   │   ├── orders/         # Procurement orders & category spend
│   │   │   ├── overview/       # High-level KPIs & performance breakdown
│   │   │   └── suppliers/      # Supplier directory & profile dossiers
│   │   ├── framework/          # Framework methodology redirect/alias
│   │   ├── group/              # Multi-property hospitality group intelligence
│   │   ├── superadmin/         # Administrative portal for system management
│   │   ├── upload-certificate/ # Supplier certification upload pipeline
│   │   ├── globals.css         # Tailwind CSS v4 design tokens and global styles
│   │   └── layout.tsx          # Root layout with preconnect hints & theme provider
│   ├── components/             # Reusable UI & domain-specific React components
│   │   ├── ChatWidget.tsx      # Gemini-powered floating AI assistant widget
│   │   ├── ExportButton.tsx    # PDF generation and download trigger
│   │   ├── ThemeProvider.tsx   # Dark/light theme context provider
│   │   ├── dashboard/          # Property dashboard widgets (KPIs, Charts, Impact cards)
│   │   ├── layout/             # Navigation sidebars, headers, and footers
│   │   ├── PDF/                # React-PDF templates for impact reporting
│   │   ├── SuperAdmin/         # Administration tables, modals, and management forms
│   │   └── ui/                 # Core atom components (hover cards, watermarks, dialogs)
│   ├── context/                # Client state contexts (e.g., Active client, session)
│   ├── lib/                    # Core utilities, Supabase client, and mock dataset backups
│   ├── types/                  # TypeScript interface definitions (scores, pillars, clients)
│   └── utils/                  # Formatting helpers, color mappers, and calculations
├── AGENTS.md                   # AI agent operational guidelines
├── package.json                # Project dependencies, metadata, and scripts
├── tailwind.config.js          # Design palette configurations
└── tsconfig.json               # TypeScript compiler options
```

---

##  Getting Started

### Prerequisites

* **Node.js**: `v20.x` or `v22.x` (LTS recommended)
* **npm** (`v10+`), **pnpm**, or **yarn**
* Active **Supabase** instance with PostgreSQL database
* **Google Cloud Console** credentials with Gemini API and Google Sheets API enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/varnacollective/varna.git
   cd varna
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
   Populate the required credentials:
   ```env
   # ─── Supabase Configuration ────────────────────────────────
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

   # ─── Google Gemini AI Configuration ────────────────────────
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

   # ─── Google Service Account & Sheets Ingestion ─────────────
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your-primary-sheet-id
   GOOGLE_SHEET_ID_CONFIDENCE=your-confidence-sheet-id
   GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Lint and Type Check:**
   ```bash
   npm run lint
   ```

6. **Production Build:**
   ```bash
   npm run build
   npm run start
   ```

---

##  Disclaimer

> [!NOTE]
> **Regulatory & Certification Disclaimer:**  
> Varna scores and evaluations are **not statutory certifications, government accreditations, or legal warranties**. They represent evidence-based, algorithmic assessments derived from the documentation, statutory filings, and disclosures submitted to Varna at the time of review. Evaluated scores are subject to updates upon document expiration, periodic re-audits, or new evidence submissions.

---

##  License

```
PROPRIETARY AND CONFIDENTIAL
Copyright © 2026 Varna Collective. All rights reserved.
```

This software and its accompanying documentation, scoring methodologies, and visual designs are the proprietary property of **Varna Collective** (`varnacollective`).

* **Unauthorized Copying**: Strictly prohibited. No part of this codebase, user interface, or algorithmic standard may be reproduced, decompiled, reverse-engineered, modified, or distributed in any form or by any means without express prior written consent from Varna Collective.
* **Authorized Use**: Use of this software is restricted exclusively to authorized enterprise licensees, clients, and partners governed under formal contractual service agreements with Varna Collective.
* **Commercial Restrictions**: Sublicensing, reselling, renting, or offering this software as a multi-tenant service bureau without explicit authorization is strictly forbidden.

### Third-Party Software Notices
This product incorporates open-source libraries under their respective permissive licenses (including MIT, Apache 2.0, and BSD licenses). All third-party copyrights and trademarks belong to their respective holders.

---

##  Copyright & Trademark Notice

* **Copyright © 2024–2026 Varna Collective.** All rights reserved.
* **Varna**, the **Varna Collective** logo, the **Varna Framework**, the **Evidence Multiplier Pipeline**, and associated visual trade dress are proprietary marks of **Varna Collective**.
* For licensing inquiries, partnership opportunities, or enterprise evaluation access, please contact the **Varna Collective Team**.