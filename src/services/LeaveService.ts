import type { Holiday, LeaveBalance, LeaveRequest, LeaveType } from '@/types';
import { api, currentOrganization } from './api';
import { adaptHoliday, adaptLeaveBalance, adaptLeaveRequest } from './adapters';

const org = () => currentOrganization.get() || '11111111-1111-1111-1111-111111111111';
const refresh = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nexus:data'));
};

type Raw = Record<string, unknown>;

export const LeaveService = {
  async list(query: { employeeId?: string; status?: string } = {}): Promise<{
    requests: LeaveRequest[];
    balances: LeaveBalance[];
    holidays: Holiday[];
  }> {
    const params = new URLSearchParams({ organization_id: org() });
    if (query.employeeId) params.set('employee_id', query.employeeId);
    if (query.status) params.set('status', query.status);
    const data = await api.get<{ requests: Raw[]; balances: Raw[]; holidays: Raw[] }>(`/api/v1/leaves?${params}`);
    return {
      requests: (data.requests || []).map(adaptLeaveRequest),
      balances: (data.balances || []).map(adaptLeaveBalance),
      holidays: (data.holidays || []).map(adaptHoliday),
    };
  },

  async apply(input: {
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days?: number;
    reason: string;
  }): Promise<LeaveRequest> {
    const res = await api.post<Raw>('/api/v1/leaves', {
      organization_id: org(),
      employee_id: input.employeeId,
      leave_type: input.leaveType,
      start_date: input.startDate,
      end_date: input.endDate,
      days: input.days,
      reason: input.reason,
    });
    refresh();
    return adaptLeaveRequest(res);
  },

  async review(
    id: string,
    status: 'Approved' | 'Rejected' | 'Cancelled',
    reviewerId: string,
    notes?: string
  ): Promise<LeaveRequest> {
    const res = await api.patch<Raw>(`/api/v1/leaves/${id}`, {
      status,
      reviewer_id: reviewerId,
      reviewer_notes: notes,
    });
    refresh();
    return adaptLeaveRequest(res);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/leaves/${id}`);
    refresh();
  },
};
