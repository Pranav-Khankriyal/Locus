import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  let user = db.users[0];
  if (token.startsWith('lokus_token_')) {
    const parts = token.split('_');
    const userId = parts[2];
    const found = db.users.find((u) => u.id === userId);
    if (found) user = found;
  }

  if (!user) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
}

