# QUEUECRAFT — Discrete-Event Simulation & Wait-Transfer Contract

## 1. Discrete-Event Ordering Specification

### Time Resolution & Priority
1. **Granularity**: Integer minutes ($t \in \mathbb{N}_{\ge 0}$).
2. **Simultaneous Event Resolution**: When multiple events occur at the exact same minute $t$, they must be executed in this strict sequential order:
   - **Phase 1: `COMPLETION`** — Server finishes an in-flight job. The server records job completion and either enters `IDLE` state or ends its shift if $t \ge \text{endMinute}$.
   - **Phase 2: `SHIFT_END`** — Scheduled shift ends. If the server is idle, it goes off-duty immediately. If the server is currently in-service, it continues uninterrupted until completion; the duration between `endMinute` and actual completion is recorded as **overtime**.
   - **Phase 3: `SHIFT_START`** — Scheduled server shift begins. Server transitions to `IDLE` and becomes eligible for dispatch.
   - **Phase 4: `ARRIVAL`** — New visitor arrives and joins the FIFO waiting queue. If multiple visitors arrive at the same minute, they are ordered deterministically by alphabetical `visitorId`.
   - **Phase 5: `DISPATCH`** — The scheduler matches the longest-waiting visitor (first by arrival minute, then by `visitorId`) to the available on-duty server with the lowest alphabetical `serverId`.

---

## 2. Invariant & Conservation Contracts

Every valid simulation run must satisfy the following fundamental physical conservation laws:

$$\text{Total Arrived} = \text{Currently Waiting} + \text{In-Service} + \text{Completed}$$

For every visitor $i$ with arrival time $a_i$ and service duration $d_i$:

$$\text{start}_i \ge a_i$$

$$\text{wait}_i = \text{start}_i - a_i \ge 0$$

$$\text{completion}_i = \text{start}_i + d_i$$

$$\sum_{s \in \text{Servers}} \text{totalBusyMinutes}_s = \sum_{i \in \text{Completed}} d_i$$

No server may process more than one visitor concurrently. No visitor may be assigned more than once.

---

## 3. Matched Wait-Transfer Ledger Formulation

To compare two staffing schedules $S_{\text{baseline}}$ and $S_{\text{candidate}}$ under a fixed scheduled staff-hour budget:
1. **Identical Materialized Scenario**: Both schedules are simulated against the exact same visitor list $\mathcal{V}$ with identical arrival times and service durations.
2. **Matched Visitor Pairwise Metric**:
   For each visitor $i \in \mathcal{V}$:
   $$\Delta w_i = w_{\text{candidate}, i} - w_{\text{baseline}, i}$$
   $$\text{Benefit}_i = \max(0, -\Delta w_i)$$
   $$\text{Harm}_i = \max(0, \Delta w_i)$$

3. **Conservation of Waiting Time**:
   $$\sum_{i \in \mathcal{V}} \Delta w_i = \sum_{i \in \mathcal{V}} \text{Harm}_i - \sum_{i \in \mathcal{V}} \text{Benefit}_i$$

4. **Honest Operational Metrics**:
   - **Total Minutes Saved** ($\sum \text{Benefit}$)
   - **Total Minutes Added** ($\sum \text{Harm}$)
   - **Victim Rate** ($\frac{|\{ i \mid \Delta w_i > 0 \}|}{|\mathcal{V}|}$)
   - **Maximum Extra Wait** ($\max_i \Delta w_i$)
   - **Overtime Disparity** ($\Delta \text{Overtime} = \text{Overtime}_{\text{cand}} - \text{Overtime}_{\text{base}}$)

---

## 4. The Canonical 3-Visitor Engine Fixture

- **Visitor Stream**:
  - Visitor $a$: Arrival $t = 0$, Service $d = 4$ min.
  - Visitor $b$: Arrival $t = 1$, Service $d = 2$ min.
  - Visitor $c$: Arrival $t = 2$, Service $d = 1$ min.

### Single Server Case ($M = 1$)
- Server 1 on-duty throughout $[0, 10]$.
- $t = 0$: $a$ arrives, dispatched immediately. Starts: 0, Completes: 4. Wait = 0.
- $t = 1$: $b$ arrives, enqueued.
- $t = 2$: $c$ arrives, enqueued behind $b$.
- $t = 4$: $a$ completes. $b$ dispatched. Starts: 4, Completes: 6. Wait = 3.
- $t = 6$: $b$ completes. $c$ dispatched. Starts: 6, Completes: 7. Wait = 4.
- **Expected Starts:** $[0, 4, 6]$, **Waits:** $[0, 3, 4]$, **Completions:** $[4, 6, 7]$.
- Mean Wait = $\frac{0 + 3 + 4}{3} = 2.333$ min.

### Dual Server Case ($M = 2$)
- Server 1 and Server 2 both on-duty throughout $[0, 10]$.
- $t = 0$: $a$ arrives, assigned to Server 1. Starts: 0, Completes: 4. Wait = 0.
- $t = 1$: $b$ arrives, assigned to Server 2. Starts: 1, Completes: 3. Wait = 0.
- $t = 2$: $c$ arrives, enqueued (both busy).
- $t = 3$: $b$ completes on Server 2. $c$ dispatched to Server 2. Starts: 3, Completes: 4. Wait = 1.
- $t = 4$: $a$ completes on Server 1; $c$ completes on Server 2.
- **Expected Starts:** $[0, 1, 3]$, **Waits:** $[0, 0, 1]$, **Completions:** $[4, 3, 4]$.
- Mean Wait = $\frac{0 + 0 + 1}{3} = 0.333$ min.
