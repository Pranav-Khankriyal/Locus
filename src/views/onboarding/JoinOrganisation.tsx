import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AtSign } from 'lucide-react';
import { AuthShowcaseCard } from '@/components/auth/AuthShowcaseCard';
import { useSession } from '@/hooks/useSession';

export default function JoinOrganisation() {
  const { joinOrganisation, logout, user } = useSession();
  const [code, setCode] = useState('ACME-CORP');
  const [designation, setDesignation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      await joinOrganisation(code.trim(), {
        name: user?.name,
        designation: designation.trim() || undefined,
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to join organization');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f4f6] flex items-center justify-center p-3 sm:p-5 lg:p-7 font-sans text-gray-900">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="flex flex-col justify-center px-1 sm:px-3 py-1">
          <div className="flex items-center justify-between mb-6">
            <img
              src="/lokus-logo.png"
              alt="Lokus"
              className="h-7 w-auto object-contain mix-blend-multiply"
            />
            <button
              type="button"
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Join With Company Code
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 mb-6 leading-normal">
            Enter the unique company code provided by your enterprise owner. Access is provisioned via role-based permissions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Unique Company Code
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. ACME-CORP"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  autoFocus
                  className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono uppercase"
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                Demo company code: <strong>ACME-CORP</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Role / Job Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white font-medium py-2.5 sm:py-3 text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining company...
                  </span>
                ) : (
                  <>
                    <span>Join Company</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Setting up a new company as Admin / Owner?{' '}
            <Link
              to="/onboarding/create-organisation"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Create an organization
            </Link>
          </p>
        </div>

        <AuthShowcaseCard
          title="Connect With Your Team"
          subtitle="Check in daily, view salary slips & PF passbook, submit requests, and access assigned assets."
        />
      </div>
    </div>
  );
}
