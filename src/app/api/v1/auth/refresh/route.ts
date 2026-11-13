import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const user = db.users[0];
  const access_token = `locus_token_${user?.id || 'demo'}_${Date.now()}`;
  const refresh_token = `locus_refresh_${user?.id || 'demo'}_${Date.now()}`;

  return NextResponse.json({
    access_token,
    refresh_token,
    token_type: 'bearer',
  });
}

