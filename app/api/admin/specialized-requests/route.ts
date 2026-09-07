import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { specializedProjectTypes, specializedStatuses } from '@/lib/specialized-options';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

const safeSearch = (value: string) => value.trim().replace(/[,%()]/g, ' ').slice(0, 120);

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  const params = request.nextUrl.searchParams;
  const status = params.get('status') || 'all';
  const projectType = params.get('projectType') || '';
  const country = safeSearch(params.get('country') || '');
  const search = safeSearch(params.get('q') || '');
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  if (status !== 'all' && !specializedStatuses.includes(status as (typeof specializedStatuses)[number])) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  if (projectType && !specializedProjectTypes.includes(projectType as (typeof specializedProjectTypes)[number])) return NextResponse.json({ error: 'Invalid project type.' }, { status: 400 });
  try {
    let query = supabaseServer.from('specialized_engineering_requests').select('*').order('created_at', { ascending: false }).limit(250);
    if (status !== 'all') query = query.eq('status', status);
    if (projectType) query = query.contains('project_types', [projectType]);
    if (country) query = query.ilike('country', country);
    if (search) query = query.or(`reference_number.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%,project_description.ilike.%${search}%`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) query = query.gte('created_at', `${from}T00:00:00.000Z`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) query = query.lte('created_at', `${to}T23:59:59.999Z`);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Specialized engineering inbox error:', error);
    return NextResponse.json({ error: 'Failed to load specialized engineering requests.' }, { status: 500 });
  }
}
