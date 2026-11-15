import { useState, useEffect } from 'react';
import {
  Clock,
  IndianRupee,
  Laptop,
  LogIn,
  Package,
  PiggyBank,
  Plus,
  Search,
  Sun,
  Moon,
  Umbrella,
  Users,
  LayoutGrid,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  KeyRound,
  Wallet,
} from 'lucide-react';

export function DemoWorkspaceWindow() {
  // Theme inversion rule:
  // "this window shall be in light theme. and in light mode of system shall be in dark theme"
  // Default on dark-mode systems is Light Theme.
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      return prefersLight; // true -> dark window, false -> light window
    }
    return false; // Default: Window is in Light Theme
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return (
    <div className="relative w-full max-w-[1040px] mx-auto px-4 sm:px-6 mt-4 sm:mt-6 mb-16 sm:mb-20">
      
      {/* ─── Notion-Style Minimalist Mascot Doodle Peeking from Top Right ─── */}
      <div className="hidden md:block absolute -top-12 right-8 sm:right-14 z-30 pointer-events-none select-none opacity-85">
        <svg
          width="80"
          height="56"
          viewBox="0 0 90 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-zinc-200"
        >
          <path
            d="M14 54C14 28 30 10 52 10C72 10 82 28 82 54"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M28 26C31 23 37 23 40 26"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="34" cy="33" r="3.5" fill="currentColor" />
          <path
            d="M54 26C57 23 63 23 66 26"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="33" r="3.5" fill="currentColor" />
          <path
            d="M46 30V43C46 46 43 47 40 47"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ─── Compact Application Window Frame (Notion Proportions) ─── */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl border transition-colors duration-300 overflow-hidden ${
          isDark
            ? 'bg-[#0E1012] border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
            : 'bg-[#FFFFFF] border-zinc-200/90 shadow-[0_25px_70px_rgba(0,0,0,0.55)] ring-1 ring-black/5'
        }`}
      >
        {/* Subtle top ambient glow */}
        <div
          className={`pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[550px] h-[100px] blur-[70px] ${
            isDark ? 'bg-emerald-400/10' : 'bg-emerald-500/10'
          }`}
        />

        {/* ─── macOS Window Titlebar ─── */}
        <div
          className={`relative z-20 h-10 sm:h-11 border-b px-4 sm:px-5 flex items-center justify-between gap-4 select-none transition-colors duration-300 ${
            isDark
              ? 'bg-[#141619] border-white/[0.08]'
              : 'bg-[#F4F5F7] border-zinc-200/90 text-zinc-700'
          }`}
        >
          {/* Traffic light window dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />

            {/* Active window tab */}
            <div
              className={`hidden sm:flex items-center gap-2 ml-3 px-2.5 py-0.5 rounded-md border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-[#1B1E22] border-white/[0.06] text-zinc-300'
                  : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#34D399]' : 'bg-emerald-600'}`} />
              <span>Locus Workspace · Acme Corp</span>
            </div>
          </div>

          {/* Right: Theme Toggle (Invert Light/Dark) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`px-2 py-1 rounded-md border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.06] border-white/[0.1] text-zinc-300 hover:text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px] font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Real App Interface Layout (Sidebar + Main Dashboard) ─── */}
        <div className="flex min-h-[440px] sm:min-h-[500px]">
          
          {/* Left Mini-Sidebar (Authentic Locus Structure) */}
          <aside
            className={`w-44 sm:w-52 shrink-0 border-r p-3 sm:p-3.5 flex flex-col justify-between select-none transition-colors duration-300 ${
              isDark
                ? 'bg-[#101215] border-white/[0.06]'
                : 'bg-white border-zinc-200/80'
            }`}
          >
            <div className="space-y-3">
              {/* Org Header */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  A
                </div>
                <div className="truncate">
                  <div className={`text-xs font-bold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    Acme Corporation
                  </div>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Workspace
                  </div>
                </div>
              </div>

              {/* Quick Search Bar */}
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] ${
                  isDark
                    ? 'bg-[#16181C] border-white/[0.06] text-zinc-500'
                    : 'bg-zinc-50 border-zinc-200/80 text-zinc-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Search className="w-3 h-3" />
                  <span>Search...</span>
                </span>
                <kbd className="font-mono text-[9px] bg-white dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">
                  ⌘K
                </kbd>
              </div>

              {/* Navigation Stack */}
              <nav className="space-y-0.5 text-xs">
                {/* Active Dashboard Link */}
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold border-l-2 transition-colors ${
                    isDark
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-600'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dashboard</span>
                </div>

                <div className={`pt-2 px-2 text-[9.5px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  Workforce &amp; HR
                </div>

                {[
                  { label: 'Employees', icon: Users, badge: '148' },
                  { label: 'Attendance', icon: Clock, badge: '98%' },
                  { label: 'Leaves', icon: Umbrella, badge: '2' },
                  { label: 'Payroll & PF', icon: IndianRupee, badge: 'Synced' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                          item.badge === 'Synced'
                            ? isDark
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  );
                })}

                <div className={`pt-2 px-2 text-[9.5px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  Assets &amp; Trust
                </div>

                {[
                  { label: 'Assets', icon: Package, badge: '42' },
                  { label: 'Audit History', icon: ShieldCheck, badge: 'Active' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                        isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Current User */}
            <div
              className={`pt-2.5 border-t flex items-center gap-2 px-1 ${
                isDark ? 'border-white/[0.06]' : 'border-zinc-200/80'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-zinc-950 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                ER
              </div>
              <div className="truncate">
                <div className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                  Elena Rostova
                </div>
                <div className={`text-[9.5px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Security Architect
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Dashboard Stage (REAL Locus Dashboard Content) */}
          <main
            className={`flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-[#0E1012]' : 'bg-[#F9FAF9]'
            }`}
          >
            <div className="space-y-4">
              {/* Real Subheader Greeting & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    <span className={isDark ? 'text-zinc-500 font-normal' : 'text-zinc-400 font-normal'}>
                      Welcome back,{' '}
                    </span>
                    <span>Elena</span>
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Acme Corporation · 15 Nov 2026
                  </p>
                </div>

                {/* Real Quick Actions */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shadow-2xs ${
                      isDark
                        ? 'bg-zinc-900 border-white/10 text-zinc-300'
                        : 'bg-white border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <LogIn className="w-3 h-3 text-emerald-600" />
                    <span>Check In</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shadow-2xs ${
                      isDark
                        ? 'bg-zinc-900 border-white/10 text-zinc-300'
                        : 'bg-white border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <IndianRupee className="w-3 h-3 text-emerald-600" />
                    <span>Payroll</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs">
                    <Plus className="w-3 h-3" />
                    <span>Add Asset</span>
                  </div>
                </div>
              </div>

              {/* ─── 4 Real Pulse Cards (Structured like Payroll KPI Cards, No Overlays!) ─── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Card 1: Today's Attendance */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <span className="text-[11px] truncate">Today&apos;s Attendance</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="my-1">
                    <span className={`text-lg sm:text-xl font-bold tabular-nums tracking-tight ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                      142 <span className={`text-xs font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>/ 148</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium truncate">
                    0 remote · live logs
                  </span>
                </div>

                {/* Card 2: Pending Leaves */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <span className="text-[11px] truncate">Pending Leaves</span>
                    <Umbrella className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </div>
                  <div className="my-1">
                    <span className={`text-lg sm:text-xl font-bold tabular-nums tracking-tight ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                      2
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-500 font-medium truncate">
                    Paid &amp; LOP synced
                  </span>
                </div>

                {/* Card 3: Monthly Net Payroll */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <span className="text-[11px] truncate">Monthly Net Payroll</span>
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg sm:text-xl font-bold tabular-nums tracking-tight text-emerald-600">
                      ₹10,28,926
                    </span>
                  </div>
                  <span className={`text-[10px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    +₹2,85,000 bonuses
                  </span>
                </div>

                {/* Card 4: EPF Corpus & Requests */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <span className="text-[11px] truncate">EPF Corpus</span>
                    <PiggyBank className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  </div>
                  <div className="my-1">
                    <span className={`text-lg sm:text-xl font-bold tabular-nums tracking-tight ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                      ₹39,39,048
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-500 font-medium truncate">
                    3 open workflow requests
                  </span>
                </div>
              </div>

              {/* ─── Real App Modules (Connected Flow & Custody Activity) ─── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Connected Flow */}
                <div
                  className={`md:col-span-7 p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Connected Workplace Flow
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    {[
                      { step: '01', title: 'People Directory', count: '148 members', icon: UserCheck },
                      { step: '02', title: 'Role & Access', count: '6 active roles', icon: KeyRound },
                      { step: '03', title: 'Asset Custody', count: '38/42 assigned', icon: Laptop },
                      { step: '04', title: 'Daily Attendance', count: '142 checked in', icon: Clock },
                      { step: '05', title: 'Payroll & EPF', count: '₹10,28,926 net', icon: Wallet },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={s.step}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                            isDark
                              ? 'bg-zinc-900/60 border-white/[0.04] text-zinc-300'
                              : 'bg-zinc-50 border-zinc-100 text-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                              <Icon className="w-3 h-3" />
                            </span>
                            <span className="font-medium text-[11px]">{s.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                            <span>{s.count}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Custody Log */}
                <div
                  className={`md:col-span-5 p-3.5 rounded-xl border flex flex-col justify-between shadow-xs ${
                    isDark
                      ? 'bg-[#15181C] border-white/[0.08]'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Asset Custody Chain
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      42 Assets
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    {[
                      { name: 'MacBook Pro 16" M3', holder: 'Elena Rostova', status: 'Assigned' },
                      { name: 'Studio Display 27"', holder: 'Marcus Chen', status: 'Assigned' },
                      { name: 'YubiKey 5C NFC', holder: 'Marcus Chen', status: 'Assigned' },
                      { name: 'ThinkPad X1 Carbon', holder: 'Sarah Connor', status: 'Assigned' },
                      { name: 'Dell UltraSharp 32"', holder: 'David Kim', status: 'Maintenance' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark
                            ? 'bg-zinc-900/60 border-white/[0.04]'
                            : 'bg-zinc-50 border-zinc-100'
                        }`}
                      >
                        <div className="truncate">
                          <p className={`font-semibold text-[11px] truncate ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                            {item.name}
                          </p>
                          <p className={`text-[9.5px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {item.holder}
                          </p>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold shrink-0 ${
                            item.status === 'Assigned'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* ─── Client Trust Logo Strip (Directly Below Window) ─── */}
      <div className="mt-10 sm:mt-12 text-center select-none">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-zinc-500 mb-5 sm:mb-6">
          Trusted by operations and compliance leaders at high-growth teams
        </p>

        {/* Crisp monochrome enterprise brand logos */}
        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-10 lg:gap-14 opacity-60 hover:opacity-90 transition-opacity">
          {['OpenAI', 'A24', 'Figma', 'FedEx', 'Ramp', 'Cursor', 'Substack', 'NVIDIA', 'Toyota'].map((brand) => (
            <span
              key={brand}
              className="text-sm sm:text-base font-bold tracking-tight text-zinc-400 font-sans hover:text-white transition-colors"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
