import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validatePayload } from '@/lib/validators/schema-validator';
import { checkRateLimit, logRequest, incrementUserUsage, checkUserCredits } from '@/lib/services/rate-limiter';
import type { Project, SchemaDefinition } from '@/types';

// ============================================================
// Universal API Router
// Handles: GET, POST, PUT, DELETE for any resource on any project
// Route: /api/v1/[apiKey]/[resource]
// ============================================================

interface RouteParams {
  params: Promise<{ apiKey: string; resource: string }>;
}

// Helper: Resolve project from API key
async function resolveProject(apiKey: string): Promise<Project | null> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Project;
}

// Helper: Validate resource exists in schema
function getResourceSchema(schema: SchemaDefinition, resource: string) {
  return schema[resource] ?? null;
}

// Helper: Build standard error response
function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// Helper: Build success response with CORS
function successResponse(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// ============================================================
// OPTIONS - CORS preflight
// ============================================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ============================================================
// GET - Fetch records
// Query params: ?page=1&per_page=25&sort=created_at&order=desc&id=UUID
// ============================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { apiKey, resource } = await params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    // 1. Resolve project
    const project = await resolveProject(apiKey);
    if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Invalid API key or inactive project', 404);

    // 2. Validate resource
    const resourceSchema = getResourceSchema(project.schema_definition, resource);
    if (!resourceSchema) {
      const available = Object.keys(project.schema_definition).join(', ');
      return errorResponse('RESOURCE_NOT_FOUND', `Resource "${resource}" not found. Available: ${available}`, 404);
    }

    // 3. Rate limiting
    const rateCheck = await checkRateLimit(project.id, project.rate_limit_per_minute);
    if (!rateCheck.allowed) {
      await logRequest(project.id, resource, 'GET', 429, ip);
      return errorResponse('RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Resets at ${rateCheck.resetAt}`, 429);
    }

    // 4. Check user credits
    const hasCredits = await checkUserCredits(project.user_id);
    if (!hasCredits) {
      return errorResponse('CREDITS_EXHAUSTED', 'API request credits exhausted. Please upgrade your plan.', 402);
    }

    // 5. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '25')));
    const sortField = searchParams.get('sort') ?? 'created_at';
    const sortOrder = searchParams.get('order') === 'asc' ? true : false;
    const recordId = searchParams.get('id');
    const offset = (page - 1) * perPage;

    // 6. Fetch data
    let query = supabaseAdmin
      .from('data_records')
      .select('*', { count: 'exact' })
      .eq('project_id', project.id)
      .eq('resource_name', resource);

    if (recordId) {
      query = query.eq('id', recordId);
    }

    query = query
      .order(sortField, { ascending: sortOrder })
      .range(offset, offset + perPage - 1);

    const { data: records, error, count } = await query;

    if (error) {
      console.error('DB error:', error);
      return errorResponse('DATABASE_ERROR', 'Failed to fetch records', 500);
    }

    // 7. Transform records — return payload with id and timestamps
    const transformed = (records ?? []).map((r) => ({
      id: r.id,
      ...r.payload,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // 8. Log & track usage
    await logRequest(project.id, resource, 'GET', 200, ip);
    await incrementUserUsage(project.user_id);

    return successResponse(recordId ? transformed[0] ?? null : transformed, {
      total: count ?? 0,
      page,
      per_page: perPage,
    });
  } catch (err) {
    console.error('GET error:', err);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

// ============================================================
// POST - Create a new record
// ============================================================
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { apiKey, resource } = await params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    // 1. Resolve project
    const project = await resolveProject(apiKey);
    if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Invalid API key or inactive project', 404);

    // 2. Validate resource
    const resourceSchema = getResourceSchema(project.schema_definition, resource);
    if (!resourceSchema) {
      const available = Object.keys(project.schema_definition).join(', ');
      return errorResponse('RESOURCE_NOT_FOUND', `Resource "${resource}" not found. Available: ${available}`, 404);
    }

    // 3. Rate limiting
    const rateCheck = await checkRateLimit(project.id, project.rate_limit_per_minute);
    if (!rateCheck.allowed) {
      await logRequest(project.id, resource, 'POST', 429, ip);
      return errorResponse('RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Resets at ${rateCheck.resetAt}`, 429);
    }

    // 4. Credits check
    const hasCredits = await checkUserCredits(project.user_id);
    if (!hasCredits) {
      return errorResponse('CREDITS_EXHAUSTED', 'API request credits exhausted. Please upgrade your plan.', 402);
    }

    // 5. Parse and validate body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    const validation = validatePayload(body, resourceSchema);
    if (!validation.valid) {
      return errorResponse('VALIDATION_ERROR', 'Payload validation failed', 400);
    }

    // 6. Insert record
    const { data: record, error } = await supabaseAdmin
      .from('data_records')
      .insert({
        project_id: project.id,
        resource_name: resource,
        payload: body,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return errorResponse('DATABASE_ERROR', 'Failed to create record', 500);
    }

    // 7. Log & track
    await logRequest(project.id, resource, 'POST', 201, ip);
    await incrementUserUsage(project.user_id);

    return successResponse(
      {
        id: record.id,
        ...record.payload,
        created_at: record.created_at,
        updated_at: record.updated_at,
      },
      undefined,
      201
    );
  } catch (err) {
    console.error('POST error:', err);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

// ============================================================
// PUT - Update a record (by ?id=UUID)
// ============================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { apiKey, resource } = await params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    const project = await resolveProject(apiKey);
    if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Invalid API key or inactive project', 404);

    const resourceSchema = getResourceSchema(project.schema_definition, resource);
    if (!resourceSchema) return errorResponse('RESOURCE_NOT_FOUND', `Resource "${resource}" not found`, 404);

    const rateCheck = await checkRateLimit(project.id, project.rate_limit_per_minute);
    if (!rateCheck.allowed) return errorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', 429);

    const recordId = request.nextUrl.searchParams.get('id');
    if (!recordId) return errorResponse('MISSING_ID', 'Query parameter "id" is required for updates', 400);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    // Partial validation: only validate fields that are provided
    for (const [key, value] of Object.entries(body)) {
      if (!(key in resourceSchema)) {
        return errorResponse('VALIDATION_ERROR', `Unknown field "${key}"`, 400);
      }
    }

    // Fetch existing, merge, update
    const { data: existing } = await supabaseAdmin
      .from('data_records')
      .select('payload')
      .eq('id', recordId)
      .eq('project_id', project.id)
      .eq('resource_name', resource)
      .single();

    if (!existing) return errorResponse('RECORD_NOT_FOUND', 'Record not found', 404);

    const merged = { ...existing.payload, ...body };

    const { data: updated, error } = await supabaseAdmin
      .from('data_records')
      .update({ payload: merged, updated_at: new Date().toISOString() })
      .eq('id', recordId)
      .select()
      .single();

    if (error) return errorResponse('DATABASE_ERROR', 'Failed to update record', 500);

    await logRequest(project.id, resource, 'PUT', 200, ip);
    await incrementUserUsage(project.user_id);

    return successResponse({
      id: updated.id,
      ...updated.payload,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    console.error('PUT error:', err);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

// ============================================================
// DELETE - Remove a record (by ?id=UUID)
// ============================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { apiKey, resource } = await params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    const project = await resolveProject(apiKey);
    if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Invalid API key or inactive project', 404);

    const resourceSchema = getResourceSchema(project.schema_definition, resource);
    if (!resourceSchema) return errorResponse('RESOURCE_NOT_FOUND', `Resource "${resource}" not found`, 404);

    const recordId = request.nextUrl.searchParams.get('id');
    if (!recordId) return errorResponse('MISSING_ID', 'Query parameter "id" is required for deletion', 400);

    const { error } = await supabaseAdmin
      .from('data_records')
      .delete()
      .eq('id', recordId)
      .eq('project_id', project.id)
      .eq('resource_name', resource);

    if (error) return errorResponse('DATABASE_ERROR', 'Failed to delete record', 500);

    await logRequest(project.id, resource, 'DELETE', 200, ip);
    await incrementUserUsage(project.user_id);

    return successResponse({ deleted: true, id: recordId });
  } catch (err) {
    console.error('DELETE error:', err);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
