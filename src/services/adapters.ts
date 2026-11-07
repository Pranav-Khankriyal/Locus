import type { Asset, AssetAssignment, AssetCategory, AuditEvent, Employee, Organisation, OrganisationUnit, Role } from '@/types';

const text = (v: unknown) => String(v ?? '');
const title = (v: string) => v.split('_').map((x) => x[0]?.toUpperCase() + x.slice(1)).join(' ');

export const adaptOrganisation = (o: any): Organisation => ({
  id: text(o.id),
  name: o.name,
  slug: o.code,
  createdAt: text(o.created_at),
  rootUnitId: '',
  contact: o.description || undefined,
});

export const adaptEmployee = (e: any): Employee => ({
  id: text(e.id),
  employeeId: e.employee_code || e.employeeId || text(e.id),
  name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Team Member',
  email: e.email,
  designation: e.designation || 'Team Member',
  organisationUnitId: text(e.organization_unit_id || e.organisationUnitId),
  managerId: e.manager_employee_id ? text(e.manager_employee_id) : (e.managerId ? text(e.managerId) : null),
  status: (e.employment_status === 'active' || e.status === 'Active') ? 'Active' : 'Inactive',
  role: e.role || 'employee',
  identityStatus: (e.identityStatus || 'Verified') as any,
  createdAt: text(e.created_at || e.createdAt),
});

export const adaptUnit = (u: any): OrganisationUnit => ({
  id: text(u.id),
  name: u.name,
  type: u.unit_type || u.type || 'department',
  parentId: u.parent_unit_id ? text(u.parent_unit_id) : (u.parentId ? text(u.parentId) : null),
  managerId: null,
  employeeCount: 0,
  assetCount: 0,
  depth: 0,
});

export const adaptCategory = (c: any): AssetCategory => ({
  id: text(c.id),
  name: c.name,
  parentId: 'api',
  type: c.type === 'Digital' ? 'Digital' : 'Physical',
});

export const adaptAsset = (a: any): Asset => ({
  id: text(a.id),
  assetId: a.asset_code || a.assetId || `AST-${text(a.id).slice(-4)}`,
  name: a.name,
  type: (a.asset_type === 'Digital' || a.type === 'Digital') ? 'Digital' : 'Physical',
  category: text(a.asset_category_id || a.category),
  subCategory: a.description || '',
  serialNumber: a.serial_number || a.serialNumber || '',
  condition: String(a.metadata?.condition || a.condition || 'Good'),
  status: (title(String(a.status).toLowerCase()) as Asset['status']) || 'Available',
  locationId: a.location || a.locationId || 'HQ',
  organisationUnitId: '',
  currentAssigneeId: a.current_employee_id ? text(a.current_employee_id) : (a.currentAssigneeId ? text(a.currentAssigneeId) : null),
  blockchainStatus: ((a.integrity_status === 'Verified' || a.blockchainStatus === 'Verified') ? 'Verified' : 'Pending') as any,
  tokenId: null,
  createdAt: text(a.created_at || a.createdAt),
  expiresAt: a.metadata?.expires_at || a.expiresAt,
});

export const adaptRole = (r: any): Role => ({
  id: text(r.id),
  name: r.name,
  description: r.description || '',
  permissions: (r.permissions || []).map((p: any) => {
    const [resource, action] = String(p.code || '').split('.');
    return {
      id: text(p.id),
      resource:
        resource === 'employee'
          ? 'employees'
          : resource === 'asset'
          ? 'assets'
          : resource === 'role'
          ? 'roles'
          : resource === 'verification'
          ? 'verification'
          : resource === 'audit'
          ? 'audit'
          : resource === 'organisation'
          ? 'organisation'
          : 'settings',
      action: ['create', 'update', 'delete', 'manage', 'manage_units'].includes(action)
        ? 'manage'
        : action === 'read'
        ? 'view'
        : action,
      scope: 'all',
    } as any;
  }),
  isSystem: r.name === 'Organisation Administrator' || Boolean(r.is_system),
});

export const adaptTransaction = (t: any): AssetAssignment => ({
  id: text(t.id),
  assetId: text(t.asset_id || t.assetId),
  assigneeId: text(t.new_employee_id || t.assigneeId),
  assignedById: text(t.performed_by_user_id || t.assignedById),
  assignedAt: text(t.created_at || t.assignedAt),
  returnedAt: t.transaction_type === 'RETURN' ? text(t.created_at) : null,
  reason: t.notes || '',
  status: t.transaction_type === 'RETURN' ? 'Returned' : t.transaction_type === 'TRANSFER' ? 'Transferred' : 'Active',
  transactionRef: text(t.id),
});

export const adaptAudit = (a: any): AuditEvent => ({
  id: text(a.id),
  actorId: text(a.actor_user_id || a.actorId),
  action: a.action,
  entity: (a.entity_type || a.entity || 'Asset') as AuditEvent['entity'],
  entityId: text(a.entity_id || a.entityId),
  status: 'Success',
  metadata: a.metadata || {},
  createdAt: text(a.created_at || a.createdAt),
});

export const adaptIdentity = (i: any): any => ({
  id: text(i.id),
  employeeId: text(i.employee_id || i.employeeId),
  did: text(i.did),
  status: text(i.status || 'Verified'),
  verifiedAt: i.verified_at ? text(i.verified_at) : (i.verifiedAt ? text(i.verifiedAt) : null),
});
