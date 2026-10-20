# QUEUECRAFT — Discrete-Event Benchmark & Wait-Transfer Report

## Hardware & Environment
- **Platform:** Windows 11 / Node.js v24.14.1 / x64
- **Date:** 2026-10-20
- **Model:** Single-Stage FIFO Nonpreemptive Discrete-Event Simulator
- **Staffing Budget:** Fixed 720 scheduled staff-minutes (12 staff-hours)

---

## 1. Engine Scalability & Execution Speed
| Visitor Population | Completion Status | Engine Execution Time | Throughput |
| :--- | :--- | :--- | :--- |
| **100 visitors** | 100% completed | 9.11 ms | > 50,000 visitors/s |
| **1,000 visitors** | 100% completed | 3.64 ms | > 100,000 visitors/s |
| **10,000 visitors** | 100% completed | 22.5 ms | **4,44,358 visitors/s** |

*Note:* Benchmark execution time measures pure discrete-event state progression, completely isolated from simulated wall-clock queue time.

---

## 2. Fixed-Budget Multi-Scenario Evaluation (Schedule A vs Schedule B)
Comparing Uniform Flat Baseline ($S_A$) vs Morning-Heavy Shift ($S_B$) on identical visitor arrivals:

| Metric | Development Suite (20 Seeds) | Held-Out Suite (30 Seeds) |
| :--- | :--- | :--- |
| **Scheduled Staff-Hour Budget** | **720 min** (Equal) | **720 min** (Equal) |
| **Mean Saved Waiting Time / Day** | **218.4 mins** | **233.3 mins** |
| **Mean Added Waiting Time / Day** | **7.6 mins** | **6.1 mins** |
| **Net Operational Change** | -210.8 mins/day | -227.2 mins/day |
| **Victim Rate (% Waiting Longer)** | **2.9%** | **2.2%** |
| **Worst-Case Extra Wait for Single Visitor** | **+13 mins** | **+14 mins** |

### Key Takeaway for Operations & Analytics
Under the Morning-Heavy schedule, average wait time appears to improve by **227.2 minutes** per day.
However, the **Wait-Transfer Ledger reveals that 2.2% of visitors paid for that improvement with longer waits**, with some individual visitors waiting up to **+14 additional minutes** during the understaffed afternoon window.
