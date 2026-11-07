import type { Identity } from '@/types';
import { api } from './api';
import { adaptIdentity } from './adapters';

export const IdentityService = {
  async getByEmployeeId(employeeId: string): Promise<Identity> {
    const data = await api.get(`/api/v1/identities/${employeeId}`);
    return adaptIdentity(data);
  }
};
