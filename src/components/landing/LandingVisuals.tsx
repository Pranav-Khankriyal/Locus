import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  GripVertical,
  KeyRound,
  Laptop,
  Lock,
  Monitor,
  ShieldCheck,
  UserCheck,
  Wallet,
} from 'lucide-react';

interface CardFrameProps {
  id: string;
  step: string;
  headline: string;
  description: string;
  children: React.ReactNode;
}

function CardFrame({ id, step, headline, description, children }: CardFrameProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="scroll-mt-24 bg-white rounded-3xl border border-zinc-200/90 shadow-[0_12px_40px_-10px_rgba(12,66,66,0.06)] hover:shadow-[0_20px_50px_-10px_rgba(12,66,66,0.12)] hover:border-[#0C4242]/30 transition-all overflow-hidden flex flex-col justify-between h-full"
    >
      {/* Header (Step Label + Headline) */}
      <div className="px-6 pt-6 pb-5 sm:px-7 sm:pt-7">
        <span className="text-xs font-semibold text-[#0C4242] tracking-wide">
          {step}
        </span>
        <h3 className="mt-1 text-xl sm:text-[22px] font-bold tracking-tight text-zinc-950">
          {headline}
        </h3>
        <p className="mt-1 text-xs sm:text-[13px] text-zinc-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Visual Graphic Bay */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 flex-1 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Card 01: Employee Management (Stacked Schema Rows + Tilted Card) ─── */

const PEOPLE_ROWS = [
  { badge: 'ENG', name: 'Elena Rostova', meta: 'Security Architect' },
  { badge: 'OPS', name: 'Marcus Vance', meta: 'Head of People Ops' },
  { badge: 'FIN', name: 'Aarav Mehta', meta: 'Payroll Controller' },
];

export function EmployeeDirectoryCard() {
  const [focused, setFocused] = useState(2);

  return (
    <CardFrame
      id="section-01"
      step="01 · Employee Management"
      headline="Your people, organized."
      description="Profiles, departments and reporting structure in one clean roster."
    >
      <div className="flex-1 rounded-2xl bg-[#F2F7F4] border border-[#0C4242]/10 p-4 sm:p-5 flex flex-col justify-between min-h-[250px] overflow-hidden">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 mb-3">
          <span>Organization Directory</span>
          <span className="font-mono text-[11px] text-[#0C4242] font-semibold">148 Active</span>
        </div>

        <div className="space-y-2.5 my-auto">
          {PEOPLE_ROWS.map((row, idx) => {
            const isTilted = idx === focused;
            return (
              <motion.button
                key={row.name}
                type="button"
                onClick={() => setFocused(idx)}
                animate={{
                  rotate: isTilted ? -1.8 : 0,
                  x: isTilted ? 6 : 0,
                  scale: isTilted ? 1.02 : 1,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`w-full text-left flex items-center gap-3 rounded-xl px-3.5 py-3 border transition-all cursor-pointer ${
                  isTilted
                    ? 'bg-white border-2 border-[#0C4242] shadow-[0_12px_24px_-6px_rgba(12,66,66,0.18)]'
                    : 'bg-white border-zinc-200/70 hover:border-[#0C4242]/40 shadow-2xs'
                }`}
              >
                <GripVertical className={`w-3.5 h-3.5 shrink-0 ${isTilted ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span
                  className={`w-8 h-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                    isTilted
                      ? 'bg-[#0C4242] text-white shadow-xs'
                      : 'bg-[#E6F0EB] text-[#0C4242] border border-[#0C4242]/20'
                  }`}
                >
                  {row.badge}
                </span>
                <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                  <span className={`text-[13px] font-semibold truncate ${isTilted ? 'text-zinc-950 font-bold' : 'text-zinc-900'}`}>
                    {row.name}
                  </span>
                  <span className={`text-[11px] truncate hidden sm:inline ${isTilted ? 'text-zinc-600' : 'text-zinc-500'}`}>
                    {row.meta}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </CardFrame>
  );
}

/* ─── Card 02: Asset Management (Concentric Orbital Custody Hub) ─────────── */

export function AssetAllocationCard() {
  const [assigned, setAssigned] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setAssigned((v) => !v), 3200);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { icon: Laptop, label: 'MacBook M3', pos: 'left-4 top-6' },
    { icon: KeyRound, label: 'YubiKey 5C', pos: 'left-16 top-20' },
    { icon: Monitor, label: '4K Display', pos: 'right-16 top-16' },
    { icon: UserCheck, label: assigned ? 'Elena R.' : 'Pool', pos: 'right-4 top-6' },
  ];

  return (
    <CardFrame
      id="section-02"
      step="02 · Asset Management"
      headline="Every asset, accounted for."
      description="Track inventory and verify custody handoffs across every team."
    >
      <div
        onClick={() => setAssigned((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setAssigned((v) => !v);
        }}
        className="flex-1 rounded-2xl bg-[#F2F7F4] border border-[#0C4242]/10 relative min-h-[250px] overflow-hidden cursor-pointer flex flex-col justify-between p-4"
      >
        {/* Top status pill */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-mono text-[11px] text-zinc-500 font-medium">AST-1001 · CUSTODY</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              assigned
                ? 'bg-white border-[#0C4242]/30 text-[#0C4242] shadow-2xs'
                : 'bg-white border-zinc-200 text-zinc-500 shadow-2xs'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                assigned ? 'bg-[#0C4242] animate-pulse' : 'bg-zinc-400'
              }`}
            />
            {assigned ? 'Assigned' : 'Available Pool'}
          </span>
        </div>

        {/* Concentric Bottom Orbital Arcs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-24 -translate-x-1/2 w-72 h-72 rounded-full border border-dashed border-[#0C4242]/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-16 -translate-x-1/2 w-52 h-52 rounded-full border border-dashed border-[#0C4242]/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 w-32 h-32 rounded-full bg-[#0C4242]/10"
        />

        {/* Floating Circular Nodes */}
        <div className="relative flex-1 min-h-[155px]">
          {nodes.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.label}
                className={`absolute ${n.pos} flex flex-col items-center gap-1`}
              >
                <div className="w-11 h-11 rounded-full bg-white border-2 border-[#0C4242]/30 shadow-sm flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#0C4242]" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-800 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-2xs">
                  {n.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center Bottom Hub */}
        <div className="relative z-10 mx-auto w-20 h-11 rounded-t-full bg-[#0C4242] text-white flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(12,66,66,0.3)]">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Vault</span>
        </div>
      </div>
    </CardFrame>
  );
}

/* ─── Card 03: Attendance Management (Airy Calendar + Floating Badge) ────── */

type DayKind = 'present' | 'late' | 'leave' | 'absent';

const MINI_DAYS: { d: number; kind: DayKind; info: string }[] = [
  { d: 10, kind: 'present', info: '9h 02m · On Time' },
  { d: 11, kind: 'present', info: '8h 45m · Office' },
  { d: 12, kind: 'late', info: '8h 05m · Late' },
  { d: 13, kind: 'present', info: '8h 50m · WFH' },
  { d: 14, kind: 'leave', info: 'Paid Leave' },
  { d: 17, kind: 'present', info: '8h 38m · Office' },
  { d: 18, kind: 'present', info: '8h 52m · Office' },
  { d: 19, kind: 'absent', info: '0h 00m · Absent' },
  { d: 20, kind: 'present', info: '8h 40m · WFH' },
  { d: 21, kind: 'present', info: '8h 55m · Office' },
];

const KIND_STYLE: Record<DayKind, { dot: string; card: string; text: string }> = {
  present: {
    dot: 'bg-[#0C4242]',
    card: 'bg-white border-zinc-200/80 text-[#0C4242]',
    text: 'text-[#0C4242]',
  },
  late: {
    dot: 'bg-amber-500',
    card: 'bg-white border-zinc-200/80 text-amber-700',
    text: 'text-amber-700',
  },
  leave: {
    dot: 'bg-sky-500',
    card: 'bg-white border-zinc-200/80 text-sky-700',
    text: 'text-sky-700',
  },
  absent: {
    dot: 'bg-rose-500',
    card: 'bg-white border-zinc-200/80 text-rose-700',
    text: 'text-rose-700',
  },
};

export function AttendanceCalendarCard() {
  const [picked, setPicked] = useState(MINI_DAYS[9]);

  return (
    <CardFrame
      id="section-03"
      step="03 · Attendance Management"
      headline="Know who's at work."
      description="Monitor daily check-ins, working hours, late arrivals and leaves."
    >
      <div className="flex-1 rounded-2xl bg-[#F2F7F4] border border-[#0C4242]/10 p-4 sm:p-5 flex flex-col justify-between min-h-[250px] relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-3">
          <span>NOV 2026</span>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0C4242]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0C4242]" /> Present
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Late
            </span>
            <span className="inline-flex items-center gap-1 text-sky-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Leave
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MINI_DAYS.map((item) => {
            const st = KIND_STYLE[item.kind];
            const isPicked = picked.d === item.d;
            return (
              <button
                key={item.d}
                type="button"
                onClick={() => setPicked(item)}
                onMouseEnter={() => setPicked(item)}
                className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  st.card
                } ${isPicked ? 'ring-2 ring-[#0C4242] bg-[#E8F3ED] scale-[1.03] shadow-xs' : 'shadow-2xs'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {item.d}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                </div>
                <div className={`mt-2 text-[10px] font-semibold capitalize ${st.text}`}>
                  {item.kind}
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Tilted Status Pill */}
        <motion.div
          key={picked.d}
          initial={{ opacity: 0.7, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 ml-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#0C4242]/40 shadow-[0_8px_20px_-4px_rgba(12,66,66,0.18)] rotate-[-1.5deg] text-xs"
        >
          <Clock className="w-3.5 h-3.5 text-[#0C4242]" />
          <span className="font-bold text-zinc-900">Nov {picked.d}</span>
          <span className="text-zinc-300">·</span>
          <span className="font-mono text-[#0C4242] font-bold">{picked.info}</span>
        </motion.div>
      </div>
    </CardFrame>
  );
}

/* ─── Card 04: Salary & Payroll (Code Slip Preview + Angled Format Pills) ─ */

const SLIP_MODES = [
  { key: 'earnings', label: 'EARNINGS', color: 'bg-[#0C4242] text-white' },
  { key: 'epf', label: 'EPF 12%', color: 'bg-amber-400 text-zinc-950' },
  { key: 'net', label: 'NET SLIP', color: 'bg-[#34D399] text-zinc-950' },
] as const;

export function SalaryBreakdownCard() {
  const [mode, setMode] = useState<'earnings' | 'epf' | 'net'>('net');

  return (
    <CardFrame
      id="section-04"
      step="04 · Salary & Payroll"
      headline="Compensation, simplified."
      description="Automated salary slips, EPF matching and monthly deductions."
    >
      <div className="flex-1 rounded-2xl bg-[#082B2B] border border-[#0C4242]/40 p-4 sm:p-5 flex flex-col justify-between min-h-[250px] relative overflow-hidden shadow-inner">
        <pre className="font-mono text-[11.5px] leading-relaxed text-[#34D399] overflow-x-auto">
          {mode === 'earnings'
            ? `{
  "employee": "Aarav Mehta",
  "basicSalary": "₹1,10,000",
  "housingAllowance": "₹44,000",
  "bonus": "₹20,000"
}`
            : mode === 'epf'
            ? `{
  "employeeEPF": "-₹13,200 (12%)",
  "employerMatch": "+₹13,200 (12%)",
  "incomeTaxTDS": "-₹18,400",
  "pfStatus": "Verified on Ledger"
}`
            : `{
  "cycle": "November 2026",
  "grossPay": "₹1,74,000",
  "deductions": "-₹31,600",
  "netDisbursement": "₹1,42,400"
}`}
        </pre>

        {/* Angled Floating Tag Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
          {SLIP_MODES.map((pill, i) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setMode(pill.key)}
              className={`px-4 py-2 rounded-xl text-[11px] font-mono font-bold shadow-md transition-transform cursor-pointer ${
                pill.color
              } ${
                i === 0 ? '-rotate-3' : i === 1 ? 'rotate-2' : '-rotate-2'
              } ${mode === pill.key ? 'ring-2 ring-white scale-105' : 'opacity-90 hover:opacity-100'}`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

/* ─── Card 05: Role-Based Access Control (Stacked Role Pills + Badge) ────── */

const ACCESS_ROLES = [
  { id: 'admin', title: 'Owner & Co-Admin', scope: 'Full Org Control', modules: 'All 10 Modules' },
  { id: 'hr', title: 'HR Manager', scope: 'People & Attendance', modules: '6 Modules' },
  { id: 'emp', title: 'Employee', scope: 'Self-Service Only', modules: '4 Modules' },
] as const;

export function RbacHierarchyCard() {
  const [activeRole, setActiveRole] = useState<'admin' | 'hr' | 'emp'>('admin');
  const current = ACCESS_ROLES.find((r) => r.id === activeRole) || ACCESS_ROLES[0];

  return (
    <CardFrame
      id="section-05"
      step="05 · Role-Based Access Control"
      headline="Everyone has their place."
      description="Owners delegate Co-Admins while employees get role-scoped views."
    >
      <div className="flex-1 rounded-2xl bg-[#F2F7F4] border border-[#0C4242]/10 p-4 sm:p-5 flex flex-col justify-between min-h-[250px] overflow-hidden">
        <div className="space-y-2.5">
          {ACCESS_ROLES.map((role) => {
            const selected = role.id === activeRole;
            return (
              <motion.button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                animate={{ scale: selected ? 1.02 : 1, rotate: selected ? 1.2 : 0 }}
                className={`w-full text-left flex items-center justify-between rounded-xl px-3.5 py-3 border transition-all cursor-pointer ${
                  selected
                    ? 'bg-white border-2 border-[#0C4242] shadow-[0_12px_24px_-6px_rgba(12,66,66,0.18)]'
                    : 'bg-white border-zinc-200/80 hover:border-[#0C4242]/40 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {role.id === 'emp' ? (
                    <Lock className={`w-3.5 h-3.5 ${selected ? 'text-[#0C4242]' : 'text-zinc-400'}`} />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0C4242]" />
                  )}
                  <span className={`text-[13px] font-semibold ${selected ? 'text-zinc-950 font-bold' : 'text-zinc-900'}`}>
                    {role.title}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                    selected
                      ? 'bg-[#0C4242] text-white shadow-xs'
                      : 'bg-[#E6F0EB] text-[#0C4242] border border-[#0C4242]/20'
                  }`}
                >
                  {role.modules}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[#0C4242]/10 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Active Policy</span>
          <span className="font-bold text-[#0C4242]">{current.scope}</span>
        </div>
      </div>
    </CardFrame>
  );
}

/* ─── Card 06: Connected Workplace (Concentric Orbital Pipeline Hub) ────── */

const FLOW_NODES = [
  { label: 'Onboarding', icon: UserCheck, pos: 'left-4 top-6' },
  { label: 'Roles', icon: KeyRound, pos: 'left-16 top-20' },
  { label: 'Assets', icon: Laptop, pos: 'left-1/2 -translate-x-1/2 top-4' },
  { label: 'Attendance', icon: Clock, pos: 'right-16 top-20' },
  { label: 'Payroll', icon: Wallet, pos: 'right-4 top-6' },
];

export function ConnectedWorkflowCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % FLOW_NODES.length), 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <CardFrame
      id="section-06"
      step="06 · Connected Workplace"
      headline="One connected workplace."
      description="From onboarding to assets, attendance and payroll — everything syncs."
    >
      <div className="flex-1 rounded-2xl bg-[#F2F7F4] border border-[#0C4242]/10 relative min-h-[250px] overflow-hidden flex flex-col justify-between p-4">
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>LIVE SYNC FLOW</span>
          <span className="text-[#0C4242] font-bold">
            0{step + 1} · {FLOW_NODES[step].label}
          </span>
        </div>

        {/* Concentric Dashed Arcs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-24 -translate-x-1/2 w-72 h-72 rounded-full border border-dashed border-[#0C4242]/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-14 -translate-x-1/2 w-48 h-48 rounded-full border border-dashed border-[#0C4242]/30"
        />

        {/* Orbiting Workflow Icons */}
        <div className="relative flex-1 min-h-[155px]">
          {FLOW_NODES.map((n, i) => {
            const Icon = n.icon;
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={n.label}
                type="button"
                onClick={() => setStep(i)}
                className={`absolute ${n.pos} flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${
                    active
                      ? 'bg-[#0C4242] border-[#0C4242] text-white scale-110 shadow-md'
                      : done
                      ? 'bg-[#E6F0EB] border-[#0C4242] text-[#0C4242]'
                      : 'bg-white border-zinc-200 text-zinc-400'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-semibold text-zinc-800 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-2xs">
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Center Hub */}
        <div className="relative z-10 mx-auto px-5 h-10 rounded-t-full bg-[#0C4242] text-white flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(12,66,66,0.3)]">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-[11px] font-semibold">Locus Core</span>
        </div>
      </div>
    </CardFrame>
  );
}
