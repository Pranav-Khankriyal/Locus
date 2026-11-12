import { useEffect, useState } from 'react';
import { AtSign, CheckCircle2, Plus, Shield, XCircle } from 'lucide-react';
import type { HierarchyBranchDraft } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { OrgHierarchyBuilder } from './OrgHierarchyBuilder';

interface CompanySetupFieldsProps {
  orgName: string;
  onOrgNameChange: (v: string) => void;
  companyCode: string;
  onCompanyCodeChange: (v: string) => void;
  codeTouched: boolean;
  onCodeTouched: () => void;
  codeAvailable: boolean | null;
  onCodeAvailabilityChange: (available: boolean | null) => void;
  branches: HierarchyBranchDraft[];
  onBranchesChange: (branches: HierarchyBranchDraft[]) => void;
  coAdminEmails: string[];
  onCoAdminEmailsChange: (emails: string[]) => void;
}

export function normalizeCodeInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 32);
}

/** Shared enterprise setup form: unique company code, co-admins, and hierarchy tree. */
export function CompanySetupFields({
  orgName,
  onOrgNameChange,
  companyCode,
  onCompanyCodeChange,
  codeTouched,
  onCodeTouched,
  codeAvailable,
  onCodeAvailabilityChange,
  branches,
  onBranchesChange,
  coAdminEmails,
  onCoAdminEmailsChange,
}: CompanySetupFieldsProps) {
  const [coAdminDraft, setCoAdminDraft] = useState('');

  // Auto-suggest unique company code from orgName until user edits code manually
  useEffect(() => {
    if (codeTouched) return;
    const suggested = normalizeCodeInput(orgName).replace(/-+$/, '');
    onCompanyCodeChange(suggested);
  }, [orgName, codeTouched, onCompanyCodeChange]);

  // Debounced uniqueness check against registered organizations
  useEffect(() => {
    const clean = companyCode.replace(/-+$/, '');
    if (clean.length < 3) {
      onCodeAvailabilityChange(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void api
        .get<{ available: boolean }>(
          `/api/v1/organization?check_code=${encodeURIComponent(clean)}`
        )
        .then((res) => {
          if (!cancelled) onCodeAvailabilityChange(res.available);
        })
        .catch(() => {
          if (!cancelled) onCodeAvailabilityChange(null);
        });
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [companyCode, onCodeAvailabilityChange]);

  const addCoAdmin = () => {
    const email = coAdminDraft.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (!coAdminEmails.includes(email)) {
      onCoAdminEmailsChange([...coAdminEmails, email]);
    }
    setCoAdminDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            placeholder="e.g. NovaTech Global"
            value={orgName}
            onChange={(e) => onOrgNameChange(e.target.value)}
            required
            maxLength={100}
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              Unique Company Code
            </label>
            {codeAvailable === true && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#107C41]">
                <CheckCircle2 className="w-3 h-3" /> Available
              </span>
            )}
            {codeAvailable === false && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                <XCircle className="w-3 h-3" /> Taken
              </span>
            )}
          </div>
          <div className="relative">
            <AtSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="NOVATECH-HQ"
              value={companyCode}
              onChange={(e) => {
                onCodeTouched();
                onCompanyCodeChange(normalizeCodeInput(e.target.value));
              }}
              required
              minLength={3}
              className="w-full rounded-xl border border-gray-300 bg-white pl-8 pr-3 py-2.5 text-sm text-gray-900 font-mono uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Interactive Branch & Department Tree */}
      <OrgHierarchyBuilder
        companyName={orgName}
        branches={branches}
        onChange={onBranchesChange}
      />

      {/* Co-Admin Invites */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#107C41]" />
            Co-Admins (Optional)
          </span>
          <span className="text-[10px] text-gray-400">Shared owner-level visibility</span>
        </div>

        {coAdminEmails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coAdminEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-[#107C41] border border-emerald-200 rounded-full px-2.5 py-0.5"
              >
                {email}
                <button
                  type="button"
                  onClick={() =>
                    onCoAdminEmailsChange(coAdminEmails.filter((e) => e !== email))
                  }
                  className="text-emerald-700 hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <input
            type="email"
            value={coAdminDraft}
            onChange={(e) => setCoAdminDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCoAdmin();
              }
            }}
            placeholder="coadmin@company.com"
            className="flex-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            onClick={addCoAdmin}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

