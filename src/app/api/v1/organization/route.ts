import { NextResponse } from 'next/server';
import { buildOrgDefaultRoles, db, normalizeCompanyCode } from '@/lib/db';

interface HierarchyBranchInput {
  name: string;
  country?: string;
  state?: string;
  departments?: string[];
}

function resolveUserFromRequest(request: Request, fallbackEmail?: string) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token.startsWith('locus_token_') || token.startsWith('lokus_token_')) {
    const userId = token.split('_')[2];
    const found = db.users.find((u) => u.id === userId);
    if (found) return found;
  }
  if (fallbackEmail) {
    return db.users.find((u) => u.email.toLowerCase() === fallbackEmail.toLowerCase()) || null;
  }
  return db.users[0] || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkCode = searchParams.get('check_code');

  if (checkCode !== null) {
    const normalized = normalizeCompanyCode(checkCode);
    const conflict = db.organizations.find(
      (o) => normalizeCompanyCode(o.code) === normalized
    );
    return NextResponse.json({
      normalizedCode: normalized,
      available: normalized.length >= 3 && !conflict,
      existingName: conflict?.name || null,
    });
  }

  return NextResponse.json({
    organizations: db.organizations,
    total: db.organizations.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgName = String(body.name || '').trim();
    if (!orgName) {
      return NextResponse.json({ detail: 'Organization name is required.' }, { status: 400 });
    }

    const rawCode = String(body.code || orgName);
    const code = normalizeCompanyCode(rawCode);
    if (code.length < 3) {
      return NextResponse.json(
        { detail: 'Unique company code must be at least 3 alphanumeric characters.' },
        { status: 400 }
      );
    }

    const duplicate = db.organizations.find(
      (o) => normalizeCompanyCode(o.code) === code
    );
    if (duplicate) {
      return NextResponse.json(
        { detail: `Company code "${code}" is already registered. Choose a unique code.` },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const id = `org-${Date.now()}`;
    const creator = resolveUserFromRequest(request, body.creatorEmail);
    const ownerUserId = creator?.id || body.creatorUserId || db.users[0]?.id;
    const ownerEmail = (creator?.email || body.creatorEmail || 'owner@locus.io').toLowerCase();
    const ownerName = String(body.creatorName || ownerEmail.split('@')[0] || 'Owner').trim();

    const coAdminEmails: string[] = Array.isArray(body.coAdminEmails)
      ? Array.from(
          new Set(
            body.coAdminEmails
              .map((e: unknown) => String(e || '').trim().toLowerCase())
              .filter((e: string) => e && e !== ownerEmail)
          )
        )
      : [];

    const newOrg = db.addOrganization({
      id,
      name: orgName,
      code,
      description: body.description || `${orgName} Enterprise Workspace (@${code})`,
      owner_user_id: ownerUserId,
      co_admin_emails: coAdminEmails,
      created_at: now,
    });

    // Seed RBAC roles specifically for this enterprise
    const { ownerRole, coAdminRole, assetManagerRole, employeeRole } = buildOrgDefaultRoles(id, now);
    db.addRole(ownerRole);
    db.addRole(coAdminRole);
    db.addRole(assetManagerRole);
    db.addRole(employeeRole);

    // Build company hierarchy tree: Root Company -> Branches (Country/State) -> Departments
    const rootUnit = db.addUnit({
      id: `u-root-${Date.now()}`,
      organization_id: id,
      name: orgName,
      unit_type: 'company',
      parent_unit_id: null,
      created_at: now,
    });

    const branches: HierarchyBranchInput[] =
      Array.isArray(body.hierarchy?.branches) && body.hierarchy.branches.length > 0
        ? body.hierarchy.branches
        : [{ name: 'Headquarters', country: 'Global', state: '', departments: ['Engineering', 'Operations'] }];

    let seq = 1;
    for (const branch of branches) {
      const bName = String(branch.name || '').trim();
      if (!bName) continue;
      const geo = [branch.state?.trim(), branch.country?.trim()].filter(Boolean).join(', ');
      const fullBranchName = geo ? `${bName} · ${geo}` : bName;
      const branchUnit = db.addUnit({
        id: `u-br-${Date.now()}-${seq++}`,
        organization_id: id,
        name: fullBranchName,
        unit_type: 'branch',
        parent_unit_id: rootUnit.id,
        created_at: now,
      });

      const depts = Array.isArray(branch.departments) ? branch.departments : [];
      for (const deptRaw of depts) {
        const dName = String(deptRaw || '').trim();
        if (!dName) continue;
        db.addUnit({
          id: `u-dp-${Date.now()}-${seq++}`,
          organization_id: id,
          name: dName,
          unit_type: 'department',
          parent_unit_id: branchUnit.id,
          created_at: now,
        });
      }
    }

    // Create Owner employee record (with identity seal + default HR/Payroll/PF setup)
    const nameParts = ownerName.split(/\s+/);
    const ownerEmpId = `e-${Date.now()}`;
    db.addEmployee({
      id: ownerEmpId,
      organization_id: id,
      organization_unit_id: rootUnit.id,
      employee_code: 'EMP-001',
      first_name: nameParts[0] || 'Enterprise',
      last_name: nameParts.slice(1).join(' ') || 'Owner',
      email: ownerEmail,
      designation: String(body.ownerDesignation || 'Founder & Owner'),
      employment_status: 'active',
      manager_employee_id: null,
      created_at: now,
    });

    if (ownerUserId) {
      db.assignUserRole(ownerUserId, ownerRole.id, id);
    }

    // Promote any existing users listed as Co-Admin
    for (const email of coAdminEmails) {
      const existingCoUser = db.users.find((u) => u.email.toLowerCase() === email);
      if (existingCoUser) {
        db.assignUserRole(existingCoUser.id, coAdminRole.id, id);
      }
    }

    // Starter holiday calendar
    [
      { name: "New Year's Day", date: '2026-01-01', type: 'Public' as const },
      { name: 'Republic Day', date: '2026-01-26', type: 'Public' as const },
      { name: 'Independence Day', date: '2026-08-15', type: 'Public' as const },
      { name: 'Annual Founder Day', date: '2026-10-02', type: 'Company' as const },
    ].forEach((h, idx) => {
      db.addHoliday({
        id: `hol-${id}-${idx + 1}`,
        organization_id: id,
        name: h.name,
        date: h.date,
        type: h.type,
      });
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: id,
      actor_user_id: ownerUserId || 'admin',
      action: 'ORGANISATION_CREATED',
      entity_type: 'Organisation',
      entity_id: id,
      metadata: {
        name: orgName,
        code,
        branches: String(branches.length),
        coAdmins: coAdminEmails.join(', ') || 'None',
      },
      created_at: now,
    });

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create organization';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
