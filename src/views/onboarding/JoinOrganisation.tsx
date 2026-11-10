import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

export default function JoinOrganisation() {
  const { joinOrganisation, logout } = useSession();
  const [code, setCode] = useState('ACME-2026');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      await joinOrganisation(code.trim());
    } catch (err) {
      setError((err as Error).message || 'Failed to join organization');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#f2f4f6] flex items-center justify-center p-3 sm:p-4 lg:p-6 font-sans text-gray-900 overflow-hidden">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl lg:max-w-5xl w-full max-h-[96vh] p-5 sm:p-7 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center overflow-hidden">
        
        {/* Left Column */}
        <div className="flex flex-col justify-center px-1 sm:px-4 py-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider">
              Join Your Team
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-5">
            Join an organization
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Invitation Code
              </label>
              <input
                type="text"
                placeholder="e.g. ACME-2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono uppercase"
              />
              <p className="text-[10px] text-emerald-700 mt-1.5 font-medium">
                Tip: Use <strong>ACME-2026</strong> to join the default demo workspace.
              </p>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-1.5">
                {error}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white font-medium py-2.5 sm:py-3 text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining workspace...
                  </span>
                ) : (
                  <>
                    <span>Join Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-5 text-center">
            Want to start a new company?{' '}
            <Link
              to="/onboarding/create-organisation"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Create an organization
            </Link>
          </p>
        </div>

        {/* Right Column: Hero Illustration Container */}
        <div className="bg-[#f0f8f3] rounded-[1.75rem] p-6 sm:p-7 lg:p-8 flex flex-col items-center justify-between text-center h-full max-h-[520px] border border-emerald-50/70 select-none">
          <div className="w-full flex-1 flex items-center justify-center min-h-0 py-1">
            <img
              src="/asset-management-access-control.png"
              alt="Asset Management & Access Control Illustration"
              className="w-full max-h-[240px] sm:max-h-[280px] lg:max-h-[310px] object-contain drop-shadow-sm pointer-events-none"
              loading="eager"
            />
          </div>

          <div className="w-full flex flex-col items-center mt-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Connect With Your Team
            </h2>
            <p className="text-xs text-gray-600 mt-1 max-w-xs leading-relaxed">
              Access organization resources, assigned equipment, and roles seamlessly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

