# QUEUECRAFT — Contract Validation & Simulation Verification

## Executive Summary
This document records the empirical verification of **QUEUECRAFT** (Discrete-Event Helpdesk Simulation & Matched Waiting-Time Transfer Ledger). QUEUECRAFT models single-stage FIFO queueing under fixed staff-hour budgets, isolating individual trade-offs behind aggregate average wait improvements.

All verification commands execute 100% offline with zero cloud spending or external services.

---

## 1. Automated Contract Verification Suite

**Command executed:**
```bash
npm test
# Equivalent to: node --experimental-strip-types --test tests/queuecraft_contract.test.ts
```

**Results:**
```
✔ Contract 1: Canonical 3-Visitor Discrete-Event Engine Verification (10.84ms)
✔ Contract 2: Same-Timestamp Event Ordering & Deterministic Tie-Breaking (0.23ms)
✔ Contract 3: Shift-End In-Flight Job Completion & Overtime Accounting (1.74ms)
✔ Contract 4: Matched Wait-Transfer Identity & Conservation of Waiting Time (1.53ms)
✔ Contract 5: Fixed-Budget Equal Scheduled Labor Verification (0.24ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ duration_ms 122.37ms
```

### Detailed Contract Analysis
1. **Contract 1: Canonical 3-Visitor Fixture Verification:**
   - Visitor stream: $a$ (arr: 0, svc: 4), $b$ (arr: 1, svc: 2), $c$ (arr: 2, svc: 1).
   - Single server ($M=1$):
     - Starts: $[0, 4, 6]$
     - Waits: $[0, 3, 4]$ (mean wait = $2.333$ min)
     - Completions: $[4, 6, 7]$
   - Dual server ($M=2$):
     - Starts: $[0, 1, 3]$
     - Waits: $[0, 0, 1]$ (mean wait = $0.333$ min)
     - Completions: $[4, 3, 4]$
   - Both match theoretical queueing hand-calculations with 0.00ms error.
2. **Contract 2: Same-Timestamp Event Ordering & Deterministic Tie-Breaking:**
   - At simultaneous minute $t=5$, tests simultaneous arrivals ($vis-z$ and $vis-a$) and server activations ($srv-2$ and $srv-1$).
   - Verifies alphabetical tie-breaking: $vis-a$ is dispatched to $srv-1$.
3. **Contract 3: Shift-End In-Flight Job Completion & Overtime Accounting:**
   - Verifies server whose shift ends at minute 60 completes in-flight job at minute 65 without preemption.
   - Verifies $+5$ minutes charged as overtime, while subsequent waiting visitors are not taken.
4. **Contract 4: Matched Wait-Transfer Identity & Mathematical Conservation:**
   - Verifies $\sum_i \Delta w_i = \sum_i \text{Harm}_i - \sum_i \text{Benefit}_i$ holds with zero numerical drift across the matched visitor population.
5. **Contract 5: Fixed-Budget Equal Scheduled Labor Verification:**
   - Proves all candidate schedules in `SCHEDULE_FAMILY` have exactly $720$ scheduled minutes ($12$ staff-hours).

---

## 2. Production Build Verification
- **Command:** `npm run build` (`tsc -b && vite build`)
- **Duration:** 2.40 seconds
- **Output:**
  - `dist/index.html` (0.54 kB)
  - `dist/assets/index.css` (19.82 kB)
  - `dist/assets/index.js` (198.57 kB)
- **Zero TypeScript errors** (`strict: true`, `noImplicitAny`).
