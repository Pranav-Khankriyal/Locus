import { api, currentOrganization } from './api';

const org = () => {
  const id = currentOrganization.get();
  if (!id) throw new Error('Select an organisation first.');
  return id;
};

export const IntegrityService = {
  getStatus: () => api.get(`/api/v1/blockchain/status?organization_id=${org()}`),
  anchorAsset: (assetId: string) => api.post('/api/v1/blockchain/anchor', { asset_id: assetId }),
  anchorIdentity: (employeeId: string) => api.post('/api/v1/blockchain/anchor/identity', { employee_id: employeeId }),
  listTransactions: () => api.get(`/api/v1/blockchain/transactions?organization_id=${org()}`),
  getTransaction: (id: string) => api.get(`/api/v1/blockchain/transactions/${id}`),
  verifyAsset: (id: string) => api.get(`/api/v1/blockchain/assets/${id}/verify`),
  verifyIdentity: (employeeId: string) => api.get(`/api/v1/blockchain/identities/${employeeId}/verify`),
};

