# SOLVRA

### AI-Powered Solar Bidding & Decision Platform

SOLVRA is a full-stack platform that helps homeowners, businesses, and organizations request solar systems based on their energy needs, receive proposals from solar suppliers, compare offers, negotiate with suppliers, and make informed purchasing decisions without requiring deep technical solar knowledge.

SOLVRA combines structured procurement workflows, AI-assisted interpretation, deterministic evaluation, proposal comparison, negotiation, and buyer-centered decision support.

---

## Overview

Traditional solar procurement can require buyers to understand technical specifications, compare proposals with different structures, evaluate equipment and warranties, and identify important differences between supplier offers.

SOLVRA simplifies this process by turning the workflow into a structured decision-making process.

A buyer can:

1. Describe their solar needs.
2. Create and manage a solar request.
3. Receive multiple bids from suppliers.
4. Compare supplier proposals using structured information.
5. Define their evaluation priorities.
6. Run deterministic proposal evaluation and ranking.
7. Receive AI-generated decision insights.
8. Explore hypothetical scenarios through What-If analysis.
9. Negotiate directly around a specific supplier bid.
10. Select and award a supplier.

### Core Principle

> **AI interprets. The backend decides.**

AI is used to understand requirements, identify missing or conflicting information, explain differences, and assist the user.

The backend remains responsible for validation, authorization, business rules, calculations, evaluation, ranking, and final system decisions.

---

# Main Features

## Buyer Features

* Buyer registration and authentication
* Solar request creation and management
* Natural-language requirement input
* AI-assisted requirement understanding
* Supplier bid comparison
* Buyer-defined evaluation criteria and weights
* Deterministic bid evaluation and ranking
* Total Cost of Ownership (TCO) calculation
* Technical compliance evaluation
* AI-generated decision insights
* Missing information and conflict detection
* What-If analysis
* Bid-specific negotiation
* Supplier selection and award
* Bid and version history
* Request workflow and status tracking

## Supplier Features

* Supplier registration and authentication
* Company profile management
* Discovery of available solar requests
* Request details and requirements
* Multiple independent bids for the same request
* Structured bid submission
* Bid management
* Bid versioning and revision history
* Bid-specific negotiation
* Supplier dashboard and bid tracking

A supplier may submit more than one independent bid for the same solar request. Each bid represents a separate proposal, while revisions to a proposal are represented through bid versions.

---

# AI Features

SOLVRA uses AI as an interpretation and decision-support layer rather than as the final decision maker.

Current AI capabilities include:

* Buyer requirement understanding
* Requirement structuring
* Missing information detection
* Conflict detection
* Bid comparison insights
* Supplier proposal differences
* Buyer-specific considerations
* Decision explanations
* Negotiation assistance

AI-generated information is treated as an input to the workflow and is subject to application validation and business rules.

---

# Evaluation & Decision Engine

SOLVRA combines AI assistance with deterministic backend evaluation.

Buyers can define evaluation criteria and assign weights to reflect their priorities.

Supported evaluation criteria include:

* Price
* Technical compliance
* Warranty
* Delivery time
* Maintenance
* Payment terms
* Custom criteria

The backend calculates proposal scores using the configured weights and produces a ranked evaluation of eligible bids.

The evaluation also calculates a simplified Total Cost of Ownership (TCO) used by the current MVP evaluation workflow.

Non-compliant bids are handled separately from compliant bids rather than silently being treated as equivalent proposals.

### Decision principle

> **The system does not define one universal "best" solar proposal.**

The result depends on the buyer's requirements and selected priorities.

---

# Negotiation Workflow

Negotiations are associated with a **specific bid**, rather than only with a buyer, supplier, or request.

This is important because a supplier may submit multiple bids for the same request.

For example:

```text
Solar Request
│
├── Supplier A
│   ├── Bid A1
│   │   └── Negotiation
│   └── Bid A2
│       └── Negotiation
│
└── Supplier B
    └── Bid B1
        └── Negotiation
```

Each negotiation therefore remains tied to the proposal being discussed.

Bid revisions are represented as new bid versions so that the history of a proposal can be preserved.

---

# What-If Analysis

SOLVRA allows buyers to explore hypothetical changes to proposal conditions without modifying the actual bid.

Examples include exploring changes to:

* Price
* Warranty
* Delivery
* Maintenance
* Other evaluation factors

What-If results are treated as hypothetical and are not persisted as changes to the supplier's actual bid.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Hook Form
* Zod
* Lucide Icons

## Backend

* Node.js
* Express
* TypeScript
* JWT authentication
* HTTP-only cookies
* Zod validation

## Database

* PostgreSQL
* Prisma ORM

## AI

* Hugging Face Inference API
* LLM-based services where appropriate

## File & Document Infrastructure

The architecture supports external file storage and document-processing integrations where required by the workflow.

---

# Project Architecture

SOLVRA follows a modular full-stack architecture.

```text
SOLVRA
│
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── landing/
│       │   └── ui/
│       ├── context/
│       ├── layouts/
│       ├── lib/
│       ├── pages/
│       │   ├── Landing/
│       │   ├── Login/
│       │   ├── Signup/
│       │   ├── ForgotPassword/
│       │   ├── ResetPassword/
│       │   └── Dashboard/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       │   └── ai/
│       ├── app.ts
│       └── server.ts
│
└── README.md
```

---

# Core Workflow

The main SOLVRA workflow is:

```text
Buyer
  │
  ▼
Create Solar Request
  │
  ▼
AI Requirement Understanding
  │
  ▼
Request Published
  │
  ▼
Suppliers Discover Request
  │
  ├───────────────┐
  ▼               ▼
Supplier Bid 1   Supplier Bid 2
  │               │
  └───────┬───────┘
          ▼
    Compare Proposals
          │
          ▼
  Buyer Defines Priorities
          │
          ▼
 Deterministic Evaluation
          │
          ▼
 AI Decision Insights
          │
          ▼
 Bid-Specific Negotiation
          │
          ▼
     Bid Revision
          │
          ▼
      Re-evaluation
          │
          ▼
      Supplier Award
```

---

# Security & Engineering Principles

### 1. AI does not make final business decisions

AI output is treated as interpretation or decision-support input.

The backend validates and applies business rules before final results are produced.

### 2. Validate inputs

User and supplier inputs are validated before entering business workflows and before being sent to AI services where applicable.

### 3. Validate AI output

AI-generated structured information must be validated before being used by the application.

### 4. Keep secrets server-side

API keys and sensitive credentials must never be exposed to the React frontend.

### 5. Minimize AI context

Only the information required for a specific AI task should be provided to the AI service.

### 6. Handle AI failures

AI services can fail, timeout, or return invalid responses. The application provides fallback/error handling rather than allowing an AI failure to determine a business decision.

### 7. Buyer priorities matter

Proposal evaluation is based on buyer-defined criteria and weights rather than a universal definition of the "best" solar proposal.

### 8. Role-based access

Protected workflows enforce ownership and role restrictions so buyers and suppliers cannot arbitrarily access or modify other users' resources.

### 9. Bid history is preserved

Bid revisions are represented as separate versions, allowing the proposal history to remain traceable.

---

# Environment Variables

Sensitive configuration must not be committed to Git.

Use:

```text
.env
```

for local development and:

```text
.env.example
```

as the documented configuration template.

Typical configuration includes:

```env
DATABASE_URL=
JWT_SECRET=
HF_API_KEY=
```

Only variables that are genuinely required by the frontend should use the `VITE_` prefix.

Server-only secrets must never use `VITE_`.

---

# Local Development

## Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

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

## Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run the backend development server:

```bash
npm run dev
```

Build the backend:

```bash
npm run build
```

---

# Project Status

## Implemented

* [x] Repository and project structure
* [x] React + TypeScript + Vite setup
* [x] Tailwind CSS
* [x] SOLVRA landing page
* [x] Buyer authentication
* [x] Supplier authentication
* [x] Role-based protected workflows
* [x] Buyer dashboard
* [x] Supplier dashboard
* [x] Solar request creation
* [x] Solar request management
* [x] AI-assisted requirement understanding
* [x] Supplier request discovery
* [x] Structured bid submission
* [x] Multiple bids per supplier/request
* [x] Bid management
* [x] Bid versioning
* [x] Proposal comparison
* [x] Buyer-defined evaluation criteria
* [x] Weighted proposal evaluation
* [x] TCO calculation
* [x] Technical compliance evaluation
* [x] Proposal ranking
* [x] AI decision insights
* [x] Missing information detection
* [x] Conflict detection
* [x] What-If analysis
* [x] Bid-specific negotiation workflow
* [x] Supplier award workflow
* [x] Request and bid status management
* [x] PostgreSQL + Prisma integration
* [x] Audit/activity logging

## Remaining / Finalization

* [ ] Final end-to-end workflow testing
* [ ] Final security and authorization testing
* [ ] Final UI/UX cleanup
* [ ] Final production deployment

## Current MVP Limitations

The current MVP focuses on the core buyer-to-supplier bidding and decision workflow.

The following areas are not part of the completed core implementation:

* Advanced engineering/system design calculations
* Payment processing
* IoT integrations
* Blockchain
* Generic chatbot functionality
* Full production deployment
* Full document-based PDF/Excel proposal extraction workflow

These areas can be extended in future versions without changing the core SOLVRA decision workflow.

---

# Git Workflow

The project uses development and stable branches.

```text
main
│
└── Stable / final version

dev
│
└── Development

feature/*
│
└── Individual feature development
```

Development work can be completed on `dev` or feature branches and merged into `main` once verified.

For the final project submission, `main` contains the complete verified implementation.

---

# Project Structure Summary

SOLVRA is organized around a clear separation of responsibilities:

```text
Frontend
    ↓
API / Authentication
    ↓
Controllers
    ↓
Business Services
    ↓
Prisma ORM
    ↓
PostgreSQL

AI Services
    ↓
Interpretation / Insights
    ↓
Validated Application Data

Backend Decision Engine
    ↓
Validation
    ↓
Business Rules
    ↓
Evaluation
    ↓
Ranking
    ↓
Award
```

The architecture keeps AI assistance separate from deterministic business logic.

---

# SOLVRA

**AI-powered interpretation. Structured procurement. Buyer-centered decisions.**

> **AI interprets. The backend decides.**
