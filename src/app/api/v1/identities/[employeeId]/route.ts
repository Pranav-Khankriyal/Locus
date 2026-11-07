import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  let identity = db.identities.find((i) => i.employee_id === employeeId);

  if (!identity) {
    const emp = db.employees.find((e) => e.id === employeeId);
    if (!emp) {
      return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    }
    identity = {
      id: `id-${emp.id}`,
      employee_id: emp.id,
      did: `did:lokus:${emp.organization_id}:${emp.id}`,
      status: 'Pending',
      hash: '',
      seal_ref: '',
      verified_at: null,
      created_at: new Date().toISOString(),
    };
    db.identities.push(identity);
  }

  return NextResponse.json(identity);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const body = await request.json();
  const updated = db.updateIdentity(employeeId, body);
  if (!updated) {
    return NextResponse.json({ detail: 'Identity not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

