import type { AttendanceRecord, AttendanceStatus, WorkMode } from '@/types';
import { api, currentOrganization } from './api';
import { adaptAttendance } from './adapters';

const org = () => currentOrganization.get() || '11111111-1111-1111-1111-111111111111';
const refresh = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nexus:data'));
};

type Raw = Record<string, unknown>;

export const AttendanceService = {
  async list(query: { employeeId?: string; date?: string; status?: string; month?: string } = {}): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams({ organization_id: org() });
    if (query.employeeId) params.set('employee_id', query.employeeId);
    if (query.date) params.set('date', query.date);
    if (query.status) params.set('status', query.status);
    if (query.month) params.set('month', query.month);
    const data = await api.get<{ items: Raw[] }>(`/api/v1/attendance?${params}`);
    return (data.items || []).map(adaptAttendance);
  },

  async clockIn(employeeId: string, workMode: WorkMode = 'Office', notes = ''): Promise<AttendanceRecord> {
    const res = await api.post<Raw>('/api/v1/attendance', {
      organization_id: org(),
      employee_id: employeeId,
      action: 'clock_in',
      work_mode: workMode,
      notes,
    });
    refresh();
    return adaptAttendance(res);
  },

  async clockOut(employeeId: string): Promise<AttendanceRecord> {
    const res = await api.post<Raw>('/api/v1/attendance', {
      organization_id: org(),
      employee_id: employeeId,
      action: 'clock_out',
    });
    refresh();
    return adaptAttendance(res);
  },

  async mark(input: {
    employeeId: string;
    date: string;
    checkIn?: string | null;
    checkOut?: string | null;
    status: AttendanceStatus;
    workMode: WorkMode;
    location?: string;
    notes?: string;
  }): Promise<AttendanceRecord> {
    const res = await api.post<Raw>('/api/v1/attendance', {
      organization_id: org(),
      employee_id: input.employeeId,
      date: input.date,
      action: 'mark',
      check_in: input.checkIn,
      check_out: input.checkOut,
      status: input.status,
      work_mode: input.workMode,
      location: input.location,
      notes: input.notes,
    });
    refresh();
    return adaptAttendance(res);
  },
};
