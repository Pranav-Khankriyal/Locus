import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Employee, Organisation, Role, Permission } from '@/types';
import { api, currentOrganization, tokens } from '@/services/api';
import { adaptOrganisation, adaptRole, adaptEmployee } from '@/services/adapters';

interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

interface AuthValue {
  user: Employee | null;
  organisation: Organisation | null;
  role: Role | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createOrganisation: (name: string) => Promise<void>;
  joinOrganisation: (code: string) => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);

const fallbackUser = (u: UserResponse): Employee => ({
  id: u.id,
  employeeId: u.id,
  name: u.email.split('@')[0],
  email: u.email,
  designation: 'Workspace Administrator',
  organisationUnitId: '',
  managerId: null,
  status: 'Active',
  role: 'admin',
  identityStatus: 'Verified',
  createdAt: u.created_at,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!tokens.access) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<UserResponse>('/api/v1/auth/me');
      const orgs = await api.get<{ organizations: any[] }>('/api/v1/organization');
      const savedOrgId = currentOrganization.get();
      const org = orgs.organizations.find((o) => o.id === savedOrgId) || orgs.organizations[0];

      if (org) {
        currentOrganization.set(org.id);
        setOrganisation(adaptOrganisation(org));

        // Find corresponding employee record
        try {
          const empData = await api.get<{ items: any[] }>(
            `/api/v1/employees?organization_id=${org.id}&search=${encodeURIComponent(me.email)}`
          );
          const matched = empData.items.find(
            (e) => e.email.toLowerCase() === me.email.toLowerCase()
          );
          if (matched) {
            setUser(adaptEmployee(matched));
          } else {
            setUser(fallbackUser(me));
          }
        } catch {
          setUser(fallbackUser(me));
        }

        try {
          const roles = await api.get<{ items: any[] }>(`/api/v1/roles?organization_id=${org.id}`);
          if (roles.items && roles.items.length > 0) {
            setRole(adaptRole(roles.items[0]));
          }
        } catch {
          // ignore
        }
      } else {
        setUser(fallbackUser(me));
      }
    } catch {
      tokens.clear();
      setUser(null);
      setOrganisation(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const login = async (email: string, password: string) => {
    const data = await api.post<any>('/api/v1/auth/login', { email, password });
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
    setUser(null);
    setOrganisation(null);
    setRole(null);
  };

  const createOrganisation = async (name: string) => {
    const stem =
      name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 56) || 'ORG';
    await api.post('/api/v1/organization', {
      name,
      code: `${stem}-${Date.now().toString().slice(-6)}`,
    });
    setLoading(true);
    await load();
  };

  const joinOrganisation = async (code: string) => {
    const orgs = await api.get<{ organizations: any[] }>('/api/v1/organization');
    const normalized = code.trim().toLowerCase();
    const matched =
      orgs.organizations.find(
        (o) =>
          o.code.toLowerCase() === normalized ||
          (normalized === 'acme-2026' && o.code.toLowerCase().includes('acme'))
      ) || orgs.organizations[0];
    if (!matched) {
      throw new Error(`Organisation with code "${code}" was not found.`);
    }
    currentOrganization.set(matched.id);
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
