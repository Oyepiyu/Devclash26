# Devclash26
This is a repo for our hackathon - devclash 2026

# 🔐 TrustLink — The Anti-Fraud Professional Ecosystem

> **Where every user is a verified human. Every transaction is secured. Every connection is trusted.**

[![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20Node.js%20%7C%20FastAPI-blue)]()
[![AI Powered](https://img.shields.io/badge/AI-Claude%20API-blueviolet)]()
[![Security](https://img.shields.io/badge/Security-FaceIO%20%7C%20SHA--256%20%7C%20RBAC-green)]()
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Redis-orange)]()

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [What is TrustLink?](#-what-is-trustlink)
- [Core Features](#-core-features)
  - [Milestone 1 — Personal Identity Verification](#milestone-1--personal-identity-claim-verification)
  - [Milestone 2 — Company Ownership Verification](#milestone-2--company-ownership-claim-verification)
  - [Milestone 3 — Event Authenticity & Escrow System](#milestone-3--event-authenticity--post-payment-trust)
  - [Milestone 4 — Direct Owner-to-Investor Trust](#milestone-4--direct-owner-to-investor-trust)
- [AI Intelligence Layer](#-ai-intelligence-layer)
- [Trust Score System](#-trust-score-system)
- [Growth & Referral Engine](#-growth--referral-engine)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Testing & QA](#-testing--qa)
- [System Architecture](#-system-architecture)
- [Why TrustLink Wins](#-why-trustlink-wins)

---

## 🚨 The Problem

Professional platforms today are riddled with unchecked fraud. Fake identities, unauthorized brokers, fraudulent events, and impersonation go undetected — costing users their trust, money, and safety.

| Statistic | Impact |
|-----------|--------|
| **73%** of profiles on professional platforms are unverified | Identity fraud runs rampant |
| **$4.2B** lost to fake events & fraudulent organizers yearly | No post-payment protection |
| **61%** of investment frauds involve unauthorized middlemen | Investors never reach real founders |

### 4 Critical Gaps in Today's Platforms

| Gap | Current Reality | TrustLink's Fix |
|-----|----------------|-----------------|
| **Personal Identity Fraud** | Anyone can claim to be a CEO with zero verification | FaceIO liveness + Govt ID OCR cross-match + Risk-based verification tiers |
| **Company Ownership Scams** | Employees claim founder status, no validation mechanism | Domain Email OTP + GST/COI Registry cross-check + 4-stage role verification |
| **Fraudulent Event Listings** | Organizers collect payments and vanish | Escrow payout on QR check-in + Social Oracle auto-refund + 10% no-show lock |
| **Investment Middlemen** | Brokers intercept investor-founder communication, skimming from both sides | Biometric anchors ensure investors talk directly to verified owner only |

---

## 🧠 What is TrustLink?

TrustLink is a **fraud-proof professional ecosystem** that makes identity verification, company validation, event trust, and investment integrity non-negotiable by design — not just policy.

Unlike traditional platforms that rely on self-reported data and reactive moderation, TrustLink **engineers trust** into every user action through a multi-layer biometric, cryptographic, and AI-driven verification pipeline.

---

## ⚙️ Core Features

### Sign-Up & Login Flow

Every new user passes through a **mandatory 6-stage verification pipeline** before accessing any platform feature:

```
[1] Enter Details → [2] Face Liveness (FaceIO) → [3] Document Upload (OCR)
→ [4] High-Profile Watchlist Filter → [5] Trust Score Assigned → [6] Dashboard Access
```

- **No shortcuts.** A single failure at any stage = access denied.
- Role-based routing ensures users only see features relevant to their verified role.
- Initial Trust Score (0–100) is computed and locked to the user's biometric identity.

---

### Milestone 1 — Personal Identity Claim Verification

**Problem:** How do we confirm a user's name is actually their own — and not a famous public figure or impersonator?

#### 6-Layer Anti-Fake Defense System

Every signup passes through **all 6 gates sequentially** — one failure = access denied:

| Layer | Check | Method |
|-------|-------|--------|
| **L1** | Face Liveness Detection | FaceIO — photos, video replays & masks are blocked |
| **L2** | Govt ID OCR | Name on Aadhaar/PAN must match face scan |
| **L3** | Document Cross-Reference | Company doc name cross-referenced with Govt ID |
| **L4** | Domain Email OTP | OTP sent to company domain email for ownership proof |
| **L5** | GSTIN Live Lookup | Real-time check against Government GST database |
| **L6** | Behavioral Flags | New account + brand similarity + duplicate document check |

✅ Only verified, accountable humans proceed to the platform.

---

### Milestone 2 — Company Ownership Claim Verification

**Problem:** If a user claims to be a Founder, how do we confirm they're not an employee or impostor?

#### 4-Stage Organisation Verification Flow

```
Stage 1: Company Details (Name · Industry · Address · Website)
    ↓
Stage 2: Role Claim (Founder / Director / HR / Rep / Employee)
    ↓ [Employees are blocked at this stage]
Stage 3: Document Upload (GST cert · COI · PAN · Domain OTP)
    ↓
Stage 4: Trust Score (Auto-scored 0–100 via Python FastAPI microservice)
```

#### Trust Score Outcomes

| Score Range | Status | Access |
|-------------|--------|--------|
| < 30 | ❌ Rejected | No access |
| 31–80 | ✅ Verified | Standard dashboard |
| > 80 | ✅ Fully Verified | Full org control |

#### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Founder / Director** | Full org control + hiring + deals |
| **HR / Rep** | Job posting + limited dashboard |
| **Employee** | View-only — cannot register org |

---

### Milestone 3 — Event Authenticity & Post-Payment Trust

**Problem:** When users pay to attend an event, how do we ensure the organiser doesn't vanish with the money?

#### Escrow-Based Payout Model

Funds are **ONLY released when Proof of Presence is confirmed via QR scan.**

```
Attendee Pays → 100% funds held in escrow
    ↓
Unique QR ticket generated per verified attendee
    ↓
Proof of Presence scan at venue
    ↓ [10% no-show reports auto-lock escrow]
Escrow released to organiser wallet ✅
```

#### Social Oracle Dispute System

A decentralized, community-driven dispute resolution mechanism:

1. **Dispute Filed** — Attendee claims event never happened
2. **5 Oracles Pinged** — High-trust attendees from same check-in location contacted
3. **15-Min Redis Vote** — Real-time vote with Redis TTL enforcement
4. **Consensus Reached** — 3/5 confirm fake → instant auto-refund triggered
5. **Oracle Reward** — Consensus participants earn +5 Trust Score points each

#### Additional Event Safety Features

- **Safety Heatmap** — Redis Geospatial (GEOADD) stores active check-ins; map overlays crowd Trust Score. Users see live ratings like *"98% Trust Rating"* before buying tickets.
- **Plus-One Invitation Flow** — Buyer delegates 2nd ticket to a named guest. Guest creates a Lite Profile with FaceIO — behavior linked to buyer's Trust Score.
- **Fraud Red-Alert System** — "Report Suspicious" on every event page. 5 reports within 1 hour auto-hides event from global Radar until a Diamond-tier leader clears it.
- **Trust Score Visibility Barrier** — Events by organizers with Score < 50 are only visible to direct referrals, not global Radar, with a "New Organiser" badge as a transparency signal.

---

### Milestone 4 — Direct Owner-to-Investor Trust

**Problem:** When startups seek funding, how do we ensure the investor speaks only to the verified founder?

#### Anti-Middleman Investment Architecture

```
Investor Intent (Trust Score >80 + KYC required)
    ↓
Platform Verification Gate (live biometrics confirm investor identity)
    ↓
Founder Identity Lock (only biometric-anchored founder can respond)
    ↓ [Unauthorized brokers are physically blocked by design]
Direct Encrypted Channel (no 3rd party can inject into this conversation)
    ↓
Investment Executed (on-platform deal + full audit trail in MongoDB)
```

**Key Guarantees:**
- ✅ Biometric anchor — founder's biometric is cryptographically locked to the company
- ✅ Broker interception is **impossible by design**, not just policy
- ✅ Direct encrypted channel — owner and investor only
- ✅ Investment only from fully verified users (Score > 80)
- ✅ Authorised rep mapping available via legal doc + biometric (for legitimate delegation)

---

## 🤖 AI Intelligence Layer

Claude-powered AI assists users across **every touchpoint** — embedded as a smart co-pilot in every feature, not bolted on as an afterthought.

| Feature | What it does |
|---------|-------------|
| **Smart Event Discovery** | Understands natural language intent — *"find a startup pitch in Pune next weekend"* — surfaces semantically matching events filtered by industry, format, and attendee trust score |
| **Event Summariser** | Before attending, users get an AI-generated brief: key speakers, agenda, crowd profile, trust score distribution of attendees, and distance/effort-to-value ratio |
| **Smart Applicant Screening** | AI pre-screens applicants against JDs, surfaces Top 5 matches with plain-language fit summaries — reduces recruiter screening time by **70%** |
| **Post-Event Debrief Generator** | Generates full debrief for organizers: attendance rate, drop-off points, attendee sentiment, Trust Score impact, and specific recommendations for the next event |
| **Profile Optimisation Concierge** | Analyzes profile completeness, suggests missing trust signals, recommends connections, gives personalized visibility-boost recommendations |
| **Trust Snapshot for Events** | Before buying tickets, users see an AI-generated Trust Snapshot: organizer history, past event success rate, community oracle ratings, and a risk-level assessment |

---

## 📊 Trust Score System

The Trust Score (0–100) is the backbone of TrustLink — a dynamic, tamper-proof reputation engine that gates every feature on the platform.

- Computed via a **Python FastAPI microservice** using weighted signals
- Increases with verified activity, oracle participation, and successful events
- Decreases with disputed behavior, failed verifications, or flagged activity
- Controls access to paid event creation, investment channels, and global visibility
- Cannot be manually edited — only system-verified actions move the score

---

## 🚀 Growth & Referral Engine

Fraud-resistant referral mechanics with milestone rewards and a live leaderboard to drive verified user growth.

#### How it Works

```
[1] Unique Referral Code (SHA-256 signed — fraud-proof)
    ↓
[2] Friend clicks link (landing page captures referral + source metadata)
    ↓
[3] FaceIO Verification (no biometric = no referral credit — period)
    ↓
[4] Milestone Auto-Checked (threshold hit → reward notification sent)
    ↓
[5] SHA-256 Ledger Entry (every referral logged with work-proof hash)
```

#### Milestone Reward Tiers

| Milestone | Reward |
|-----------|--------|
| **100** verified referrals | Gift Reward |
| **500** verified referrals | Bigger Gift Reward |
| **1,000** verified referrals | 3 Mega Gifts (Smartphones) |

- ✅ SHA-256 fraud-proof referral ledger — no fake account farming
- ✅ Biometric requirement eliminates bot referrals entirely
- ✅ Live leaderboard with real-time milestone tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + Vite, Tailwind CSS, PWA (V2) |
| **Backend** | Node.js + Express, Python FastAPI, JWT Auth + RBAC |
| **Database** | MongoDB Atlas, Redis (cache/queue), Mongoose ODM |
| **AI Layer** | Claude API (primary), OpenAI (fallback), FastAPI microservice |
| **Payments** | Razorpay Escrow, Wallet system, Auto-release logic |
| **Security** | FaceIO Biometrics, SHA-256 Ledger, IPC/IT Act Compliance Logging |

---

## 🗄 Database Schema

### User Model
```
name · email · password · role · intent
faceVerified · docVerified · trustScore · walletBalance
```

### Organisation Model
```
owner (ref) · gstin · domain · logo
verificationStatus · trustScore · stats
```

### Event Model
```
organiser (ref) · title · price · capacity
location · date · type · participants[]
```

### Agreement Model
```
buyer (ref) · seller (ref) · biometricUrl
amount · escrowStatus · stage · auditTrail
```

### Ticket Model
```
event (ref) · attendee (ref) · qrCode
checkedIn · escrowReleased
```

### Post Model
```
author (ref) · content · timestamp · likes
comments[] · visibility
```

---

## 🧪 Testing & QA

Comprehensive test coverage across **4 categories** — functional flows, validations, edge cases, RBAC, and business logic.

### Identity Validations

| Test ID | Scenario | Expected |
|---------|----------|----------|
| TC-ID-01 | FaceIO liveness — live face | PASS → proceed |
| TC-ID-02 | FaceIO liveness — printed photo | FAIL → blocked |
| TC-ID-03 | OCR name match — ID vs COI | Match → +10 pts |
| TC-ID-04 | Duplicate face detection | Reject 2nd account |
| TC-ID-05 | Expired ID uploaded | Flag for review |

### RBAC & Access Control

| Test ID | Scenario | Expected |
|---------|----------|----------|
| TC-RBAC-01 | Employee tries to register org | 403 Blocked |
| TC-RBAC-02 | Score 25 user creates paid event | 402 Restricted |
| TC-RBAC-03 | Unverified user sends message | Gate blocks |
| TC-RBAC-04 | Diamond user vouches for another | Vouch recorded |
| TC-RBAC-05 | Score <50 event — global radar | Not shown globally |

### Edge Cases

| Test ID | Scenario | Expected |
|---------|----------|----------|
| TC-EDGE-01 | 2 users upload same GST cert | Duplicate flag |
| TC-EDGE-02 | Famous brand name impersonation | AI flag + review |
| TC-EDGE-03 | OTP expired before entry | Request new OTP |
| TC-EDGE-04 | Event reports: 4 of 5 in 1hr | Still visible (threshold not met) |
| TC-EDGE-05 | Oracle vote timeout (>15 min) | Redis TTL clears vote |

### Business Logic

| Test ID | Scenario | Expected |
|---------|----------|----------|
| TC-BL-01 | QR scan success → escrow release | AVAILABLE_BALANCE |
| TC-BL-02 | 10% no-show within 30 mins | Escrow locked |
| TC-BL-03 | Oracle 3/5 consensus → fake | Auto-refund |
| TC-BL-04 | Oracle 2/5 consensus → disputed | No refund yet |
| TC-BL-05 | Escrow cancel pre-event | Full refund policy |

---

## 🏗 System Architecture

TrustLink follows a **microservice-oriented architecture** with a clear separation of concerns:

- **React + Vite Frontend** — PWA-ready, role-aware UI with trust score gating on all components
- **Node.js + Express API** — Primary REST backend handling auth, events, agreements, and referrals
- **Python FastAPI Microservice** — Dedicated Trust Score computation engine with pluggable signal weights
- **MongoDB Atlas** — Primary persistent store for all user, org, event, ticket, and agreement data
- **Redis** — Used for Oracle voting (TTL-enforced), geospatial safety heatmap, session caching, and referral queues
- **FaceIO Integration** — Real-time biometric liveness checks injected at every critical verification gate
- **Razorpay Escrow** — Payment held in escrow with auto-release logic tied to QR check-in confirmation

---

## 🏆 Why TrustLink Wins

| Pillar | What We Built |
|--------|--------------|
| **Proof of Presence** | QR + FaceIO check-in triggers escrow release — cryptographic proof, not just trust |
| **Social Oracle** | Community-driven dispute resolution with Redis TTL — faster than any manual process |
| **Anti-Broker Locks** | Biometric anchors make middlemen impossible in investment flows by design |
| **6-Layer Defense** | Every user passes 6 sequential fraud gates — one failure blocks access, no exceptions |
| **Trust Heatmap** | Real-time Redis geospatial overlay shows crowd trust score before you leave home |
| **AI Co-pilot** | Smart screening, event debrief, profile optimization — embedded in every workflow |

---

> **TrustLink — Where Trust is Not Optional, It's Engineered.**

*Built by Team NULL-POINTERS*

