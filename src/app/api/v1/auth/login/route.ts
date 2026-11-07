import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // In demo/dev mode, automatically create the user if not found
      user = db.addUser({
        id: `usr-${Date.now()}`,
        email,
        password_hash: 'demo_hash',
        is_active: true,
        created_at: new Date().toISOString(),
      });
      // Also assign to default admin role
      const org = db.organizations[0];
      const role = db.roles[0];
      if (org && role) {
        db.assignUserRole(user.id, role.id, org.id);
      }
    }

    const token = `lokus_token_${user.id}_${Date.now()}`;
    const refreshToken = `lokus_refresh_${user.id}_${Date.now()}`;

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
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Login failed' }, { status: 500 });
  }
}

