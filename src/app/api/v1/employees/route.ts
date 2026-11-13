import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const search = searchParams.get('search')?.toLowerCase();
  const unitId = searchParams.get('organization_unit_id');
  const status = searchParams.get('employment_status')?.toLowerCase();

  let list = db.employees;
  if (organizationId) {
    list = list.filter((e) => e.organization_id === organizationId);
  }
  if (unitId) {
    list = list.filter((e) => e.organization_unit_id === unitId);
  }
  if (status) {
    list = list.filter((e) => e.employment_status.toLowerCase() === status);
  }
  if (search) {
    list = list.filter(
      (e) =>
        e.first_name.toLowerCase().includes(search) ||
        e.last_name.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.designation.toLowerCase().includes(search) ||
        e.employee_code.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    items: list,
    total: list.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const emp = db.addEmployee({
      id,
      organization_id: body.organization_id || db.organizations[0]?.id || 'org-1',
      organization_unit_id: body.organization_unit_id || null,
      employee_code: body.employee_code || `EMP-${Date.now().toString().slice(-4)}`,
      first_name: body.first_name || 'New',
      last_name: body.last_name || 'Member',
      email: body.email || `employee-${Date.now()}@locus.internal`,
      designation: body.designation || 'Team Member',
      employment_status: body.employment_status || 'active',
      manager_employee_id: body.manager_employee_id || null,
      created_at: now,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: emp.organization_id,
      actor_user_id: 'admin',
      action: 'EMPLOYEE_CREATED',
      entity_type: 'Employee',
      entity_id: emp.id,
      metadata: { name: `${emp.first_name} ${emp.last_name}`, code: emp.employee_code },
      created_at: now,
    });

    return NextResponse.json(emp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create employee' }, { status: 500 });
  }
}

