# SOLVRA

### AI-Powered Solar Bidding & Decision Platform

SOLVRA is a digital platform that helps homeowners, businesses, and organizations request solar systems based on their actual energy needs, receive proposals from solar suppliers, and make informed decisions without requiring deep technical solar knowledge.

SOLVRA combines structured procurement workflows, AI-assisted interpretation, proposal normalization, comparison, and personalized decision support.

---

## Overview

The traditional solar procurement process can require buyers to understand technical specifications, compare different proposal formats, evaluate equipment and warranties, and identify important differences between supplier offers.

SOLVRA simplifies this process.

A buyer can:

1. Describe their solar needs.
2. Create a solar request.
3. Receive bids from qualified suppliers.
4. Understand and normalize supplier proposals.
5. Compare proposals according to their own priorities.
6. Explore different scenarios through What-If analysis.
7. Negotiate with suppliers.
8. Select a supplier based on their requirements and preferences.

### Core principle

> **AI interprets. The backend decides.**

AI is used to understand, extract, explain, and assist.

The backend remains responsible for validation, business rules, calculations, ranking logic, authorization, and final system decisions.

---

## Main Features

### Buyer Features

* Solar request creation
* Buyer-defined priorities and preferences
* Supplier proposal comparison
* Personalized decision support
* What-If analysis
* Negotiation assistance
* Supplier selection
* Bid history and version tracking

### Supplier Features

* Supplier onboarding
* Company profile management
* Solar request discovery
* Bid submission
* Proposal document upload
* Bid versioning
* Negotiation workflow
* Bid management

### AI Features

* Understand buyer requirements
* Extract supplier proposal information
* Normalize proposal data
* Detect missing information
* Detect conflicting information
* Explain differences between bids
* Generate personalized insights
* Assist with supplier negotiations

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Hook Form
* Zod
* Lucide Icons

### Backend

* Node.js
* Express
* TypeScript
* JWT
* HTTP-only cookies
* Zod

### Database

* PostgreSQL
* Prisma ORM

### AI

* Hugging Face Inference API
* LLM-based services where appropriate

### File Storage

* Cloudinary / ImageKit

### Document Processing

* PDF parsing
* Excel parsing

---

## Project Architecture

The project follows a modular full-stack architecture.

```text
SOLVRA
│
├── Frontend
│   ├── Pages
│   ├── Components
│   ├── Layouts
│   ├── Routes
│   ├── Services
│   ├── Hooks
│   ├── Utilities
│   └── Types
│
├── Backend
│   ├── Routes
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   ├── Validation
│   ├── Authentication
│   ├── AI Services
│   └── Business Logic
│
└── Database
    └── PostgreSQL + Prisma
```

---

## Frontend Structure

```text
src/
├── assets/
├── components/
│   ├── ui/
│   ├── layout/
│   └── landing/
├── pages/
│   ├── Landing/
│   ├── Login/
│   └── Signup/
├── layouts/
├── routes/
├── services/
├── hooks/
├── lib/
├── types/
├── App.tsx
├── main.tsx
└── index.css
```

---

## Development Principles

### 1. AI does not make final business decisions

AI output must be treated as an interpretation or recommendation input.

The backend validates and applies business rules before presenting final results.

### 2. Validate before AI calls

User and supplier inputs should be validated before being sent to an AI service.

### 3. Validate AI output

AI-generated structured data must be validated before entering the application workflow.

### 4. Keep secrets server-side

API keys and sensitive credentials must never be exposed to the React frontend.

### 5. Minimize AI context

Only the information necessary for a specific AI task should be included in prompts.

### 6. Handle AI failures

AI services may fail, timeout, or return invalid responses. The application must provide safe fallback behavior.

### 7. Buyer priorities matter

Proposal evaluation should reflect the buyer's defined requirements and priorities rather than applying one universal definition of the "best" solar proposal.

---

## Git Workflow

The project uses separate development and production branches.

```text
main
│
└── Stable / production-ready code

dev
│
└── Active development
```

Feature work should be developed from `dev` using feature branches when appropriate.

Example:

```text
dev
└── feature/landing-page
```

Changes are reviewed and merged into `dev` before eventually being promoted to `main`.

---

## Environment Variables

Sensitive configuration must not be committed to Git.

Use:

```text
.env
```

for local development and:

```text
.env.example
```

as the documented template.

Example:

```env
VITE_API_URL=

DATABASE_URL=

JWT_SECRET=

HF_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Only variables that are genuinely required by the frontend should use the `VITE_` prefix.

Server-only secrets must never use `VITE_`.

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Project Status

### Current

* [x] Repository initialized
* [x] React + TypeScript + Vite setup
* [x] Tailwind CSS setup
* [x] Frontend architecture established
* [ ] SOLVRA landing page
* [ ] Authentication
* [ ] Buyer workflow
* [ ] Supplier workflow
* [ ] Solar request management
* [ ] Bid management
* [ ] Proposal comparison
* [ ] AI integration
* [ ] Negotiation workflow
* [ ] What-If analysis
* [ ] PostgreSQL + Prisma integration
* [ ] Production deployment

---

## SOLVRA

**AI-powered interpretation. Structured procurement. Buyer-centered decisions.**
