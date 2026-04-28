# Pinglly CRM — AI-Powered Sales Intelligence Platform

> Built by **TechEcho** · Next.js 16 · MongoDB · Tailwind CSS 4

Pinglly is a futuristic, neural-themed B2B CRM platform designed to help sales teams manage leads, track deals, schedule follow-ups, and leverage AI-powered insights — all from a single, immersive terminal interface.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Contributing Guidelines](#contributing-guidelines)

---

## Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| **Framework**  | Next.js 16.2.4 (App Router, Turbopack)         |
| **Language**   | TypeScript 5                                   |
| **Styling**    | Tailwind CSS 4, tw-animate-css                 |
| **UI Library** | shadcn/ui (Radix primitives)                   |
| **Fonts**      | Manrope (headings), Poppins (body)             |
| **Animation**  | Framer Motion 12                               |
| **Auth**       | NextAuth v5 (Credentials provider)             |
| **Database**   | MongoDB Atlas (Mongoose 9 ODM)                 |
| **Icons**      | Lucide React                                   |
| **Charts**     | Recharts 3                                     |
| **Forms**      | React Hook Form + Zod validation               |

---

## Project Structure

```
pinglly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login, signup)
│   │   ├── layout.tsx            # Aurora mesh background layout
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   ├── (dashboard)/              # Protected dashboard group
│   │   ├── layout.tsx            # Sidebar + TopNavbar layout
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── leads/page.tsx        # Lead management
│   │   ├── deals/page.tsx        # Deal pipeline
│   │   ├── contacts/page.tsx     # Contact directory
│   │   ├── follow-ups/page.tsx   # Follow-up scheduler
│   │   ├── tasks/page.tsx        # Task board
│   │   ├── calendar/page.tsx     # Calendar view
│   │   ├── reports/page.tsx      # Analytics & reports
│   │   └── settings/page.tsx     # User settings
│   ├── onboarding/page.tsx       # Full-screen onboarding flow
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── chat/                 # AI chatbot endpoint
│   │   ├── clients/              # Client CRUD
│   │   ├── dashboard/stats/      # Dashboard statistics
│   │   └── leads/                # Lead CRUD + [id] routes
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page (public)
│   └── globals.css               # Global styles & design tokens
│
├── components/                   # React Components
│   ├── landing/                  # Landing page sections
│   │   ├── hero.tsx              # Hero section with CTA
│   │   ├── navbar.tsx            # Floating capsule navigation
│   │   ├── pricing.tsx           # Pricing plans grid
│   │   ├── features.tsx          # Feature showcase
│   │   ├── testimonials.tsx      # Social proof
│   │   ├── comparison.tsx        # Competitor comparison
│   │   ├── faq.tsx               # FAQ accordion
│   │   ├── footer.tsx            # Footer section
│   │   ├── stats.tsx             # Statistics bar
│   │   ├── pathway.tsx           # User journey visual
│   │   ├── logo-strip.tsx        # Brand logos
│   │   └── constants.ts          # Pricing data & landing copy
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   ├── sheet.tsx
│   │   ├── separator.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── login-form.tsx            # Login form with split layout
│   ├── signup-form.tsx           # Signup + loading overlay
│   ├── onboarding-form.tsx       # 6-step onboarding wizard
│   ├── lead-form-panel.tsx       # Lead create/edit panel
│   ├── sidebar.tsx               # Dashboard sidebar navigation
│   ├── mobile-sidebar.tsx        # Responsive mobile nav
│   ├── top-navbar.tsx            # Dashboard top bar
│   ├── chat-widget.tsx           # AI chatbot widget
│   ├── animated-number.tsx       # Number animation utility
│   ├── theme-toggle.tsx          # Dark/light mode toggle
│   └── providers.tsx             # Session + Theme providers
│
├── models/                       # Mongoose schemas
│   ├── lead.ts                   # Lead model + interface
│   └── client.ts                 # Client model
│
├── lib/                          # Shared utilities
│   ├── db.ts                     # MongoDB connection singleton
│   ├── utils.ts                  # Tailwind merge helper (cn)
│   └── constants.ts              # Lead statuses & priorities
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # NavItem, UserSession interfaces
│
├── scripts/                      # CLI utilities
│   ├── seed-leads.ts             # Database seeder (demo data)
│   └── hash-password.ts          # Bcrypt password hasher
│
├── docs/                         # Documentation
│   └── knowledge_base.md         # AI chatbot knowledge base
│
├── public/assets/                # Static assets
│   ├── logo.png                  # Pinglly logo (primary)
│   ├── logo-source.png           # High-res source logo
│   ├── footer.png                # Footer branding
│   └── favicon.png               # Browser favicon
│
├── auth.ts                       # NextAuth configuration
├── middleware.ts                  # Route middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # (via globals.css @theme)
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── .env.local                    # Environment variables (DO NOT COMMIT)
└── .env.example                  # Environment template
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url> pinglly
cd pinglly

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Seed Demo Data (Optional)

```bash
npx tsx scripts/seed-leads.ts
```

---

## Environment Variables

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

| Variable              | Description                        | Required |
| --------------------- | ---------------------------------- | -------- |
| `MONGODB_URI`         | MongoDB Atlas connection string    | ✅       |
| `AUTH_SECRET`         | NextAuth session encryption key     | ✅       |
| `ADMIN_EMAIL`        | Super admin email address           | ✅       |
| `ADMIN_PASSWORD_HASH`| Bcrypt hash of admin password       | ✅       |

> Generate `AUTH_SECRET` with: `openssl rand -base64 32`
> Generate password hash with: `npx tsx scripts/hash-password.ts`

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start dev server (Turbopack)         |
| `npm run build`   | Create production build              |
| `npm run start`   | Start production server              |
| `npm run lint`    | Run ESLint                           |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (Client)                   │
├──────────┬──────────┬──────────┬────────────────────┤
│ Landing  │  Auth    │ Onboard  │     Dashboard       │
│ (public) │ (login/  │ (6-step  │  (leads, deals,     │
│          │  signup) │  wizard) │   follow-ups, etc.) │
├──────────┴──────────┴──────────┴────────────────────┤
│              Next.js App Router (RSC + Client)       │
├─────────────────────────────────────────────────────┤
│               API Routes (/api/*)                    │
│    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│    │ Leads  │  │ Deals  │  │  Chat  │  │  Auth  │  │
│    └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  │
├─────────┴───────────┴───────────┴───────────┴───────┤
│              Mongoose ODM + MongoDB Atlas             │
└─────────────────────────────────────────────────────┘
```

### User Flow

```
Homepage → Sign Up → Loading Overlay → Onboarding (6 steps) → Dashboard
                                                                   ↓
Homepage → Login ──────────────────────────────────────────→ Dashboard
```

---

## Key Features

### 🌐 Public Landing Page
- Hero with animated orange horizon glow
- Interactive pricing grid (3 tiers)
- Feature showcase, testimonials, FAQ
- Floating capsule navigation bar

### 🔐 Authentication
- NextAuth v5 with Credentials provider
- Role-based access (Super Admin / Client)
- Encrypted JWT sessions

### 🚀 Onboarding (6 Phases)
1. **Command Center** — Name, email, phone, LinkedIn, designation
2. **Logic Node** — Entity type, department, team size, region
3. **Organization DNA** — Company, industry, website, GSTR, revenue
4. **Visual Core** — Logo upload, primary brand color, tagline, voice
5. **Neural Targets** — Goals, sales channel, audience, CRM integration
6. **Bot Interface** — Live chatbot preview with custom colors & messaging

### 📊 Dashboard
- Real-time stats (leads, deals, revenue, follow-ups)
- Collapsible sidebar navigation
- Responsive mobile drawer
- Dark theme by default

### 🤖 AI Chatbot
- Context-aware assistance
- Bilingual support (Hindi/English)
- Knowledge base integration
- Floating widget across all dashboard pages

### 📋 Lead Management
- Full CRUD with slide-out panel
- Status pipeline tracking (New → Won/Lost)
- Priority tagging
- Source attribution
- Follow-up scheduling

---

## Authentication

Authentication is handled by **NextAuth v5** configured in `auth.ts`.

### Roles

| Role           | Access Level                             |
| -------------- | ---------------------------------------- |
| `admin`        | Full access, all data, user management   |
| `client`       | Own leads, deals, and follow-ups         |

### Test Credentials

| Role   | Email                          | Password   |
| ------ | ------------------------------ | ---------- |
| Admin  | `techecho.kanpur@gmail.com`    | `admin@123`|
| Client | `anujsachan98@gmail.com`       | `Anuj@123` |

> ⚠️ **Important**: Replace hardcoded credentials with database-backed auth before production deployment.

---

## Database Models

### Lead (`models/lead.ts`)

| Field            | Type     | Description                |
| ---------------- | -------- | -------------------------- |
| `fullName`       | String   | Contact's full name        |
| `email`          | String   | Contact email              |
| `phone`          | String   | Phone number               |
| `companyName`    | String   | Company/organization       |
| `productInterest`| String   | Product they're interested in |
| `source`         | String   | Lead source channel        |
| `status`         | String   | Pipeline stage             |
| `priority`       | String   | Low / Medium / High        |
| `dealValue`      | Number   | Estimated deal value       |
| `notes`          | String   | Internal notes             |
| `followUpDate`   | Date     | Next follow-up date        |
| `userId`         | String   | Owner (multi-tenancy)      |

### Client (`models/client.ts`)

| Field        | Type     | Description              |
| ------------ | -------- | ------------------------ |
| `name`       | String   | Client name              |
| `email`      | String   | Client email (unique)    |
| `company`    | String   | Company name             |
| `phone`      | String   | Phone number             |
| `status`     | String   | active / inactive        |

---

## API Endpoints

| Method   | Endpoint               | Description             |
| -------- | ---------------------- | ----------------------- |
| `GET`    | `/api/leads`           | Fetch all leads         |
| `POST`   | `/api/leads`           | Create a new lead       |
| `GET`    | `/api/leads/[id]`      | Get single lead         |
| `PUT`    | `/api/leads/[id]`      | Update a lead           |
| `DELETE` | `/api/leads/[id]`      | Delete a lead           |
| `GET`    | `/api/clients`         | Fetch all clients       |
| `POST`   | `/api/clients`         | Create a new client     |
| `GET`    | `/api/dashboard/stats` | Dashboard statistics    |
| `POST`   | `/api/chat`            | AI chatbot interaction  |

---

## UI Components

### Primitive Components (`components/ui/`)
Built with [shadcn/ui](https://ui.shadcn.com/) — based on Radix UI primitives. Do not edit directly unless customizing the design system.

### Feature Components (`components/`)

| Component              | Description                                |
| ---------------------- | ------------------------------------------ |
| `login-form.tsx`       | Split-screen login with branding panel     |
| `signup-form.tsx`      | Signup gateway + neural loading overlay    |
| `onboarding-form.tsx`  | 6-phase onboarding wizard with bot preview |
| `lead-form-panel.tsx`  | Slide-out lead create/edit form            |
| `sidebar.tsx`          | Collapsible dashboard sidebar              |
| `mobile-sidebar.tsx`   | Responsive mobile navigation drawer        |
| `top-navbar.tsx`       | Dashboard header with search & profile     |
| `chat-widget.tsx`      | AI assistant floating widget               |
| `providers.tsx`        | Session + Theme context providers          |

### Landing Page Components (`components/landing/`)

| Component              | Description                    |
| ---------------------- | ------------------------------ |
| `hero.tsx`             | Main hero with orange glow     |
| `navbar.tsx`           | Floating capsule nav           |
| `pricing.tsx`          | 3-tier pricing cards           |
| `features.tsx`         | Feature grid                   |
| `testimonials.tsx`     | Customer testimonials          |
| `comparison.tsx`       | vs-competitors table           |
| `faq.tsx`              | FAQ section                    |
| `footer.tsx`           | Site footer                    |
| `constants.ts`         | All landing page data/copy     |

---

## Design System

### Typography
- **Headings (h1–h6)**: `Manrope` (via `--font-manrope`)
- **Body / UI**: `Poppins` (via `--font-poppins`)

### Color Palette

| Token             | Value                | Usage                     |
| ----------------- | -------------------- | ------------------------- |
| Background        | `#050510`            | Auth & onboarding pages   |
| Primary           | `oklch(0.55 0.20 260)` | Buttons, active states  |
| Accent Orange     | `#ff6b35`            | Landing page CTA & hover  |
| Indigo            | `#818cf8`            | Dashboard accents         |
| Emerald           | `#10b981`            | Success / completed       |
| Destructive       | `oklch(0.60 0.18 25)` | Error states             |

### CSS Utilities (defined in `globals.css`)
- `.text-glow` — Orange text shadow
- `.btn-cyber-filled` — Gradient orange CTA button
- `.glow-horizon` — Decorative arc glow effect
- `.reveal` — Scroll-triggered fade-in animation

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

### Docker (Self-hosted)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing Guidelines

### Branch Naming
```
feature/short-description
fix/bug-description
refactor/component-name
```

### Commit Messages
```
feat: add lead export to CSV
fix: resolve sidebar collapse on mobile
refactor: extract onboarding step components
docs: update API endpoint table
```

### Code Standards
- All components use `"use client"` directive only when required (hooks, event handlers)
- Use `cn()` utility from `lib/utils.ts` for conditional class merging
- Follow the existing naming convention: `kebab-case` for files, `PascalCase` for components
- Keep `components/ui/` untouched — customize via `globals.css` theme tokens
- All API routes must connect to DB via `lib/db.ts` singleton

---

## License

Proprietary — **TechEcho**. All rights reserved.
