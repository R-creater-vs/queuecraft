# QUEUECRAFT — Technical Deep-Dive Interview Walkthrough

## 1. System Architecture Overview
QUEUECRAFT is architected into three discrete layers:
1. **Discrete-Event Simulation Engine (`src/domain/engine.ts`)**:
   - Priority event queue with strict same-minute phase resolution (Completions $\to$ Shift Ends $\to$ Shift Starts $\to$ Arrivals $\to$ Dispatch).
   - Nonpreemptive FIFO queueing with deterministic tie-breaking on `visitorId` and `serverId`.
   - Shift-ending in-flight job completion with dedicated overtime accounting.
2. **Transfer Ledger & Analytics Layer (`src/domain/ledger.ts`, `scenarios.ts`)**:
   - Matched-pair waiting time subtraction: $\Delta w_i = w_{\text{cand}, i} - w_{\text{base}, i}$.
   - Conservation of waiting time identity: $\sum \Delta w = \sum \text{Harm} - \sum \text{Benefit}$.
   - Arrival wave aggregation (morning rush, midday lull, afternoon rush).
   - Budget frontier evaluation over 50 independent Monte Carlo seeds.
3. **Interactive Visual Dashboard (`src/features/`)**:
   - Time rail Gantt theatre, Matched wait-transfer ledger, Visual schedule board, Budget frontier, and Scenario notebook.

---

## 2. Deep-Dive Interview Questions & Honest Answers

### Q: "Why discrete-event simulation instead of fixed-timestep animation ticks?"
> "Fixed-timestep animation (e.g. updating state every second or frame) creates accumulator errors and wastes CPU cycles iterating through empty intervals. Discrete-event simulation jumps directly to the timestamp of the next physical event (arrival, completion, or shift transition). This allows us to simulate 10,000 visitors in 22 milliseconds with microsecond precision, completely decoupling analytical computation from visual rendering."

### Q: "Why is matching identical visitor streams essential for schedule comparison?"
> "If you evaluate Schedule A on Monday's visitor arrivals and Schedule B on Tuesday's arrivals, variance in arrival bursts confounds the comparison. By materializing a single exogenous visitor stream (using Common Random Numbers) and simulating both schedules on the exact same visitors, we eliminate external demand variance. This allows us to isolate the pure marginal effect of shift timing on individual visitors."

### Q: "Why doesn't fixed scheduled labor imply equal realized labor?"
> "In nonpreemptive queueing, a server whose shift ends at 3:00 PM cannot abandon a visitor whose service is mid-flight. If a 15-minute job started at 2:55 PM, the server finishes at 3:10 PM, incurring 10 minutes of overtime. If a candidate schedule shifts staff to a peak rush and triggers frequent shift-end overtime, it is consuming more realized labor than the baseline despite sharing the same 720 scheduled minutes. QUEUECRAFT tracks scheduled budget and realized overtime as distinct variables."

### Q: "What does an observed finite-scenario constraint fail to guarantee?"
> "If a schedule satisfies 'no matched visitor waits more than 5 extra minutes' across 20 development seeds, that is an **empirical property of the observed sample path**. It is not a mathematical guarantee that a pathological arrival surge on an unobserved day cannot cause an 8-minute extra wait."
