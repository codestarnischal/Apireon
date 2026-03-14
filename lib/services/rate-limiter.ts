import { supabaseAdmin } from '@/lib/supabase';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

export async function checkRateLimit(
  projectId: string,
  limitPerMinute: number
): Promise<RateLimitResult> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from('request_log')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', oneMinuteAgo);

  if (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request but log error
    return { allowed: true, remaining: 0, resetAt: new Date(Date.now() + 60000).toISOString() };
  }

  const used = count ?? 0;
  const allowed = used < limitPerMinute;

  return {
    allowed,
    remaining: Math.max(0, limitPerMinute - used),
    resetAt: new Date(Date.now() + 60000).toISOString(),
  };
}

export async function logRequest(
  projectId: string,
  resourceName: string,
  method: string,
  statusCode: number,
  ipAddress?: string
) {
  await supabaseAdmin.from('request_log').insert({
    project_id: projectId,
    resource_name: resourceName,
    method,
    status_code: statusCode,
    ip_address: ipAddress ?? null,
  });
}

export async function incrementUserUsage(userId: string) {
  await supabaseAdmin.rpc('increment_usage', { p_user_id: userId });
}

export async function checkUserCredits(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('request_credits, requests_used')
    .eq('id', userId)
    .single();

  if (!data) return false;
  return data.requests_used < data.request_credits;
}
