import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  KeyRound,
  Laptop,
  Users,
  Wallet,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import {
  AssetAllocationCard,
  AttendanceCalendarCard,
  ConnectedWorkflowCard,
  EmployeeDirectoryCard,
  RbacHierarchyCard,
  SalaryBreakdownCard,
} from '@/components/landing/LandingVisuals';

const CAPABILITY_PILLARS = [
  { id: 'section-01', label: 'Employees', icon: Users },
  { id: 'section-02', label: 'Asset Vault', icon: Laptop },
  { id: 'section-03', label: 'Attendance', icon: Clock },
  { id: 'section-04', label: 'Payroll & EPF', icon: Wallet },
  { id: 'section-05', label: 'RBAC Roles', icon: KeyRound },
];

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
      await login('admin@lokus.io', 'password123');
      navigate('/dashboard');
    } catch {
      navigate('/login?mode=login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAFBF6] text-zinc-900 font-sans selection:bg-[#0C4242] selection:text-white overflow-x-hidden relative">
      {/* ─── Layer 1: Full-Screen Edge-to-Edge Hero (Visible at One View) ───── */}
      <section className="w-full min-h-screen lg:h-screen lg:max-h-[100dvh] bg-[#0C4242] text-white flex flex-col justify-between relative overflow-hidden">
        {/* Ambient radial glow & fine grid extending edge-to-edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 90% 60% at 50% 20%, rgba(20, 110, 100, 0.45) 0%, rgba(12, 66, 66, 0.72) 50%, rgba(8, 45, 45, 0.98) 100%),
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 4.5rem 4.5rem, 4.5rem 4.5rem',
          }}
        />

        {/* ─── Reference Navbar (Logo & Links on Left, Login & Mint Button on Right) ─ */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
          {/* Left: Logo & Links immediately beside it */}
          <div className="flex items-center gap-7 sm:gap-9">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
              aria-label="Lokus Home"
            >
              <img
                src="/locus-logo-white.png"
                alt="Lokus"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </button>

            {/* Left-aligned navigation links matching reference */}
            <nav className="hidden md:flex items-center gap-5 sm:gap-7 text-[13px] font-medium text-white/90">
              <button
                type="button"
                onClick={() => scrollTo('section-04')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => scrollTo('section-02')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                API
              </button>
              <button
                type="button"
                onClick={() => scrollTo('section-01')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Docs
              </button>
              <button
                type="button"
                onClick={() => scrollTo('section-03')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Blog
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToolsOpen((v) => !v)}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Free Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {toolsOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#082920] border border-white/15 p-2 shadow-2xl z-50 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        handleViewDemo();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Interactive Live Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('section-04');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      EPF &amp; Net Salary Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('section-02');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Hardware Custody Vault
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(false);
                        scrollTo('section-01');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Employee Directory Roster
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Login link + Mint Green Get started button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[13px] font-medium text-white hover:text-white/80 transition-colors cursor-pointer"
              >
                Open Workspace
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login?mode=login')}
                className="text-[13px] font-medium text-white hover:text-white/80 transition-colors cursor-pointer"
              >
                Login
              </button>
            )}
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-4 py-1.5 rounded-lg bg-[#34D399] hover:bg-[#2fe09d] text-zinc-950 text-[13px] font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Get started
            </button>
          </div>
        </header>

        {/* ─── Hero Center Body (Centered & Compact for 100vh Visibility) ───── */}
        <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6 flex-1 flex flex-col items-center justify-center text-center my-auto">
          {/* Left Floating Card (subtly tilted, pushed to outer edge) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden xl:flex absolute left-3 lg:left-6 xl:left-8 2xl:left-12 top-[38%] -translate-y-1/2 w-52 2xl:w-60 bg-white text-zinc-900 rounded-2xl p-3.5 2xl:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)] border border-white/20 rotate-[-2.5deg] flex-col gap-2 text-left pointer-events-none"
          >
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-mono text-zinc-500">
              <span className="font-semibold text-[#0C4242]">ROSTER</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">148 Active</span>
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <span className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-xl bg-[#0C4242] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                ENG
              </span>
              <div className="min-w-0">
                <div className="text-xs 2xl:text-sm font-bold text-zinc-950 truncate">Elena Rostova</div>
                <div className="text-[10px] 2xl:text-[11px] text-zinc-500 truncate">Security Architect</div>
              </div>
            </div>
            <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-zinc-500">
              <span>Custody ID</span>
              <span className="font-mono font-semibold text-zinc-800">AST-1001</span>
            </div>
          </motion.div>

          {/* Right Floating Card (subtly tilted, pushed to outer edge) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden xl:flex absolute right-3 lg:right-6 xl:right-8 2xl:right-12 top-[44%] -translate-y-1/2 w-52 2xl:w-60 bg-white text-zinc-900 rounded-2xl p-3.5 2xl:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)] border border-white/20 rotate-[2.5deg] flex-col gap-2 text-left pointer-events-none"
          >
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-mono text-zinc-500">
              <span>PAYROLL</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">100% EPF</span>
            </div>
            <div className="pt-0.5">
              <div className="text-[10px] 2xl:text-[11px] text-zinc-500">Net Slip</div>
              <div className="text-lg 2xl:text-xl font-bold text-zinc-950 tracking-tight">₹1,42,400</div>
            </div>
            <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
              </span>
              <span className="font-mono font-semibold text-[#0C4242]">Ledger Synced</span>
            </div>
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            {/* Rating / Review Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium text-white mb-4 sm:mb-5">
              <span className="text-emerald-300">★</span>
              <span>Trusted by modern engineering &amp; ops teams</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] xl:text-[3.4rem] 2xl:text-[3.75rem] font-bold tracking-tight leading-[1.12] text-white text-center">
              <span className="block sm:whitespace-nowrap">Workplace management,</span>
              <span className="block">made easy.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-zinc-200/90 max-w-lg mx-auto leading-relaxed">
              One platform to manage employees, company assets, attendance and payroll.
            </p>

            {/* Hero CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-zinc-100 text-[#0C4242] text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Get started for free <ArrowRight className="w-4 h-4 text-[#0C4242]" />
              </button>
              <button
                type="button"
                onClick={handleViewDemo}
                disabled={isDemoLoading}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium border border-white/25 transition-all inline-flex items-center gap-2 cursor-pointer backdrop-blur-xs active:scale-98 disabled:opacity-70"
              >
                {isDemoLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading Demo...</span>
                  </>
                ) : (
                  <>
                    <span>View Demo</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                  </>
                )}
              </button>
            </div>


          </motion.div>
        </div>

        {/* ─── Bottom Trust Bar (Anchored at Bottom of 100vh Hero) ─────────── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 py-3.5 sm:py-4 border-t border-white/10 flex flex-wrap items-center justify-around gap-3 sm:gap-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/60 shrink-0">
          <span>Access Control (RBAC)</span>
          <span className="text-white/30">·</span>
          <span>Hardware Vault</span>
          <span className="text-white/30">·</span>
          <span>Biometric Attendance</span>
          <span className="text-white/30">·</span>
          <span>Automated EPF</span>
          <span className="text-white/30">·</span>
          <span>Audit Ledger</span>
        </div>
      </section>

      {/* ─── Layer 2: Capability Strip (Clean Editorial Pills) ─────────────── */}
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-10 py-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-4">
          {CAPABILITY_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/80 hover:border-[#0C4242]/40 text-zinc-700 hover:text-zinc-950 shadow-2xs transition-all cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-[#E6F0EB] text-[#0C4242] flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-[#0C4242]" />
                </span>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Layer 3: 2-Card Side-by-Side Showcase Grid ─────────────────────── */}
      <div className="w-full py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 leading-snug">
            Everything in your organization,{' '}
            <span className="text-[#0C4242]">working as one.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600">
            Interactive live platform preview. Test workflows across every module.
          </p>
        </div>

        {/* Hairline Divider with Tilted Floating Pill */}
        <div className="max-w-6xl mx-auto px-5 sm:px-10 my-9 relative flex items-center justify-center">
          <div className="w-full h-px bg-zinc-200/80" />
          <span className="absolute px-4 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-[0_4px_15px_rgba(0,0,0,0.06)] text-xs font-bold text-zinc-900 rotate-[-2.5deg]">
            Live Platform Demo
          </span>
        </div>

        {/* 2-Card Layout (kept exactly in original layout) */}
        <div className="max-w-7xl mx-auto px-5 sm:px-10 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <EmployeeDirectoryCard />
            <AssetAllocationCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <AttendanceCalendarCard />
            <SalaryBreakdownCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <RbacHierarchyCard />
            <ConnectedWorkflowCard />
          </div>
        </div>
      </div>

      {/* ─── Layer 4: Bottom Final CTA matching Hero Card + Footer ─────────── */}
      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6 mt-8 mb-4">
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#0C4242] text-white p-12 sm:p-16 text-center overflow-hidden shadow-xl border border-[#0C4242]/30">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 90% 70% at 50% 30%, rgba(20, 110, 100, 0.45) 0%, rgba(12, 66, 66, 0.72) 60%, rgba(8, 45, 45, 0.98) 100%),
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 4.5rem 4.5rem, 4.5rem 4.5rem',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 flex flex-col items-center space-y-4"
          >
            <img
              src="/locus-logo-white.png"
              alt="Lokus"
              className="h-10 sm:h-12 w-auto object-contain mb-1"
            />

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.15]">
              Your workplace. Under control.
            </h2>

            <p className="text-sm sm:text-base text-zinc-200/90 max-w-md leading-relaxed">
              Everything your organization needs, seamlessly synchronized in real-time.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleGetStarted}
                className="px-7 py-3 rounded-full bg-white text-[#0C4242] hover:bg-zinc-100 font-semibold text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Enter Your Workspace <ArrowRight className="w-4 h-4 text-[#0C4242]" />
              </button>
              <button
                type="button"
                onClick={handleViewDemo}
                disabled={isDemoLoading}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer backdrop-blur-xs active:scale-98 disabled:opacity-70"
              >
                {isDemoLoading ? 'Loading Demo...' : 'View Demo'}
              </button>
            </div>
          </motion.div>
        </div>

        <footer className="w-full px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span>© 2026 Lokus Enterprise</span>
          <div className="flex items-center gap-5 text-zinc-500">
            <button
              type="button"
              onClick={() => navigate('/login?mode=login')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={handleGetStarted}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
