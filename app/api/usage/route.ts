import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const projectId = request.nextUrl.searchParams.get('projectId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
  }

  try {
    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Get today's requests
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let logQuery = supabaseAdmin
      .from('request_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    if (projectId) {
      logQuery = logQuery.eq('project_id', projectId);
    }

    const { count: todayCount } = await logQuery;

    // Get top resources (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let resourceQuery = supabaseAdmin
      .from('request_log')
      .select('resource_name')
      .gte('created_at', weekAgo);

    if (projectId) {
      resourceQuery = resourceQuery.eq('project_id', projectId);
    }

    const { data: logs } = await resourceQuery;

    // Count resources
    const resourceCounts: Record<string, number> = {};
    for (const log of logs ?? []) {
      resourceCounts[log.resource_name] = (resourceCounts[log.resource_name] || 0) + 1;
    }

    const topResources = Object.entries(resourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        total_requests: profile.requests_used,
        credits_remaining: profile.request_credits - profile.requests_used,
        requests_today: todayCount ?? 0,
        top_resources: topResources,
        plan: profile.plan,
      },
    });
  } catch (err) {
    console.error('Usage stats error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
