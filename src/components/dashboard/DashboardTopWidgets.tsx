import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  KeyRound,
  Laptop,
  UserCheck,
  Wallet,
} from 'lucide-react';
import type { AttendanceRecord, LeaveRequest } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

type DayTone = 'present' | 'late' | 'leave' | 'absent' | 'neutral';

interface DaySummary {
  isoDate: string;
  day: number;
  tone: DayTone;
  label: string;
  detail: string;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
}

const TONE_META: Record<DayTone, { label: string; dot: string; box: string }> = {
  present: {
    label: 'Present',
    dot: 'bg-emerald-500',
    box: 'border-emerald-200/80 bg-emerald-50/75 text-zinc-900',
  },
  late: {
    label: 'Late',
    dot: 'bg-amber-500',
    box: 'border-amber-200/80 bg-amber-50/75 text-zinc-900',
  },
  leave: {
    label: 'Leave',
    dot: 'bg-sky-500',
    box: 'border-sky-200/80 bg-sky-50/75 text-zinc-900',
  },
  absent: {
    label: 'Absent',
    dot: 'bg-rose-500',
    box: 'border-rose-200/80 bg-rose-50/75 text-zinc-900',
  },
  neutral: {
    label: 'No log',
    dot: 'bg-zinc-300',
    box: 'border-zinc-200/70 bg-zinc-50/70 text-zinc-500',
  },
};

function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DashboardAttendanceCalendar({
  attendance,
  leaveRequests = [],
  personal = false,
}: {
  attendance: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  personal?: boolean;
}) {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const todayIso = toIsoDate(year, monthIndex, now.getDate());
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Monday-first leading blanks (0 = Mon .. 6 = Sun)
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  const approvedLeaves = useMemo(
    () => leaveRequests.filter((l) => l.status === 'Approved'),
    [leaveRequests]
  );

  const days = useMemo<DaySummary[]>(() => {
    return Array.from({ length: daysInMonth }, (_, idx) => {
      const day = idx + 1;
      const isoDate = toIsoDate(year, monthIndex, day);
      const dayOfWeek = new Date(year, monthIndex, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dayLogs = attendance.filter((a) => a.date === isoDate);
      const leavesOnDay = approvedLeaves.filter(
        (l) => isoDate >= l.startDate && isoDate <= l.endDate
      ).length;

      const presentCount = dayLogs.filter(
        (a) => a.status === 'Present' || a.status === 'WFH'
      ).length;
      const lateCount = dayLogs.filter(
        (a) => a.status === 'Late' || a.status === 'Half Day'
      ).length;
      const onLeaveLogs = dayLogs.filter((a) => a.status === 'On Leave').length;
      const leaveCount = Math.max(leavesOnDay, onLeaveLogs);
      const absentCount = dayLogs.filter((a) => a.status === 'Absent').length;

      let tone: DayTone = 'neutral';
      let label = isWeekend ? 'Weekend' : isoDate > todayIso ? 'Upcoming' : 'No log';
      let detail = isWeekend
        ? 'Off day'
        : isoDate > todayIso
        ? 'Scheduled'
        : 'No attendance entries';

      if (dayLogs.length > 0 || leaveCount > 0) {
        if (personal) {
          const rec = dayLogs[0];
          if (rec) {
            if (rec.status === 'Present' || rec.status === 'WFH') {
              tone = 'present';
              label = rec.status;
              detail = rec.workHours ? `${rec.workHours} hrs · ${rec.workMode}` : rec.workMode;
            } else if (rec.status === 'Late' || rec.status === 'Half Day') {
              tone = 'late';
              label = rec.status;
              detail = rec.checkIn ? `In ${rec.checkIn}` : rec.status;
            } else if (rec.status === 'On Leave') {
              tone = 'leave';
              label = 'Leave';
              detail = 'Approved Leave';
            } else {
              tone = 'absent';
              label = 'Absent';
              detail = 'Absent';
            }
          } else {
            tone = 'leave';
            label = 'Leave';
            detail = 'Approved Leave';
          }
        } else {
          if (absentCount > presentCount && absentCount > 0) {
            tone = 'absent';
            label = `${absentCount} Absent`;
          } else if (lateCount > 0 && presentCount === 0) {
            tone = 'late';
            label = `${lateCount} Late`;
          } else if (leaveCount > 0 && presentCount === 0) {
            tone = 'leave';
            label = `${leaveCount} Leave`;
          } else {
            tone = 'present';
            label = `${presentCount} Present`;
          }
          const parts: string[] = [];
          if (presentCount > 0) parts.push(`${presentCount} present`);
          if (lateCount > 0) parts.push(`${lateCount} late`);
          if (leaveCount > 0) parts.push(`${leaveCount} leave`);
          if (absentCount > 0) parts.push(`${absentCount} absent`);
          detail = parts.join(' · ') || 'Logs synced';
        }
      }

      return {
        isoDate,
        day,
        tone,
        label,
        detail,
        presentCount,
        lateCount,
        leaveCount,
        absentCount,
      };
    });
  }, [approvedLeaves, attendance, daysInMonth, monthIndex, personal, todayIso, year]);

  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());
  const activeSummary = days.find((d) => d.day === selectedDay) || days[0];

  const monthTitle = now.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{personal ? 'My Attendance Calendar' : 'Attendance Calendar'}</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{monthTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
          {(['present', 'late', 'leave', 'absent'] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${TONE_META[k].dot}`} />
              {TONE_META[k].label}
            </span>
          ))}
          <Link
            to="/attendance"
            className="w-7 h-7 rounded-full border border-zinc-200/80 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
            title="Open Attendance"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-zinc-400 uppercase">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} className="h-10 sm:h-11" />
        ))}

        {days.map((d) => {
          const meta = TONE_META[d.tone];
          const isToday = d.isoDate === todayIso;
          const isSelected = activeSummary?.day === d.day;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              onMouseEnter={() => setSelectedDay(d.day)}
              className={`rounded-xl border p-1.5 sm:p-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[42px] sm:min-h-[46px] ${
                meta.box
              } ${
                isSelected
                  ? 'ring-2 ring-emerald-500/40'
                  : isToday
                  ? 'border-emerald-500/60'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`font-mono text-[11px] font-semibold tabular-nums ${
                    isToday ? 'text-emerald-700' : ''
                  }`}
                >
                  {String(d.day).padStart(2, '0')}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              </div>
              <span className="hidden sm:block text-[9.5px] opacity-75 truncate">
                {d.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeSummary && (
        <div className="mt-4 pt-3.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-zinc-900">
              {new Date(year, monthIndex, activeSummary.day).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
            <span className="text-zinc-300">·</span>
            <span>{activeSummary.label}</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 font-medium">
            {activeSummary.detail}
          </span>
        </div>
      )}
    </div>
  );
}

export function DashboardWorkflowPulse({
  employeeCount,
  rolesCount,
  assignedAssets,
  totalAssets,
  presentToday,
  monthlyPayrollTotal,
}: {
  employeeCount: number;
  rolesCount: number;
  assignedAssets: number;
  totalAssets: number;
  presentToday: number;
  monthlyPayrollTotal: number;
}) {
  const steps = [
    {
      to: '/employees',
      title: 'People Directory',
      metric: `${employeeCount} members`,
      icon: UserCheck,
    },
    {
      to: '/roles',
      title: 'Role & Access',
      metric: `${rolesCount} active roles`,
      icon: KeyRound,
    },
    {
      to: '/assets',
      title: 'Asset Custody',
      metric: `${assignedAssets}/${totalAssets} assigned`,
      icon: Laptop,
    },
    {
      to: '/attendance',
      title: 'Daily Attendance',
      metric: `${presentToday} checked in`,
      icon: Clock,
    },
    {
      to: '/payroll',
      title: 'Payroll & EPF',
      metric: formatCurrency(monthlyPayrollTotal),
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900">
            Connected Workplace Flow
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Live sync from onboarding to payroll
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="my-4 space-y-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.title}
              to={step.to}
              className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/70 hover:bg-emerald-50/60 hover:border-emerald-200 px-3.5 py-2.5 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-white border border-zinc-200/80 group-hover:border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-zinc-900 truncate">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono tabular-nums">
                    {step.metric}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-zinc-400 group-hover:text-emerald-600 transition-colors">
                <span className="text-[10px] font-mono">0{i + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11.5px] text-zinc-500">
        <span>All modules RBAC-scoped</span>
        <Link to="/audit" className="text-emerald-700 font-medium hover:underline">
          View Audit Trail →
        </Link>
      </div>
    </div>
  );
}

