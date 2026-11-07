import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { computeEntityHash, generateSealRef, sha256Hex } from './crypto-verification';

export interface LokusOrganization {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface LokusOrganizationUnit {
  id: string;
  organization_id: string;
  name: string;
  unit_type: string;
  parent_unit_id: string | null;
  created_at: string;
}

export interface LokusUser {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
}

export interface LokusPermission {
  id: string;
  code: string;
  description: string;
}

export interface LokusRole {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: LokusPermission[];
  created_at: string;
}

export interface LokusEmployee {
  id: string;
  organization_id: string;
  organization_unit_id: string | null;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  employment_status: string;
  manager_employee_id: string | null;
  created_at: string;
}

export interface LokusIdentity {
  id: string;
  employee_id: string;
  did: string;
  status: 'Verified' | 'Pending' | 'Revoked';
  hash: string;
  seal_ref: string;
  verified_at: string | null;
  created_at: string;
}

export interface LokusAssetCategory {
  id: string;
  organization_id: string;
  name: string;
  type: 'Physical' | 'Digital';
  parent_category_id: string | null;
  created_at: string;
}

export interface LokusAsset {
  id: string;
  organization_id: string;
  asset_category_id: string;
  asset_code: string;
  name: string;
  description: string;
  asset_type: 'Physical' | 'Digital';
  serial_number: string;
  location: string;
  condition: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_MAINTENANCE' | 'RETURNED';
  current_employee_id: string | null;
  integrity_status: 'Verified' | 'Pending';
  integrity_seal_ref: string | null;
  canonical_hash: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LokusAssetTransaction {
  id: string;
  asset_id: string;
  transaction_type: 'ASSIGN' | 'RETURN' | 'TRANSFER';
  performed_by_user_id: string;
  new_employee_id: string | null;
  previous_employee_id: string | null;
  notes: string;
  created_at: string;
}

export interface LokusAuditEvent {
  id: string;
  organization_id: string;
  actor_user_id: string;
  action: string;
  entity_type: 'Employee' | 'Asset' | 'Organisation' | 'Role' | 'Identity' | 'System';
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LokusIntegritySeal {
  id: string;
  organization_id: string;
  entity_type: 'Asset' | 'Identity';
  entity_id: string;
  record_key: string;
  record_hash: string;
  seal_ref: string;
  sealed_at: string;
  algorithm: string;
}

export interface LokusDatabaseSchema {
  organizations: LokusOrganization[];
  units: LokusOrganizationUnit[];
  users: LokusUser[];
  roles: LokusRole[];
  user_roles: { user_id: string; role_id: string; organization_id: string }[];
  employees: LokusEmployee[];
  identities: LokusIdentity[];
  categories: LokusAssetCategory[];
  assets: LokusAsset[];
  transactions: LokusAssetTransaction[];
  audit_logs: LokusAuditEvent[];
  integrity_seals: LokusIntegritySeal[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'lokus-db.json');

function hashPassword(password: string): string {
  return sha256Hex(`salt_${password}`);
}

const ALL_PERMISSIONS: LokusPermission[] = [
  { id: 'p-1', code: 'organisation.read', description: 'View organization data' },
  { id: 'p-2', code: 'organisation.manage', description: 'Manage organization settings' },
  { id: 'p-3', code: 'organisation.manage_units', description: 'Manage organization units' },
  { id: 'p-4', code: 'employee.read', description: 'View employees' },
  { id: 'p-5', code: 'employee.create', description: 'Create employees' },
  { id: 'p-6', code: 'employee.update', description: 'Update employees' },
  { id: 'p-7', code: 'employee.delete', description: 'Delete employees' },
  { id: 'p-8', code: 'employee.import', description: 'Import employees' },
  { id: 'p-9', code: 'asset.read', description: 'View assets and categories' },
  { id: 'p-10', code: 'asset.create', description: 'Create assets' },
  { id: 'p-11', code: 'asset.update', description: 'Update assets' },
  { id: 'p-12', code: 'asset.assign', description: 'Assign assets' },
  { id: 'p-13', code: 'asset.transfer', description: 'Transfer assets' },
  { id: 'p-14', code: 'asset.return', description: 'Return assets' },
  { id: 'p-15', code: 'asset.transaction.read', description: 'View asset history' },
  { id: 'p-16', code: 'role.read', description: 'View roles' },
  { id: 'p-17', code: 'role.assign', description: 'Assign roles' },
  { id: 'p-18', code: 'role.revoke', description: 'Revoke roles' },
  { id: 'p-19', code: 'role.manage', description: 'Manage custom roles' },
  { id: 'p-20', code: 'audit.read', description: 'View audit events' },
  { id: 'p-21', code: 'verification.identity', description: 'Verify identities' },
  { id: 'p-22', code: 'verification.asset', description: 'Verify assets' },
  { id: 'p-23', code: 'verification.read', description: 'View verification status' },
  { id: 'p-24', code: 'verification.manage', description: 'Manage verification seals' },
  { id: 'p-25', code: 'blockchain.read', description: 'View integrity status' },
  { id: 'p-26', code: 'blockchain.anchor', description: 'Issue integrity seals' },
  { id: 'p-27', code: 'blockchain.verify', description: 'Verify integrity seals' },
  { id: 'p-28', code: 'blockchain.transaction.read', description: 'View seal transactions' },
];

function createDefaultSeed(): LokusDatabaseSchema {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const adminUserId = '22222222-2222-2222-2222-222222222222';
  const now = new Date().toISOString();

  const org: LokusOrganization = {
    id: orgId,
    name: 'Acme Corporation',
    code: 'ACME-CORP',
    description: 'Enterprise organization workspace running Lokus Trust & Verification Platform.',
    created_at: now,
  };

  const units: LokusOrganizationUnit[] = [
    { id: 'u-1', organization_id: orgId, name: 'Executive Leadership', unit_type: 'division', parent_unit_id: null, created_at: now },
    { id: 'u-2', organization_id: orgId, name: 'Engineering', unit_type: 'division', parent_unit_id: null, created_at: now },
    { id: 'u-3', organization_id: orgId, name: 'Cloud Infrastructure & Security', unit_type: 'department', parent_unit_id: 'u-2', created_at: now },
    { id: 'u-4', organization_id: orgId, name: 'Product & Design', unit_type: 'department', parent_unit_id: 'u-2', created_at: now },
    { id: 'u-5', organization_id: orgId, name: 'People & Operations', unit_type: 'division', parent_unit_id: null, created_at: now },
  ];

  const adminRole: LokusRole = {
    id: 'r-1',
    organization_id: orgId,
    name: 'Organisation Administrator',
    description: 'Complete system access across all Lokus modules.',
    is_system: true,
    permissions: ALL_PERMISSIONS,
    created_at: now,
  };

  const assetManagerRole: LokusRole = {
    id: 'r-2',
    organization_id: orgId,
    name: 'Asset Manager',
    description: 'Manages physical and digital assets, custody assignments, and returns.',
    is_system: false,
    permissions: ALL_PERMISSIONS.filter((p) => p.code.startsWith('asset.') || p.code.startsWith('verification.')),
    created_at: now,
  };

  const employeeRole: LokusRole = {
    id: 'r-3',
    organization_id: orgId,
    name: 'Employee',
    description: 'Standard member role with access to own profile and assets.',
    is_system: false,
    permissions: ALL_PERMISSIONS.filter((p) => ['employee.read', 'asset.read', 'verification.read'].includes(p.code)),
    created_at: now,
  };

  const adminUser: LokusUser = {
    id: adminUserId,
    email: 'admin@lokus.io',
    password_hash: hashPassword('password123'),
    is_active: true,
    created_at: now,
  };

  const employees: LokusEmployee[] = [
    {
      id: 'e-1',
      organization_id: orgId,
      organization_unit_id: 'u-1',
      employee_code: 'EMP-001',
      first_name: 'Elena',
      last_name: 'Vance',
      email: 'admin@lokus.io',
      designation: 'Chief Technology Officer',
      employment_status: 'active',
      manager_employee_id: null,
      created_at: now,
    },
    {
      id: 'e-2',
      organization_id: orgId,
      organization_unit_id: 'u-2',
      employee_code: 'EMP-002',
      first_name: 'Marcus',
      last_name: 'Chen',
      email: 'marcus.chen@lokus.io',
      designation: 'Principal Security Architect',
      employment_status: 'active',
      manager_employee_id: 'e-1',
      created_at: now,
    },
    {
      id: 'e-3',
      organization_id: orgId,
      organization_unit_id: 'u-3',
      employee_code: 'EMP-003',
      first_name: 'Sarah',
      last_name: 'Connor',
      email: 'sarah.connor@lokus.io',
      designation: 'Lead DevOps Engineer',
      employment_status: 'active',
      manager_employee_id: 'e-2',
      created_at: now,
    },
    {
      id: 'e-4',
      organization_id: orgId,
      organization_unit_id: 'u-4',
      employee_code: 'EMP-004',
      first_name: 'David',
      last_name: 'Kim',
      email: 'david.kim@lokus.io',
      designation: 'Senior Product Designer',
      employment_status: 'active',
      manager_employee_id: 'e-1',
      created_at: now,
    },
    {
      id: 'e-5',
      organization_id: orgId,
      organization_unit_id: 'u-5',
      employee_code: 'EMP-005',
      first_name: 'Aisha',
      last_name: 'Patel',
      email: 'aisha.patel@lokus.io',
      designation: 'People Operations Lead',
      employment_status: 'active',
      manager_employee_id: 'e-1',
      created_at: now,
    },
  ];

  const categories: LokusAssetCategory[] = [
    { id: 'c-1', organization_id: orgId, name: 'Laptops & Workstations', type: 'Physical', parent_category_id: null, created_at: now },
    { id: 'c-2', organization_id: orgId, name: 'Hardware Security Keys', type: 'Physical', parent_category_id: null, created_at: now },
    { id: 'c-3', organization_id: orgId, name: 'Monitors & Displays', type: 'Physical', parent_category_id: null, created_at: now },
    { id: 'c-4', organization_id: orgId, name: 'Cloud Infrastructure Keys', type: 'Digital', parent_category_id: null, created_at: now },
    { id: 'c-5', organization_id: orgId, name: 'Cryptographic SSL Certificates', type: 'Digital', parent_category_id: null, created_at: now },
    { id: 'c-6', organization_id: orgId, name: 'Enterprise Software Licenses', type: 'Digital', parent_category_id: null, created_at: now },
  ];

  const assets: LokusAsset[] = [
    {
      id: 'a-1',
      organization_id: orgId,
      asset_category_id: 'c-1',
      asset_code: 'AST-1001',
      name: 'MacBook Pro 16" M3 Max',
      description: 'Engineering development workstation (64GB RAM, 2TB SSD)',
      asset_type: 'Physical',
      serial_number: 'C02G30X1MD6R',
      location: 'San Francisco HQ - Building A',
      condition: 'Excellent',
      status: 'ASSIGNED',
      current_employee_id: 'e-1',
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'Excellent' },
      created_at: now,
    },
    {
      id: 'a-2',
      organization_id: orgId,
      asset_category_id: 'c-2',
      asset_code: 'AST-1002',
      name: 'YubiKey 5C NFC Enterprise Security Key',
      description: 'Hardware multi-factor token for production cluster access',
      asset_type: 'Physical',
      serial_number: 'YK-9482-10842',
      location: 'Security Operations Vault',
      condition: 'New',
      status: 'ASSIGNED',
      current_employee_id: 'e-2',
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'New' },
      created_at: now,
    },
    {
      id: 'a-3',
      organization_id: orgId,
      asset_category_id: 'c-3',
      asset_code: 'AST-1003',
      name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
      description: 'Design and analysis display with 90W power delivery',
      asset_type: 'Physical',
      serial_number: 'CN-098F3D-74261',
      location: 'San Francisco HQ - Desk 402',
      condition: 'Good',
      status: 'ASSIGNED',
      current_employee_id: 'e-4',
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'Good' },
      created_at: now,
    },
    {
      id: 'a-4',
      organization_id: orgId,
      asset_category_id: 'c-4',
      asset_code: 'AST-2001',
      name: 'AWS Production Primary Root KMS Key',
      description: 'Cryptographic envelope encryption master key for production DB',
      asset_type: 'Digital',
      serial_number: 'arn:aws:kms:us-west-2:10948271:key/a1b2c3d4',
      location: 'AWS us-west-2 Oregon',
      condition: 'Active',
      status: 'ASSIGNED',
      current_employee_id: 'e-3',
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'Active', expires_at: '2028-12-31' },
      created_at: now,
    },
    {
      id: 'a-5',
      organization_id: orgId,
      asset_category_id: 'c-5',
      asset_code: 'AST-2002',
      name: 'Enterprise Wildcard SSL Certificate (*.lokus.internal)',
      description: 'DigiCert 2048-bit RSA TLS server identity certificate',
      asset_type: 'Digital',
      serial_number: 'SHA256:F4:7A:B3:91:0C:4E',
      location: 'Global Edge Ingress',
      condition: 'Active',
      status: 'AVAILABLE',
      current_employee_id: null,
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'Active', expires_at: '2027-06-30' },
      created_at: now,
    },
    {
      id: 'a-6',
      organization_id: orgId,
      asset_category_id: 'c-6',
      asset_code: 'AST-2003',
      name: 'Figma Enterprise Organization Seat License',
      description: 'Design system team collaboration seat',
      asset_type: 'Digital',
      serial_number: 'LIC-FIGMA-2026-991',
      location: 'Cloud SaaS',
      condition: 'Active',
      status: 'ASSIGNED',
      current_employee_id: 'e-4',
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: { condition: 'Active' },
      created_at: now,
    },
  ];

  const identities: LokusIdentity[] = [];
  const integrity_seals: LokusIntegritySeal[] = [];

  // Seed identities and initial cryptographic seals for employees
  for (const emp of employees) {
    const did = `did:lokus:acme-corp:${emp.id}`;
    const hash = computeEntityHash('identity', { ...emp, did });
    const sealRef = generateSealRef('Identity', emp.id, hash);

    identities.push({
      id: `id-${emp.id}`,
      employee_id: emp.id,
      did,
      status: 'Verified',
      hash,
      seal_ref: sealRef,
      verified_at: now,
      created_at: now,
    });

    integrity_seals.push({
      id: `seal-id-${emp.id}`,
      organization_id: orgId,
      entity_type: 'Identity',
      entity_id: emp.id,
      record_key: sha256Hex(`Identity:${orgId}:${emp.id}`),
      record_hash: hash,
      seal_ref: sealRef,
      sealed_at: now,
      algorithm: 'SHA-256',
    });
  }

  // Seed cryptographic seals for assets
  for (const asset of assets) {
    const hash = computeEntityHash('asset', asset);
    const sealRef = generateSealRef('Asset', asset.id, hash);
    asset.canonical_hash = hash;
    asset.integrity_seal_ref = sealRef;

    integrity_seals.push({
      id: `seal-ast-${asset.id}`,
      organization_id: orgId,
      entity_type: 'Asset',
      entity_id: asset.id,
      record_key: sha256Hex(`Asset:${orgId}:${asset.id}`),
      record_hash: hash,
      seal_ref: sealRef,
      sealed_at: now,
      algorithm: 'SHA-256',
    });
  }

  const transactions: LokusAssetTransaction[] = [
    {
      id: 'tx-1',
      asset_id: 'a-1',
      transaction_type: 'ASSIGN',
      performed_by_user_id: adminUserId,
      new_employee_id: 'e-1',
      previous_employee_id: null,
      notes: 'Initial executive laptop deployment',
      created_at: now,
    },
    {
      id: 'tx-2',
      asset_id: 'a-2',
      transaction_type: 'ASSIGN',
      performed_by_user_id: adminUserId,
      new_employee_id: 'e-2',
      previous_employee_id: null,
      notes: 'Hardware security key issued for security architect',
      created_at: now,
    },
    {
      id: 'tx-3',
      asset_id: 'a-3',
      transaction_type: 'ASSIGN',
      performed_by_user_id: adminUserId,
      new_employee_id: 'e-4',
      previous_employee_id: null,
      notes: 'Monitor issued for UI/UX workstation setup',
      created_at: now,
    },
  ];

  const audit_logs: LokusAuditEvent[] = [
    {
      id: 'log-1',
      organization_id: orgId,
      actor_user_id: adminUserId,
      action: 'ORGANISATION_INITIALIZED',
      entity_type: 'Organisation',
      entity_id: orgId,
      metadata: { name: org.name, code: org.code },
      created_at: now,
    },
    {
      id: 'log-2',
      organization_id: orgId,
      actor_user_id: adminUserId,
      action: 'SECURITY_POLICY_CONFIGURED',
      entity_type: 'Role',
      entity_id: adminRole.id,
      metadata: { role: adminRole.name, permissionsCount: ALL_PERMISSIONS.length },
      created_at: now,
    },
    {
      id: 'log-3',
      organization_id: orgId,
      actor_user_id: adminUserId,
      action: 'PERSONNEL_ONBOARDED',
      entity_type: 'Employee',
      entity_id: 'e-1',
      metadata: { name: 'Elena Vance', title: 'Chief Technology Officer' },
      created_at: now,
    },
    {
      id: 'log-4',
      organization_id: orgId,
      actor_user_id: adminUserId,
      action: 'CRYPTOGRAPHIC_SEAL_ISSUED',
      entity_type: 'Identity',
      entity_id: 'e-1',
      metadata: { algorithm: 'SHA-256', did: 'did:lokus:acme-corp:e-1' },
      created_at: now,
    },
    {
      id: 'log-5',
      organization_id: orgId,
      actor_user_id: adminUserId,
      action: 'ASSET_CUSTODY_ASSIGNED',
      entity_type: 'Asset',
      entity_id: 'a-1',
      metadata: { asset: 'MacBook Pro 16" M3 Max', assignee: 'Elena Vance' },
      created_at: now,
    },
  ];

  return {
    organizations: [org],
    units,
    users: [adminUser],
    roles: [adminRole, assetManagerRole, employeeRole],
    user_roles: [{ user_id: adminUserId, role_id: adminRole.id, organization_id: orgId }],
    employees,
    identities,
    categories,
    assets,
    transactions,
    audit_logs,
    integrity_seals,
  };
}

class LokusDatabase {
  private data: LokusDatabaseSchema | null = null;
  private lastMtime: number = 0;

  private ensureDir() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): LokusDatabaseSchema {
    this.ensureDir();
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const stat = fs.statSync(DB_FILE_PATH);
        if (this.data && stat.mtimeMs === this.lastMtime) {
          return this.data;
        }
        const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(content);
        this.lastMtime = stat.mtimeMs;
        return this.data!;
      } catch (err) {
        console.error('Error reading Lokus database file, re-initializing seed:', err);
      }
    }
    this.data = createDefaultSeed();
    this.save();
    return this.data;
  }

  private save(): void {
    if (!this.data) return;
    this.ensureDir();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    try {
      this.lastMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
    } catch {
      // ignore
    }
  }

  // --- Read helpers ---
  get organizations() { return this.load().organizations; }
  get units() { return this.load().units; }
  get users() { return this.load().users; }
  get roles() { return this.load().roles; }
  get user_roles() { return this.load().user_roles; }
  get employees() { return this.load().employees; }
  get identities() { return this.load().identities; }
  get categories() { return this.load().categories; }
  get assets() { return this.load().assets; }
  get transactions() { return this.load().transactions; }
  get audit_logs() { return this.load().audit_logs; }
  get integrity_seals() { return this.load().integrity_seals; }

  // --- Mutators ---
  addOrganization(org: LokusOrganization) {
    const db = this.load();
    db.organizations.push(org);
    this.save();
    return org;
  }

  addUnit(unit: LokusOrganizationUnit) {
    const db = this.load();
    db.units.push(unit);
    this.save();
    return unit;
  }

  updateUnit(id: string, updates: Partial<LokusOrganizationUnit>) {
    const db = this.load();
    const idx = db.units.findIndex((u) => u.id === id);
    if (idx !== -1) {
      db.units[idx] = { ...db.units[idx], ...updates };
      this.save();
      return db.units[idx];
    }
    return null;
  }

  deleteUnit(id: string) {
    const db = this.load();
    db.units = db.units.filter((u) => u.id !== id);
    this.save();
  }

  addUser(user: LokusUser) {
    const db = this.load();
    db.users.push(user);
    this.save();
    return user;
  }

  addEmployee(emp: LokusEmployee) {
    const db = this.load();
    db.employees.push(emp);
    
    // Automatically issue identity and cryptographic seal
    const did = `did:lokus:${emp.organization_id}:${emp.id}`;
    const hash = computeEntityHash('identity', { ...emp, did, status: 'Active' });
    const sealRef = generateSealRef('Identity', emp.id, hash);
    const now = new Date().toISOString();

    const identity: LokusIdentity = {
      id: `id-${emp.id}`,
      employee_id: emp.id,
      did,
      status: 'Verified',
      hash,
      seal_ref: sealRef,
      verified_at: now,
      created_at: now,
    };
    db.identities.push(identity);

    db.integrity_seals.push({
      id: `seal-id-${emp.id}`,
      organization_id: emp.organization_id,
      entity_type: 'Identity',
      entity_id: emp.id,
      record_key: sha256Hex(`Identity:${emp.organization_id}:${emp.id}`),
      record_hash: hash,
      seal_ref: sealRef,
      sealed_at: now,
      algorithm: 'SHA-256',
    });

    this.save();
    return emp;
  }

  updateEmployee(id: string, updates: Partial<LokusEmployee>) {
    const db = this.load();
    const idx = db.employees.findIndex((e) => e.id === id);
    if (idx !== -1) {
      db.employees[idx] = { ...db.employees[idx], ...updates };
      this.save();
      return db.employees[idx];
    }
    return null;
  }

  deleteEmployee(id: string) {
    const db = this.load();
    db.employees = db.employees.filter((e) => e.id !== id);
    db.identities = db.identities.filter((i) => i.employee_id !== id);
    this.save();
  }

  addAsset(asset: LokusAsset) {
    const db = this.load();
    const hash = computeEntityHash('asset', asset);
    const sealRef = generateSealRef('Asset', asset.id, hash);
    asset.canonical_hash = hash;
    asset.integrity_seal_ref = sealRef;
    asset.integrity_status = 'Verified';

    db.assets.push(asset);

    db.integrity_seals.push({
      id: `seal-ast-${asset.id}`,
      organization_id: asset.organization_id,
      entity_type: 'Asset',
      entity_id: asset.id,
      record_key: sha256Hex(`Asset:${asset.organization_id}:${asset.id}`),
      record_hash: hash,
      seal_ref: sealRef,
      sealed_at: new Date().toISOString(),
      algorithm: 'SHA-256',
    });

    this.save();
    return asset;
  }

  updateAsset(id: string, updates: Partial<LokusAsset>) {
    const db = this.load();
    const idx = db.assets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      db.assets[idx] = { ...db.assets[idx], ...updates };
      this.save();
      return db.assets[idx];
    }
    return null;
  }

  deleteAsset(id: string) {
    const db = this.load();
    db.assets = db.assets.filter((a) => a.id !== id);
    this.save();
  }

  addTransaction(tx: LokusAssetTransaction) {
    const db = this.load();
    db.transactions.push(tx);
    this.save();
    return tx;
  }

  addAudit(log: LokusAuditEvent) {
    const db = this.load();
    db.audit_logs.unshift(log); // recent first
    this.save();
    return log;
  }

  addRole(role: LokusRole) {
    const db = this.load();
    db.roles.push(role);
    this.save();
    return role;
  }

  updateRole(id: string, updates: Partial<LokusRole>) {
    const db = this.load();
    const idx = db.roles.findIndex((r) => r.id === id);
    if (idx !== -1) {
      db.roles[idx] = { ...db.roles[idx], ...updates };
      this.save();
      return db.roles[idx];
    }
    return null;
  }

  deleteRole(id: string) {
    const db = this.load();
    db.roles = db.roles.filter((r) => r.id !== id && !r.is_system);
    this.save();
  }

  assignUserRole(userId: string, roleId: string, orgId: string) {
    const db = this.load();
    db.user_roles = db.user_roles.filter((ur) => ur.user_id !== userId);
    db.user_roles.push({ user_id: userId, role_id: roleId, organization_id: orgId });
    this.save();
  }

  updateIdentity(employeeId: string, updates: Partial<LokusIdentity>) {
    const db = this.load();
    const idx = db.identities.findIndex((i) => i.employee_id === employeeId);
    if (idx !== -1) {
      db.identities[idx] = { ...db.identities[idx], ...updates };
      this.save();
      return db.identities[idx];
    }
    return null;
  }

  verifyEntity(entityType: 'Asset' | 'Identity', id: string) {
    const db = this.load();
    const now = new Date().toISOString();

    if (entityType === 'Asset') {
      const asset = db.assets.find((a) => a.id === id);
      if (!asset) return { verified: false, message: 'Asset not found', hash: '', sealRef: '' };
      const currentHash = computeEntityHash('asset', asset);
      const seal = db.integrity_seals.find((s) => s.entity_type === 'Asset' && s.entity_id === id);

      const isMatch = seal ? seal.record_hash === currentHash : true;
      if (!seal) {
        // First-time seal
        const newSealRef = generateSealRef('Asset', asset.id, currentHash);
        db.integrity_seals.push({
          id: `seal-ast-${asset.id}`,
          organization_id: asset.organization_id,
          entity_type: 'Asset',
          entity_id: asset.id,
          record_key: sha256Hex(`Asset:${asset.organization_id}:${asset.id}`),
          record_hash: currentHash,
          seal_ref: newSealRef,
          sealed_at: now,
          algorithm: 'SHA-256',
        });
        asset.canonical_hash = currentHash;
        asset.integrity_seal_ref = newSealRef;
        asset.integrity_status = 'Verified';
        this.save();
      }

      return {
        verified: isMatch,
        name: asset.name,
        record: asset.asset_code,
        message: isMatch
          ? 'Canonical SHA-256 digest matches registered integrity seal.'
          : 'Integrity discrepancy detected! Current record does not match registered cryptographic seal.',
        transactionRef: seal ? seal.seal_ref : asset.integrity_seal_ref || 'LOKUS-SEAL-VERIFIED',
        checkedAt: now,
      };
    } else {
      const emp = db.employees.find((e) => e.id === id);
      if (!emp) return { verified: false, message: 'Employee not found', hash: '', sealRef: '' };
      const ident = db.identities.find((i) => i.employee_id === emp.id);
      const did = ident?.did || `did:lokus:${emp.organization_id}:${emp.id}`;
      const currentHash = computeEntityHash('identity', { ...emp, did });
      const seal = db.integrity_seals.find((s) => s.entity_type === 'Identity' && s.entity_id === id);

      const isMatch = seal ? seal.record_hash === currentHash : true;
      if (!seal) {
        const newSealRef = generateSealRef('Identity', emp.id, currentHash);
        db.integrity_seals.push({
          id: `seal-id-${emp.id}`,
          organization_id: emp.organization_id,
          entity_type: 'Identity',
          entity_id: emp.id,
          record_key: sha256Hex(`Identity:${emp.organization_id}:${emp.id}`),
          record_hash: currentHash,
          seal_ref: newSealRef,
          sealed_at: now,
          algorithm: 'SHA-256',
        });
        const ident = db.identities.find((i) => i.employee_id === emp.id);
        if (ident) {
          ident.hash = currentHash;
          ident.seal_ref = newSealRef;
          ident.status = 'Verified';
          ident.verified_at = now;
        }
        this.save();
      }

      return {
        verified: isMatch,
        name: `${emp.first_name} ${emp.last_name}`,
        record: emp.employee_code,
        message: isMatch
          ? 'Cryptographic identity digest matches registered seal.'
          : 'Discrepancy detected! Personnel identity credentials altered from original seal.',
        transactionRef: seal ? seal.seal_ref : `LOKUS-SEAL-ID-${emp.employee_code}`,
        checkedAt: now,
      };
    }
  }

  sealEntity(entityType: 'Asset' | 'Identity', id: string) {
    const db = this.load();
    const now = new Date().toISOString();

    if (entityType === 'Asset') {
      const asset = db.assets.find((a) => a.id === id);
      if (!asset) throw new Error('Asset not found');
      const hash = computeEntityHash('asset', asset);
      const sealRef = generateSealRef('Asset', asset.id, hash);

      asset.canonical_hash = hash;
      asset.integrity_seal_ref = sealRef;
      asset.integrity_status = 'Verified';

      const existingIdx = db.integrity_seals.findIndex((s) => s.entity_type === 'Asset' && s.entity_id === id);
      const sealRecord: LokusIntegritySeal = {
        id: `seal-ast-${asset.id}`,
        organization_id: asset.organization_id,
        entity_type: 'Asset',
        entity_id: asset.id,
        record_key: sha256Hex(`Asset:${asset.organization_id}:${asset.id}`),
        record_hash: hash,
        seal_ref: sealRef,
        sealed_at: now,
        algorithm: 'SHA-256',
      };
      if (existingIdx !== -1) db.integrity_seals[existingIdx] = sealRecord;
      else db.integrity_seals.push(sealRecord);

      this.addAudit({
        id: `log-${Date.now()}`,
        organization_id: asset.organization_id,
        actor_user_id: 'system',
        action: 'INTEGRITY_SEAL_ISSUED',
        entity_type: 'Asset',
        entity_id: asset.id,
        metadata: { sealRef, hash },
        created_at: now,
      });

      this.save();
      return sealRecord;
    } else {
      const emp = db.employees.find((e) => e.id === id);
      if (!emp) throw new Error('Employee not found');
      let ident = db.identities.find((i) => i.employee_id === emp.id);
      const did = ident?.did || `did:lokus:${emp.organization_id}:${emp.id}`;
      const hash = computeEntityHash('identity', { ...emp, did });
      const sealRef = generateSealRef('Identity', emp.id, hash);
      if (!ident) {
        ident = {
          id: `id-${emp.id}`,
          employee_id: emp.id,
          did: `did:lokus:${emp.organization_id}:${emp.id}`,
          status: 'Verified',
          hash,
          seal_ref: sealRef,
          verified_at: now,
          created_at: now,
        };
        db.identities.push(ident);
      } else {
        ident.hash = hash;
        ident.seal_ref = sealRef;
        ident.status = 'Verified';
        ident.verified_at = now;
      }

      const existingIdx = db.integrity_seals.findIndex((s) => s.entity_type === 'Identity' && s.entity_id === id);
      const sealRecord: LokusIntegritySeal = {
        id: `seal-id-${emp.id}`,
        organization_id: emp.organization_id,
        entity_type: 'Identity',
        entity_id: emp.id,
        record_key: sha256Hex(`Identity:${emp.organization_id}:${emp.id}`),
        record_hash: hash,
        seal_ref: sealRef,
        sealed_at: now,
        algorithm: 'SHA-256',
      };
      if (existingIdx !== -1) db.integrity_seals[existingIdx] = sealRecord;
      else db.integrity_seals.push(sealRecord);

      this.addAudit({
        id: `log-${Date.now()}`,
        organization_id: emp.organization_id,
        actor_user_id: 'system',
        action: 'IDENTITY_SEAL_ISSUED',
        entity_type: 'Identity',
        entity_id: emp.id,
        metadata: { sealRef, hash, did: ident.did },
        created_at: now,
      });

      this.save();
      return sealRecord;
    }
  }
}

export const db = new LokusDatabase();
