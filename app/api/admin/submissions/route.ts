import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

type SubmissionType = 'contact' | 'build';

type Submission = {
  id: string;
  created_at: string;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  }

  const filter = request.nextUrl.searchParams.get('type') || 'all';
  const archived = request.nextUrl.searchParams.get('archived') || 'false';
  if (!['all', 'contact', 'build'].includes(filter)) {
    return NextResponse.json({ error: 'Invalid submission filter.' }, { status: 400 });
  }
  if (!['true', 'false'].includes(archived)) {
    return NextResponse.json({ error: 'Invalid archive filter.' }, { status: 400 });
  }

  try {
    const submissions: Array<Submission & { type: SubmissionType }> = [];

    if (filter === 'all' || filter === 'contact') {
      const { data, error } = await supabaseServer
        .from('contact_submissions')
        .select('*')
        .eq('archived', archived === 'true')
        .order('created_at', { ascending: false });
      if (error) throw error;
      submissions.push(...((data || []) as Submission[]).map((item) => ({ ...item, type: 'contact' as const })));
    }

    if (filter === 'all' || filter === 'build') {
      const { data, error } = await supabaseServer
        .from('build_requests')
        .select('*')
        .eq('archived', archived === 'true')
        .order('created_at', { ascending: false });
      if (error) throw error;
      submissions.push(...((data || []) as Submission[]).map((item) => ({ ...item, type: 'build' as const })));
    }

    submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json({ error: 'Failed to load submissions.' }, { status: 500 });
  }
}
