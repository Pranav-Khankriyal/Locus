import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthShowcaseCard } from '@/components/auth/AuthShowcaseCard';
import { CompanySetupFields } from '@/components/auth/CompanySetupFields';
import { useSession } from '@/hooks/useSession';
import type { HierarchyBranchDraft } from '@/contexts/AuthContext';

export default function CreateOrganisation() {
  const { createOrganisation, logout, user } = useSession();
  const [name, setName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  const [branches, setBranches] = useState<HierarchyBranchDraft[]>([
    {
      name: 'Bengaluru HQ',
      country: 'India',
      state: 'Karnataka',
      departments: ['Engineering', 'People & Operations'],
    },
  ]);
  const [coAdminEmails, setCoAdminEmails] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (companyCode.replace(/-+$/, '').length < 3) {
      setError('Please enter a unique company code (at least 3 characters).');
      return;
    }
    if (codeAvailable === false) {
      setError('That company code is already registered. Please choose a unique code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await createOrganisation({
        name: name.trim(),
        code: companyCode.replace(/-+$/, ''),
        creatorName: user?.name,
        coAdminEmails,
        hierarchy: { branches },
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to create organization');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f4f6] flex items-center justify-center p-3 sm:p-5 lg:p-7 font-sans text-gray-900">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="flex flex-col justify-center px-1 sm:px-3 py-1 max-h-[85vh] overflow-y-auto workspace-scroll">
          <div className="flex items-center justify-between mb-5">
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
            Create Enterprise Workspace
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 mb-5 leading-normal">
            Set a unique company code for employees, build your country &rarr; branch &rarr; department tree, and invite optional Co-Admins.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CompanySetupFields
              orgName={name}
              onOrgNameChange={setName}
              companyCode={companyCode}
              onCompanyCodeChange={setCompanyCode}
              codeTouched={codeTouched}
              onCodeTouched={() => setCodeTouched(true)}
              codeAvailable={codeAvailable}
              onCodeAvailabilityChange={setCodeAvailable}
              branches={branches}
              onBranchesChange={setBranches}
              coAdminEmails={coAdminEmails}
              onCoAdminEmailsChange={setCoAdminEmails}
            />

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white font-medium py-2.5 sm:py-3 text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating workspace...
                </span>
              ) : (
                <>
                  <span>Launch Organization</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Joining as an employee?{' '}
            <Link
              to="/onboarding/join-organisation"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Join with company code
            </Link>
          </p>
        </div>

        <AuthShowcaseCard
          title="Launch Your Organization"
          subtitle="Configure teams, payroll structures, leave policies, asset custody, and RBAC in minutes."
        />
      </div>
    </div>
  );
}
