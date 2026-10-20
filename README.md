# QUEUECRAFT — Who Pays for a Faster Queue?

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=flat-square)](https://github.com)
[![Contracts](https://img.shields.io/badge/Contracts-5%2F5%20Passing-brightgreen?style=flat-square)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)

> **Recruiter-Facing Moment:** “The average wait improved, but these visitors paid for that improvement. Follow the exact scheduling decisions.”

---

## What is QUEUECRAFT?

Workforce management dashboards typically optimize schedules by tracking aggregate average wait times. However, under a fixed staff-hour budget, staffing cannot be created out of thin air—reallocating staff to handle morning peaks invariably thins coverage during other windows, imposing delays on specific visitors.

**QUEUECRAFT** is a deterministic discrete-event simulation workbench that introduces the **matched visitor waiting-time transfer ledger**.

### Key Capabilities
1. **Matched Wait-Transfer Ledger:**
   - Evaluates competing schedules on the exact same materialized visitor stream.
   - Computes individual wait changes: $\Delta w_i = w_{\text{candidate}, i} - w_{\text{baseline}, i}$.
   - Proves exact mathematical conservation: $\sum \Delta w_i = \sum \text{Harm}_i - \sum \text{Benefit}_i$.
2. **Fixed-Budget Staffing Constraints:**
   - Holds scheduled labor strictly constant (720 scheduled staff-minutes = 12 staff-hours).
   - Separately accounts for shift-ending overtime when busy servers finish in-flight jobs.
3. **High-Performance Discrete-Event Engine:**
   - Simulates 10,000 visitors in **22.5 ms** (>440,000 visitors/second).
   - Strict 5-phase same-timestamp event ordering: Completions $\to$ Shift Ends $\to$ Shift Starts $\to$ Arrivals $\to$ Dispatch.
4. **Multiobjective Budget Frontier:**
   - Plots average wait vs maximum extra wait vs overtime, isolating schedules that satisfy finite-scenario fairness constraints (e.g. $\max \Delta w \le 5$ min).

---

## Architecture Overview

```
QUEUECRAFT
├── src/
│   ├── app/App.tsx                   # Interactive Analytical Workbench
│   ├── components/HeaderRail.tsx     # Navigation & Schedule Selector
│   ├── domain/                       # Core Simulation & Ledger Engine
│   │   ├── types.ts                  # Visitor, Shift, Receipt, Ledger types
│   │   ├── engine.ts                 # Discrete-Event Queue Engine
│   │   ├── ledger.ts                 # Matched wait-transfer & conservation math
│   │   └── scenarios.ts              # Helpdesk demand generator & schedule family
│   └── features/
│       ├── theatre/                  # Gantt time rail & visitor receipt inspector
│       ├── transfer/                 # Who Waited Longer ledger & wave breakdown
│       ├── board/                    # Visual shift planner & 720m budget meter
│       ├── frontier/                 # Average wait vs max extra wait frontier
│       └── notebook/                 # Specifications & CLI reproduction suite
├── tests/
│   └── queuecraft_contract.test.ts   # 5/5 Mathematical Contract Verification
├── scripts/
│   ├── run_benchmark.mjs             # Multi-scenario Monte Carlo benchmark
│   └── capture_screenshots.mjs       # Headless screenshot capture
└── docs/                             # Simulation contract, prior art, & benchmarks
```

---

## Quick Start (100% Offline & Zero Cloud Spend)

```bash
# 1. Install dependencies
npm install

# 2. Run automated contract verification suite (122 ms)
npm test

# 3. Execute multi-scenario Monte Carlo benchmark (10,000 visitors, 50 seeds)
npm run benchmark

# 4. Build production bundle (218 kB total)
npm run build

# 5. Launch local interactive workbench
npm run preview
```

---

## Contract Verification Summary

```
✔ Contract 1: Canonical 3-Visitor Discrete-Event Engine Verification (10.84ms)
✔ Contract 2: Same-Timestamp Event Ordering & Deterministic Tie-Breaking (0.23ms)
✔ Contract 3: Shift-End In-Flight Job Completion & Overtime Accounting (1.74ms)
✔ Contract 4: Matched Wait-Transfer Identity & Conservation of Waiting Time (1.53ms)
✔ Contract 5: Fixed-Budget Equal Scheduled Labor Verification (0.24ms)
ℹ tests 5
ℹ duration_ms 122.37ms
```

---

## License
MIT
