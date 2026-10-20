# QUEUECRAFT — Who Pays for a Faster Queue?

Portfolio expansion 07 of 07 · Gemini 3.8 Flash / Antigravity · Self-contained build specification

**Idea:** Compare staffing schedules with the same staff-hour budget and show the individual waiting-time winners and losers behind the average.

**Recruiter-facing moment:** “The average wait improved, but these visitors paid for that improvement. Follow the exact scheduling decisions.”

---
## BUILD PROMPT

Implement **QUEUECRAFT**, a deterministic discrete-event simulation and schedule-comparison application for a fictional campus help desk. Its mandatory contribution is a **matched visitor-level waiting-time transfer ledger** under a fixed staffing budget.

I am a BCA Data Analytics student with existing forecasts and scenario tools. This project adds event scheduling, finite resource constraints, and distribution-aware operational evaluation. A staffing slider with an average wait chart is not sufficient.

### 1. Scope and stack

Use React, strict TypeScript, Vite, SVG/ECharts, and a simulation Web Worker. Keep the pure event engine shared by the browser and benchmark CLI. Use a simple independent reference simulator on tiny fixtures; Python/SimPy can be an optional cross-check.

No paid services, runtime LLM, real personal information, hosted backend, GPU, Docker, or live queue integration. Use synthetic demand with visible assumptions. Inspect existing files/instructions, lock dependencies, and maintain `BUILD_STATUS.md`.

Core: one service stage, FIFO, nonpreemptive service, homogeneous servers, finite day, fixed arrivals, and service times attached to each synthetic visitor. Do not claim to model actual university operations.

### 2. Data and event ordering

```text
Visitor: id, arrivalMinute, serviceMinutes, groupLabel
ServerShift: serverId, startMinute, endMinute
Scenario: seed, arrivalHorizonMinute, observationEndMinute, visitors
Receipt: visitorId, assignedServer, startMinute, completionMinute,
         queueWaitMinute, status, schedulingReason
```

Use integer minute resolution in v1. Durations must be positive. Validate overlapping shifts for the same server and reject ambiguous schedules.

For equal timestamps, process completions, shift endings, shift starts, arrivals, then dispatch; within arrivals use stable visitor ID. Document this exact order.

A server whose shift ended finishes an already started job but takes no new job. Track overtime separately. The scheduled staff-hour budget excludes overtime; total realized labor includes it. A candidate must not look cost-equivalent if it uses more overtime.

Stop new arrivals at the arrival horizon. Continue to a declared observation end or until all work completes, depending on the run mode. Keep unfinished visitors visible and do not exclude them from arrival counts.

### 3. Correct queue engine

Implement an event priority queue. At dispatch, take the longest-waiting visitor (arrival then ID) and the available on-shift server with lowest stable ID. Assign each job at most once and never overlap jobs on one server.

Do not reveal future service time to a policy that would not know it operationally. FIFO requires no such knowledge. A later shortest-job-first extension must be labeled an oracle unless it uses separately declared observable estimates.

Maintain:

```text
arrived = waiting + inService + completed
start >= arrival
completion = start + duration
sum busy intervals reconciles to assigned service durations
```

All animation reads receipts. Changing playback speed cannot affect simulation.

### 4. Mandatory contribution: matched wait-transfer ledger

Compare two schedules on the **same visitor IDs, arrivals, and service requirements**. A shared seed is insufficient if generators consume random numbers differently; materialize the exogenous scenario first.

For visitors who start service in both complete-drain runs, compute:

```text
waitChange_i = waitCandidate_i - waitBaseline_i
benefit_i = max(0, -waitChange_i)
harm_i = max(0, waitChange_i)
sum(waitChange) = sum(harm) - sum(benefit)
```

Use “longer wait” rather than moral judgment about a person. The ledger's word harm is a precise model label, not a comprehensive fairness assessment.

Display total saved minutes, total added minutes, share waiting longer, maximum extra wait, and per-group distributions. Group labels refer to arrival wave or service category, not inferred sensitive demographics.

For censored runs, report incomplete outcomes separately. Do not compare completed-only averages as if the populations matched. The core schedule-selection benchmark uses complete-drain scenarios or marks a schedule infeasible if service never resumes.

For a finite enumerated schedule set, identify candidates satisfying an explicit constraint, such as no matched visitor's wait increasing by more than five minutes. Label this an **observed finite-scenario constraint**, not a guarantee for future arrivals.

### 5. Fixed-budget schedule search

Define a small schedule family: two named workers, each with one contiguous shift of a fixed duration, starts on a 30-minute grid within a six-hour service day. Keep the total scheduled minutes constant.

Enumerate the allowed start pairs, reject schedules that cannot drain the scenario under the declared service rules, simulate the rest, and display a frontier over average wait, maximum extra wait, and overtime. Do not call the best enumerated candidate globally optimal over all staffing arrangements.

Use development scenario seeds to choose a schedule. Evaluate it on separate held-out seeds. Avoid selecting a different “best schedule” with future knowledge for every test day; an oracle may be shown only as an explicitly labeled retrospective bound.

### 6. Canonical engine fixture

Three arrivals: visitor a at minute 0 with service 4; b at minute 1 with service 2; c at minute 2 with service 1.

One always-on server gives starts `[0,4,6]`, waits `[0,3,4]`, completions `[4,6,7]`.

Two always-on servers give starts `[0,1,3]`, waits `[0,0,1]`, completions `[4,3,4]`.

This validates the engine, but it is **not** the fixed-budget showcase because it adds staff.

For the showcase, generate bursty morning/afternoon demand and compare two equal-budget shift arrangements. Derive the visitor gains/losses from actual simulation. If the chosen case has no losers, show that result; select a tradeoff example by a published rule across the scenario suite rather than inventing counts.

### 7. Views

**Service theatre:** A time rail with arrival marks, queue, and actual server busy intervals. Select a visitor to trace arrival → wait → dispatch → completion.

**Schedule board:** Keyboard-editable shift times and explicit scheduled-minute total, overtime, and invalid-schedule warnings.

**Who waited longer:** Matched visitor slope plot, distribution of wait changes, and receipt table. Selecting a point highlights the differing dispatch context in both worlds.

**Budget frontier:** Evaluated candidates, constraints, infeasible schedules, and held-out results. Show the baseline prominently.

**Scenario notebook:** Generator assumptions, formulas, raw receipt exports, versioned replay JSON, comparison manifest, and a print brief.

### 8. Art direction and usability

Use a warm civic-service design: ivory `#F7F5EF`, ink `#24343A`, teal `#267D78`, copper `#B96732`. The defining view is a pair of server timelines connected by matched visitor lines. Avoid making animated dots the only representation of people or outcomes.

Provide pause, step, scrub, and reset. Tables supply the same information as visuals. Use non-color encodings, visible focus, reduced motion, mobile stacked timelines, 200% zoom, and error/empty states.

### 9. Tests and experiments

Production-engine tests: canonical one/two-server fixture, simultaneous arrival/completion, shift-ending service, overtime, no available server, empty demand, invalid duration, FIFO ties, no overlap, conservation, deterministic replay, and import validation.

Compare tiny scenarios with an independently implemented tick/reference simulator. Do not copy production helpers into the reference.

Test the transfer identity and matched population. Make tests fail if one candidate silently drops waiting visitors. Verify scheduled-budget equality and separately reported overtime.

Use at least 20 development and 30 held-out seeds across declared arrival patterns. Preserve all input scenarios and outputs. Compare paired per-scenario differences, and if reporting intervals, resample independent scenario runs. These do not establish real-world staffing benefits.

Playwright: run baseline → move a shift while preserving scheduled hours → recompute → select a visitor with changed wait → inspect both receipts → export/import → reproduce.

Measure engine runtime and worker cancellation on 100/1,000/10,000 visitors. Keep benchmark time separate from simulated queue time.

### 10. Milestones and deliverables

1. Write `docs/SIMULATION_CONTRACT.md`; implement and independently verify the canonical engine fixture.
2. Build the real server timeline and visitor inspector.
3. Add fixed-budget enumeration, matched wait ledger, and replay export.
4. Run held-out experiments; inspect actual screenshots; fix failures.
5. Complete documentation, interview explanations, and showcase assets.

Deliver source, lockfile, working dev/build/preview/test/test:e2e/benchmark commands, generator, raw scenario results, README, contract, prior art, validation, performance, limitations, five screenshots, a 60-second script, and an honest LinkedIn draft.

Hook: “I optimized a queue, then built a ledger of who waited longer.” Use it only if the measured comparison supports that story.

Interview questions: Why event simulation rather than animation ticks? Why pair identical visitors? Why does fixed scheduled labor not imply equal realized labor? What does a finite-scenario no-extra-wait constraint fail to guarantee?

### 11. Prior art

Review [SimPy's bank example](https://simpy.readthedocs.io/en/4.1.0/examples/bank_renege.html), [TableFlow](https://github.com/shamsadr/tableflow), and [the common-random-number queue simulator](https://github.com/denniemok/queuing-system-simulation).

Queue optimization and fair comparisons are established. The intended contribution is the fixed-budget, matched visitor transfer receipt and its constrained schedule comparison. Do not claim novel queueing theory or worldwide novelty.

Begin milestone 1. Completion requires the wait-transfer identity, real schedule enumeration, matched-population validation, and the usable evidence journey.

### Continuation prompt

Read PROJECT_SPEC.md and BUILD_STATUS.md. Resume QUEUECRAFT. Preserve event ordering, FIFO, fixed scheduled budget, separately reported overtime, identical visitor inputs, and explicit censoring. Reuse the working engine and verify the first incomplete milestone.

### Final audit prompt

Independently check tiny queue schedules, same-time events, and shift-end overtime. Verify visitor matching and the benefit/harm conservation identity. Ensure held-out scenarios did not choose their own schedule. Replay an export and inspect the actual browser journey.
