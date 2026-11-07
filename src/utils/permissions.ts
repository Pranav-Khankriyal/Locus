import type { Action, Employee, Permission, Resource, OrganisationUnit, Scope } from '@/types';
import { descendantIds } from './buildTree';

export function can(
  permissions: Permission[] | undefined | null,
  resource: Resource,
  action: Action = 'view'
): boolean {
  if (!Array.isArray(permissions)) return false;
  return permissions.some((p) => p && p.resource === resource && p.action === action);
}

export function permissionScope(
  permissions: Permission[] | undefined | null,
  resource: Resource,
  action: Action = 'view'
): Scope | null {
  if (!Array.isArray(permissions)) return null;
  const scopes = permissions
    .filter((p) => p && p.resource === resource && p.action === action)
    .map((p) => p.scope);
  return scopes.includes('all')
    ? 'all'
    : scopes.includes('team')
    ? 'team'
    : scopes.includes('own')
    ? 'own'
    : null;
}

export function inScope(
  scope: Scope | null,
  user: Employee,
  units: OrganisationUnit[],
  unitId: string,
  employeeId?: string | null
): boolean {
  return (
    scope === 'all' ||
    (scope === 'own' && employeeId === user.id) ||
    (scope === 'team' && (employeeId === user.id || descendantIds(units, user.organisationUnitId).includes(unitId)))
  );
}
