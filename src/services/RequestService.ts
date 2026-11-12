import type { OrgRequest, RequestCategory, RequestPriority, RequestStatus } from '@/types';
import { api, currentOrganization } from './api';
import { adaptOrgRequest } from './adapters';

const org = () => currentOrganization.get() || '11111111-1111-1111-1111-111111111111';
const refresh = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nexus:data'));
};

type Raw = Record<string, unknown>;

export const RequestService = {
  async list(query: { employeeId?: string; category?: string; status?: string } = {}): Promise<OrgRequest[]> {
    const params = new URLSearchParams({ organization_id: org() });
    if (query.employeeId) params.set('employee_id', query.employeeId);
    if (query.category) params.set('category', query.category);
    if (query.status) params.set('status', query.status);
    const data = await api.get<{ items: Raw[] }>(`/api/v1/requests?${params}`);
    return (data.items || []).map(adaptOrgRequest);
  },

  async create(input: {
    employeeId: string;
    category: RequestCategory;
    title: string;
    description: string;
    priority: RequestPriority;
    amount?: number;
  }): Promise<OrgRequest> {
    const res = await api.post<Raw>('/api/v1/requests', {
      organization_id: org(),
      employee_id: input.employeeId,
      category: input.category,
      title: input.title,
      description: input.description,
      priority: input.priority,
      amount: input.amount,
    });
    refresh();
    return adaptOrgRequest(res);
  },

  async review(
    id: string,
    status: RequestStatus,
    reviewerId: string,
    reviewerNotes?: string
  ): Promise<OrgRequest> {
    const res = await api.patch<Raw>(`/api/v1/requests/${id}`, {
      status,
      reviewer_id: reviewerId,
      reviewer_notes: reviewerNotes,
    });
    refresh();
    return adaptOrgRequest(res);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/requests/${id}`);
    refresh();
  },
};
