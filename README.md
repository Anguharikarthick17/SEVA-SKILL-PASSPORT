# SEVA SKILL PASSPORT
### Proof of Course → Proof of Ability

> **Official Submission for the SEVA FIRST Innovation Challenge 2026**  
> **Built by TEAM OG — Opportunity & Growth**  
> **Development Status:** Working Prototype (Next.js 14 + Supabase + Automated Test Suites)

---

## Overview

**SEVA Skill Passport** transforms digital learning by bridging the trust deficit between passive online course completion and verified practical engineering competency. 

Traditional e-learning platforms reward learners for streaming video lectures in background tabs and guessing low-stakes multiple-choice questions. SEVA Skill Passport replaces this with a continuous, verified continuum:
1. **Curated Pathways:** Structured curriculum with 16 modules in Full Stack Development.
2. **Interactive Coding Labs:** 30 unit-tested coding challenges evaluated in isolated runners.
3. **Capstone Projects:** 5 production-grade project specifications evaluated across 4 rubric dimensions by authorized reviewers.
4. **Tamper-Evident Passport:** Cryptographic SHA-256 evidence hashing (`SHA256:SEVA:<hash>`), multi-dimensional competency scoring, anti-gaming diminishing returns, and 1-click public verification at `/verify`.

---

## Key Features

- **Individual ₹100 Pricing Policy:** Every course is ₹100 INR individually (10,000 paise). Access to Course A never unlocks Course B. No all-courses pass.
- **Zero-Friction Demo Mode:** Immediate exploration of learning dashboards and coding challenges with zero real payments, explicitly tagged with `isDemo: true`.
- **Anti-Gaming Scoring Engine:** Diminishing returns scaling on repeated submissions ($1.00 \rightarrow 0.70 \rightarrow 0.50 \rightarrow 0.25$) preventing brute-force gaming.
- **Zero-Inflation Competency Threshold:** Single-attempt tasks clamp displayed scores to 0 and report *"Building evidence"* until multi-source evidence diversity is proven.
- **Cryptographic Evidence Sealing:** Deterministic canonical JSON payloads sealed with SHA-256 digests.
- **Public Credential Verification:** Verification lookup at `/verify?id=<ID>` without requiring authentication.
- **Role-Based Reviewer Authorization:** Anti-self-review guards preventing students or unprivileged users from evaluating their own capstones.

---

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React, Framer Motion.
- **Backend & Database:** Supabase PostgreSQL with 12 structured migrations, Row-Level Security (RLS) policies, and `SECURITY DEFINER` stored procedures.
- **Scoring & Cryptography:** Custom multi-dimensional scoring engine with SHA-256 cryptographic verification.
- **Testing:** 12 automated test suites executed via ESBuild + Node.js.

---

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/Anguharikarthick17/SEVA-SKILL-PASSPORT.git
cd SEVA-SKILL-PASSPORT
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
*(Configure Supabase and Razorpay test credentials as needed. The platform includes local deterministic fallbacks for standalone evaluation).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Suites & Verification

Run the automated test suites:

```bash
# Run ultimate master test suite (all phases)
npm run test:ultimate

# Run scoring engine test suite (anti-gaming, multipliers, hashing)
npm run test:scoring

# Run assessment engine test suite (timed expiry, proctoring)
npm run test:assessment

# Run project verification & reviewer security test suite
npm run test:project

# Run authentication security audit
npm run test:audit

# Run onboarding & demo access test suite
npm run test:onboarding
```

---

## Project Audit Documentation

For detailed analysis covering all 22 official presentation slides for SEVA FIRST 2026, refer to the [SEVA Skill Passport Project Audit Report](SEVA_SKILL_PASSPORT_PROJECT_AUDIT_REPORT.md).

---

## License & Attribution

Designed and developed by **TEAM OG — Opportunity & Growth** for the **SEVA FIRST Innovation Challenge 2026**.
