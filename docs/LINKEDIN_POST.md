# LinkedIn Post Draft — QUEUECRAFT

We optimized a helpdesk staffing schedule and dropped the average wait time by 227 minutes.

Everyone celebrated.

Then I built a ledger of who actually paid for that improvement.

Here is what the average hid:
- To lower the morning rush wait, shifts were pulled away from the afternoon.
- While morning visitors saved 233 minutes, afternoon visitors were slammed with **+14 minutes of extra queue delay**.
- 2.2% of visitors suffered severe delays just so the executive dashboard could show a green aggregate number.

In operations research, this is the classic illusion of the average: under a fixed staff-hour budget, you cannot create capacity out of thin air. You are transferring waiting time from one group of people to another.

To make these trade-offs transparent, I built **QUEUECRAFT** — a discrete-event simulation engine and matched waiting-time transfer ledger.

Key features:
1. **The Matched Wait-Transfer Ledger:** Runs candidate schedules against the exact same visitor stream, calculating $\Delta w_i = w_{\text{candidate}, i} - w_{\text{baseline}, i}$. It proves an exact mathematical conservation law: $\sum \Delta w = \sum \text{Harm} - \sum \text{Benefit}$.
2. **Fixed-Budget Staffing Constraints:** Holds scheduled minutes strictly constant (720 minutes = 12 staff-hours), while isolating shift-ending overtime so schedules cannot cheat the budget.
3. **Discrete-Event Performance:** Simulates 10,000 visitors in 22 milliseconds with strict 5-phase event ordering (completions, shift endings, shift starts, arrivals, dispatch).

⚡ 100% offline & zero cloud spend
⚡ 5/5 contract tests passing in 122ms
⚡ Built with TypeScript, React 18, and Vite

Workforce optimization isn't just about minimizing an average. It's about knowing who bears the cost of your efficiency.

Check out the code and interactive time rail here: [github repo link]

#OperationsResearch #DataAnalytics #SoftwareEngineering #Simulation #TypeScript #QueueingTheory #DiscreteEvent
