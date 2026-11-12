import { useState } from 'react';
import { Building2, GitBranch, MapPin, Plus, Trash2, FolderTree } from 'lucide-react';
import type { HierarchyBranchDraft } from '@/contexts/AuthContext';

interface OrgHierarchyBuilderProps {
  companyName: string;
  branches: HierarchyBranchDraft[];
  onChange: (branches: HierarchyBranchDraft[]) => void;
}

/** Interactive company -> branches (country/state) -> departments tree builder. */
export function OrgHierarchyBuilder({
  companyName,
  branches,
  onChange,
}: OrgHierarchyBuilderProps) {
  const [deptDrafts, setDeptDrafts] = useState<Record<number, string>>({});

  const updateBranch = (idx: number, patch: Partial<HierarchyBranchDraft>) => {
    onChange(branches.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const addBranch = () => {
    onChange([
      ...branches,
      { name: `Branch ${branches.length + 1}`, country: '', state: '', departments: ['Operations'] },
    ]);
  };

  const removeBranch = (idx: number) => {
    if (branches.length <= 1) return;
    onChange(branches.filter((_, i) => i !== idx));
  };

  const addDepartment = (branchIdx: number) => {
    const val = (deptDrafts[branchIdx] || '').trim();
    if (!val) return;
    const existing = branches[branchIdx]?.departments || [];
    if (!existing.includes(val)) {
      updateBranch(branchIdx, { departments: [...existing, val] });
    }
    setDeptDrafts((prev) => ({ ...prev, [branchIdx]: '' }));
  };

  const removeDepartment = (branchIdx: number, deptIdx: number) => {
    const existing = branches[branchIdx]?.departments || [];
    updateBranch(branchIdx, {
      departments: existing.filter((_, i) => i !== deptIdx),
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <FolderTree className="w-3.5 h-3.5 text-[#107C41]" />
          <span>Organization Hierarchy Tree</span>
        </div>
        <button
          type="button"
          onClick={addBranch}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#107C41] hover:underline cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Add Branch
        </button>
      </div>

      {/* Root Company Node */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200/80 text-xs font-semibold text-gray-900">
        <Building2 className="w-3.5 h-3.5 text-[#107C41] shrink-0" />
        <span className="truncate">{companyName.trim() || 'Your Organization'}</span>
        <span className="ml-auto text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Root
        </span>
      </div>

      {/* Child Branch Nodes -> Department Child Nodes */}
      <div className="pl-3 border-l-2 border-emerald-200/80 space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
        {branches.map((branch, bIdx) => (
          <div
            key={bIdx}
            className="rounded-xl bg-white border border-gray-200/80 p-2.5 space-y-2"
          >
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#107C41] shrink-0" />
              <input
                type="text"
                value={branch.name}
                onChange={(e) => updateBranch(bIdx, { name: e.target.value })}
                placeholder="Branch name (e.g. Bengaluru HQ)"
                className="flex-1 min-w-0 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600"
              />
              {branches.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBranch(bIdx)}
                  className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                  aria-label="Remove branch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <MapPin className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={branch.country}
                  onChange={(e) => updateBranch(bIdx, { country: e.target.value })}
                  placeholder="Country (e.g. India)"
                  className="w-full text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-2 py-1 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <input
                type="text"
                value={branch.state}
                onChange={(e) => updateBranch(bIdx, { state: e.target.value })}
                placeholder="State / Region"
                className="w-full text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Child Department Nodes under Branch */}
            <div className="pl-2.5 border-l border-gray-200 space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {branch.departments.map((dept, dIdx) => (
                  <span
                    key={`${dept}-${dIdx}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-[#107C41] border border-emerald-200/70 rounded-full px-2 py-0.5"
                  >
                    {dept}
                    <button
                      type="button"
                      onClick={() => removeDepartment(bIdx, dIdx)}
                      className="text-emerald-600 hover:text-red-600 leading-none cursor-pointer"
                      aria-label={`Remove ${dept}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={deptDrafts[bIdx] || ''}
                  onChange={(e) =>
                    setDeptDrafts((prev) => ({ ...prev, [bIdx]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDepartment(bIdx);
                    }
                  }}
                  placeholder="+ Add department & press Enter"
                  className="flex-1 text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => addDepartment(bIdx)}
                  className="text-[11px] font-medium px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

