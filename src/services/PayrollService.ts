import type {
  BonusRecord,
  BonusStatus,
  BonusType,
  PFAccount,
  PFTransaction,
  SalarySlip,
  SalaryStructure,
} from '@/types';
import { api, currentOrganization } from './api';
import {
  adaptBonus,
  adaptPFAccount,
  adaptPFTransaction,
  adaptSalarySlip,
  adaptSalaryStructure,
} from './adapters';

const org = () => currentOrganization.get() || '11111111-1111-1111-1111-111111111111';
const refresh = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nexus:data'));
};

export interface PayrollOverviewData {
  structures: SalaryStructure[];
  slips: SalarySlip[];
  bonuses: BonusRecord[];
  pfAccounts: PFAccount[];
  pfTransactions: PFTransaction[];
}

type Raw = Record<string, unknown>;

export const PayrollService = {
  async list(query: { employeeId?: string; month?: string } = {}): Promise<PayrollOverviewData> {
    const params = new URLSearchParams({ organization_id: org() });
    if (query.employeeId) params.set('employee_id', query.employeeId);
    if (query.month) params.set('month', query.month);
    const data = await api.get<{
      structures?: Raw[];
      slips?: Raw[];
      bonuses?: Raw[];
      pf_accounts?: Raw[];
      pf_transactions?: Raw[];
    }>(`/api/v1/payroll?${params}`);
    return {
      structures: (data.structures || []).map(adaptSalaryStructure),
      slips: (data.slips || []).map(adaptSalarySlip),
      bonuses: (data.bonuses || []).map(adaptBonus),
      pfAccounts: (data.pf_accounts || []).map(adaptPFAccount),
      pfTransactions: (data.pf_transactions || []).map(adaptPFTransaction),
    };
  },

  async updateStructure(employeeId: string, input: Partial<SalaryStructure>): Promise<SalaryStructure> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'update_structure',
      employee_id: employeeId,
      structure: {
        annual_ctc: input.annualCtc,
        basic_monthly: input.basicMonthly,
        hra_monthly: input.hraMonthly,
        special_allowance_monthly: input.specialAllowanceMonthly,
        conveyance_monthly: input.conveyanceMonthly,
        employee_pf_monthly: input.employeePfMonthly,
        employer_pf_monthly: input.employerPfMonthly,
        professional_tax_monthly: input.professionalTaxMonthly,
        tds_monthly: input.tdsMonthly,
        bank_name: input.bankName,
        bank_account_last4: input.bankAccountLast4,
        pan_number: input.panNumber,
      },
    });
    refresh();
    return adaptSalaryStructure(res);
  },

  async generateSlips(month: string): Promise<SalarySlip[]> {
    const res = await api.post<{ items: Raw[] }>('/api/v1/payroll', {
      organization_id: org(),
      action: 'generate_slips',
      month,
    });
    refresh();
    return (res.items || []).map(adaptSalarySlip);
  },

  async markSlipPaid(slipId: string): Promise<SalarySlip> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'mark_paid',
      slip_id: slipId,
    });
    refresh();
    return adaptSalarySlip(res);
  },

  async createBonus(input: {
    employeeId: string;
    bonusType: BonusType;
    amount: number;
    payoutMonth: string;
    reason: string;
    status?: BonusStatus;
  }): Promise<BonusRecord> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'create_bonus',
      employee_id: input.employeeId,
      bonus_type: input.bonusType,
      amount: input.amount,
      payout_month: input.payoutMonth,
      reason: input.reason,
      status: input.status || 'Approved',
    });
    refresh();
    return adaptBonus(res);
  },

  async updateBonusStatus(bonusId: string, status: BonusStatus): Promise<BonusRecord> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'update_bonus',
      bonus_id: bonusId,
      status,
    });
    refresh();
    return adaptBonus(res);
  },

  async updatePFAccount(employeeId: string, updates: { vpfMonthly?: number; nomineeName?: string; kycStatus?: 'Verified' | 'Pending'; uan?: string }): Promise<PFAccount> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'update_pf',
      employee_id: employeeId,
      updates: {
        ...(updates.vpfMonthly !== undefined ? { vpf_monthly: updates.vpfMonthly } : {}),
        ...(updates.nomineeName !== undefined ? { nominee_name: updates.nomineeName } : {}),
        ...(updates.kycStatus !== undefined ? { kyc_status: updates.kycStatus } : {}),
        ...(updates.uan !== undefined ? { uan: updates.uan } : {}),
      },
    });
    refresh();
    return adaptPFAccount(res);
  },

  async postPFTransaction(input: {
    employeeId: string;
    month: string;
    type: PFTransaction['type'];
    employeeContribution: number;
    employerContribution: number;
  }): Promise<PFTransaction> {
    const res = await api.post<Raw>('/api/v1/payroll', {
      organization_id: org(),
      action: 'pf_transaction',
      employee_id: input.employeeId,
      month: input.month,
      type: input.type,
      employee_contribution: input.employeeContribution,
      employer_contribution: input.employerContribution,
    });
    refresh();
    return adaptPFTransaction(res);
  },
};
