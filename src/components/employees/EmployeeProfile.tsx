import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import type {
  Employee,
  Asset,
  Identity,
  OrganisationUnit,
  AuditEvent,
  AttendanceRecord,
  LeaveRequest,
  SalarySlip,
  BonusRecord,
  PFTransaction,
  OrgRequest,
} from '@/types';
import { Panel, Details, Tabs, QueryState } from '@/components/ui/Page';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { AssetCard } from '@/components/assets/AssetCard';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { SalarySlipModal } from '@/components/payroll/SalarySlipModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { unitPath } from '@/utils/buildTree';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency, formatMonthLabel } from '@/utils/formatCurrency';
import { can } from '@/utils/permissions';
import { IntegrityService } from '@/services/IntegrityService';
import { AttendanceService } from '@/services/AttendanceService';
import { LeaveService } from '@/services/LeaveService';
import { PayrollService } from '@/services/PayrollService';
import { RequestService } from '@/services/RequestService';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';

function IdentityActions({ employee, identity: _identity }: { employee: Employee; identity: Identity }) {
  const [anchoring, setAnchoring] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useNotifications();

  const doAnchor = async () => {
    setAnchoring(true);
    try {
      await IntegrityService.anchorIdentity(employee.id);
      toast('Cryptographic identity seal issued and verified successfully!');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setAnchoring(false);
    }
  };

  const doVerify = async () => {
    setVerifying(true);
    try {
      const res = (await IntegrityService.verifyIdentity(employee.id)) as {
        verified?: boolean;
        data?: { verified?: boolean; blockchain_verified?: boolean };
      };
      const verified = Boolean(res.data?.verified ?? res.data?.blockchain_verified ?? res.verified);
      toast(
        verified
          ? 'Canonical SHA-256 digest matches identity seal!'
          : 'Integrity discrepancy detected! Record does not match registered seal.',
        verified ? 'success' : 'error'
      );
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="inline" style={{ marginTop: 25, gap: 12 }}>
      <Button disabled={anchoring} onClick={doAnchor}>
        {anchoring ? 'Issuing...' : 'Issue Cryptographic Seal'}
      </Button>
      <Button variant="outline" disabled={verifying} onClick={doVerify}>
        {verifying ? 'Verifying...' : 'Verify Cryptographic Seal'}
      </Button>
    </div>
  );
}

export function EmployeeProfile({
  employee,
  assets,
  identity,
  units,
  audit,
  manager,
  roleName,
}: {
  employee: Employee;
  assets: Asset[];
  identity: Identity;
  units: OrganisationUnit[];
  audit: AuditEvent[];
  manager?: string;
  roleName: string;
}) {
  const [params, setParams] = useSearchParams();
  const { organisation, permissions } = useSession();
  const { toast } = useNotifications();
  const [activeSlip, setActiveSlip] = useState<SalarySlip | null>(null);
  const canManagePayroll =
    can(permissions, 'payroll', 'manage') || can(permissions, 'employees', 'manage');

  const tabs = [
    'Overview',
    'Attendance',
    'Leaves & Balance',
    'Payroll & PF',
    'Requests',
    'Organisation',
    'Assigned Assets',
    'Identity',
    'Activity',
  ];
  const tab = tabs.includes(params.get('tab') || '') ? params.get('tab')! : 'Overview';

  const hrQuery = useQuery(async () => {
    const [attendance, leaves, payroll, requests] = await Promise.all([
      AttendanceService.list({ employeeId: employee.id }),
      LeaveService.list({ employeeId: employee.id }),
      PayrollService.list({ employeeId: employee.id }),
      RequestService.list({ employeeId: employee.id }),
    ]);
    return { attendance, leaves, payroll, requests };
  }, employee.id);

  const hr = hrQuery.data;
  const leaveBal = hr?.leaves.balances.find((b) => b.employeeId === employee.id);
  const structure = hr?.payroll.structures.find((s) => s.employeeId === employee.id);
  const pfAccount = hr?.payroll.pfAccounts.find((a) => a.employeeId === employee.id);

  const handleMarkPaid = async (slipId: string) => {
    try {
      const updated = await PayrollService.markSlipPaid(slipId);
      setActiveSlip(updated);
      toast('Salary slip marked Paid and PF posted');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <>
      <Tabs tabs={tabs} active={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} />
      {tab === 'Overview' && (
        <Panel title="Employee information">
          <div className="panel-body">
            <Details
              items={[
                ['Employee ID', employee.employeeId],
                ['Full name', employee.name],
                ['Email', employee.email],
                ['Designation', employee.designation],
                ['Role', roleName],
                ['Status', <Badge key="emp-st">{employee.status}</Badge>],
                ['Identity status', <Badge key="id-st">{employee.identityStatus}</Badge>],
                ['Joined', formatDate(employee.createdAt)],
              ]}
            />
          </div>
        </Panel>
      )}
      {tab === 'Organisation' && (
        <Panel title="Organisation and reporting">
          <div className="panel-body">
            <Details
              items={[
                ['Organisation path', unitPath(units, employee.organisationUnitId).map((u) => u.name).join(' / ')],
                ['Current unit', <Link key="u-link" to={'/organisation/' + employee.organisationUnitId}>{units.find((u) => u.id === employee.organisationUnitId)?.name}</Link>],
                ['Reporting manager', manager || 'No reporting manager'],
                ['Designation', employee.designation],
              ]}
            />
          </div>
        </Panel>
      )}
      {tab === 'Assigned Assets' && (
        <Panel title="Assigned assets" description={assets.length + ' assets currently assigned'}>
          <div className="panel-body">
            {assets.length ? (
              <div className="cards-grid">
                {assets.map((a) => (
                  <AssetCard key={a.id} asset={a} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No assets assigned"
                description="Assets assigned to this employee will appear here."
                action={<Link className="btn btn-outline" to="/assets">Browse assets</Link>}
              />
            )}
          </div>
        </Panel>
      )}
      {tab === 'Identity' && (
        <Panel title="Identity details" description="Cryptographic identity credentials and DID">
          <div className="panel-body">
            <Details
              items={[
                ['Identity ID', identity.id],
                ['Decentralized identifier (DID)', <span key="did" className="mono">{identity.did}</span>],
                ['Seal status', <Badge key="st">{identity.status}</Badge>],
                ['Last verified', formatDate(identity.verifiedAt)],
                ['Employee reference', employee.employeeId],
              ]}
            />
            <IdentityActions employee={employee} identity={identity} />
          </div>
        </Panel>
      )}
      {tab === 'Attendance' && (
        <QueryState query={hrQuery}>
          {hr && (
            <Panel
              title="Attendance History"
              actions={
                <Link className="btn btn-outline" to="/attendance">
                  Open Attendance
                </Link>
              }
            >
              <div className="panel-body pb-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                    <span className="text-xs font-medium text-slate-500">
                      Present / WFH
                    </span>
                    <p className="text-xl font-semibold tabular-nums text-[#107C41] mt-1">
                      {
                        hr.attendance.filter(
                          (r) => r.status === 'Present' || r.status === 'WFH'
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                    <span className="text-xs font-medium text-slate-500">
                      Late Logs
                    </span>
                    <p className="text-xl font-semibold tabular-nums text-amber-600 mt-1">
                      {hr.attendance.filter((r) => r.status === 'Late').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                    <span className="text-xs font-medium text-slate-500">
                      Leave Days
                    </span>
                    <p className="text-xl font-semibold tabular-nums text-zinc-800 mt-1">
                      {hr.attendance.filter((r) => r.status === 'On Leave').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                    <span className="text-xs font-medium text-slate-500">
                      Logged Records
                    </span>
                    <p className="text-xl font-semibold tabular-nums text-zinc-900 mt-1">{hr.attendance.length}</p>
                  </div>
                </div>
              </div>
              <Table<AttendanceRecord>
                caption="Employee attendance logs"
                rows={hr.attendance}
                columns={[
                  { key: 'date', title: 'Date', render: (r) => formatDate(r.date) },
                  { key: 'mode', title: 'Mode', render: (r) => r.workMode },
                  { key: 'in', title: 'Check In', render: (r) => r.checkIn || '—' },
                  { key: 'out', title: 'Check Out', render: (r) => r.checkOut || '—' },
                  {
                    key: 'hours',
                    title: 'Hours',
                    render: (r) => (r.workHours ? `${r.workHours}h` : '—'),
                  },
                  { key: 'status', title: 'Status', render: (r) => <Badge>{r.status}</Badge> },
                  { key: 'notes', title: 'Notes', render: (r) => r.notes || r.location || '—' },
                ]}
              />
            </Panel>
          )}
        </QueryState>
      )}

      {tab === 'Leaves & Balance' && (
        <QueryState query={hrQuery}>
          {hr && (
            <div className="space-y-5">
              {leaveBal && (
                <Panel
                  title={`${leaveBal.year} Leave Quota`}
                  actions={
                    <Link className="btn btn-outline" to="/leaves">
                      Manage Leaves
                    </Link>
                  }
                >
                  <div className="panel-body">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                        <span className="text-xs font-medium text-slate-500">
                          Paid Leave
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-zinc-900 mt-1">
                          {Math.max(0, leaveBal.paidTotal - leaveBal.paidUsed)} /{' '}
                          {leaveBal.paidTotal}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">
                          Sick Leave
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-zinc-900 mt-1">
                          {Math.max(0, leaveBal.sickTotal - leaveBal.sickUsed)} /{' '}
                          {leaveBal.sickTotal}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">
                          Casual
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-zinc-900 mt-1">
                          {Math.max(0, leaveBal.casualTotal - leaveBal.casualUsed)} /{' '}
                          {leaveBal.casualTotal}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">
                          Privilege
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-zinc-900 mt-1">
                          {Math.max(0, leaveBal.privilegeTotal - leaveBal.privilegeUsed)} /{' '}
                          {leaveBal.privilegeTotal}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">
                          Comp Off
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-[#107C41] mt-1">{leaveBal.compOff}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
                        <span className="text-xs font-medium text-slate-500">
                          Unpaid LOP
                        </span>
                        <p className="text-lg font-semibold tabular-nums text-rose-600 mt-1">
                          {leaveBal.unpaidTaken}d
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}

              <Panel title="Leave Applications">
                <Table<LeaveRequest>
                  caption="Employee leave applications"
                  rows={hr.leaves.requests}
                  columns={[
                    {
                      key: 'type',
                      title: 'Leave Type',
                      render: (r) => <Badge>{r.leaveType}</Badge>,
                    },
                    {
                      key: 'period',
                      title: 'Period',
                      render: (r) =>
                        `${formatDate(r.startDate)}${r.endDate !== r.startDate ? ` → ${formatDate(r.endDate)}` : ''}`,
                    },
                    {
                      key: 'days',
                      title: 'Days & Pay',
                      render: (r) => `${r.days}d (${r.isPaid ? 'Paid' : 'Unpaid LOP'})`,
                    },
                    { key: 'reason', title: 'Reason', render: (r) => r.reason },
                    { key: 'status', title: 'Status', render: (r) => <Badge>{r.status}</Badge> },
                  ]}
                />
              </Panel>
            </div>
          )}
        </QueryState>
      )}

      {tab === 'Payroll & PF' && (
        <QueryState query={hrQuery}>
          {hr && (
            <div className="space-y-5">
              <div className="dashboard-grid">
                {structure && (
                  <Panel
                    title="Compensation Structure"
                    actions={
                      <Link className="btn btn-outline" to="/payroll?tab=Salary+Structures">
                        Open Payroll
                      </Link>
                    }
                  >
                    <div className="panel-body">
                      <Details
                        items={[
                          ['Annual CTC', formatCurrency(structure.annualCtc)],
                          ['Monthly Basic', formatCurrency(structure.basicMonthly)],
                          ['Monthly HRA', formatCurrency(structure.hraMonthly)],
                          [
                            'Special + Conveyance',
                            formatCurrency(
                              structure.specialAllowanceMonthly + structure.conveyanceMonthly
                            ),
                          ],
                          [
                            'Employee / Employer PF',
                            `${formatCurrency(structure.employeePfMonthly)} / ${formatCurrency(structure.employerPfMonthly)}`,
                          ],
                          [
                            'Bank Account',
                            `${structure.bankName} (••••${structure.bankAccountLast4})`,
                          ],
                          ['PAN', <span key="pan" className="mono">{structure.panNumber}</span>],
                        ]}
                      />
                    </div>
                  </Panel>
                )}

                {pfAccount && (
                  <Panel
                    title="EPF (Provident Fund) Account"
                    actions={
                      <Link className="btn btn-outline" to="/payroll?tab=PF+Fund+%28EPF%29">
                        PF Portal
                      </Link>
                    }
                  >
                    <div className="panel-body">
                      <Details
                        items={[
                          ['Total PF Corpus', <strong key="bal" className="text-[#107C41]">{formatCurrency(pfAccount.totalBalance)}</strong>],
                          ['UAN Number', <span key="uan" className="mono">{pfAccount.uan}</span>],
                          ['PF Account #', <span key="pfno" className="mono">{pfAccount.pfAccountNumber}</span>],
                          [
                            'Employee / Employer Total',
                            `${formatCurrency(pfAccount.employeeShareTotal)} / ${formatCurrency(pfAccount.employerShareTotal)}`,
                          ],
                          ['Monthly VPF', formatCurrency(pfAccount.vpfMonthly)],
                          [
                            `YTD Interest (${pfAccount.interestRate}%)`,
                            formatCurrency(pfAccount.interestAccruedYtd),
                          ],
                          ['Nominee', pfAccount.nomineeName],
                          ['KYC Status', <Badge key="kyc">{pfAccount.kycStatus}</Badge>],
                        ]}
                      />
                    </div>
                  </Panel>
                )}
              </div>

              <Panel title="Salary Slips">
                <Table<SalarySlip>
                  caption="Employee monthly salary slips"
                  rows={hr.payroll.slips}
                  columns={[
                    { key: 'slip', title: 'Slip #', render: (s) => <span className="mono">{s.slipNumber}</span> },
                    { key: 'month', title: 'Period', render: (s) => s.monthLabel },
                    { key: 'gross', title: 'Gross', render: (s) => formatCurrency(s.grossEarnings) },
                    { key: 'bonus', title: 'Bonus', render: (s) => formatCurrency(s.bonusAmount) },
                    {
                      key: 'ded',
                      title: 'Deductions',
                      render: (s) => formatCurrency(s.totalDeductions),
                    },
                    {
                      key: 'net',
                      title: 'Net Pay',
                      render: (s) => <strong className="text-[#107C41]">{formatCurrency(s.netPay)}</strong>,
                    },
                    { key: 'status', title: 'Status', render: (s) => <Badge>{s.status}</Badge> },
                    {
                      key: 'actions',
                      title: 'Payslip',
                      render: (s) => (
                        <Button variant="outline" onClick={() => setActiveSlip(s)}>
                          <Eye size={14} /> View Slip
                        </Button>
                      ),
                    },
                  ]}
                />
              </Panel>

              <div className="dashboard-grid">
                <Panel title="Bonuses & Appraisals">
                  <Table<BonusRecord>
                    caption="Employee bonus history"
                    pageSize={5}
                    rows={hr.payroll.bonuses}
                    columns={[
                      { key: 'type', title: 'Bonus Type', render: (b) => <Badge>{b.bonusType}</Badge> },
                      { key: 'month', title: 'Month', render: (b) => formatMonthLabel(b.payoutMonth) },
                      {
                        key: 'amount',
                        title: 'Amount',
                        render: (b) => <strong className="text-[#107C41]">{formatCurrency(b.amount)}</strong>,
                      },
                      { key: 'status', title: 'Status', render: (b) => <Badge>{b.status}</Badge> },
                    ]}
                  />
                </Panel>

                <Panel title="PF Passbook Entries">
                  <Table<PFTransaction>
                    caption="Employee PF passbook"
                    pageSize={5}
                    rows={hr.payroll.pfTransactions}
                    columns={[
                      { key: 'month', title: 'Month', render: (t) => formatMonthLabel(t.month) },
                      { key: 'type', title: 'Type', render: (t) => <Badge>{t.type}</Badge> },
                      {
                        key: 'total',
                        title: 'Contribution',
                        render: (t) => (
                          <strong className={t.totalAmount < 0 ? 'text-rose-600' : 'text-[#107C41]'}>
                            {t.totalAmount >= 0 ? '+' : ''}
                            {formatCurrency(t.totalAmount)}
                          </strong>
                        ),
                      },
                      {
                        key: 'bal',
                        title: 'Balance',
                        render: (t) => formatCurrency(t.balanceAfter),
                      },
                    ]}
                  />
                </Panel>
              </div>
            </div>
          )}
        </QueryState>
      )}

      {tab === 'Requests' && (
        <QueryState query={hrQuery}>
          {hr && (
            <Panel
              title="Employee Requests"
              actions={
                <Link className="btn btn-outline" to="/requests">
                  Open Requests Hub
                </Link>
              }
            >
              <Table<OrgRequest>
                caption="Employee organization requests"
                rows={hr.requests}
                columns={[
                  { key: 'num', title: 'Req #', render: (r) => <span className="mono">{r.requestNumber}</span> },
                  { key: 'cat', title: 'Category', render: (r) => r.category },
                  { key: 'title', title: 'Title', render: (r) => r.title },
                  {
                    key: 'amt',
                    title: 'Amount',
                    render: (r) => (r.amount ? formatCurrency(r.amount) : '—'),
                  },
                  { key: 'prio', title: 'Priority', render: (r) => r.priority },
                  { key: 'status', title: 'Status', render: (r) => <Badge>{r.status}</Badge> },
                ]}
              />
            </Panel>
          )}
        </QueryState>
      )}

      {tab === 'Activity' && (
        <Panel title="Employee activity">
          <AuditTimeline events={audit} />
        </Panel>
      )}

      {activeSlip && (
        <SalarySlipModal
          slip={activeSlip}
          employee={employee}
          organisation={organisation}
          structure={structure}
          pfAccount={pfAccount}
          canManage={canManagePayroll}
          onMarkPaid={handleMarkPaid}
          onClose={() => setActiveSlip(null)}
        />
      )}
    </>
  );
}
