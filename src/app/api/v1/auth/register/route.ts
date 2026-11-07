import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({
        id: existing.id,
        email: existing.email,
        created_at: existing.created_at,
      });
    }

    const newUser = db.addUser({
      id: `usr-${Date.now()}`,
      email,
      password_hash: 'demo_hash',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    const org = db.organizations[0];
    const role = db.roles[0];
    if (org && role) {
      db.assignUserRole(newUser.id, role.id, org.id);
    }

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Registration failed' }, { status: 500 });
  }
}

