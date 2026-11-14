import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Laptop,
  Users,
  Clock,
  Wallet,
  Lock,
  Bell,
  Share2,
  CheckCircle2,
  Check,
  Sun,
  Moon,
} from 'lucide-react';

type TabKey = 'roster' | 'vault' | 'attendance' | 'payroll';

export function DemoWorkspaceWindow() {
  const [activeTab, setActiveTab] = useState<TabKey>('roster');
  const [searchQuery, setSearchQuery] = useState('');

  // User specification:
  // "this window shall be in light theme. and in light mode of system shall be in dark theme"
  // If system prefers light -> window is in dark theme.
  // Otherwise (system is in dark mode or default) -> window is in light theme!
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      return prefersLight; // true -> dark window, false -> light window
    }
    return false; // Default: Window is in Light Theme
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      // Invert: light system -> dark window, dark system -> light window
      setIsDark(e.matches);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return (
    <div className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 mt-6 sm:mt-10 mb-16 sm:mb-24">
      {/* ─── Notion-Style Minimalist Mascot Doodles (Matching Reference) ─── */}
      {/* Top-Right Peeking Face Doodle */}
      <div className="hidden md:block absolute -top-14 right-12 sm:right-20 z-30 pointer-events-none select-none opacity-85">
        <svg width="90" height="64" viewBox="0 0 90 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-200">
          <path d="M14 54C14 28 30 10 52 10C72 10 82 28 82 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 26C31 23 37 23 40 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="34" cy="33" r="3.5" fill="currentColor" />
          <path d="M54 26C57 23 63 23 66 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="60" cy="33" r="3.5" fill="currentColor" />
          <path d="M46 30V43C46 46 43 47 40 47" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ─── Window Outer Frame with Sleek macOS Chrome ─── */}
      <div
        className={`relative rounded-[20px] sm:rounded-[28px] border transition-colors duration-300 overflow-hidden ${
          isDark
            ? 'bg-[#0E1012] border-white/[0.14] shadow-[0_30px_90px_rgba(0,0,0,0.85)]'
            : 'bg-[#FFFFFF] border-zinc-300 shadow-[0_25px_80px_rgba(0,0,0,0.65)] ring-1 ring-black/5'
        }`}
      >
        {/* Subtle top ambient glow */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[140px] blur-[80px] ${
            isDark ? 'bg-[#34D399]/15' : 'bg-[#0C4242]/10'
          }`}
        />

        {/* ─── macOS Window Titlebar ─── */}
        <div
          className={`relative z-20 h-11 sm:h-12 border-b px-4 sm:px-5 flex items-center justify-between gap-4 select-none transition-colors duration-300 ${
            isDark
              ? 'bg-[#141619] border-white/[0.08]'
              : 'bg-[#EAECEF] border-zinc-200/90 text-zinc-700'
          }`}
        >
          {/* Left: Traffic light window controls */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />

            {/* Active window tab */}
            <div
              className={`hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-[#1B1E22] border-white/[0.06] text-zinc-300'
                  : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#34D399]' : 'bg-[#0C4242]'}`} />
              <span>Acme Corp HQ</span>
              <span className={isDark ? 'text-zinc-500 text-[10px]' : 'text-zinc-400 text-[10px]'}>main</span>
            </div>
          </div>

          {/* Center: Browser URL / breadcrumb bar */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-auto hidden md:flex items-center justify-center">
            <div
              className={`w-full h-7 px-3 rounded-lg border flex items-center justify-between text-[11px] transition-colors ${
                isDark
                  ? 'bg-[#0A0C0E] border-white/[0.06] text-zinc-400'
                  : 'bg-white border-zinc-200 text-zinc-600 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Lock className={`w-3 h-3 shrink-0 ${isDark ? 'text-emerald-400' : 'text-[#0C4242]'}`} />
                <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>app.locus.io/</span>
                <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  workspace/acme-corp
                </span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                SHA-256
              </span>
            </div>
          </div>

          {/* Right: Window actions + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                isDark
                  ? 'bg-white/[0.04] text-emerald-300 border-emerald-500/20'
                  : 'bg-white text-emerald-800 border-emerald-200 shadow-2xs'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>Tamper Engine Active</span>
            </div>

            {/* Interactive Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.06] border-white/[0.1] text-zinc-300 hover:text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xl:inline text-[10px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden xl:inline text-[10px]">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={`p-1.5 rounded-md transition-colors ${
                isDark
                  ? 'hover:bg-white/[0.06] text-zinc-400 hover:text-white'
                  : 'hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-950'
              }`}
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-md transition-colors ${
                isDark
                  ? 'hover:bg-white/[0.06] text-zinc-400 hover:text-white'
                  : 'hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-950'
              }`}
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Main Window Body (Sidebar + Content Workspace) ─── */}
        <div className={`relative z-10 flex min-h-[580px] sm:min-h-[640px] transition-colors duration-300 ${
          isDark ? 'bg-[#0A0B0D]' : 'bg-[#FAFAFA]'
        }`}>
          {/* Left Mini-Sidebar */}
          <aside
            className={`hidden lg:flex w-56 xl:w-60 flex-col justify-between border-r p-3 text-xs select-none shrink-0 transition-colors duration-300 ${
              isDark
                ? 'bg-[#0D0F12] border-white/[0.06]'
                : 'bg-[#F5F6F8] border-zinc-200'
            }`}
          >
            <div className="space-y-4">
              {/* Organization Header */}
              <div
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl border ${
                  isDark
                    ? 'bg-white/[0.03] border-white/[0.06]'
                    : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDark
                        ? 'bg-[#0C4242] text-[#34D399] border border-[#34D399]/30'
                        : 'bg-[#0C4242] text-white shadow-2xs'
                    }`}
                  >
                    A
                  </div>
                  <div className="truncate">
                    <div className={`font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                      Acme Corporation
                    </div>
                    <div className={isDark ? 'text-[10px] text-zinc-500' : 'text-[10px] text-zinc-400'}>
                      Enterprise DID Tier
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Search Bar */}
              <div className="relative px-1">
                <Search className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
                <input
                  type="text"
                  placeholder="Quick search... ⌘K"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-7 pl-7 pr-2 rounded-lg border text-[11px] focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#141619] border-white/[0.05] text-zinc-300 placeholder-zinc-600 focus:border-emerald-500/40'
                      : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-[#0C4242]/40 shadow-2xs'
                  }`}
                />
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-0.5">
                {[
                  { key: 'roster', label: 'Employee Roster', icon: Users, count: '148' },
                  { key: 'vault', label: 'Hardware Vault', icon: Laptop, count: '42' },
                  { key: 'attendance', label: 'Attendance & Leaves', icon: Clock, count: '98%' },
                  { key: 'payroll', label: 'Payroll & EPF Ledger', icon: Wallet, count: 'Synced' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveTab(item.key as TabKey)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-[#15342C] text-[#34D399] font-semibold border border-[#34D399]/20'
                            : 'bg-white text-[#0C4242] font-semibold border border-zinc-200 shadow-2xs'
                          : isDark
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected
                              ? isDark
                                ? 'text-[#34D399]'
                                : 'text-[#0C4242]'
                              : isDark
                              ? 'text-zinc-500'
                              : 'text-zinc-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected
                            ? isDark
                              ? 'bg-[#34D399]/20 text-[#34D399]'
                              : 'bg-[#0C4242]/10 text-[#0C4242] font-bold'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-zinc-200/70 text-zinc-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Enterprise Security Box */}
              <div
                className={`mx-1 p-3 rounded-xl border space-y-1.5 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#0C4242]/40 to-[#041512]/60 border-[#34D399]/20 text-zinc-300'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0C4242] dark:text-[#34D399]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tamper Integrity</span>
                </div>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Canonical SHA-256 seals active on all employee records and hardware custody.
                </p>
              </div>
            </div>

            {/* Bottom Current User */}
            <div
              className={`pt-3 border-t flex items-center justify-between px-2 ${
                isDark ? 'border-white/[0.06]' : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                      isDark
                        ? 'bg-[#183B33] text-emerald-300 border-emerald-400/30'
                        : 'bg-[#0C4242] text-white border-transparent'
                    }`}
                  >
                    ER
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#34D399] absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-[#0D0F12]" />
                </div>
                <div className="truncate">
                  <div className={`text-xs font-bold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    Elena Rostova
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    Security Architect
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Workspace Header Strip */}
            <div
              className={`px-5 sm:px-8 py-4 sm:py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${
                isDark
                  ? 'bg-[#0E1013]/60 border-white/[0.06]'
                  : 'bg-white border-zinc-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                    {activeTab === 'roster' && 'Workforce & Decentralized Identity Matrix'}
                    {activeTab === 'vault' && 'Hardware Vault & Cryptographic Custody'}
                    {activeTab === 'attendance' && 'Biometric Attendance & Shift Audit'}
                    {activeTab === 'payroll' && 'Payroll Execution & Statutory EPF Ledger'}
                  </h3>
                  <span
                    className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDark
                        ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    Live Platform Preview
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Synced across all enterprise nodes with zero-tamper cryptographic seals.
                </p>
              </div>

              {/* Tab Selector Pills */}
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl border self-start sm:self-auto overflow-x-auto max-w-full ${
                  isDark ? 'bg-[#141619] border-white/[0.06]' : 'bg-[#F2F4F7] border-zinc-200'
                }`}
              >
                {[
                  { key: 'roster', label: 'Roster & DID', icon: Users },
                  { key: 'vault', label: 'Hardware Vault', icon: Laptop },
                  { key: 'attendance', label: 'Attendance', icon: Clock },
                  { key: 'payroll', label: 'Payroll & EPF', icon: Wallet },
                ].map((t) => {
                  const Icon = t.icon;
                  const isCurrent = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key as TabKey)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? isDark
                            ? 'bg-[#34D399] text-zinc-950 font-semibold shadow-xs'
                            : 'bg-white text-[#0C4242] font-bold shadow-xs'
                          : isDark
                          ? 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Views */}
            <div className="p-5 sm:p-7 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ── VIEW 1: Employee Roster & DID ── */}
                {activeTab === 'roster' && (
                  <motion.div
                    key="roster"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Top Stats Metric Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        { label: 'Active Personnel', val: '148', sub: '● 100% DID Assigned', highlight: false },
                        { label: 'Valid SHA-256 Seals', val: '148 / 148', sub: '0 Divergent Hashes', highlight: true },
                        { label: 'Custody Devices', val: '42', sub: '38 Pristine · 4 Review', highlight: false },
                        { label: 'Shift Attendance', val: '98.4%', sub: 'Live Kiosk Linked', highlight: false },
                      ].map((st) => (
                        <div
                          key={st.label}
                          className={`p-3.5 rounded-2xl border transition-colors ${
                            isDark
                              ? 'bg-[#121417] border-white/[0.06]'
                              : 'bg-white border-zinc-200/90 shadow-2xs'
                          }`}
                        >
                          <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {st.label}
                          </div>
                          <div
                            className={`text-xl font-bold mt-1 ${
                              st.highlight
                                ? isDark
                                  ? 'text-[#34D399]'
                                  : 'text-[#0C4242]'
                                : isDark
                                ? 'text-white'
                                : 'text-zinc-950'
                            }`}
                          >
                            {st.val}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-medium'}`}>
                            {st.sub}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Employee Directory Table Simulation */}
                    <div
                      className={`rounded-2xl border overflow-hidden transition-colors ${
                        isDark ? 'bg-[#121417] border-white/[0.06]' : 'bg-white border-zinc-200/90 shadow-2xs'
                      }`}
                    >
                      <div
                        className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${
                          isDark
                            ? 'border-white/[0.06] text-zinc-400'
                            : 'border-zinc-200/80 bg-zinc-50/70 text-zinc-600'
                        }`}
                      >
                        <span>Directory Personnel &amp; Cryptographic Proofs</span>
                        <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Sorted by Custody ID
                        </span>
                      </div>
                      <div className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-zinc-100'}`}>
                        {[
                          {
                            name: 'Elena Rostova',
                            role: 'Security Architect',
                            dept: 'Engineering & Trust',
                            did: 'did:locus:acme:e-1',
                            hardware: 'MacBook Pro 16" M3 Max',
                            seal: 'AST-1001',
                          },
                          {
                            name: 'Marcus Chen',
                            role: 'Principal Systems Architect',
                            dept: 'Infrastructure',
                            did: 'did:locus:acme:e-2',
                            hardware: 'Studio Display + YubiKey',
                            seal: 'AST-1002',
                          },
                          {
                            name: 'Sarah Connor',
                            role: 'Lead DevOps Engineer',
                            dept: 'Cloud & Deployments',
                            did: 'did:locus:acme:e-3',
                            hardware: 'ThinkPad X1 Carbon',
                            seal: 'AST-1003',
                          },
                          {
                            name: 'David Kim',
                            role: 'Senior Product Designer',
                            dept: 'Product Design',
                            did: 'did:locus:acme:e-4',
                            hardware: 'iPad Pro 12.9" M2',
                            seal: 'AST-1004',
                          },
                        ].map((emp) => (
                          <div
                            key={emp.did}
                            className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50/90'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-[#0C4242] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {emp.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs sm:text-sm font-semibold truncate ${
                                    isDark ? 'text-white' : 'text-zinc-950'
                                  }`}>
                                    {emp.name}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                                      isDark
                                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    {emp.seal}
                                  </span>
                                </div>
                                <div className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  {emp.role} · <span>{emp.dept}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs shrink-0 sm:self-center">
                              <div className="hidden md:block text-right">
                                <div className={`text-[11px] font-medium truncate max-w-[180px] ${
                                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                                }`}>
                                  {emp.hardware}
                                </div>
                                <div className={`text-[10px] font-mono truncate max-w-[180px] ${
                                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                                }`}>
                                  {emp.did}
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                                  isDark
                                    ? 'bg-emerald-950/50 text-[#34D399] border-[#34D399]/30'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                <Check className={`w-3 h-3 ${isDark ? 'text-[#34D399]' : 'text-emerald-700'}`} /> Verified Seal
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── VIEW 2: Hardware Custody Vault ── */}
                {activeTab === 'vault' && (
                  <motion.div
                    key="vault"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      {
                        title: 'MacBook Pro 16" M3 Max (64GB / 2TB)',
                        tag: 'AST-1001',
                        custodian: 'Elena Rostova',
                        role: 'Security Architect',
                        condition: 'Pristine Condition',
                        seal: 'LOCUS-SEAL-ASS-A1-DD4E944B49',
                      },
                      {
                        title: 'Studio Display 27" 5K Retina + Stand',
                        tag: 'AST-1002',
                        custodian: 'Marcus Chen',
                        role: 'Principal Architect',
                        condition: 'Pristine Condition',
                        seal: 'LOCUS-SEAL-ASS-A2-F80CFF56FE',
                      },
                      {
                        title: 'YubiKey 5C NFC Enterprise Token Set',
                        tag: 'AST-1003',
                        custodian: 'Sarah Connor',
                        role: 'Lead DevOps',
                        condition: 'Cryptographic Token Active',
                        seal: 'LOCUS-SEAL-ASS-A3-45817E73E6',
                      },
                      {
                        title: 'Enterprise Wildcard SSL (*.locus.internal)',
                        tag: 'SEC-CERT-01',
                        custodian: 'Infrastructure Custody',
                        role: 'Core Cluster',
                        condition: 'SHA-256 Validated Cert',
                        seal: 'LOCUS-SEAL-ASS-A5-6B0370E91F',
                      },
                    ].map((item) => (
                      <div
                        key={item.tag}
                        className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                          isDark
                            ? 'bg-[#121417] border-white/[0.06] hover:border-emerald-500/30'
                            : 'bg-white border-zinc-200/90 shadow-2xs hover:border-[#0C4242]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                              }`}
                            >
                              {item.tag}
                            </span>
                            <h4 className={`text-sm font-bold mt-1.5 leading-snug ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                              {item.title}
                            </h4>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                              isDark
                                ? 'bg-emerald-950/70 text-[#34D399] border-[#34D399]/30'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" /> Active Custody
                          </span>
                        </div>

                        <div
                          className={`p-2.5 rounded-xl border space-y-1.5 text-xs ${
                            isDark ? 'bg-black/40 border-white/[0.04]' : 'bg-zinc-50 border-zinc-200/70'
                          }`}
                        >
                          <div className={`flex items-center justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            <span>Custodian:</span>
                            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                              {item.custodian} ({item.role})
                            </span>
                          </div>
                          <div className={`flex items-center justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            <span>Condition:</span>
                            <span className={isDark ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-medium'}>
                              {item.condition}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                            isDark ? 'border-white/[0.05] text-zinc-500' : 'border-zinc-100 text-zinc-400'
                          }`}
                        >
                          <span>SEAL: {item.seal}</span>
                          <span className={isDark ? 'text-emerald-400 font-semibold' : 'text-emerald-700 font-bold'}>
                            Matched
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* ── VIEW 3: Attendance & Biometric Audit ── */}
                {activeTab === 'attendance' && (
                  <motion.div
                    key="attendance"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isDark
                          ? 'bg-gradient-to-r from-[#0C4242]/40 to-[#121417] border-[#34D399]/20'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                          Today's Shift Roster Summary
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          142 / 148 checked in on time · 4 Approved Leaves · 2 WFH Remote
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                          isDark ? 'bg-[#34D399] text-zinc-950' : 'bg-[#0C4242] text-white'
                        }`}
                      >
                        98.4% On-Time Compliance
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl border overflow-hidden divide-y ${
                        isDark
                          ? 'bg-[#121417] border-white/[0.06] divide-white/[0.04]'
                          : 'bg-white border-zinc-200/90 divide-zinc-100 shadow-2xs'
                      }`}
                    >
                      {[
                        { name: 'Elena Rostova', inTime: '09:04 AM', mode: 'Office (Biometric Kiosk 1)', tag: 'On Time' },
                        { name: 'Marcus Chen', inTime: '09:12 AM', mode: 'Office (Biometric Kiosk 2)', tag: 'On Time' },
                        { name: 'Sarah Connor', inTime: '08:58 AM', mode: 'Remote (WireGuard Auth)', tag: 'Verified' },
                        { name: 'David Kim', inTime: '09:28 AM', mode: 'Office (Main Gate Turnstile)', tag: 'On Time' },
                      ].map((log) => (
                        <div key={log.name} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#34D399]" />
                            <div>
                              <div className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>{log.name}</div>
                              <div className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{log.mode}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{log.inTime}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                isDark
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {log.tag}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── VIEW 4: Payroll & Statutory EPF Ledger ── */}
                {activeTab === 'payroll' && (
                  <motion.div
                    key="payroll"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Salary Slip Detail Card */}
                    <div
                      className={`p-5 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-[#121417] border-white/[0.06]' : 'bg-white border-zinc-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-[10px] font-mono font-semibold uppercase ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>
                            Net Pay Summary
                          </span>
                          <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                            ₹1,42,400
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isDark
                              ? 'bg-emerald-950/80 text-[#34D399] border-[#34D399]/30'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          100% EPF Matched
                        </span>
                      </div>

                      <div className={`space-y-2 text-xs divide-y pt-2 ${
                        isDark ? 'divide-white/[0.04]' : 'divide-zinc-100'
                      }`}>
                        <div className={`flex justify-between py-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <span>Basic Salary</span>
                          <span className={`font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>₹85,000</span>
                        </div>
                        <div className={`flex justify-between py-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <span>House Rent Allowance (HRA)</span>
                          <span className={`font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>₹42,500</span>
                        </div>
                        <div className={`flex justify-between py-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <span>Special &amp; Performance Allowance</span>
                          <span className={`font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>₹31,988</span>
                        </div>
                        <div className={`flex justify-between py-1 font-medium ${
                          isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                          <span>Statutory EPF Contribution (12%)</span>
                          <span className="font-mono">- ₹17,088</span>
                        </div>
                      </div>

                      <div
                        className={`pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                          isDark ? 'border-white/[0.06] text-zinc-500' : 'border-zinc-100 text-zinc-400'
                        }`}
                      >
                        <span>Ledger Sync: COMPLIANT</span>
                        <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          UAN Synced
                        </span>
                      </div>
                    </div>

                    {/* EPF Account Card */}
                    <div
                      className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                        isDark
                          ? 'bg-gradient-to-br from-[#0C4242]/30 via-[#121417] to-[#121417] border-white/[0.06]'
                          : 'bg-gradient-to-br from-emerald-50/60 via-white to-white border-zinc-200/90 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-semibold tracking-wider uppercase ${
                            isDark ? 'text-emerald-400' : 'text-[#0C4242]'
                          }`}>
                            EPFO Trust Vault
                          </span>
                          <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            UAN: 1019-4829-8819
                          </span>
                        </div>
                        <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                          ₹4,86,240
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Accumulated retirement savings with automated monthly employer &amp; employee ledger credit.
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                          isDark ? 'bg-black/40 border-white/[0.05]' : 'bg-zinc-50 border-zinc-200/70'
                        }`}
                      >
                        <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <span>Employee Share (12%):</span>
                          <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-900 font-semibold'}`}>
                            ₹10,200/mo
                          </span>
                        </div>
                        <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <span>Employer Share (3.67% + 8.33% EPS):</span>
                          <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-900 font-semibold'}`}>
                            ₹10,200/mo
                          </span>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between text-xs font-medium ${
                        isDark ? 'text-emerald-400' : 'text-emerald-800'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#34D399]' : 'text-emerald-600'}`} />
                          EPFO Challan Generated
                        </span>
                        <span className={`font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>TXN-9021</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* ─── Client Trust Logo Strip (Matching Notion's reference layout directly below the window) ─── */}
      <div className="mt-12 sm:mt-16 text-center select-none">
        <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-6 sm:mb-8">
          Trusted by operations and compliance leaders at high-growth teams
        </p>

        {/* Crisp monochrome enterprise badges */}
        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-12 lg:gap-16 opacity-60 hover:opacity-90 transition-opacity">
          {['OpenAI', 'A24', 'Figma', 'FedEx', 'Ramp', 'Cursor', 'Substack', 'NVIDIA', 'Toyota'].map((brand) => (
            <span
              key={brand}
              className="text-base sm:text-lg font-bold tracking-tight text-zinc-400 font-sans hover:text-white transition-colors"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
