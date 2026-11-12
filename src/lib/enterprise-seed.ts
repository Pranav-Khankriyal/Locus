import { sha256Hex, generateSealRef } from './crypto-verification';

export interface LokusAttendanceRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'WFH' | 'On Leave';
  work_mode: 'Office' | 'Remote' | 'Hybrid';
  location: string;
  notes: string;
  updated_at: string;
}

export interface LokusLeaveBalance {
  employee_id: string;
  organization_id: string;
  year: number;
  paid_total: number;
  paid_used: number;
  sick_total: number;
  sick_used: number;
  casual_total: number;
  casual_used: number;
  privilege_total: number;
  privilege_used: number;
  comp_off: number;
  unpaid_taken: number;
}

export interface LokusLeaveRequest {
  id: string;
  organization_id: string;
  employee_id: string;
  leave_type: 'Paid Leave' | 'Sick Leave' | 'Casual Leave' | 'Privilege Leave' | 'Unpaid Leave' | 'Comp Off';
  start_date: string;
  end_date: string;
  days: number;
  is_paid: boolean;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

export interface LokusHoliday {
  id: string;
  organization_id: string;
  name: string;
  date: string;
  type: 'Public' | 'Company' | 'Optional';
}

export interface LokusSalaryStructure {
  id: string;
  organization_id: string;
  employee_id: string;
  currency: 'INR' | 'USD';
  annual_ctc: number;
  basic_monthly: number;
  hra_monthly: number;
  special_allowance_monthly: number;
  conveyance_monthly: number;
  employee_pf_monthly: number;
  employer_pf_monthly: number;
  professional_tax_monthly: number;
  tds_monthly: number;
  bank_name: string;
  bank_account_last4: string;
  pan_number: string;
  effective_from: string;
  updated_at: string;
}

export interface LokusSalarySlip {
  id: string;
  organization_id: string;
  slip_number: string;
  employee_id: string;
  month: string;
  month_label: string;
  working_days: number;
  paid_days: number;
  paid_leaves_used: number;
  lop_days: number;
  basic: number;
  hra: number;
  special_allowance: number;
  conveyance: number;
  bonus_amount: number;
  gross_earnings: number;
  employee_pf: number;
  employer_pf: number;
  professional_tax: number;
  tds: number;
  lop_deduction: number;
  total_deductions: number;
  net_pay: number;
  status: 'Draft' | 'Processed' | 'Paid';
  seal_ref: string;
  paid_at: string | null;
  generated_at: string;
}

export interface LokusBonusRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  bonus_type:
    | 'Performance Bonus'
    | 'Annual Appraisal'
    | 'Joining Bonus'
    | 'Spot Award'
    | 'Referral Bonus'
    | 'Festival Bonus';
  amount: number;
  payout_month: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Credited' | 'Cancelled';
  approved_by_id: string | null;
  created_at: string;
  credited_at: string | null;
}

export interface LokusPFAccount {
  id: string;
  organization_id: string;
  employee_id: string;
  uan: string;
  pf_account_number: string;
  total_balance: number;
  employee_share_total: number;
  employer_share_total: number;
  vpf_monthly: number;
  interest_rate: number;
  interest_accrued_ytd: number;
  kyc_status: 'Verified' | 'Pending';
  nominee_name: string;
  status: 'Active' | 'Settled';
  updated_at: string;
}

export interface LokusPFTransaction {
  id: string;
  organization_id: string;
  employee_id: string;
  month: string;
  type: 'Monthly Contribution' | 'VPF' | 'Interest Credit' | 'PF Advance';
  employee_contribution: number;
  employer_contribution: number;
  total_amount: number;
  balance_after: number;
  reference: string;
  created_at: string;
}

export interface LokusOrgRequest {
  id: string;
  organization_id: string;
  request_number: string;
  employee_id: string;
  category:
    | 'Asset Request'
    | 'Attendance Regularization'
    | 'Expense Reimbursement'
    | 'PF Advance / KYC'
    | 'Salary Advance / Bonus'
    | 'HR Document / NOC'
    | 'Access Elevation'
    | 'General';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  amount?: number;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  reviewed_by_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ENTERPRISE_PERMISSIONS = [
  { id: 'p-29', code: 'attendance.read', description: 'View attendance records' },
  { id: 'p-30', code: 'attendance.manage', description: 'Check-in, mark, and regularize attendance' },
  { id: 'p-31', code: 'leaves.read', description: 'View leaves and paid leave balances' },
  { id: 'p-32', code: 'leaves.manage', description: 'Apply, approve, and manage leave policies' },
  { id: 'p-33', code: 'payroll.read', description: 'View salary slips, bonuses, and PF passbooks' },
  { id: 'p-34', code: 'payroll.manage', description: 'Run payroll, manage structures, bonuses, and PF' },
  { id: 'p-35', code: 'requests.read', description: 'View organizational employee requests' },
  { id: 'p-36', code: 'requests.manage', description: 'Create, triage, and approve requests' },
];

export function computeSalaryBreakdownFromCTC(annualCtc: number) {
  const employerPfMonthly = Math.round((annualCtc * 0.5 / 12) * 0.12);
  const monthlyFixed = Math.round(annualCtc / 12) - employerPfMonthly;
  const basicMonthly = Math.round(monthlyFixed * 0.5);
  const hraMonthly = Math.round(basicMonthly * 0.4);
  const conveyanceMonthly = 3000;
  const specialAllowanceMonthly = Math.max(0, monthlyFixed - basicMonthly - hraMonthly - conveyanceMonthly);
  const employeePfMonthly = Math.round(basicMonthly * 0.12);
  const professionalTaxMonthly = 200;
  const tdsMonthly = annualCtc > 1500000 ? Math.round((annualCtc * 0.14) / 12) : Math.round((annualCtc * 0.06) / 12);

  return {
    basic_monthly: basicMonthly,
    hra_monthly: hraMonthly,
    conveyance_monthly: conveyanceMonthly,
    special_allowance_monthly: specialAllowanceMonthly,
    employee_pf_monthly: employeePfMonthly,
    employer_pf_monthly: employerPfMonthly,
    professional_tax_monthly: professionalTaxMonthly,
    tds_monthly: tdsMonthly,
  };
}

export function buildDefaultEmployeeHRData(
  emp: { id: string; organization_id: string; designation: string },
  index: number,
  now: string
) {
  const ctcMap: Record<string, number> = {
    'e-1': 4200000,
    'e-2': 3400000,
    'e-3': 2600000,
    'e-4': 2200000,
    'e-5': 1800000,
  };
  const annualCtc = ctcMap[emp.id] || 1400000 + (index % 4) * 300000;
  const parts = computeSalaryBreakdownFromCTC(annualCtc);
  const banks = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'SBI Corporate'];

  const leaveBalance: LokusLeaveBalance = {
    employee_id: emp.id,
    organization_id: emp.organization_id,
    year: 2026,
    paid_total: 18,
    paid_used: index % 4,
    sick_total: 10,
    sick_used: index % 2,
    casual_total: 8,
    casual_used: (index + 1) % 3,
    privilege_total: 12,
    privilege_used: 0,
    comp_off: index === 2 ? 2 : 0,
    unpaid_taken: 0,
  };

  const salaryStructure: LokusSalaryStructure = {
    id: `sal-${emp.id}`,
    organization_id: emp.organization_id,
    employee_id: emp.id,
    currency: 'INR',
    annual_ctc: annualCtc,
    ...parts,
    bank_name: banks[index % banks.length],
    bank_account_last4: `${4810 + index * 137}`.slice(-4),
    pan_number: `ABCDE${1234 + index}F`,
    effective_from: '2026-04-01',
    updated_at: now,
  };

  const monthsAccumulated = 18 + index * 6;
  const empShare = parts.employee_pf_monthly * monthsAccumulated;
  const erShare = parts.employer_pf_monthly * monthsAccumulated;
  const interestYtd = Math.round((empShare + erShare) * 0.0825 * 0.5);

  const pfAccount: LokusPFAccount = {
    id: `pf-${emp.id}`,
    organization_id: emp.organization_id,
    employee_id: emp.id,
    uan: `10148829${4410 + index * 29}`,
    pf_account_number: `MH/BAN/0048291/000/000${101 + index}`,
    total_balance: empShare + erShare + interestYtd,
    employee_share_total: empShare,
    employer_share_total: erShare,
    vpf_monthly: index === 0 ? 15000 : 0,
    interest_rate: 8.25,
    interest_accrued_ytd: interestYtd,
    kyc_status: 'Verified',
    nominee_name: index % 2 === 0 ? 'Spouse / Family Nominee' : 'Parent Nominee',
    status: 'Active',
    updated_at: now,
  };

  return { leaveBalance, salaryStructure, pfAccount };
}

function monthNameLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[(m - 1) % 12]} ${y}`;
}

export function createEnterpriseSeedForSchema(
  organizations: { id: string }[],
  employees: { id: string; organization_id: string; designation: string; first_name: string; last_name: string }[]
) {
  const now = new Date().toISOString();
  const orgId = organizations[0]?.id || '11111111-1111-1111-1111-111111111111';

  const holidays: LokusHoliday[] = [
    { id: 'hol-1', organization_id: orgId, name: 'Republic Day', date: '2026-01-26', type: 'Public' },
    { id: 'hol-2', organization_id: orgId, name: 'Holi Festival', date: '2026-03-04', type: 'Public' },
    { id: 'hol-3', organization_id: orgId, name: 'Independence Day', date: '2026-08-15', type: 'Public' },
    { id: 'hol-4', organization_id: orgId, name: 'Gandhi Jayanti', date: '2026-10-02', type: 'Public' },
    { id: 'hol-5', organization_id: orgId, name: 'Diwali / Deepavali', date: '2026-11-08', type: 'Public' },
    { id: 'hol-6', organization_id: orgId, name: 'Founders Day Wellness Off', date: '2026-11-20', type: 'Company' },
    { id: 'hol-7', organization_id: orgId, name: 'Christmas Day', date: '2026-12-25', type: 'Public' },
  ];

  const attendance_records: LokusAttendanceRecord[] = [];
  const leave_balances: LokusLeaveBalance[] = [];
  const salary_structures: LokusSalaryStructure[] = [];
  const salary_slips: LokusSalarySlip[] = [];
  const pf_accounts: LokusPFAccount[] = [];
  const pf_transactions: LokusPFTransaction[] = [];

  // Last 10 days attendance for existing employees
  const today = new Date();
  employees.forEach((emp, idx) => {
    const hr = buildDefaultEmployeeHRData(emp, idx, now);
    leave_balances.push(hr.leaveBalance);
    salary_structures.push(hr.salaryStructure);
    pf_accounts.push(hr.pfAccount);

    for (let d = 1; d <= 10; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - d);
      const dayOfWeek = dt.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = dt.toISOString().slice(0, 10);
      const isRemote = (idx + d) % 4 === 0;
      const isLate = d === 2 && idx === 3;
      const isOnLeave = d === 3 && idx === 1;

      attendance_records.push({
        id: `att-${emp.id}-${dateStr}`,
        organization_id: emp.organization_id,
        employee_id: emp.id,
        date: dateStr,
        check_in: isOnLeave ? null : isLate ? '10:18' : `09:0${(idx + d) % 9}`,
        check_out: isOnLeave ? null : `18:${15 + ((idx * 7 + d) % 40)}`,
        work_hours: isOnLeave ? 0 : isLate ? 7.9 : 8.7 + (idx % 3) * 0.2,
        status: isOnLeave ? 'On Leave' : isLate ? 'Late' : isRemote ? 'WFH' : 'Present',
        work_mode: isRemote ? 'Remote' : idx === 3 ? 'Hybrid' : 'Office',
        location: isRemote ? 'Remote · Home Office' : 'Headquarters · Tech Park',
        notes: isOnLeave ? 'Approved Paid Leave' : isLate ? 'Traffic delay (notified manager)' : '',
        updated_at: now,
      });
    }

    // Generate 3 months of payroll history + PF passbook entries
    const months = ['2026-08', '2026-09', '2026-10'];
    months.forEach((ym, mIdx) => {
      const s = hr.salaryStructure;
      const bonusAmount = mIdx === 2 && idx === 0 ? 150000 : mIdx === 1 && idx === 1 ? 75000 : 0;
      const gross =
        s.basic_monthly + s.hra_monthly + s.special_allowance_monthly + s.conveyance_monthly + bonusAmount;
      const totalDed = s.employee_pf_monthly + s.professional_tax_monthly + s.tds_monthly;
      const netPay = Math.max(0, gross - totalDed);
      const slipId = `slip-${emp.id}-${ym}`;
      const hash = sha256Hex(`${slipId}:${emp.id}:${ym}:${netPay}`);

      salary_slips.push({
        id: slipId,
        organization_id: emp.organization_id,
        slip_number: `SLIP-${ym.replace('-', '')}-${emp.id.toUpperCase()}`,
        employee_id: emp.id,
        month: ym,
        month_label: monthNameLabel(ym),
        working_days: 22,
        paid_days: 22,
        paid_leaves_used: idx === 1 && mIdx === 2 ? 1 : 0,
        lop_days: 0,
        basic: s.basic_monthly,
        hra: s.hra_monthly,
        special_allowance: s.special_allowance_monthly,
        conveyance: s.conveyance_monthly,
        bonus_amount: bonusAmount,
        gross_earnings: gross,
        employee_pf: s.employee_pf_monthly,
        employer_pf: s.employer_pf_monthly,
        professional_tax: s.professional_tax_monthly,
        tds: s.tds_monthly,
        lop_deduction: 0,
        total_deductions: totalDed,
        net_pay: netPay,
        status: 'Paid',
        seal_ref: generateSealRef('Asset', slipId, hash),
        paid_at: `${ym}-28T10:00:00.000Z`,
        generated_at: `${ym}-27T18:00:00.000Z`,
      });

      pf_transactions.push({
        id: `pftx-${emp.id}-${ym}`,
        organization_id: emp.organization_id,
        employee_id: emp.id,
        month: ym,
        type: 'Monthly Contribution',
        employee_contribution: s.employee_pf_monthly,
        employer_contribution: s.employer_pf_monthly,
        total_amount: s.employee_pf_monthly + s.employer_pf_monthly,
        balance_after: hr.pfAccount.total_balance - (2 - mIdx) * (s.employee_pf_monthly + s.employer_pf_monthly),
        reference: `EPFO-ECR-${ym.replace('-', '')}-${emp.id.toUpperCase()}`,
        created_at: `${ym}-28T11:30:00.000Z`,
      });
    });
  });

  const leave_requests: LokusLeaveRequest[] = [
    {
      id: 'lv-1',
      organization_id: orgId,
      employee_id: employees[1]?.id || 'e-2',
      leave_type: 'Paid Leave',
      start_date: '2026-11-18',
      end_date: '2026-11-20',
      days: 3,
      is_paid: true,
      reason: 'Family wedding out of station',
      status: 'Pending',
      reviewed_by_id: null,
      reviewed_at: null,
      reviewer_notes: null,
      created_at: now,
    },
    {
      id: 'lv-2',
      organization_id: orgId,
      employee_id: employees[3]?.id || 'e-4',
      leave_type: 'Casual Leave',
      start_date: '2026-11-14',
      end_date: '2026-11-14',
      days: 1,
      is_paid: true,
      reason: 'Personal errands & dental appointment',
      status: 'Pending',
      reviewed_by_id: null,
      reviewed_at: null,
      reviewer_notes: null,
      created_at: now,
    },
    {
      id: 'lv-3',
      organization_id: orgId,
      employee_id: employees[2]?.id || 'e-3',
      leave_type: 'Sick Leave',
      start_date: '2026-11-04',
      end_date: '2026-11-05',
      days: 2,
      is_paid: true,
      reason: 'Seasonal viral fever recovery',
      status: 'Approved',
      reviewed_by_id: employees[0]?.id || 'e-1',
      reviewed_at: now,
      reviewer_notes: 'Take rest and recover well.',
      created_at: '2026-11-04T08:30:00.000Z',
    },
    {
      id: 'lv-4',
      organization_id: orgId,
      employee_id: employees[4]?.id || 'e-5',
      leave_type: 'Privilege Leave',
      start_date: '2026-12-01',
      end_date: '2026-12-04',
      days: 4,
      is_paid: true,
      reason: 'Year-end annual vacation plan',
      status: 'Approved',
      reviewed_by_id: employees[0]?.id || 'e-1',
      reviewed_at: now,
      reviewer_notes: 'Approved with handoff completed.',
      created_at: '2026-11-02T11:00:00.000Z',
    },
  ];

  const bonuses: LokusBonusRecord[] = [
    {
      id: 'bon-1',
      organization_id: orgId,
      employee_id: employees[0]?.id || 'e-1',
      bonus_type: 'Annual Appraisal',
      amount: 150000,
      payout_month: '2026-10',
      reason: 'Q3 Infrastructure reliability & zero-trust rollout milestone',
      status: 'Credited',
      approved_by_id: employees[0]?.id || 'e-1',
      created_at: '2026-10-20T10:00:00.000Z',
      credited_at: '2026-10-28T10:00:00.000Z',
    },
    {
      id: 'bon-2',
      organization_id: orgId,
      employee_id: employees[1]?.id || 'e-2',
      bonus_type: 'Spot Award',
      amount: 75000,
      payout_month: '2026-09',
      reason: 'SOC2 cryptographic attestation automation',
      status: 'Credited',
      approved_by_id: employees[0]?.id || 'e-1',
      created_at: '2026-09-18T10:00:00.000Z',
      credited_at: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 'bon-3',
      organization_id: orgId,
      employee_id: employees[2]?.id || 'e-3',
      bonus_type: 'Performance Bonus',
      amount: 60000,
      payout_month: '2026-11',
      reason: 'Kubernetes multi-region failover zero-downtime migration',
      status: 'Approved',
      approved_by_id: employees[0]?.id || 'e-1',
      created_at: now,
      credited_at: null,
    },
    {
      id: 'bon-4',
      organization_id: orgId,
      employee_id: employees[3]?.id || 'e-4',
      bonus_type: 'Festival Bonus',
      amount: 35000,
      payout_month: '2026-11',
      reason: 'Annual Diwali Festival Ex-Gratia Bonus',
      status: 'Pending',
      approved_by_id: null,
      created_at: now,
      credited_at: null,
    },
  ];

  const org_requests: LokusOrgRequest[] = [
    {
      id: 'req-1',
      organization_id: orgId,
      request_number: 'REQ-2026-011',
      employee_id: employees[3]?.id || 'e-4',
      category: 'Asset Request',
      title: 'Wacom Intuos Pro Pen Tablet for Design Team',
      description: 'Need precision stylus tablet for design system icon and UI illustration sprint.',
      priority: 'Medium',
      amount: 34500,
      status: 'Pending',
      reviewed_by_id: null,
      reviewer_notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'req-2',
      organization_id: orgId,
      request_number: 'REQ-2026-012',
      employee_id: employees[2]?.id || 'e-3',
      category: 'Expense Reimbursement',
      title: 'AWS re:Invent Virtual Pass & Home Fiber Upgrade',
      description: 'Quarterly broadband allowance + technical conference certification voucher.',
      priority: 'Low',
      amount: 14200,
      status: 'In Review',
      reviewed_by_id: employees[4]?.id || 'e-5',
      reviewer_notes: 'Receipts verified, queued for Friday settlement batch.',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'req-3',
      organization_id: orgId,
      request_number: 'REQ-2026-013',
      employee_id: employees[1]?.id || 'e-2',
      category: 'Attendance Regularization',
      title: 'Regularize Late Check-in (Client Security Audit Call)',
      description: 'Started early from client bridge at 07:45 AM; physical badge swipe happened at 10:18 AM.',
      priority: 'High',
      status: 'Approved',
      reviewed_by_id: employees[0]?.id || 'e-1',
      reviewer_notes: 'Approved — early remote shift verified.',
      created_at: '2026-11-08T12:00:00.000Z',
      updated_at: now,
    },
    {
      id: 'req-4',
      organization_id: orgId,
      request_number: 'REQ-2026-014',
      employee_id: employees[4]?.id || 'e-5',
      category: 'PF Advance / KYC',
      title: 'Update UAN Nominee & Verify Aadhaar e-KYC',
      description: 'Submitted updated Form-2 EPF nomination declaration for verification.',
      priority: 'Medium',
      status: 'Pending',
      reviewed_by_id: null,
      reviewer_notes: null,
      created_at: now,
      updated_at: now,
    },
  ];

  return {
    attendance_records,
    leave_balances,
    leave_requests,
    holidays,
    salary_structures,
    salary_slips,
    pf_accounts,
    pf_transactions,
    bonuses,
    org_requests,
  };
}

