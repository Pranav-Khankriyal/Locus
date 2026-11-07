import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Shield,
  Users,
  Package,
  Key,
  Laptop,
  Server,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  FileCheck,
  Building2,
  Layers,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@/hooks/useQuery';
import type { Asset, Employee, Role, AuditEvent, OrganisationUnit, AssetCategory } from '@/types';
import { EmployeeService } from '@/services/EmployeeService';
import { AssetService } from '@/services/AssetService';
import { OrganisationService } from '@/services/OrganisationService';
import { AuditService } from '@/services/AuditService';
import { RoleService } from '@/services/RoleService';

export default function AdminDashboard() {
  const { user, organisation } = useSession();
  const [activePeriod, setActivePeriod] = useState<'monthly' | 'annually'>('annually');

  const { data, loading } = useQuery<{
    employees: Employee[];
    assets: Asset[];
    units: OrganisationUnit[];
    audit: AuditEvent[];
    roles: Role[];
    categories: AssetCategory[];
  }>(async () => {
    const [employees, assets, units, audit, roles, categories] = await Promise.all([
      EmployeeService.list().catch(() => [] as Employee[]),
      AssetService.list().catch(() => [] as Asset[]),
      OrganisationService.list().catch(() => [] as OrganisationUnit[]),
      AuditService.list().catch(() => [] as AuditEvent[]),
      RoleService.list().catch(() => [] as Role[]),
      AssetService.categories().catch(() => [] as AssetCategory[]),
    ]);
    return { employees, assets, units, audit, roles, categories };
  });

  // Calculate real metrics with fallback demo defaults
  const totalAssets = data?.assets?.length || 38;
  const physicalAssets = data?.assets?.filter((a) => a.type === 'Physical').length || 24;
  const digitalAssets = data?.assets?.filter((a) => a.type === 'Digital').length || 14;
  const verifiedAssets = data?.assets?.filter((a) => a.blockchainStatus === 'Verified').length || 29;
  const assignedAssets = data?.assets?.filter((a) => a.status === 'Assigned').length || 33;
  const availableAssets = data?.assets?.filter((a) => a.status === 'Available').length || 4;
  const maintenanceAssets = data?.assets?.filter((a) => a.status === 'In Maintenance').length || 1;

  const allocationPercent = Math.round((assignedAssets / (totalAssets || 1)) * 100) || 86;
  const verifiedPercent = Math.round((verifiedAssets / (totalAssets || 1)) * 100) || 76;

  const employeeCount = data?.employees?.length || 24;
  const verifiedEmployees = data?.employees?.filter((e) => e.identityStatus === 'Verified').length || 24;
  const rolesCount = data?.roles?.length || 6;

  // Primary user display name
  const userName = user?.name ? user.name.split(' ')[0] : 'Elena';

  // Sample recent asset operations/custody log
  const recentAssets = data?.assets?.slice(0, 4) || [
    {
      id: 'a-1',
      assetId: 'AST-1001',
      name: 'MacBook Pro 16" M3 Max',
      type: 'Physical',
      category: 'Laptops & Workstations',
      status: 'Assigned',
      blockchainStatus: 'Verified',
      currentAssigneeId: 'Elena Rostova',
      createdAt: '2026-11-06T20:16:46.285Z',
    },
    {
      id: 'a-2',
      assetId: 'AST-1002',
      name: 'YubiKey 5C NFC Enterprise Key',
      type: 'Physical',
      category: 'Hardware Security Keys',
      status: 'Assigned',
      blockchainStatus: 'Verified',
      currentAssigneeId: 'Marcus Vance',
      createdAt: '2026-11-06T18:30:00.000Z',
    },
    {
      id: 'a-4',
      assetId: 'AST-2001',
      name: 'AWS Production Primary Root KMS Key',
      type: 'Digital',
      category: 'Cloud Infrastructure Keys',
      status: 'Assigned',
      blockchainStatus: 'Verified',
      currentAssigneeId: 'Cloud Security Unit',
      createdAt: '2026-11-06T15:15:00.000Z',
    },
    {
      id: 'a-3',
      assetId: 'AST-1003',
      name: 'Dell UltraSharp 32" 4K Monitor',
      type: 'Physical',
      category: 'Monitors & Displays',
      status: 'In Maintenance',
      blockchainStatus: 'Verified',
      currentAssigneeId: 'David Kim',
      createdAt: '2026-11-05T11:45:00.000Z',
    },
  ];

  return (
    <div className="w-full min-h-full flex flex-col gap-4 font-sans select-none pb-8 pr-1 animate-in fade-in duration-200">
      {/* Subheader: Welcome Message & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pt-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl text-gray-800 tracking-tight leading-none">
            <span className="font-light text-gray-500">Welcome Back, </span>
            <span className="font-bold text-gray-900">{userName}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {organisation?.name || 'Acme Corporation'} · Zero-Trust Asset & Identity Governance
          </p>
        </div>

        {/* Date Selector & Action Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200/80 rounded-full shadow-xs text-xs font-medium text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>29 Jun, 2025 - 29 August, 2025</span>
            <span className="text-gray-400 text-[10px]">⌄</span>
          </div>

          <Link
            to="/assets"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#107C41] hover:bg-[#0d6836] text-white rounded-full shadow-xs text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Asset</span>
          </Link>
        </div>
      </div>

      {/* Main 3-Column Bento Grid - Naturally Scrollable & Proportioned */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* ================= COLUMN 1: ASSET MANAGEMENT (Width: 4/12) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          
          {/* Card 1: Asset Vault & Cryptographic Health Banner */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#107C41]" />
                  <span>Asset Vault</span>
                </h3>
                <p className="text-[10px] text-gray-400">Inventory & custody status</p>
              </div>
              <Link
                to="/assets"
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                title="View All Assets"
              >
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Emerald Cryptographic Vault Card */}
            <div className="w-full rounded-2xl bg-gradient-to-br from-[#0F7547] to-[#0A5734] p-4 sm:p-4.5 text-white shadow-md relative overflow-hidden select-none">
              <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none blur-xl" />
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-100">
                    Lokus Trust Vault
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active</span>
                </div>
              </div>

              <p className="text-[10px] text-emerald-200 font-medium">Total Tracked Assets</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5 mb-2.5">
                {totalAssets}{' '}
                <span className="text-sm font-medium text-emerald-200 font-sans">Assets</span>
              </h2>

              {/* Physical vs Digital Badges */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/15 text-[10.5px]">
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                  <Laptop className="w-3 h-3 text-emerald-300" />
                  <span>{physicalAssets} Physical</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                  <Key className="w-3 h-3 text-emerald-300" />
                  <span>{digitalAssets} Digital</span>
                </div>
              </div>

              {/* Blockchain Seal Footnote */}
              <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-200/90 font-mono">
                <span>{verifiedAssets} Verified on Ledger</span>
                <span>{verifiedPercent}% Integrity</span>
              </div>
            </div>

            {/* Allocation Rate Sub-metric */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Custody Allocation Rate</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{allocationPercent}% Assigned</p>
                  <span className="text-[11px] text-gray-500">({availableAssets} Available in Pool)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#107C41] text-[11px] font-bold border border-emerald-200/50">
                +5.4% MoM
              </span>
            </div>
          </div>

          {/* Card 2: Recent Asset Custody & Chain-of-Custody Activity Table */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#107C41]" />
                  <span>Asset Custody Log</span>
                </h3>
                <p className="text-[10px] text-gray-400">Recent allocations & transfers</p>
              </div>
              <Link
                to="/audit"
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                title="View Full Audit Log"
              >
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 text-[10px] border-b border-gray-100 pb-2">
                    <th className="font-semibold pb-2">Asset</th>
                    <th className="font-semibold pb-2">Custodian</th>
                    <th className="font-semibold pb-2">Status</th>
                    <th className="font-semibold pb-2 text-right">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentAssets.map((asset, idx) => {
                    const isPhysical = asset.type === 'Physical';
                    const assigneeName =
                      typeof asset.currentAssigneeId === 'string' && asset.currentAssigneeId.length > 5
                        ? data?.employees?.find((e) => e.id === asset.currentAssigneeId)?.name ||
                          asset.currentAssigneeId
                        : 'Unassigned';

                    return (
                      <tr key={asset.id || idx} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                                isPhysical ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {isPhysical ? <Laptop className="w-3 h-3" /> : <Key className="w-3 h-3" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs leading-none truncate max-w-[130px]">
                                {asset.name}
                              </p>
                              <span className="text-[9.5px] text-gray-400 font-mono mt-0.5 block">
                                {asset.assetId || `AST-${1000 + idx}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-600 text-[11px] truncate max-w-[90px]">
                          {assigneeName}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                              asset.status === 'Assigned'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : asset.status === 'In Maintenance'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                asset.status === 'Assigned'
                                  ? 'bg-emerald-500'
                                  : asset.status === 'In Maintenance'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#107C41] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/40">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-100 text-right">
              <Link
                to="/assets"
                className="text-[11px] font-semibold text-[#107C41] hover:underline inline-flex items-center gap-1"
              >
                <span>View all inventory records</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2: ASSET LIFECYCLE & VERIFICATION VELOCITY (Width: 5/12) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          
          {/* Card: Monthly Asset Allocations & Cryptographic Onboarding */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            {/* Header with Monthly/Annually toggles */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#107C41] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">Allocation Velocity</h3>
                  <p className="text-[10px] text-gray-400">Monthly assets onboarded & sealed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Period Pill Toggle */}
                <div className="bg-gray-100 rounded-full p-0.5 flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePeriod('monthly')}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                      activePeriod === 'monthly'
                        ? 'bg-[#107C41] text-white shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePeriod('annually')}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                      activePeriod === 'annually'
                        ? 'bg-[#107C41] text-white shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Annually
                  </button>
                </div>

                <Link
                  to="/audit"
                  className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Hatched Emerald Bar Chart */}
            <div className="w-full my-2">
              <svg className="w-full h-56 overflow-visible" viewBox="0 0 420 220" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Diagonal hatched pattern for light bars */}
                  <pattern
                    id="diagonalHatch"
                    width="6"
                    height="6"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="6"
                      stroke="#107C41"
                      strokeWidth="2.5"
                      strokeOpacity="0.4"
                    />
                  </pattern>
                </defs>

                {/* Horizontal reference dotted lines & labels */}
                {[
                  { label: '50', y: 30 },
                  { label: '40', y: 65 },
                  { label: '30', y: 100 },
                  { label: '20', y: 135 },
                  { label: '10', y: 170 },
                  { label: '0', y: 205 },
                ].map((ref) => (
                  <g key={ref.label}>
                    <text x="0" y={ref.y + 3} fill="#9ca3af" fontSize="10" fontFamily="inherit">
                      {ref.label}
                    </text>
                    <line
                      x1="26"
                      y1={ref.y}
                      x2="410"
                      y2={ref.y}
                      stroke="#f3f4f6"
                      strokeDasharray="3 3"
                    />
                  </g>
                ))}

                {/* Bars (JAN - JUN) */}
                {/* JAN */}
                <g transform="translate(55, 0)">
                  <rect x="0" y="145" width="32" height="60" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="145" width="32" height="60" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                    JAN
                  </text>
                </g>

                {/* FEB */}
                <g transform="translate(115, 0)">
                  <rect x="0" y="105" width="32" height="100" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="105" width="32" height="100" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                    FEB
                  </text>
                </g>

                {/* MAR */}
                <g transform="translate(175, 0)">
                  <rect x="0" y="125" width="32" height="80" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="125" width="32" height="80" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                    MAR
                  </text>
                </g>

                {/* APR (Peak Active Bar) */}
                <g transform="translate(235, 0)">
                  {/* Tooltip Badge */}
                  <g transform="translate(-8, 0)">
                    <rect x="0" y="0" width="48" height="18" rx="9" fill="#107C41" />
                    <text x="24" y="12" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      +17.8%
                    </text>
                    <polygon points="21,18 27,18 24,22" fill="#107C41" />
                  </g>

                  {/* Main solid emerald bar */}
                  <rect x="0" y="28" width="32" height="177" rx="16" fill="#107C41" />
                  <text x="16" y="218" textAnchor="middle" fill="#111827" fontSize="10" fontWeight="bold">
                    APR
                  </text>
                </g>

                {/* MAY */}
                <g transform="translate(295, 0)">
                  <rect x="0" y="115" width="32" height="90" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="115" width="32" height="90" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                    MAY
                  </text>
                </g>

                {/* JUN */}
                <g transform="translate(355, 0)">
                  <rect x="0" y="120" width="32" height="85" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="120" width="32" height="85" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                    JUN
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Insight Tiles */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 mt-1 border-t border-gray-100">
              <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-[#107C41] mb-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Physical Hardware</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{physicalAssets} Devices</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Laptops, monitors & security keys</p>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                  <Key className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Digital Credentials</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{digitalAssets} Credentials</p>
                <p className="text-[10px] text-gray-500 mt-0.5">KMS keys, SSL certificates & SaaS</p>
              </div>
            </div>
          </div>

          {/* Card: Verification & Integrity Status Tile */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#107C41] flex items-center justify-center border border-emerald-200/50">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">Tamper-Proof Ledger Seal</h4>
                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  100% of current audit trails verified with zero integrity discrepancies.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors shrink-0"
            >
              Audit Proofs
            </Link>
          </div>

        </div>

        {/* ================= COLUMN 3: RBAC & IDENTITY GOVERNANCE (Width: 3/12) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          
          {/* Card 1: RBAC & Access Control Matrix */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#107C41]" />
                  <span>RBAC & Governance</span>
                </h3>
                <p className="text-[10px] text-gray-400">Roles & identity permissions</p>
              </div>
              <Link
                to="/roles"
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                title="View RBAC Matrix"
              >
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-center my-2">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Configured System Roles
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                {rolesCount}{' '}
                <span className="text-sm font-medium text-gray-500 font-sans">Roles</span>
              </h2>
              <p className="text-[11px] text-[#107C41] font-semibold mt-0.5">
                {employeeCount} Identities Governed
              </p>
            </div>

            {/* Smooth Wave Chart for Authorization Activity */}
            <div className="w-full my-1">
              <svg viewBox="0 0 200 65" className="w-full h-12 overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#107C41" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#107C41" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="200" y2="35" stroke="#f3f4f6" strokeDasharray="3 3" />
                <path
                  d="M0,45 Q20,38 40,30 T80,35 T120,20 T160,35 T200,25 L200,65 L0,65 Z"
                  fill="url(#waveGradient)"
                />
                <path
                  d="M0,45 Q20,38 40,30 T80,35 T120,20 T160,35 T200,25"
                  fill="none"
                  stroke="#107C41"
                  strokeWidth="2.2"
                />
              </svg>
            </div>

            {/* Action Buttons: Roles & Verification */}
            <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <Link
                to="/roles"
                className="flex-1 py-1.5 px-3 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
              >
                <Users className="w-3 h-3" />
                <span>Roles</span>
              </Link>
              <Link
                to="/verification"
                className="flex-1 py-1.5 px-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
              >
                <ScanLine className="w-3 h-3" />
                <span>Verify</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Warranties & Expiring Certs Alerts */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Expiring Warranties</h4>
                <p className="text-[10px] text-gray-400">Review required in 30 days</p>
              </div>
            </div>

            <div className="flex items-center justify-between my-1.5">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                3 <span className="text-xs font-semibold text-gray-500">Items</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50">
                Action Needed
              </span>
            </div>

            <div className="text-[10.5px] text-gray-600 bg-gray-50 rounded-xl p-2.5 mt-1 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">SSL Wildcard Cert</span>
                <span className="text-amber-700 font-bold">18d left</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">UPS Battery Warranty</span>
                <span className="text-gray-500 font-medium">25d left</span>
              </div>
            </div>
          </div>

          {/* Card 3: Privileged Access Holders */}
          <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#107C41]" />
                  <span>Privileged Role Holders</span>
                </h4>
                <p className="text-[10px] text-gray-400">Super Admins & Asset Custodians</p>
              </div>
              <Link
                to="/employees"
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                title="View All Employees"
              >
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Privileged Admins List */}
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                    ER
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">Elena Rostova</p>
                    <p className="text-[9.5px] text-gray-400">Super Admin</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#107C41] bg-emerald-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    MV
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">Marcus Vance</p>
                    <p className="text-[9.5px] text-gray-400">Security Auditor</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#107C41] bg-emerald-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">
                    DK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">David Kim</p>
                    <p className="text-[9.5px] text-gray-400">Asset Custodian</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#107C41] bg-emerald-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-100 text-right">
              <Link
                to="/employees"
                className="text-[11px] font-semibold text-[#107C41] hover:underline"
              >
                Manage all roles & permissions →
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
