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
      email: email.trim(),
      password_hash: password ? `hash_${password.length}` : 'demo_hash',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
