import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/lib/projects/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const adminClient = getSupabaseServerAdminClient();
    let role = 'student';

    if (token && adminClient) {
      const { data: { user } } = await adminClient.auth.getUser(token);
      if (user) {
        // Check Supabase Auth app_metadata first (server-controlled RBAC)
        role = (user.app_metadata as any)?.role || 'student';

        if (role === 'student') {
          try {
            const { data: profile } = await (adminClient as any)
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            if (profile?.role) {
              role = profile.role;
            }
          } catch {
            // Safe fallback if column is missing
          }
        }
      }
    }

    // Role verification
    const ALLOWED_ROLES = ['admin', 'instructor', 'reviewer'];
    const queryRole = req.nextUrl.searchParams.get('role');
    
    // In production or when token is present, query parameters CANNOT override authenticated role
    const finalRole = (token || process.env.NODE_ENV === 'production')
      ? role
      : (queryRole && ALLOWED_ROLES.includes(queryRole) ? queryRole : role);

    if (!ALLOWED_ROLES.includes(finalRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient privileges to view instructor submissions.' },
        { status: 403 }
      );
    }

    // Fetch all submissions for review
    const allProjects = await ProjectService.getAllProjects();
    const submissions = await ProjectService.getAllSubmissionsForReview();

    return NextResponse.json({
      success: true,
      submissions,
      projects: allProjects,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error fetching submissions.' },
      { status: 500 }
    );
  }
}
