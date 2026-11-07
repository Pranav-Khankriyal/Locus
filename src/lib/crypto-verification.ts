import crypto from 'crypto';

export function canonicalJson(record: any): string {
  if (record === null || typeof record !== 'object') {
    return JSON.stringify(record);
  }
  if (Array.isArray(record)) {
    return '[' + record.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(record).sort();
  const entries = keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(record[k])}`);
  return '{' + entries.join(',') + '}';
}

export function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

export function computeEntityHash(entityType: string, entity: Record<string, any>): string {
  let canonicalPayload: Record<string, any> = {};
  const typeLower = entityType.toLowerCase();

  if (typeLower === 'asset') {
    canonicalPayload = {
      asset_code: entity.asset_code || entity.assetId || '',
      category_id: entity.asset_category_id || entity.category || '',
      condition: String(entity.metadata?.condition || entity.condition || 'Good'),
      location: entity.location || entity.locationId || '',
      name: entity.name || '',
      organization_id: entity.organization_id || '',
      serial_number: entity.serial_number || entity.serialNumber || '',
      status: String(entity.status || 'AVAILABLE').toUpperCase(),
    };
  } else if (typeLower === 'identity' || typeLower === 'employee') {
    canonicalPayload = {
      designation: entity.designation || '',
      did: entity.did || '',
      email: (entity.email || '').toLowerCase(),
      employee_code: entity.employee_code || entity.employeeId || '',
      name: entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim(),
      organization_id: entity.organization_id || '',
      organization_unit_id: entity.organization_unit_id || entity.organisationUnitId || '',
      status: (entity.employment_status || entity.status || 'active').toLowerCase(),
    };
  } else {
    canonicalPayload = { ...entity };
    delete canonicalPayload.updated_at;
    delete canonicalPayload.verified_at;
    delete canonicalPayload.created_at;
  }

  return sha256Hex(canonicalJson(canonicalPayload));
}

export function generateSealRef(entityType: string, entityId: string, hash: string): string {
  const shortId = entityId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  const shortHash = hash.slice(0, 10).toUpperCase();
  return `LOKUS-SEAL-${entityType.slice(0, 3).toUpperCase()}-${shortId}-${shortHash}`;
}
