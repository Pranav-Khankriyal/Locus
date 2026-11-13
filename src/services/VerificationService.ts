import type { Action, Resource, VerificationResultData } from '@/types';
import { api } from './api';
import { AssetService } from './AssetService';
import { EmployeeService } from './EmployeeService';

export const VerificationService = {
  async verify(
    kind: VerificationResultData['kind'],
    id: string,
    _resource: Resource = 'assets',
    _action: Action = 'view'
  ): Promise<VerificationResultData> {
    if (kind === 'Asset') {
      const [asset, result] = await Promise.all([
        AssetService.getById(id),
        api.get<any>(`/api/v1/blockchain/assets/${id}/verify`),
      ]);
      const verified = Boolean(result.blockchain_verified);
      return {
        verified,
        kind,
        name: asset.name,
        id: asset.id,
        record: asset.assetId,
        message: verified
          ? 'Canonical SHA-256 digest matches registered integrity seal.'
          : 'Integrity mismatch! Asset record has been altered or seal is missing.',
        transactionRef: result.transaction_id || 'LOCUS-SEAL-AST',
        checkedAt: result.verified_at || new Date().toISOString(),
      };
    } else {
      const [emp, result] = await Promise.all([
        EmployeeService.getById(id),
        api.get<any>(`/api/v1/blockchain/identities/${id}/verify`),
      ]);
      const verified = Boolean(result.verified ?? result.blockchain_verified);
      return {
        verified,
        kind: 'Identity',
        name: emp.name,
        id: emp.id,
        record: emp.employeeId,
        message: verified
          ? 'Cryptographic identity digest matches registered Locus seal.'
          : 'Identity verification failed! Profile attributes do not match registered credentials.',
        transactionRef: result.transaction_id || `LOCUS-SEAL-ID-${emp.employeeId}`,
        checkedAt: result.verified_at || new Date().toISOString(),
      };
    }
  },
};
