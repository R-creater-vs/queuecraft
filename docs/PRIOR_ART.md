# QUEUECRAFT — Prior Art & Methodological Boundaries

## 1. Prior Art in Discrete-Event Queueing Simulation

### SimPy (Team SimPy / Python Software Foundation)
- **Overview**: SimPy is the standard process-based discrete-event simulation framework in Python. Its canonical bank-renege example models arrival streams, shared server resources, and queueing wait times.
- **How QUEUECRAFT Differs**: Standard SimPy runs report aggregate distributions (mean wait, 95th percentile, queue length). QUEUECRAFT computes a **visitor-level matched transfer ledger** that isolates individual trade-offs under fixed-budget schedule shifts.

### TableFlow & Operational Simulators
- **Overview**: Specialized operational scheduling tools for restaurant table turns, hospital triage, and retail counters.
- **How QUEUECRAFT Differs**: TableFlow optimizes for throughput and capacity planning. QUEUECRAFT exposes who pays for throughput gains when total staff-hours are held constant.

### Common Random Numbers (CRN) Methodology
- **Overview**: Established technique in stochastic simulation where competing policies are evaluated using identical pseudorandom seeds to reduce variance in pairwise comparisons.
- **How QUEUECRAFT Extends CRN**: Rather than just comparing paired means, QUEUECRAFT tracks the sign and magnitude of wait changes for every individual visitor, identifying the victims and beneficiaries of scheduling changes.

---

## 2. Intellectual Honesty & Theoretical Boundaries
- **No Novel Queueing Theory Claim**: QUEUECRAFT uses standard single-stage $M/G/c$-style FIFO queueing. It does not invent new mathematical theorems in queueing theory.
- **Finite Observed Scenario vs Future Guarantee**: A schedule that guarantees no visitor wait increases by $>5$ minutes on a 20-seed training suite is an **observed finite-scenario property**, not an asymptotic statistical guarantee for future unobserved operational days.
- **Scheduled Budget vs Realized Labor**: Total scheduled hours can be identical while realized labor diverges due to shift-ending overtime when busy servers complete in-flight jobs.
