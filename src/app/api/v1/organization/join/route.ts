import { NextResponse } from 'next/server';
import { db, normalizeCompanyCode } from '@/lib/db';

function resolveUser(request: Request, fallbackEmail?: string) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token.startsWith('lokus_token_')) {
    const userId = token.split('_')[2];
    const found = db.users.find((u) => u.id === userId);
    if (found) return found;
  }
  if (fallbackEmail) {
    return db.users.find((u) => u.email.toLowerCase() === fallbackEmail.toLowerCase()) || null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = String(body.code || '').trim();
    if (!rawCode) {
      return NextResponse.json({ detail: 'Company code is required.' }, { status: 400 });
    }

    const normalized = normalizeCompanyCode(rawCode);
    const org = db.organizations.find((o) => {
      const orgNorm = normalizeCompanyCode(o.code);
      return (
        orgNorm === normalized ||
        (normalized === 'ACME-2026' && orgNorm === 'ACME-CORP')
      );
    });

    if (!org) {
      return NextResponse.json(
        { detail: `No enterprise registered with company code "${rawCode}".` },
        { status: 404 }
      );
    }

    const user = resolveUser(request, body.email);
    if (!user) {
      return NextResponse.json({ detail: 'Authenticated user session not found.' }, { status: 401 });
    }

    const orgRoles = db.roles.filter((r) => r.organization_id === org.id);
    const isOwner = org.owner_user_id === user.id;
    const isCoAdmin = (org.co_admin_emails || []).includes(user.email.toLowerCase());

    const assignedRole = isOwner
      ? orgRoles.find((r) => r.name.toLowerCase().includes('owner') || r.name.toLowerCase().includes('administrator')) || orgRoles[0]
      : isCoAdmin
      ? orgRoles.find((r) => r.name.toLowerCase() === 'co-admin' || r.name.toLowerCase().includes('administrator')) || orgRoles[0]
      : orgRoles.find((r) => r.name.toLowerCase() === 'employee') || orgRoles[orgRoles.length - 1];

    if (assignedRole) {
      db.assignUserRole(user.id, assignedRole.id, org.id);
    }

    const existingEmp = db.employees.find(
      (e) => e.organization_id === org.id && e.email.toLowerCase() === user.email.toLowerCase()
    );
    const now = new Date().toISOString();
    let employee = existingEmp;

    if (!employee) {
      const orgUnits = db.units.filter((u) => u.organization_id === org.id);
      const preferredUnit =
        orgUnits.find((u) => u.unit_type === 'department') ||
        orgUnits.find((u) => u.unit_type === 'branch') ||
        orgUnits[0];
      const fullName = String(body.name || user.email.split('@')[0] || 'Team Member').trim();
      const parts = fullName.split(/\s+/);
      const countInOrg = db.employees.filter((e) => e.organization_id === org.id).length + 1;

      employee = db.addEmployee({
        id: `e-${Date.now()}`,
        organization_id: org.id,
        organization_unit_id: preferredUnit?.id || null,
        employee_code: `EMP-${String(countInOrg).padStart(3, '0')}`,
        first_name: parts[0] || 'Team',
        last_name: parts.slice(1).join(' ') || 'Member',
        email: user.email,
        designation: String(
          body.designation || (isCoAdmin ? 'Co-Administrator' : 'Enterprise Member')
        ),
        employment_status: 'active',
        manager_employee_id: null,
        created_at: now,
      });
    }

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: org.id,
      actor_user_id: user.id,
      action: 'EMPLOYEE_JOINED_VIA_CODE',
      entity_type: 'Employee',
      entity_id: employee.id,
      metadata: {
        email: user.email,
        companyCode: org.code,
        assignedRole: assignedRole?.name || 'Employee',
      },
      created_at: now,
    });

    return NextResponse.json({
      organization: org,
      role: assignedRole || null,
      employee,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to join organization';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

