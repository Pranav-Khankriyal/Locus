import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unit = db.units.find((u) => u.id === id);
  if (!unit) {
    return NextResponse.json({ detail: 'Unit not found' }, { status: 404 });
  }
  return NextResponse.json(unit);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = db.updateUnit(id, {
    name: body.name,
    unit_type: body.unit_type,
    parent_unit_id: body.parent_unit_id,
  });
  if (!updated) {
    return NextResponse.json({ detail: 'Unit not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.deleteUnit(id);
  return new NextResponse(null, { status: 204 });
}

