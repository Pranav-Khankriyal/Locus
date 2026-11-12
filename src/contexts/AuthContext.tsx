import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Employee, Organisation, Role, Permission } from '@/types';
import { api, currentOrganization, tokens } from '@/services/api';
import { adaptOrganisation, adaptRole, adaptEmployee } from '@/services/adapters';

interface MembershipInfo {
  organization_id: string;
  role_id: string;
  role_name: string;
  is_owner: boolean;
  is_co_admin: boolean;
}

interface UserResponse {
  id: string;
  email: string;
  created_at: string;
  memberships?: MembershipInfo[];
}

export interface HierarchyBranchDraft {
  name: string;
  country: string;
  state: string;
  departments: string[];
}

export interface CreateOrganisationInput {
  name: string;
  code: string;
  description?: string;
  creatorName?: string;
  ownerDesignation?: string;
  coAdminEmails?: string[];
  hierarchy?: {
    branches: HierarchyBranchDraft[];
  };
}

interface AuthValue {
  user: Employee | null;
  organisation: Organisation | null;
  role: Role | null;
  permissions: Permission[];
  isOwner: boolean;
  isCoAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createOrganisation: (input: string | CreateOrganisationInput) => Promise<void>;
  joinOrganisation: (
    code: string,
    options?: { name?: string; designation?: string }
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);

const fallbackUser = (u: UserResponse): Employee => ({
  id: u.id,
  employeeId: u.id,
  name: u.email.split('@')[0],
  email: u.email,
  designation: 'Workspace Member',
  organisationUnitId: '',
  managerId: null,
  status: 'Active',
  role: 'employee',
  identityStatus: 'Verified',
  createdAt: u.created_at,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isCoAdmin, setIsCoAdmin] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!tokens.access) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<UserResponse>('/api/v1/auth/me');
      const memberships = me.memberships || [];

      if (memberships.length === 0) {
        currentOrganization.set('');
        setOrganisation(null);
        setRole(null);
        setIsOwner(false);
        setIsCoAdmin(false);
        setUser(fallbackUser(me));
        return;
      }

      const orgs = await api.get<{ organizations: Record<string, unknown>[] }>('/api/v1/organization');
      const savedOrgId = currentOrganization.get();
      const activeMembership =
        memberships.find((m) => m.organization_id === savedOrgId) || memberships[0];
      const org = orgs.organizations.find((o) => o.id === activeMembership.organization_id);

      if (org) {
        currentOrganization.set(String(org.id));
        setOrganisation(adaptOrganisation(org));
        setIsOwner(activeMembership.is_owner);
        setIsCoAdmin(activeMembership.is_co_admin);

        try {
          const empData = await api.get<{ items: Record<string, unknown>[] }>(
            `/api/v1/employees?organization_id=${org.id}&search=${encodeURIComponent(me.email)}`
          );
          const matched = empData.items.find(
            (e) => String(e.email || '').toLowerCase() === me.email.toLowerCase()
          );
          setUser(matched ? adaptEmployee(matched) : fallbackUser(me));
        } catch {
          setUser(fallbackUser(me));
        }

        try {
          const roles = await api.get<{ items: Record<string, unknown>[] }>(
            `/api/v1/roles?organization_id=${org.id}`
          );
          const matchedRole =
            roles.items.find((r) => String(r.id) === activeMembership.role_id) ||
            roles.items.find((r) => String(r.name).toLowerCase() === 'employee') ||
            roles.items[0];
          if (matchedRole) {
            setRole(adaptRole(matchedRole));
          }
        } catch {
          // ignore
        }
      } else {
        setOrganisation(null);
        setRole(null);
        setIsOwner(false);
        setIsCoAdmin(false);
        setUser(fallbackUser(me));
      }
    } catch {
      tokens.clear();
      currentOrganization.set('');
      setUser(null);
      setOrganisation(null);
      setRole(null);
      setIsOwner(false);
      setIsCoAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; refresh_token: string }>(
      '/api/v1/auth/login',
      { email, password }
    );
    tokens.set(data.access_token, data.refresh_token);
    setLoading(true);
    await load();
  };

  const signup = async (name: string, email: string, password: string) => {
    await api.post('/api/v1/auth/register', { email, password, name });
    await login(email, password);
  };

  const logout = () => {
    void api.post('/api/v1/auth/logout').catch(() => undefined);
    tokens.clear();
    currentOrganization.set('');
    setUser(null);
    setOrganisation(null);
    setRole(null);
    setIsOwner(false);
    setIsCoAdmin(false);
  };

  const createOrganisation = async (input: string | CreateOrganisationInput) => {
    const payload: CreateOrganisationInput =
      typeof input === 'string'
        ? {
            name: input,
            code:
              input
                .trim()
                .toUpperCase()
                .replace(/[^A-Z0-9-]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 24) || `ORG-${Date.now().toString().slice(-4)}`,
          }
        : input;

    const created = await api.post<{ id: string }>('/api/v1/organization', {
      ...payload,
      creatorUserId: user?.id,
      creatorEmail: user?.email,
      creatorName: payload.creatorName || user?.name,
    });
    currentOrganization.set(created.id);
    setLoading(true);
    await load();
  };

  const joinOrganisation = async (
    code: string,
    options?: { name?: string; designation?: string }
  ) => {
    const joined = await api.post<{ organization: { id: string } }>(
      '/api/v1/organization/join',
      {
        code: code.trim(),
        userId: user?.id,
        email: user?.email,
        name: options?.name || user?.name,
        designation: options?.designation,
      }
    );
    currentOrganization.set(joined.organization.id);
    setLoading(true);
    await load();
  };

  const permissions = useMemo(() => role?.permissions || [], [role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organisation,
        role,
        permissions,
        isOwner,
        isCoAdmin,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        createOrganisation,
        joinOrganisation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
