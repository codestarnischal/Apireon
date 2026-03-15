'use client';

import { useState } from 'react';
import {
  BookOpen, Globe, Lock, Zap, ChevronDown, Copy, Check, ChevronRight, ExternalLink,
} from 'lucide-react';
import { generateExamplePayload } from '@/lib/validators/schema-validator';
import type { ResourceSchema, FieldType } from '@/types';

interface PublicProject {
  name: string;
  description: string | null;
  schema_definition: Record<string, Record<string, FieldType>>;
  api_key: string;
  rate_limit_per_minute: number;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-[#f8f9fa] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-[#9aa0a6]" />}
    </button>
  );
}

function EndpointBlock({
  method,
  resource,
  baseUrl,
  schema,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  resource: string;
  baseUrl: string;
  schema: ResourceSchema;
}) {
  const [open, setOpen] = useState(false);
  const example = generateExamplePayload(schema);
  const methodClasses: Record<string, string> = {
    GET: 'method-get', POST: 'method-post', PUT: 'method-put', DELETE: 'method-delete',
  };

  return (
    <div className="border border-[#e8eaed] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fa]">
        <span className={`method-badge ${methodClasses[method]} text-[11px]`}>{method}</span>
        <code className="text-sm font-mono text-[#1a1a1a]">/{resource}{['PUT', 'DELETE'].includes(method) ? '?id={id}' : ''}</code>
        <ChevronDown className={`h-3.5 w-3.5 text-[#9aa0a6] ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-[#e8eaed] p-4 space-y-4">
          {['POST', 'PUT'].includes(method) && (
            <div>
              <h4 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-2">
                Request Body
              </h4>
              <pre className="bg-surface-1 rounded-lg p-3 text-xs font-mono text-[#5f6368] overflow-x-auto">
                {JSON.stringify(example, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-2">Schema</h4>
            <div className="space-y-1">
              {Object.entries(schema).map(([field, type]) => (
                <div key={field} className="flex items-center gap-3 text-sm py-1 px-3 bg-[#f8f9fa] rounded">
                  <code className="font-mono text-zinc-200 w-28">{field}</code>
                  <span className="font-mono text-xs text-[#1a1a1a]">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicDocsClient({ project }: { project: PublicProject }) {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/${project.api_key}`
    : `/api/v1/${project.api_key}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#F0F0EE] border border-brand-500/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-sm text-[#5f6368]">{project.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-[#f8f9fa] rounded-lg px-4 py-2.5 border border-[#e8eaed]">
            <Globe className="h-4 w-4 text-[#9aa0a6]" />
            <code className="text-sm font-mono text-[#1a1a1a] flex-1">{baseUrl}</code>
            <CopyBtn text={baseUrl} />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="card p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Authentication</h3>
              <p className="text-xs text-[#5f6368] mt-0.5">API key is embedded in the URL. No auth headers needed.</p>
            </div>
          </div>
          <div className="card p-4 flex items-start gap-3">
            <Zap className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Rate Limit</h3>
              <p className="text-xs text-[#5f6368] mt-0.5">{project.rate_limit_per_minute} requests per minute</p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        {Object.entries(project.schema_definition).map(([resource, schema]) => (
          <div key={resource} className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 capitalize">
              <ChevronRight className="h-4 w-4 text-[#1a1a1a]" />
              {resource}
            </h2>
            <div className="space-y-2">
              {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                <EndpointBlock key={m} method={m} resource={resource} baseUrl={baseUrl} schema={schema} />
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#e8eaed] text-center">
          <p className="text-xs text-[#9aa0a6]">
            Powered by <a href="/" className="text-[#1a1a1a] hover:text-[#1a1a1a]">Apireon</a>
          </p>
        </div>
      </div>
    </div>
  );
}
