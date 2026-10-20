import type { Visitor, Schedule, ServerShift } from './types.ts';

// Deterministic Linear Congruential Generator (LCG)
export function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHelpdeskScenario(seed: number, visitorCount: number = 60): Visitor[] {
  const rng = createRng(seed);
  const visitors: Visitor[] = [];

  let currentMinute = 5;

  for (let i = 1; i <= visitorCount; i++) {
    const id = `vis-${String(i).padStart(3, '0')}`;
    let group: 'morning_rush' | 'midday_lull' | 'afternoon_rush' | 'evening_close';
    let interArrival: number;
    let serviceDuration: number;

    if (currentMinute < 120) {
      // Morning rush: high arrival rate, moderate service times
      group = 'morning_rush';
      interArrival = Math.floor(1 + rng() * 4); // 1 to 4 min
      serviceDuration = Math.floor(3 + rng() * 5); // 3 to 7 min
    } else if (currentMinute < 210) {
      // Midday lull: slower arrivals, quick queries
      group = 'midday_lull';
      interArrival = Math.floor(4 + rng() * 8); // 4 to 11 min
      serviceDuration = Math.floor(2 + rng() * 4); // 2 to 5 min
    } else if (currentMinute < 330) {
      // Afternoon rush: high arrival rate
      group = 'afternoon_rush';
      interArrival = Math.floor(1 + rng() * 5); // 1 to 5 min
      serviceDuration = Math.floor(3 + rng() * 6); // 3 to 8 min
    } else {
      // Evening close
      group = 'evening_close';
      interArrival = Math.floor(3 + rng() * 6);
      serviceDuration = Math.floor(2 + rng() * 3);
    }

    currentMinute += interArrival;
    if (currentMinute > 360) break;

    visitors.push({
      id,
      arrivalMinute: currentMinute,
      serviceMinutes: serviceDuration,
      groupLabel: group,
    });
  }

  return visitors;
}

// Canonical Fixed-Budget Schedules (All exactly 720 scheduled staff-minutes = 12 staff-hours)
export const SCHEDULE_FAMILY: Schedule[] = [
  {
    id: 'sched-flat-baseline',
    name: 'Schedule A: Uniform Flat Baseline',
    description: 'Two full-time servers on-duty simultaneously throughout the entire 6-hour service window (0-360m).',
    totalScheduledMinutes: 720,
    shifts: [
      { serverId: 'srv-1', serverName: 'Alex (Desk 1)', startMinute: 0, endMinute: 360 },
      { serverId: 'srv-2', serverName: 'Blake (Desk 2)', startMinute: 0, endMinute: 360 },
    ],
  },
  {
    id: 'sched-morning-heavy',
    name: 'Schedule B: Morning Rush Stagger',
    description: 'Concentrates 3 servers during the chaotic morning peak (0-120m), leaving 1 server in the afternoon (120-360m). Total = 720m.',
    totalScheduledMinutes: 720,
    shifts: [
      { serverId: 'srv-1', serverName: 'Alex (Desk 1)', startMinute: 0, endMinute: 360 }, // 360m
      { serverId: 'srv-2', serverName: 'Blake (Desk 2)', startMinute: 0, endMinute: 180 }, // 180m
      { serverId: 'srv-3', serverName: 'Casey (Desk 3)', startMinute: 0, endMinute: 180 }, // 180m -> Total 720m
    ],
  },
  {
    id: 'sched-afternoon-heavy',
    name: 'Schedule C: Afternoon Rush Heavy',
    description: 'Light single-server morning, heavily reinforced dual afternoon coverage (120-360m). Total = 720m.',
    totalScheduledMinutes: 720,
    shifts: [
      { serverId: 'srv-1', serverName: 'Alex (Desk 1)', startMinute: 0, endMinute: 360 },   // 360m
      { serverId: 'srv-2', serverName: 'Blake (Desk 2)', startMinute: 120, endMinute: 360 }, // 240m
      { serverId: 'srv-3', serverName: 'Casey (Desk 3)', startMinute: 240, endMinute: 360 }, // 120m -> Total 720m
    ],
  },
  {
    id: 'sched-split-peak',
    name: 'Schedule D: Dual Peak Interleaved',
    description: 'Two servers cover morning rush (0-150m) and afternoon rush (210-360m), single server during lunch lull. Total = 720m.',
    totalScheduledMinutes: 720,
    shifts: [
      { serverId: 'srv-1', serverName: 'Alex (Desk 1)', startMinute: 0, endMinute: 360 },   // 360m
      { serverId: 'srv-2', serverName: 'Blake (Desk 2)', startMinute: 0, endMinute: 150 },   // 150m
      { serverId: 'srv-3', serverName: 'Casey (Desk 3)', startMinute: 150, endMinute: 360 }, // 210m -> Total 720m
    ],
  },
];

export const DEMO_SCENARIO: Visitor[] = generateHelpdeskScenario(42, 65);
