import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = db.organizations.find((o) => o.id === id);
  if (!org) {
    return NextResponse.json({ detail: 'Organization not found' }, { status: 404 });
  }
  return NextResponse.json(org);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = db.organizations.find((o) => o.id === id);
  if (!org) {
    return NextResponse.json({ detail: 'Organization not found' }, { status: 404 });
  }
  const body = await request.json();
  if (body.name) org.name = body.name;
  if (body.description !== undefined) org.description = body.description;
  return NextResponse.json(org);
}

