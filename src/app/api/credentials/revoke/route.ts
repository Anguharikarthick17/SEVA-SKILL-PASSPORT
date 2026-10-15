import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/credentials/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let reviewerId = 'admin-system';
    let role: string | null = null;
    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid authentication session.' },
          { status: 401 }
        );
      }
      reviewerId = user.id;

      // Check Supabase Auth app_metadata first (server-controlled RBAC)
      role = (user.app_metadata as any)?.role;

      if (!role) {
        try {
          const { data: profile } = await (adminClient as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          role = (profile as any)?.role;
        } catch {
          // Safe fallback if column is missing
        }
      }
    }

    const body = await req.json().catch(() => ({}));

    // In production or when adminClient is active, reject unauthenticated revocation
    if ((process.env.NODE_ENV === 'production' || adminClient) && !token) {
      return NextResponse.json(
        { error: 'Unauthorized: Bearer token is required for credential revocation.' },
        { status: 401 }
      );
    }

    // An authenticated user cannot override their assigned role via body.reviewerRole
    const userRole = role !== null ? role : (process.env.NODE_ENV !== 'production' ? body.reviewerRole || 'student' : 'student');

    const ALLOWED_ROLES = ['admin', 'instructor', 'reviewer'];
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators, instructors, or authorized reviewers may revoke credentials.' },
        { status: 403 }
      );
    }

    const { credentialId, reason } = body;
    if (!credentialId || typeof credentialId !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request: credentialId is required.' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Bad Request: A documented revocation reason of at least 5 characters is required.' },
        { status: 400 }
      );
    }

    const result = await CertificateService.revokeCredential(
      credentialId.trim(),
      reviewerId,
      reason.trim()
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to revoke credential.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Credential "${credentialId}" successfully revoked.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error during credential revocation.' },
      { status: 500 }
    );
  }
}
