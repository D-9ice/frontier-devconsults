import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

type Activity = {
  id: string;
  type: 'contact' | 'build' | 'project' | 'app';
  title: string;
  detail: string;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalVisitorsResult,
      visitsTodayResult,
      contactCountResult,
      buildCountResult,
      pendingContactResult,
      pendingBuildResult,
      activeProjectsResult,
      publishedAppsResult,
      appsInDevelopmentResult,
      contactsResult,
      buildsResult,
      projectsResult,
      appsResult,
    ] = await Promise.all([
      supabaseServer.from('visitors').select('*', { count: 'exact', head: true }),
      supabaseServer.from('visitors').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabaseServer.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabaseServer.from('build_requests').select('*', { count: 'exact', head: true }),
      supabaseServer.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('responded', false),
      supabaseServer.from('build_requests').select('*', { count: 'exact', head: true }).eq('responded', false),
      supabaseServer.from('projects').select('*', { count: 'exact', head: true }).in('status', ['Production', 'Development']),
      supabaseServer.from('apps').select('*', { count: 'exact', head: true }).eq('visibility', 'published'),
      supabaseServer.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'Development'),
      supabaseServer.from('contact_submissions').select('id, name, created_at').order('created_at', { ascending: false }).limit(4),
      supabaseServer.from('build_requests').select('id, name, description, created_at').order('created_at', { ascending: false }).limit(4),
      supabaseServer.from('projects').select('id, title, visibility, updated_at').order('updated_at', { ascending: false }).limit(4),
      supabaseServer.from('apps').select('id, name, visibility, updated_at').order('updated_at', { ascending: false }).limit(4),
    ]);

    const results = [
      totalVisitorsResult, visitsTodayResult, contactCountResult, buildCountResult, pendingContactResult,
      pendingBuildResult, activeProjectsResult, publishedAppsResult, appsInDevelopmentResult, contactsResult,
      buildsResult, projectsResult, appsResult,
    ];
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;

    const recentActivity: Activity[] = [
      ...((contactsResult.data || []).map((item) => ({
        id: `contact-${item.id}`,
        type: 'contact' as const,
        title: 'New contact enquiry',
        detail: item.name,
        createdAt: item.created_at,
      }))),
      ...((buildsResult.data || []).map((item) => ({
        id: `build-${item.id}`,
        type: 'build' as const,
        title: 'New build request',
        detail: item.description?.split('\n')[0] || item.name,
        createdAt: item.created_at,
      }))),
      ...((projectsResult.data || []).map((item) => ({
        id: `project-${item.id}`,
        type: 'project' as const,
        title: item.visibility === 'published' ? 'Project published or updated' : 'Project draft updated',
        detail: item.title,
        createdAt: item.updated_at,
      }))),
      ...((appsResult.data || []).map((item) => ({
        id: `app-${item.id}`,
        type: 'app' as const,
        title: item.visibility === 'published' ? 'App published or updated' : 'App draft updated',
        detail: item.name,
        createdAt: item.updated_at,
      }))),
    ]
      .filter((item) => Boolean(item.createdAt))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return NextResponse.json({
      stats: {
        totalVisitors: totalVisitorsResult.count || 0,
        visitsToday: visitsTodayResult.count || 0,
        totalSubmissions: (contactCountResult.count || 0) + (buildCountResult.count || 0),
        pendingRequests: (pendingContactResult.count || 0) + (pendingBuildResult.count || 0),
        activeProjects: activeProjectsResult.count || 0,
        publishedApps: publishedAppsResult.count || 0,
        appsInDevelopment: appsInDevelopmentResult.count || 0,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data.' }, { status: 500 });
  }
}
