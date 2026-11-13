import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  let user = db.users[0];
  if (token.startsWith('locus_token_') || token.startsWith('lokus_token_')) {
    const parts = token.split('_');
    const userId = parts[2];
    const found = db.users.find((u) => u.id === userId);
    if (found) user = found;
  }

  if (!user) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  const memberships = db.user_roles
    .filter((ur) => ur.user_id === user.id)
    .map((ur) => {
      const org = db.organizations.find((o) => o.id === ur.organization_id);
      const role = db.roles.find((r) => r.id === ur.role_id);
      const isOwner =
        !!org &&
        (org.owner_user_id === user.id ||
          (!org.owner_user_id && ur.user_id === db.users[0]?.id));
      const isCoAdmin =
        !!org &&
        ((org.co_admin_emails || []).includes(user.email.toLowerCase()) ||
          role?.name.toLowerCase() === 'co-admin');
      return {
        organization_id: ur.organization_id,
        role_id: ur.role_id,
        role_name: role?.name || 'Employee',
        is_owner: isOwner,
        is_co_admin: isCoAdmin,
      };
    });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    memberships,
  });
}
