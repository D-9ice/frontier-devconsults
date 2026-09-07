import { NextRequest, NextResponse } from 'next/server';
import { acquisitionStatuses } from '@/lib/acquisition-options';
import { requireAdmin } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  const params = request.nextUrl.searchParams;
  const status = params.get('status') || 'all';
  const product = (params.get('product') || '').trim();
  const country = (params.get('country') || '').trim();
  const type = (params.get('type') || '').trim();
  const search = (params.get('q') || '').trim().replace(/[,%()]/g, ' ').slice(0, 120);
  if (status !== 'all' && !acquisitionStatuses.includes(status as (typeof acquisitionStatuses)[number])) return NextResponse.json({ error: 'Invalid acquisition status.' }, { status: 400 });
  try {
    let query = supabaseServer.from('application_acquisition_requests').select('*').order('created_at', { ascending: false }).limit(250);
    if (status !== 'all') query = query.eq('status', status);
    if (product) query = query.eq('product_slug', product);
    if (country) query = query.ilike('buyer_country', country);
    if (type) query = query.eq('acquisition_type', type);
    if (search) query = query.or(`reference_number.ilike.%${search}%,buyer_full_name.ilike.%${search}%,buyer_company.ilike.%${search}%,buyer_email.ilike.%${search}%,product_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Acquisition inbox error:', error);
    return NextResponse.json({ error: 'Failed to load acquisition requests.' }, { status: 500 });
  }
}
