import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  KeyRound,
  Laptop,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { DemoWorkspaceWindow } from '@/components/landing/DemoWorkspaceWindow';

/* ─────────────────────────────────────────────────────────────────
   HERO / FIRST SECTION — Green accent & deep emerald atmosphere
   (User rule: Green accent only on first section, NOT on cards)
───────────────────────────────────────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useSession();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleViewDemo = async () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    try {
      setIsDemoLoading(true);
      await login('admin@locus.io', 'password123');
      navigate('/dashboard');
    } catch {
      navigate('/login?mode=login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-[#10B981] selection:text-black overflow-x-hidden antialiased">
      
      {/* ══════════════════════════════════════════════════════════
          FIRST SECTION: HERO WITH HIGH-EXPOSURE GREEN ACCENT ON SLEEK BLACK
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-zinc-900 bg-black"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #030706 60%, #000000 100%)',
        }}
      >
        
        {/* Luminous High-Exposure Green Accent Aura */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {/* Main high-exposure emerald spotlight centered behind headline */}
          <div
            className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1100px] h-[520px] sm:h-[600px] blur-[110px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(52, 211, 153, 0.48) 0%, rgba(16, 185, 129, 0.32) 32%, rgba(5, 150, 105, 0.14) 58%, transparent 85%)',
            }}
          />

          {/* Core luminous high-exposure mint bloom */}
          <div
            className="absolute top-[24%] left-1/2 -translate-x-1/2 w-[520px] sm:w-[650px] h-[300px] blur-[75px] opacity-90 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.25) 50%, transparent 100%)',
            }}
          />

          {/* Architectural grid fading into black at edges & navbar */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(52, 211, 153, 0.08) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(52, 211, 153, 0.08) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 75% 55% at 50% 45%, black 20%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 45%, black 20%, transparent 80%)',
            }}
          />
        </div>

        {/* ── Top Navigation Bar (Clean borderless floating navbar) ── */}
        <header className="relative z-30 w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center cursor-pointer hover:opacity-85 transition-opacity"
              aria-label="Locus Home"
            >
              <img
                src="/locus-logo-white.png"
                alt="Locus"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </button>

            <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-zinc-300">
              <button
                type="button"
                onClick={() => scrollTo('feature-directory')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Employees
              </button>
              <button
                type="button"
                onClick={() => scrollTo('feature-assets')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Asset Vault
              </button>
              <button
                type="button"
                onClick={() => scrollTo('feature-attendance')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Attendance
              </button>
              <button
                type="button"
                onClick={() => scrollTo('feature-payroll')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Payroll &amp; EPF
              </button>
              <button
                type="button"
                onClick={() => scrollTo('section-news')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Updates
              </button>

              {/* Free Tools dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToolsOpen((v) => !v)}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Platform Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {toolsOpen && (
                  <div className="absolute left-0 mt-3 w-60 rounded-2xl bg-[#141416] border border-white/10 p-2 shadow-2xl z-50 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        handleViewDemo();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>Interactive Demo</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#34D399]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('feature-directory');
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Employee Roster
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('feature-assets');
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Hardware Custody Chain
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('feature-payroll');
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      EPF &amp; Net Salary Slips
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-5 sm:gap-7">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[14px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Open Workspace
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login?mode=login')}
                className="text-[14px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}

            {/* Green Accent CTA button */}
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-4 sm:px-5 py-2 rounded-lg bg-[#34D399] hover:bg-[#2fe09d] text-black text-[13px] sm:text-[14px] font-semibold transition-all shadow-[0_0_24px_rgba(52,211,153,0.35)] cursor-pointer active:scale-95"
            >
              Get started
            </button>
          </div>
        </header>

        {/* ── Hero Center Content ── */}
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 pt-24 sm:pt-32 pb-24 text-center">
          
          {/* Green accent badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs sm:text-[13px] font-medium mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>Enterprise Identity, Asset Custody &amp; Payroll Platform</span>
          </motion.div>

          {/* Giant Title matching Codex typography scale */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-semibold tracking-[-0.035em] leading-[1.05] text-white max-w-4xl mx-auto"
          >
            Workplace management
            <br />
            made easy.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            One unified platform to manage employees, hardware custody, attendance, and payroll — built with enterprise-grade RBAC and compliance.
          </motion.p>

          {/* Hero CTAs with Green Accent */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-7 py-3.5 rounded-full bg-[#34D399] hover:bg-[#2fe09d] text-black text-sm sm:text-[15px] font-semibold transition-all shadow-[0_0_35px_rgba(52,211,153,0.4)] inline-flex items-center gap-2 cursor-pointer active:scale-98"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={handleViewDemo}
              disabled={isDemoLoading}
              className="px-7 py-3.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 text-white text-sm sm:text-[15px] font-medium border border-emerald-400/30 transition-all inline-flex items-center gap-2 cursor-pointer backdrop-blur-md active:scale-98 disabled:opacity-70 shadow-[0_0_20px_rgba(12,66,66,0.3)]"
            >
              {isDemoLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading demo workspace...</span>
                </>
              ) : (
                <>
                  <span>View live demo</span>
                  <ArrowUpRight className="w-4 h-4 text-[#34D399]" />
                </>
              )}
            </button>
          </motion.div>

          {/* Capability Quick-Links with Emerald Glass Styling */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {[
              { id: 'feature-directory', label: 'Employee Directory', icon: Users },
              { id: 'feature-assets', label: 'Hardware Custody Vault', icon: Laptop },
              { id: 'feature-attendance', label: 'Attendance & Leaves', icon: Clock },
              { id: 'feature-payroll', label: 'EPF & Salary Slips', icon: Wallet },
              { id: 'feature-rbac', label: 'Role Scopes & RBAC', icon: KeyRound },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollTo(p.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/25 hover:border-emerald-400/50 text-emerald-200 hover:text-white text-xs sm:text-[13px] font-medium transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Notion-Style Interactive Application Window Mockup ─── */}
      <DemoWorkspaceWindow />

      {/* ══════════════════════════════════════════════════════════
          FEATURE SECTIONS — EXACT CODEX SPLIT-SCREEN LAYOUT
          Canvas with Periwinkle/Lavender Gradient (Screenshot 1 & 2)
          Realistic App UIs inside (No green accent on the cards)
      ══════════════════════════════════════════════════════════ */}

      {/* ─── FEATURE 01: Employee Management (Codex Split: Text Left, Canvas Right) ─── */}
      <section id="feature-directory" className="w-full border-b border-zinc-900 bg-[#000000]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-28 sm:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Built to drive real engineering work
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-zinc-400 leading-[1.6] max-w-[420px] font-normal">
              Give Locus your toughest workforce operations, from high-velocity onboarding to organizational hierarchy and role delegation. Locus delivers clear visibility across your entire organization.
            </p>
          </div>

          {/* Right Visual Canvas: Lavender Gradient Backdrop + Realistic Dark App Windows */}
          <div className="lg:col-span-7">
            <div
              className="relative w-full rounded-[32px] p-6 sm:p-9 lg:p-11 overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #6E79D8 0%, #8792E5 50%, #9DA7F8 100%)',
              }}
            >
              <div className="relative w-full min-h-[380px] sm:min-h-[440px]">
                
                {/* Back App Window: Employee Directory Table (Dark Authentic UI) */}
                <div className="w-[88%] sm:w-[84%] rounded-2xl bg-[#18181D] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.55)] overflow-hidden">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#131316] border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                      <span className="ml-3 text-[11px] font-mono text-zinc-400">directory/employees.tsx</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300">148 Active</span>
                    </div>
                  </div>

                  {/* Window Content */}
                  <div className="p-4 sm:p-5 text-xs text-zinc-300">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-[12px]">Filter roster...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md bg-white/[0.06] text-[11px] font-medium text-zinc-300">All Units</span>
                        <span className="px-2.5 py-1 rounded-md bg-blue-600 text-[11px] font-medium text-white">+ Add</span>
                      </div>
                    </div>

                    {/* Directory Rows */}
                    <div className="space-y-2">
                      {[
                        { name: 'Elena Rostova', role: 'Security Architect', dept: 'Engineering', code: 'ENG' },
                        { name: 'Marcus Vance', role: 'Head of People Ops', dept: 'Operations', code: 'OPS' },
                        { name: 'Aarav Mehta', role: 'Payroll Controller', dept: 'Finance', code: 'FIN' },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold flex items-center justify-center">
                              {item.code}
                            </span>
                            <div>
                              <div className="font-semibold text-white text-[13px]">{item.name}</div>
                              <div className="text-[11px] text-zinc-400">{item.role}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlapping Floating Panel: Profile & Custody Card (Codex overlap style) */}
                <div className="absolute right-0 bottom-0 sm:bottom-2 w-[72%] sm:w-[62%] rounded-2xl bg-[#1C1D22] border border-white/[0.12] p-4 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                        ER
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs sm:text-sm">Elena Rostova</div>
                        <div className="text-[11px] text-zinc-400">Security Scope: Co-Admin</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">AST-1001</span>
                  </div>

                  <div className="py-3 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-400">Primary Device</span>
                      <span className="font-medium text-white">MacBook Pro 16&quot; M3 Max</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-400">Security Token</span>
                      <span className="font-medium text-white">YubiKey 5C NFC</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-400">Custody Status</span>
                      <span className="font-medium text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Handover Verified
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Ledger Sign-off</span>
                    <span className="font-mono text-zinc-200">2026-11-14 · Signed</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FEATURE 02: Scale Code Review / Asset Vault (Codex Split: Canvas Left, Text Right) ─── */}
      <section id="feature-assets" className="w-full border-b border-zinc-900 bg-[#000000]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-28 sm:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Visual Canvas on Left (matching Screenshot 2) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div
              className="relative w-full rounded-[32px] p-6 sm:p-9 lg:p-11 overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #707CD8 0%, #8A95E7 50%, #9EA8F8 100%)',
              }}
            >
              <div className="relative w-full min-h-[380px] sm:min-h-[440px]">
                
                {/* Back Window: PR Review / Hardware Custody Ledger */}
                <div className="w-[90%] sm:w-[86%] rounded-2xl bg-[#191A1F] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.55)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#131417] border-b border-white/[0.06]">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-medium">Summary</span>
                      <span className="text-zinc-400">Assets +42 -0</span>
                      <span className="text-emerald-400 font-medium">● In Custody</span>
                    </div>
                    <button type="button" className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium">
                      Audit
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 text-xs">
                    <div className="text-base font-semibold text-white">
                      Prevent unaccounted hardware loss
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Automated digital custody receipts &amp; serial inventory
                    </div>

                    <div className="mt-4 space-y-2 text-zinc-300 text-[12px]">
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-500">•</span>
                        <span>Full inventory of laptops, monitors, accessories &amp; security tokens</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-500">•</span>
                        <span>Zero-trust employee sign-off when equipment is transferred</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-500">•</span>
                        <span>Real-time status tracking: Pool, Assigned, Repair, or Deprecated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Floating Action Box (Screenshot 2 "Review PR with Codex" card) */}
                <div className="absolute right-0 sm:right-2 bottom-0 w-[72%] sm:w-[62%] rounded-2xl bg-[#1E1F25] border border-white/[0.12] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.7)] text-center">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 mx-auto flex items-center justify-center text-zinc-300 mb-3">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Audit custody with Lokus
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Check custody handoff edge cases &amp; serial match
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Hardware Vault</span>
                    <span className="text-emerald-400 font-medium">100% Verified</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Scale asset custody confidently
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-zinc-400 leading-[1.6] max-w-[420px] font-normal">
              Keep physical hardware accounted for as your team scales. Lokus automatically verifies handoffs, surfaces unreturned assets, and answers audit questions so your team focuses where judgment is needed most.
            </p>
          </div>

        </div>
      </section>

      {/* ─── FEATURE 03: Attendance & Leaves (Codex Split: Text Left, Canvas Right) ─── */}
      <section id="feature-attendance" className="w-full border-b border-zinc-900 bg-[#000000]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-28 sm:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Track attendance without disputes
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-zinc-400 leading-[1.6] max-w-[420px] font-normal">
              Eliminate spreadsheet errors and attendance disagreements. Employees check in smoothly with office and WFH markers, while managers approve leave requests with instant quota updates.
            </p>
          </div>

          {/* Right Visual Canvas: Lavender Gradient Backdrop */}
          <div className="lg:col-span-7">
            <div
              className="relative w-full rounded-[32px] p-6 sm:p-9 lg:p-11 overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #6C78D8 0%, #8A96EA 50%, #A0ACF6 100%)',
              }}
            >
              <div className="relative w-full min-h-[380px] sm:min-h-[440px]">
                
                {/* Back Window: Attendance Calendar Grid */}
                <div className="w-[88%] sm:w-[84%] rounded-2xl bg-[#18181D] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
                    <span className="font-mono font-medium text-white">November 2026 · Attendance</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400">● 94% Present</span>
                      <span className="text-amber-400">● 4% Late</span>
                      <span className="text-blue-400">● 2% Leave</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {[
                      { d: 10, status: 'On Time', kind: 'text-emerald-400 bg-emerald-500/10' },
                      { d: 11, status: 'Office', kind: 'text-emerald-400 bg-emerald-500/10' },
                      { d: 12, status: 'Late', kind: 'text-amber-400 bg-amber-500/10' },
                      { d: 13, status: 'WFH', kind: 'text-blue-400 bg-blue-500/10' },
                      { d: 14, status: 'Leave', kind: 'text-purple-400 bg-purple-500/10' },
                      { d: 17, status: 'Office', kind: 'text-emerald-400 bg-emerald-500/10' },
                      { d: 18, status: 'On Time', kind: 'text-emerald-400 bg-emerald-500/10' },
                      { d: 19, status: 'WFH', kind: 'text-blue-400 bg-blue-500/10' },
                      { d: 20, status: 'Office', kind: 'text-emerald-400 bg-emerald-500/10' },
                      { d: 21, status: 'On Time', kind: 'text-emerald-400 bg-emerald-500/10' },
                    ].map((slot) => (
                      <div
                        key={slot.d}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center"
                      >
                        <div className="text-xs font-mono font-bold text-white">{slot.d}</div>
                        <div className={`text-[10px] font-semibold mt-1 rounded py-0.5 ${slot.kind}`}>
                          {slot.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlapping Floating Panel: Leave Request Verification */}
                <div className="absolute right-0 bottom-0 sm:bottom-2 w-[72%] sm:w-[62%] rounded-2xl bg-[#1C1D22] border border-white/[0.12] p-4 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="text-xs font-semibold text-white">Leave Application · Annual</div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Approved
                    </span>
                  </div>
                  <div className="py-3 text-[12px] space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Employee</span>
                      <span className="text-white font-medium">Aarav Mehta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Duration</span>
                      <span className="text-white">3 Days (Nov 24 - 26)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Balance Remaining</span>
                      <span className="text-white font-mono">14 Days</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Automatic sync to payroll</span>
                    <span className="text-emerald-400 font-medium">Synced</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FEATURE 04: Payroll & Statutory EPF (Codex Split: Canvas Left, Text Right) ─── */}
      <section id="feature-payroll" className="w-full border-b border-zinc-900 bg-[#000000]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-28 sm:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Visual Canvas on Left */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div
              className="relative w-full rounded-[32px] p-6 sm:p-9 lg:p-11 overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #717DD9 0%, #8C97E9 50%, #9FAAF7 100%)',
              }}
            >
              <div className="relative w-full min-h-[380px] sm:min-h-[440px]">
                
                {/* Back Window: Payroll Register Table */}
                <div className="w-[90%] sm:w-[86%] rounded-2xl bg-[#191A1F] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
                    <span className="font-semibold text-white">November 2026 Payroll Cycle</span>
                    <span className="font-mono text-zinc-400">148 Employees</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-white/[0.03]">
                      <span className="text-zinc-400">Gross Disbursement</span>
                      <span className="font-mono font-semibold text-white">₹1,74,000</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/[0.03]">
                      <span className="text-zinc-400">Employee EPF (12%)</span>
                      <span className="font-mono text-amber-400">-₹13,200</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/[0.03]">
                      <span className="text-zinc-400">Employer EPF Match (12%)</span>
                      <span className="font-mono text-emerald-400">+₹13,200</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/[0.03]">
                      <span className="text-zinc-400">Income Tax TDS</span>
                      <span className="font-mono text-rose-400">-₹18,400</span>
                    </div>
                  </div>
                </div>

                {/* Overlapping Floating Net Pay Voucher */}
                <div className="absolute right-0 sm:right-2 bottom-0 w-[72%] sm:w-[62%] rounded-2xl bg-[#1E1F25] border border-white/[0.12] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
                  <div className="text-[11px] font-mono text-zinc-400">NET DISBURSEMENT</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                    ₹1,42,400
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Bank Transfer</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disbursed
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Statutory payroll, on autopilot
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-zinc-400 leading-[1.6] max-w-[420px] font-normal">
              Execute compliant payroll runs in minutes. Lokus automatically computes 12% EPF matching, handles income tax TDS deductions, and generates ledger-audited salary slips without tedious manual exports.
            </p>
          </div>

        </div>
      </section>

      {/* ─── FEATURE 05: Meet our leadership / Platform Architecture (Meta Screenshot 3 style) ─── */}
      <section className="w-full border-b border-zinc-900 bg-[#000000]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-28 sm:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Text Block with Pill CTA (Screenshot 3 style) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Engineered for enterprise trust
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-zinc-400 leading-[1.6] max-w-[480px] font-normal">
              Lokus architecture is built as security-first infrastructure, ensuring immutable audit logs, granular role delegation, and verifiable digital custody for every asset and employee action.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleGetStarted}
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Explore platform architecture
              </button>
            </div>
          </div>

          {/* Right Visual Card with Large Rounded Corner (Screenshot 3 style) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[32px] overflow-hidden border border-white/[0.08] bg-[#121316] p-8 sm:p-10 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">Immutable Ledger Audit</div>
                    <div className="text-xs text-zinc-400">SOC 2 Type II Architecture</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  Compliant
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { title: 'Fine-Grained RBAC', desc: 'Separate Admin, HR, Ops and Employee scopes' },
                  { title: 'Cryptographic Custody Tokens', desc: 'QR-verified hardware custody handoffs' },
                  { title: 'Continuous Ledger Sync', desc: 'Statutory EPF & TDS audit-ready exports' },
                ].map((item) => (
                  <div key={item.title} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NEWSROOM SECTION — EXACT META SCREENSHOT 4 STYLE
          "Catch up on the latest news", Pill button, 3 Cards, (→) Read more
      ══════════════════════════════════════════════════════════ */}
      <section id="section-news" className="w-full border-b border-zinc-900 bg-[#000000] py-28 sm:py-36">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
          
          {/* Header (Screenshot 4 typography & pill) */}
          <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold tracking-[-0.03em] text-white">
              Catch up on the latest news
            </h2>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGetStarted}
                className="px-6 py-2.5 rounded-full border border-white/25 hover:border-white/50 text-white text-sm font-medium transition-all hover:bg-white/[0.06] cursor-pointer"
              >
                See more at Newsroom
              </button>
            </div>
          </div>

          {/* 3 News Cards in a Row (Screenshot 4 style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Card 1 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="w-full aspect-[16/10] rounded-[26px] overflow-hidden bg-[#16171B] border border-white/[0.08] relative">
                {/* Visual Representation */}
                <div
                  className="w-full h-full p-6 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(145deg, #1A1C24 0%, #101115 100%)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-2">
                    <Laptop className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400">HARDWARE VAULT 2.0</span>
                </div>
              </div>

              <h3 className="mt-5 text-lg sm:text-xl font-semibold text-white leading-snug group-hover:text-zinc-200 transition-colors">
                Introducing Lokus Hardware Custody: A Digital Vault and Handoff Ledger in Just One Click
              </h3>

              <div className="mt-4 flex items-center gap-2.5 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                <span className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-white flex items-center justify-center text-xs transition-colors">
                  →
                </span>
                <span>Read more</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="w-full aspect-[16/10] rounded-[26px] overflow-hidden bg-[#16171B] border border-white/[0.08] relative">
                <div
                  className="w-full h-full p-6 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(145deg, #201C28 0%, #111016 100%)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-2">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400">STATUTORY PAYROLL</span>
                </div>
              </div>

              <h3 className="mt-5 text-lg sm:text-xl font-semibold text-white leading-snug group-hover:text-zinc-200 transition-colors">
                Automated EPF Matching, Statutory TDS Computation, and Direct Bank Slips
              </h3>

              <div className="mt-4 flex items-center gap-2.5 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                <span className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-white flex items-center justify-center text-xs transition-colors">
                  →
                </span>
                <span>Read more</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="w-full aspect-[16/10] rounded-[26px] overflow-hidden bg-[#16171B] border border-white/[0.08] relative">
                <div
                  className="w-full h-full p-6 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(145deg, #1C2422 0%, #101514 100%)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400">ENTERPRISE PLATFORM</span>
                </div>
              </div>

              <h3 className="mt-5 text-lg sm:text-xl font-semibold text-white leading-snug group-hover:text-zinc-200 transition-colors">
                Biggest Platform News from Lokus Connect: Unified RBAC &amp; Live Org Directory
              </h3>

              <div className="mt-4 flex items-center gap-2.5 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                <span className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-white flex items-center justify-center text-xs transition-colors">
                  →
                </span>
                <span>Read more</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA & FOOTER
      ══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#000000] py-24 sm:py-32">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
          
          <img
            src="/locus-logo-white.png"
            alt="Lokus"
            className="h-9 sm:h-10 w-auto object-contain mx-auto mb-6"
          />

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white">
            Your workplace. Under control.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-md mx-auto">
            Everything your organization needs, seamlessly synchronized in real-time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-7 py-3.5 rounded-full bg-[#34D399] hover:bg-[#2fe09d] text-black text-sm font-semibold transition-all shadow-[0_0_28px_rgba(52,211,153,0.35)] cursor-pointer active:scale-98"
            >
              Enter your workspace
            </button>
            <button
              type="button"
              onClick={handleViewDemo}
              disabled={isDemoLoading}
              className="px-7 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/20 text-sm font-medium transition-all cursor-pointer active:scale-98 disabled:opacity-60"
            >
              {isDemoLoading ? 'Loading demo...' : 'View live demo'}
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <span>© 2026 Lokus Technologies, Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => navigate('/login?mode=login')}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleGetStarted}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Create Organization
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
