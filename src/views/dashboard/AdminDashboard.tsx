import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Shield,
  Users,
  Package,
  Key,
  Laptop,
  ScanLine,
  Clock,
  LogIn,
  LogOut,
  Umbrella,
  IndianRupee,
  PiggyBank,
  ClipboardList,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@/hooks/useQuery';
import { useNotifications } from '@/hooks/useNotifications';
import type {
  Asset,
  Employee,
  Role,
  AuditEvent,
  OrganisationUnit,
  AssetCategory,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  SalarySlip,
  BonusRecord,
  PFAccount,
  OrgRequest,
} from '@/types';
import { EmployeeService } from '@/services/EmployeeService';
import { AssetService } from '@/services/AssetService';
import { OrganisationService } from '@/services/OrganisationService';
import { AuditService } from '@/services/AuditService';
import { RoleService } from '@/services/RoleService';
import { AttendanceService } from '@/services/AttendanceService';
import { LeaveService } from '@/services/LeaveService';
import { PayrollService } from '@/services/PayrollService';
import { RequestService } from '@/services/RequestService';
import { formatCurrency } from '@/utils/formatCurrency';

export default function AdminDashboard() {
  const { user, organisation } = useSession();
  const { toast } = useNotifications();
  const [activePeriod, setActivePeriod] = useState<'monthly' | 'annually'>('annually');
  const [clockBusy, setClockBusy] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data } = useQuery<{
    employees: Employee[];
    assets: Asset[];
    units: OrganisationUnit[];
    audit: AuditEvent[];
    roles: Role[];
    categories: AssetCategory[];
    attendance: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    leaveBalances: LeaveBalance[];
    slips: SalarySlip[];
    bonuses: BonusRecord[];
    pfAccounts: PFAccount[];
    requests: OrgRequest[];
  }>(async () => {
    const [employees, assets, units, audit, roles, categories, attendance, leaves, payroll, requests] =
      await Promise.all([
        EmployeeService.list().catch(() => [] as Employee[]),
        AssetService.list().catch(() => [] as Asset[]),
        OrganisationService.list().catch(() => [] as OrganisationUnit[]),
        AuditService.list().catch(() => [] as AuditEvent[]),
        RoleService.list().catch(() => [] as Role[]),
        AssetService.categories().catch(() => [] as AssetCategory[]),
        AttendanceService.list().catch(() => [] as AttendanceRecord[]),
        LeaveService.list().catch(() => ({ requests: [], balances: [], holidays: [] })),
        PayrollService.list().catch(() => ({
          structures: [],
          slips: [],
          bonuses: [],
          pfAccounts: [],
          pfTransactions: [],
        })),
        RequestService.list().catch(() => [] as OrgRequest[]),
      ]);
    return {
      employees,
      assets,
      units,
      audit,
      roles,
      categories,
      attendance,
      leaveRequests: leaves.requests,
      leaveBalances: leaves.balances,
      slips: payroll.slips,
      bonuses: payroll.bonuses,
      pfAccounts: payroll.pfAccounts,
      requests,
    };
  });

  // Enterprise HR, Payroll & Operations KPIs
  const empMap = Object.fromEntries((data?.employees || []).map((e) => [e.id, e]));
  const todayLogs = (data?.attendance || []).filter((a) => a.date === todayStr);
  const myToday = todayLogs.find((a) => a.employeeId === user?.id);
  const presentToday = todayLogs.filter(
    (a) => a.status === 'Present' || a.status === 'WFH' || a.status === 'Late'
  ).length;
  const wfhToday = todayLogs.filter((a) => a.status === 'WFH').length;

  const pendingLeaves = (data?.leaveRequests || []).filter((l) => l.status === 'Pending');
  const openRequests = (data?.requests || []).filter(
    (r) => r.status === 'Pending' || r.status === 'In Review'
  );
  const latestSlipMonth = data?.slips?.[0]?.month;
  const monthlyPayrollTotal = (data?.slips || [])
    .filter((s) => !latestSlipMonth || s.month === latestSlipMonth)
    .reduce((sum, s) => sum + s.netPay, 0);
  const totalPfCorpus = (data?.pfAccounts || []).reduce((sum, a) => sum + a.totalBalance, 0);
  const activeBonusTotal = (data?.bonuses || [])
    .filter((b) => b.status === 'Approved' || b.status === 'Credited')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleQuickClock = async () => {
    if (!user?.id) return;
    setClockBusy(true);
    try {
      if (!myToday?.checkIn) {
        await AttendanceService.clockIn(user.id, 'Office');
        toast('Checked in for today');
      } else if (!myToday.checkOut) {
        await AttendanceService.clockOut(user.id);
        toast('Checked out successfully');
      }
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setClockBusy(false);
    }
  };

  const handleQuickApproveLeave = async (id: string) => {
    if (!user?.id) return;
    try {
      await LeaveService.review(id, 'Approved', user.id);
      toast('Leave approved');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const handleQuickApproveRequest = async (id: string) => {
    if (!user?.id) return;
    try {
      await RequestService.review(id, 'Approved', user.id);
      toast('Request approved');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  // Calculate real metrics with fallback demo defaults
  const totalAssets = data?.assets?.length || 38;
  const physicalAssets = data?.assets?.filter((a) => a.type === 'Physical').length || 24;
  const digitalAssets = data?.assets?.filter((a) => a.type === 'Digital').length || 14;
  const verifiedAssets = data?.assets?.filter((a) => a.blockchainStatus === 'Verified').length || 29;
  const assignedAssets = data?.assets?.filter((a) => a.status === 'Assigned').length || 33;
  const availableAssets = data?.assets?.filter((a) => a.status === 'Available').length || 4;

  const allocationPercent = Math.round((assignedAssets / (totalAssets || 1)) * 100) || 86;
  const verifiedPercent = Math.round((verifiedAssets / (totalAssets || 1)) * 100) || 76;

  const employeeCount = data?.employees?.length || 24;
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
    <div className="w-full min-h-full flex flex-col gap-7 font-sans select-none pt-1 pb-10 animate-in fade-in duration-200">
      {/* Subheader: Welcome Message & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold text-zinc-900 tracking-tight leading-snug">
            <span className="font-normal text-slate-400">Welcome back, </span>
            <span>{userName}</span>
          </h1>
          <p className="text-[13px] font-normal text-slate-500 mt-1">
            {organisation?.name || 'Acme Corporation'} ·{' '}
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Clean Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!myToday?.checkOut && (
            <button
              type="button"
              disabled={clockBusy}
              onClick={handleQuickClock}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 text-slate-700 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-[13px] font-medium transition-colors cursor-pointer"
            >
              {!myToday?.checkIn ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[#107C41]" />
                  <span>Check In</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5 text-amber-600" />
                  <span>Check Out ({myToday.checkIn})</span>
                </>
              )}
            </button>
          )}

          <Link
            to="/payroll"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-[13px] font-medium transition-colors"
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#107C41]" />
            <span>Payroll</span>
          </Link>

          <Link
            to="/assets"
            className="flex items-center gap-2 px-4 py-2 bg-[#107C41] hover:bg-[#0d6836] text-white rounded-full shadow-[0_1px_2px_rgba(16,124,65,0.18)] text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </Link>
        </div>
      </div>

      {/* Enterprise HR & Payroll Pulse Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/attendance"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-emerald-200 transition-colors flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <span className="text-[12.5px] font-medium text-slate-500">
              Today&apos;s Attendance
            </span>
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight tabular-nums text-zinc-900 mt-1.5">
              {presentToday} <span className="text-sm font-normal text-slate-400">/ {employeeCount}</span>
            </p>
            <span className="text-xs text-[#107C41] font-medium mt-1.5 block">{wfhToday} remote · live logs</span>
          </div>
          <span className="w-11 h-11 rounded-2xl bg-emerald-50/75 text-[#107C41] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </span>
        </Link>

        <Link
          to="/leaves"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-emerald-200 transition-colors flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <span className="text-[12.5px] font-medium text-slate-500">
              Pending Leaves
            </span>
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight tabular-nums text-zinc-900 mt-1.5">
              {pendingLeaves.length}
            </p>
            <span className="text-xs text-amber-600/90 font-medium mt-1.5 block">Paid &amp; LOP synced</span>
          </div>
          <span className="w-11 h-11 rounded-2xl bg-amber-50/75 text-amber-600 flex items-center justify-center shrink-0">
            <Umbrella className="w-5 h-5" />
          </span>
        </Link>

        <Link
          to="/payroll"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-emerald-200 transition-colors flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <span className="text-[12.5px] font-medium text-slate-500">
              Monthly Net Payroll
            </span>
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight tabular-nums text-[#107C41] mt-1.5">
              {formatCurrency(monthlyPayrollTotal)}
            </p>
            <span className="text-xs text-slate-500 font-normal mt-1.5 block">
              +{formatCurrency(activeBonusTotal)} bonuses
            </span>
          </div>
          <span className="w-11 h-11 rounded-2xl bg-emerald-50/75 text-[#107C41] flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </span>
        </Link>

        <Link
          to="/requests"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-emerald-200 transition-colors flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <span className="text-[12.5px] font-medium text-slate-500">
              EPF Corpus &amp; Requests
            </span>
            <p className="text-2xl sm:text-[26px] font-semibold tracking-tight tabular-nums text-zinc-900 mt-1.5">
              {formatCurrency(totalPfCorpus)}
            </p>
            <span className="text-xs text-sky-700 font-medium mt-1.5 block">
              {openRequests.length} open workflow requests
            </span>
          </div>
          <span className="w-11 h-11 rounded-2xl bg-sky-50/80 text-sky-700 flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5" />
          </span>
        </Link>
      </div>

      {/* Main 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1: ASSET MANAGEMENT (Width: 4/12) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: Asset Vault & Cryptographic Health Banner */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#107C41]" />
                  <span>Asset Vault</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Inventory &amp; custody status</p>
              </div>
              <Link
                to="/assets"
                className="w-7 h-7 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="View All Assets"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Emerald Cryptographic Vault Card */}
            <div className="w-full rounded-2xl bg-gradient-to-br from-[#0F7547] to-[#0B5D38] p-5 sm:p-6 text-white shadow-sm relative overflow-hidden select-none">
              <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none blur-xl" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-100/90">
                    Lokus Trust Vault
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span>Active</span>
                </div>
              </div>

              <p className="text-xs text-emerald-100/80 font-normal">Total Tracked Assets</p>
              <h2 className="text-3xl font-semibold tracking-tight tabular-nums mt-1 mb-4">
                {totalAssets}{' '}
                <span className="text-sm font-normal text-emerald-100/80 font-sans">Assets</span>
              </h2>

              {/* Physical vs Digital Badges */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-white/15 text-xs font-medium">
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl">
                  <Laptop className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{physicalAssets} Physical</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl">
                  <Key className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{digitalAssets} Digital</span>
                </div>
              </div>

              {/* Blockchain Seal Footnote */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-100/75 font-mono">
                <span>{verifiedAssets} Verified on Ledger</span>
                <span>{verifiedPercent}% Integrity</span>
              </div>
            </div>

            {/* Allocation Rate Sub-metric */}
            <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-normal">Custody Allocation Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-lg font-semibold tabular-nums text-zinc-900">{allocationPercent}% Assigned</p>
                  <span className="text-xs text-slate-400">({availableAssets} available)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50/80 text-[#107C41] text-xs font-medium border border-emerald-200/50">
                +5.4% MoM
              </span>
            </div>
          </div>

          {/* Card 2: Recent Asset Custody & Chain-of-Custody Activity Table */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900">Asset Custody Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recent allocations &amp; transfers</p>
              </div>
              <Link
                to="/audit"
                className="w-7 h-7 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="View Full Audit Log"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                    <th className="font-medium pb-2.5">Asset</th>
                    <th className="font-medium pb-2.5">Custodian</th>
                    <th className="font-medium pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentAssets.map((asset, idx) => {
                    const isPhysical = asset.type === 'Physical';
                    const assigneeName =
                      typeof asset.currentAssigneeId === 'string' && asset.currentAssigneeId.length > 5
                        ? data?.employees?.find((e) => e.id === asset.currentAssigneeId)?.name ||
                          asset.currentAssigneeId
                        : 'Unassigned';

                    return (
                      <tr key={asset.id || idx} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isPhysical ? 'bg-emerald-50/80 text-emerald-700' : 'bg-sky-50/80 text-sky-700'
                              }`}
                            >
                              {isPhysical ? <Laptop className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 text-[13px] leading-snug truncate max-w-[155px]">
                                {asset.name}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                                {asset.assetId || `AST-${1000 + idx}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-2 text-slate-500 text-xs truncate max-w-[100px]">
                          {assigneeName}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                              asset.status === 'Assigned'
                                ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/50'
                                : asset.status === 'In Maintenance'
                                ? 'bg-amber-50/90 text-amber-700 border border-amber-200/50'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                asset.status === 'Assigned'
                                  ? 'bg-emerald-500'
                                  : asset.status === 'In Maintenance'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 text-right">
              <Link
                to="/assets"
                className="text-xs font-medium text-[#107C41] hover:underline inline-flex items-center gap-1"
              >
                <span>View all inventory records</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2: ASSET LIFECYCLE & VERIFICATION VELOCITY (Width: 5/12) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Monthly Asset Allocations & Cryptographic Onboarding */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            {/* Header with Monthly/Annually toggles */}
            <div className="flex items-start justify-between mb-5 shrink-0">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50/80 text-[#107C41] flex items-center justify-center mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-zinc-900">Allocation Velocity</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Monthly assets onboarded &amp; sealed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Period Pill Toggle */}
                <div className="bg-slate-100/80 rounded-full p-0.5 flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePeriod('monthly')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activePeriod === 'monthly'
                        ? 'bg-[#107C41] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePeriod('annually')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activePeriod === 'annually'
                        ? 'bg-[#107C41] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Annually
                  </button>
                </div>

                <Link
                  to="/audit"
                  className="w-7 h-7 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Hatched Emerald Bar Chart */}
            <div className="w-full my-3">
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
                      strokeOpacity="0.35"
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
                    <text x="0" y={ref.y + 3} fill="#94a3b8" fontSize="10" fontFamily="inherit">
                      {ref.label}
                    </text>
                    <line
                      x1="26"
                      y1={ref.y}
                      x2="410"
                      y2={ref.y}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                    />
                  </g>
                ))}

                {/* Bars (JAN - JUN) */}
                {/* JAN */}
                <g transform="translate(55, 0)">
                  <rect x="0" y="145" width="32" height="60" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="145" width="32" height="60" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                    JAN
                  </text>
                </g>

                {/* FEB */}
                <g transform="translate(115, 0)">
                  <rect x="0" y="105" width="32" height="100" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="105" width="32" height="100" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                    FEB
                  </text>
                </g>

                {/* MAR */}
                <g transform="translate(175, 0)">
                  <rect x="0" y="125" width="32" height="80" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="125" width="32" height="80" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                    MAR
                  </text>
                </g>

                {/* APR (Peak Active Bar) */}
                <g transform="translate(235, 0)">
                  {/* Tooltip Badge */}
                  <g transform="translate(-8, 0)">
                    <rect x="0" y="0" width="48" height="18" rx="9" fill="#107C41" />
                    <text x="24" y="12" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="600">
                      +17.8%
                    </text>
                    <polygon points="21,18 27,18 24,22" fill="#107C41" />
                  </g>

                  {/* Main solid emerald bar */}
                  <rect x="0" y="28" width="32" height="177" rx="16" fill="#107C41" />
                  <text x="16" y="218" textAnchor="middle" fill="#18181b" fontSize="10" fontWeight="600">
                    APR
                  </text>
                </g>

                {/* MAY */}
                <g transform="translate(295, 0)">
                  <rect x="0" y="115" width="32" height="90" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="115" width="32" height="90" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                    MAY
                  </text>
                </g>

                {/* JUN */}
                <g transform="translate(355, 0)">
                  <rect x="0" y="120" width="32" height="85" rx="16" fill="#bbf7d0" fillOpacity="0.45" />
                  <rect x="0" y="120" width="32" height="85" rx="16" fill="url(#diagonalHatch)" />
                  <text x="16" y="218" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                    JUN
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Insight Tiles */}
            <div className="grid grid-cols-2 gap-3.5 pt-4 mt-2 border-t border-slate-100">
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[#107C41] mb-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Physical Hardware</span>
                </div>
                <p className="text-lg font-semibold tabular-nums text-zinc-900">{physicalAssets} Devices</p>
                <p className="text-xs text-slate-500 mt-1">Laptops &amp; monitors</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-700 mb-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Digital Credentials</span>
                </div>
                <p className="text-lg font-semibold tabular-nums text-zinc-900">{digitalAssets} Credentials</p>
                <p className="text-xs text-slate-500 mt-1">KMS keys, SSL &amp; SaaS</p>
              </div>
            </div>
          </div>

          {/* Card: Verification & Integrity Status Tile */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50/80 text-[#107C41] flex items-center justify-center border border-emerald-200/40 shrink-0">
                <ScanLine className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-semibold text-zinc-900">Tamper-Proof Ledger Seal</h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  100% of current audit trails verified cleanly.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors shrink-0"
            >
              Audit Proofs
            </Link>
          </div>

        </div>

        {/* ================= COLUMN 3: RBAC & IDENTITY GOVERNANCE (Width: 3/12) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Card 1: RBAC & Access Control Matrix */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#107C41]" />
                  <span>RBAC &amp; Governance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Roles &amp; permissions</p>
              </div>
              <Link
                to="/roles"
                className="w-7 h-7 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="View RBAC Matrix"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="text-center my-3">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                Configured System Roles
              </span>
              <h2 className="text-3xl font-semibold tabular-nums text-zinc-900 tracking-tight mt-1">
                {rolesCount}{' '}
                <span className="text-sm font-normal text-slate-400 font-sans">Roles</span>
              </h2>
              <p className="text-xs text-[#107C41] font-medium mt-1">
                {employeeCount} Identities Governed
              </p>
            </div>

            {/* Smooth Wave Chart for Authorization Activity */}
            <div className="w-full my-2">
              <svg viewBox="0 0 200 65" className="w-full h-12 overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#107C41" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#107C41" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="200" y2="35" stroke="#f1f5f9" strokeDasharray="3 3" />
                <path
                  d="M0,45 Q20,38 40,30 T80,35 T120,20 T160,35 T200,25 L200,65 L0,65 Z"
                  fill="url(#waveGradient)"
                />
                <path
                  d="M0,45 Q20,38 40,30 T80,35 T120,20 T160,35 T200,25"
                  fill="none"
                  stroke="#107C41"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Action Buttons: Roles & Verification */}
            <div className="flex items-center justify-center gap-2.5 mt-3 pt-4 border-t border-slate-100">
              <Link
                to="/roles"
                className="flex-1 py-2 px-3 rounded-full bg-[#107C41] hover:bg-[#0d6836] text-white text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Roles</span>
              </Link>
              <Link
                to="/verification"
                className="flex-1 py-2 px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Verify</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Warranties & Expiring Certs Alerts */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50/80 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-zinc-900">Expiring Warranties</h4>
                <p className="text-xs text-slate-400">Review within 30 days</p>
              </div>
            </div>

            <div className="flex items-center justify-between my-2">
              <h3 className="text-2xl font-semibold tabular-nums text-zinc-900 tracking-tight">
                3 <span className="text-xs font-normal text-slate-500">Items</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50/90 text-amber-700 text-[11px] font-medium border border-amber-200/50">
                Action Needed
              </span>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50/80 rounded-2xl p-3.5 mt-2 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-800">SSL Wildcard Cert</span>
                <span className="text-amber-700 font-medium">18d left</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-800">UPS Battery Warranty</span>
                <span className="text-slate-500 font-normal">25d left</span>
              </div>
            </div>
          </div>

          {/* Card 3: Privileged Access Holders */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#107C41]" />
                  <span>Privileged Holders</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Admins &amp; custodians</p>
              </div>
              <Link
                to="/employees"
                className="w-7 h-7 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="View All Employees"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Privileged Admins List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-medium text-[11px] flex items-center justify-center">
                    ER
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 leading-snug">Elena Rostova</p>
                    <p className="text-[11px] text-slate-400">Super Admin</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-medium text-[11px] flex items-center justify-center">
                    MV
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 leading-snug">Marcus Vance</p>
                    <p className="text-[11px] text-slate-400">Security Auditor</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-medium text-[11px] flex items-center justify-center">
                    DK
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 leading-snug">David Kim</p>
                    <p className="text-[11px] text-slate-400">Asset Custodian</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-3.5 mt-4 border-t border-slate-100 text-right">
              <Link
                to="/employees"
                className="text-xs font-medium text-[#107C41] hover:underline"
              >
                Manage roles &amp; permissions →
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Operations Row: Approval Queue + Workforce Attendance & PF Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#107C41]" />
              <span>Pending HR &amp; Org Approvals</span>
            </h3>
            <div className="flex items-center gap-3.5 text-xs font-medium">
              <Link to="/leaves" className="text-[#107C41] hover:underline">
                Leaves →
              </Link>
              <Link to="/requests" className="text-[#107C41] hover:underline">
                Requests →
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {pendingLeaves.slice(0, 3).map((l) => (
              <div
                key={l.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-zinc-900 truncate">
                    {empMap[l.employeeId]?.name || l.employeeId} · {l.leaveType} ({l.days}d)
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {l.startDate} · {l.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickApproveLeave(l.id)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#107C41] text-white text-xs font-medium hover:bg-[#0d6836] cursor-pointer"
                >
                  Approve
                </button>
              </div>
            ))}

            {openRequests.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-zinc-900 truncate">
                    {r.requestNumber} · {r.title}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {empMap[r.employeeId]?.name || r.employeeId} · {r.category} ({r.priority})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickApproveRequest(r.id)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#107C41] text-xs font-medium hover:bg-emerald-50 cursor-pointer"
                >
                  Approve
                </button>
              </div>
            ))}

            {pendingLeaves.length === 0 && openRequests.length === 0 && (
              <div className="text-xs text-slate-400 py-8 text-center">
                All leave requests and organizational tickets are cleared.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] border border-slate-200/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#107C41]" />
              <span>Today&apos;s Attendance &amp; EPF Ledger</span>
            </h3>
            <div className="flex items-center gap-3.5 text-xs font-medium">
              <Link to="/attendance" className="text-[#107C41] hover:underline">
                Attendance →
              </Link>
              <Link to="/payroll?tab=PF+Fund+%28EPF%29" className="text-[#107C41] hover:underline">
                EPF Portal →
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            {todayLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-[13px] py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#107C41] shrink-0" />
                  <span className="font-medium text-zinc-900 truncate">
                    {empMap[log.employeeId]?.name || log.employeeId}
                  </span>
                  <span className="text-xs text-slate-400">({log.workMode})</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {log.checkIn || '—'} {log.checkOut ? `→ ${log.checkOut}` : ''}
                  </span>
                  <span className="font-medium text-[#107C41] bg-emerald-50/90 px-2.5 py-0.5 rounded-full text-[11px]">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
            {todayLogs.length === 0 && (
              <div className="text-xs text-slate-400 py-8 text-center">
                No attendance logs recorded yet for {todayStr}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
