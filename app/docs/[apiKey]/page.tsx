import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PublicDocsClient from './PublicDocsClient';

// Force dynamic rendering — this page needs DB access at runtime
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ apiKey: string }>;
}

export default async function PublicDocsPage({ params }: PageProps) {
  const { apiKey } = await params;

  // Fetch the project by API key
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('name, description, schema_definition, api_key, rate_limit_per_minute')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !project) {
    notFound();
  }

  return <PublicDocsClient project={project} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { apiKey } = await params;
  return {
    title: `API Documentation — Procyon Labs`,
    description: `Auto-generated REST API documentation`,
  };
}
