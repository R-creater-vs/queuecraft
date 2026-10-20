# QUEUECRAFT — Performance Profile & Empirical Benchmarks

## System Configuration
- **Platform:** Windows 11 x64
- **Runtime:** Node.js v24.14.1
- **Vite:** 6.0.1 / React 18.3.1
- **Demand Model:** Burst-Arrival Campus Helpdesk Scenario (360-min service window)

---

## 1. Engine Scalability & Execution Speed
| Visitor Population | Completion Status | Discrete-Event Engine Runtime | Throughput |
| :--- | :--- | :--- | :--- |
| **100 visitors** | 100% completed | 9.11 ms | 10,982 visitors/s |
| **1,000 visitors** | 100% completed | 3.64 ms | 274,394 visitors/s |
| **10,000 visitors** | 100% completed | **22.50 ms** | **444,358 visitors/s** |

*Methodological note:* Pure discrete-event queue state updates execute synchronously in memory, completely decoupled from animation or rendering clocks.

---

## 2. Multi-Scenario Monte Carlo Benchmark (50 Seeds)
Evaluated across 20 Development Seeds (101-120) and 30 Held-Out Seeds (201-230):

| Metric | Development Suite (20 Seeds) | Held-Out Suite (30 Seeds) |
| :--- | :--- | :--- |
| **Scheduled Staff-Hour Budget** | 720 min (Equal) | 720 min (Equal) |
| **Mean Saved Waiting Time / Day** | 218.4 min | 233.3 min |
| **Mean Added Waiting Time / Day** | 7.6 min | 6.1 min |
| **Net Operational Change / Day** | -210.8 min | -227.2 min |
| **Victim Rate (% Waiting Longer)** | 2.9% | 2.2% |
| **Worst-Case Extra Wait for Single Visitor** | +13 min | +14 min |

---

## 3. Production Bundle Size
| Asset | Uncompressed | Gzip Compressed |
| :--- | :--- | :--- |
| `dist/index.html` | 0.54 kB | 0.37 kB |
| `dist/assets/index.css` | 19.82 kB | 4.29 kB |
| `dist/assets/index.js` | 198.57 kB | 58.96 kB |
| **Total Production Package** | **218.93 kB** | **63.62 kB** |

---

## 4. Resource & Cloud Cost
- External network requests: **0** (100% in-memory local execution).
- External databases / APIs: **0**.
- Cloud cost: **$0.00**.
