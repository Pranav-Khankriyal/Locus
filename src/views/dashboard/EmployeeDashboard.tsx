import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Network,
  ArrowUpRight,
  Clock,
  LogIn,
  LogOut,
  Umbrella,
  IndianRupee,
  PiggyBank,
  ClipboardList,
  Eye,
} from 'lucide-react';
import type { SalarySlip, WorkMode } from '@/types';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@/hooks/useQuery';
import { useNotifications } from '@/hooks/useNotifications';
import { AssetService } from '@/services/AssetService';
import { OrganisationService } from '@/services/OrganisationService';
import { AuditService } from '@/services/AuditService';
import { AttendanceService } from '@/services/AttendanceService';
import { LeaveService } from '@/services/LeaveService';
import { PayrollService } from '@/services/PayrollService';
import { RequestService } from '@/services/RequestService';
import { AssetCard } from '@/components/assets/AssetCard';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { SalarySlipModal } from '@/components/payroll/SalarySlipModal';
import { PageHeading, Panel, QueryState } from '@/components/ui/Page';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { unitPath } from '@/utils/buildTree';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export default function EmployeeDashboard() {
  const { user, organisation, role } = useSession();
  const { toast } = useNotifications();
  const [workMode, setWorkMode] = useState<WorkMode>('Office');
  const [clockBusy, setClockBusy] = useState(false);
  const [activeSlip, setActiveSlip] = useState<SalarySlip | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const query = useQuery(async () => {
    const empId = user!.id;
    const [assets, units, audit, attendance, leaves, payroll, requests] = await Promise.all([
      AssetService.list({ assigneeId: empId }),
      OrganisationService.list(),
      AuditService.personal(empId),
      AttendanceService.list({ employeeId: empId }),
      LeaveService.list({ employeeId: empId }),
      PayrollService.list({ employeeId: empId }),
      RequestService.list({ employeeId: empId }),
    ]);
    return { assets, units, audit, attendance, leaves, payroll, requests };
  }, user?.id);

  const d = query.data;
  const myToday = d?.attendance.find((a) => a.date === todayStr);
  const myBal = d?.leaves.balances[0];
  const paidLeft = myBal
    ? Math.max(0, myBal.paidTotal - myBal.paidUsed) +
      Math.max(0, myBal.sickTotal - myBal.sickUsed) +
      Math.max(0, myBal.casualTotal - myBal.casualUsed) +
      Math.max(0, myBal.privilegeTotal - myBal.privilegeUsed) +
      myBal.compOff
    : 0;
  const latestSlip = d?.payroll.slips[0];
  const myStruct = d?.payroll.structures[0];
  const myPF = d?.payroll.pfAccounts[0];
  const openReqs = (d?.requests || []).filter(
    (r) => r.status === 'Pending' || r.status === 'In Review'
  ).length;

  const handleClock = async (action: 'in' | 'out') => {
    if (!user?.id) return;
    setClockBusy(true);
    try {
      if (action === 'in') {
        await AttendanceService.clockIn(user.id, workMode);
        toast(`Checked in (${workMode})`);
      } else {
        await AttendanceService.clockOut(user.id);
        toast('Checked out for today');
      }
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setClockBusy(false);
    }
  };

  return (
    <>
      <PageHeading title={'Welcome back, ' + (user?.name?.split(' ')[0] || 'Team Member')} />
      <QueryState query={query}>
        {d && (
          <>
            {/* Quick Check-In / Out Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="w-11 h-11 rounded-2xl bg-emerald-50/80 text-[#107C41] border border-emerald-200/50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[15px] font-semibold text-zinc-900">
                      Today · {formatDate(todayStr)}
                    </h2>
                    {myToday && <Badge>{myToday.status}</Badge>}
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5 tabular-nums">
                    In: <span className="font-medium text-zinc-800">{myToday?.checkIn || 'Not checked in'}</span>
                    {' · '}
                    Out: <span className="font-medium text-zinc-800">{myToday?.checkOut || '—'}</span>
                    {myToday?.workHours ? ` · ${myToday.workHours} hrs` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {!myToday?.checkIn && (
                  <>
                    <div className="bg-slate-100/80 rounded-full p-1 flex items-center text-xs">
                      {(['Office', 'Remote', 'Hybrid'] as WorkMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setWorkMode(m)}
                          className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
                            workMode === m ? 'bg-white text-zinc-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <Button disabled={clockBusy} onClick={() => handleClock('in')}>
                      <LogIn size={15} /> Check In
                    </Button>
                  </>
                )}
                {myToday?.checkIn && !myToday?.checkOut && (
                  <Button variant="outline" disabled={clockBusy} onClick={() => handleClock('out')}>
                    <LogOut size={15} /> Check Out
                  </Button>
                )}
                <Link className="btn btn-ghost" to="/attendance">
                  Attendance Log <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Personal HR & Payroll Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[12.5px] font-medium">
                    Paid Leave Balance
                  </span>
                  <Umbrella className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">{paidLeft} days</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{myBal?.unpaidTaken || 0} LOP taken</span>
                  <Link to="/leaves" className="text-[#107C41] font-medium hover:underline">
                    Apply →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[12.5px] font-medium">
                    Latest Net Salary
                  </span>
                  <IndianRupee className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-[#107C41] mt-2">
                  {latestSlip ? formatCurrency(latestSlip.netPay) : '—'}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{latestSlip?.monthLabel || 'No slips'}</span>
                  {latestSlip && (
                    <button
                      type="button"
                      onClick={() => setActiveSlip(latestSlip)}
                      className="inline-flex items-center gap-1 text-[#107C41] font-medium hover:underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View Slip
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[12.5px] font-medium">
                    EPF Corpus
                  </span>
                  <PiggyBank className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">
                  {myPF ? formatCurrency(myPF.totalBalance) : '—'}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">
                    {myPF ? `UAN ${myPF.uan.slice(-4)}` : ''}
                  </span>
                  <Link
                    to="/payroll?tab=PF+Fund+%28EPF%29"
                    className="text-[#107C41] font-medium hover:underline"
                  >
                    Passbook →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[12.5px] font-medium">
                    Requests &amp; Claims
                  </span>
                  <ClipboardList className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">{openReqs} open</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{d.requests.length} total filed</span>
                  <Link to="/requests" className="text-[#107C41] font-medium hover:underline">
                    Raise Ticket →
                  </Link>
                </div>
              </div>
            </div>

            {/* Identity & Organisation */}
            <div className="dashboard-grid">
              <Panel title="My identity">
                <div className="panel-body">
                  <span className="asset-icon">
                    <ShieldCheck />
                  </span>
                  <h3>{user?.name}</h3>
                  <p className="subtle">{role?.name}</p>
                  <Badge>{user?.identityStatus}</Badge>
                  <p>
                    <Link className="text-link" to={'/employees/' + user?.id + '?tab=Identity'}>
                      View identity <ArrowUpRight size={15} />
                    </Link>
                  </p>
                </div>
              </Panel>
              <Panel title="My organisation">
                <div className="panel-body">
                  <span className="asset-icon">
                    <Network />
                  </span>
                  <h3>
                    {d.units.find((u) => u.id === user?.organisationUnitId)?.name}
                  </h3>
                  <p className="subtle">
                    {unitPath(d.units, user!.organisationUnitId)
                      .map((u) => u.name)
                      .join(' / ')}
                  </p>
                  <Link className="text-link" to={'/organisation/' + user?.organisationUnitId}>
                    Explore my team <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Panel>
            </div>

            <Panel title="My assets">
              <div className="panel-body">
                {d.assets.length ? (
                  <div className="cards-grid">
                    {d.assets.map((a) => (
                      <AssetCard key={a.id} asset={a} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No assets assigned yet"
                    description="Your assigned equipment and software will appear here."
                    action={
                      <Link to={'/employees/' + user?.id} className="btn btn-outline">
                        View my profile
                      </Link>
                    }
                  />
                )}
              </div>
            </Panel>

            <Panel title="Recent activity">
              <AuditTimeline events={d.audit.slice(0, 10)} />
            </Panel>

            {activeSlip && user && (
              <SalarySlipModal
                slip={activeSlip}
                employee={user}
                organisation={organisation}
                structure={myStruct}
                pfAccount={myPF}
                canManage={false}
                onClose={() => setActiveSlip(null)}
              />
            )}
          </>
        )}
      </QueryState>
    </>
  );
}
