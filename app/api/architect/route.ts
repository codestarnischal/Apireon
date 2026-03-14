import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSchema, generateSchemaFallback } from '@/lib/services/architect-engine';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A description prompt is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Check project limits
    const { count } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('max_projects')
      .eq('id', userId)
      .single();

    if (profile && count !== null && count >= profile.max_projects) {
      return NextResponse.json(
        { success: false, error: `Project limit reached (${profile.max_projects}). Upgrade your plan for more.` },
        { status: 403 }
      );
    }

    // Generate schema via AI or fallback
    let result;
    try {
      result = await generateSchema(prompt);
    } catch (aiError) {
      console.warn('AI schema generation failed, using fallback:', aiError);
      result = generateSchemaFallback(prompt);
    }

    // Create the project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        name: result.name,
        description: result.description,
        schema_definition: result.schema,
      })
      .select()
      .single();

    if (error) {
      console.error('Project creation failed:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        project,
        resources: Object.keys(result.schema),
        base_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/${project.api_key}`,
      },
    });
  } catch (err) {
    console.error('Architect route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
