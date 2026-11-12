import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  KeyRound,
  Laptop,
  ShieldCheck,
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
  const { isAuthenticated } = useSession();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#0D2B1E] text-white font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      {/* ─── Subtle Dark Green Grid + Radial Aura (matching reference theme) ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 65% at 50% -5%, rgba(20, 140, 75, 0.55) 0%, rgba(13, 43, 30, 0.7) 50%, rgba(11, 37, 26, 0.95) 100%),
            linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 4.5rem 4.5rem, 4.5rem 4.5rem',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ─── Full-Width Header ────────────────────────────────────────────── */}
        <header className="max-w-7xl mx-auto w-full px-5 sm:px-10 h-20 flex items-center justify-between gap-4 border-b border-emerald-800/30">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full bg-[#107C41] flex items-center justify-center text-white">
              <ShieldCheck className="w-4.5 h-4.5" />
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              Lokus
            </span>
          </button>

          <nav className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-sm font-medium">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Open Workspace
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login?mode=login')}
                  className="px-3.5 py-1.5 text-zinc-300 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white font-semibold transition-colors cursor-pointer active:scale-98"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </header>

        {/* ─── Hero Section (Bold High-Contrast Typography & Emerald CTA) ─── */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            {/* Minimal Shield Badge */}
            <div className="w-14 h-14 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-[#34D399]" />
            </div>

            {/* Giant Title matching Reference Composition */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08] text-white">
              Workplace management,{' '}
              <br className="hidden sm:inline" />
              <span className="text-[#34D399]">made easy.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto leading-relaxed">
              One platform to manage employees, company assets, attendance and payroll.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="px-7 py-3 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white text-sm sm:text-base font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Get started for free
              </button>
              <button
                type="button"
                onClick={() => scrollTo('section-01')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-medium border border-white/15 transition-colors inline-flex items-center gap-2 cursor-pointer backdrop-blur-xs active:scale-98"
              >
                View Demo
                <ArrowUpRight className="w-4 h-4 text-[#34D399]" />
              </button>
            </div>

            {/* Social Avatars Proof (matching reference image) */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#06120B] bg-emerald-700 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">ER</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#06120B] bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">MV</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#06120B] bg-emerald-800 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">AM</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#06120B] bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">DK</span>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                Trusted by modern engineering &amp; ops teams
              </span>
            </div>
          </motion.div>
        </section>

        {/* ─── Capability Strip (Glass Pills) ──────────────────────────────── */}
        <div className="max-w-6xl mx-auto w-full px-5 sm:px-10 pb-8 sm:pb-12">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3.5 sm:gap-4">
            {CAPABILITY_PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-[#34D399]" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Layer 2: 2-Card Side-by-Side Showcase Grid ───────────────────── */}
        <div className="w-full py-10 sm:py-14">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Everything in your organization,{' '}
              <span className="text-[#34D399]">working as one.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              Interactive live platform preview. Test workflows across every module.
            </p>
          </div>

          {/* Hairline Divider with Tilted Floating Pill */}
          <div className="max-w-6xl mx-auto px-5 sm:px-10 my-9 relative flex items-center justify-center">
            <div className="w-full h-px bg-emerald-800/40" />
            <span className="absolute px-4 py-1.5 rounded-full bg-[#eaf4ef] border border-[rgba(11,31,23,0.12)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-xs font-bold text-[#0b1f17] rotate-[-2.5deg]">
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

        {/* ─── Layer 3: Bottom Final CTA + Footer ──────────────────────────── */}
        <div className="w-full bg-[#091F15] border-t border-emerald-800/40 mt-16">
          <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-14 sm:pt-20 sm:pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-1">
                <ShieldCheck className="w-6 h-6 text-[#34D399]" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.15]">
                Your workplace. Under control.
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 max-w-md leading-relaxed">
                Everything your organization needs, seamlessly synchronized in real-time.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-7 py-3 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  Enter Your Workspace <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login?mode=login')}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer backdrop-blur-xs"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </section>

          <footer className="max-w-7xl mx-auto px-5 sm:px-10 py-7 border-t border-emerald-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <span>© 2026 Lokus Enterprise</span>
            <div className="flex items-center gap-5 text-zinc-400">
              <button
                type="button"
                onClick={() => navigate('/login?mode=login')}
                className="hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
