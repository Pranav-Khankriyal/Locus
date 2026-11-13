import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Demo/dev convenience: create user record without auto-granting admin until onboarding
      user = db.addUser({
        id: `usr-${Date.now()}`,
        email: email.trim(),
        password_hash: 'demo_hash',
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }

    const token = `locus_token_${user.id}_${Date.now()}`;
    const refreshToken = `locus_refresh_${user.id}_${Date.now()}`;

    return NextResponse.json({
      access_token: token,
      refresh_token: refreshToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
