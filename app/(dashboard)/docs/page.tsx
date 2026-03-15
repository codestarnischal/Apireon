'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronRight, Copy, Check,
  Globe, Lock, Zap, Info, ExternalLink,
} from 'lucide-react';
import type { FieldType, ResourceSchema } from '@/types';
import { generateExamplePayload } from '@/lib/validators/schema-validator';

// Demo data
const DEMO_API_KEY = 'd4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f80';
const DEMO_SCHEMA: Record<string, ResourceSchema> = {
  books: {
    title: 'string' as FieldType, isbn: 'string' as FieldType, price: 'number' as FieldType,
    genre: 'string' as FieldType, author_id: 'uuid' as FieldType,
    published_date: 'date' as FieldType, in_stock: 'boolean' as FieldType,
  },
  authors: {
    name: 'string' as FieldType, bio: 'string' as FieldType,
    email: 'email' as FieldType, website: 'url' as FieldType, born_year: 'number' as FieldType,
  },
  reviews: {
    book_id: 'uuid' as FieldType, reviewer_name: 'string' as FieldType,
    rating: 'number' as FieldType, comment: 'string' as FieldType,
  },
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-[var(--warm)] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-[var(--ink-2)]" />}
    </button>
  );
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  string: 'Text value, max 10,000 characters',
  number: 'Numeric value (integer or float)',
  boolean: 'true or false',
  uuid: 'UUID v4 format (e.g., 550e8400-e29b-...)',
  email: 'Valid email address',
  url: 'Valid URL starting with http(s)://',
  date: 'ISO 8601 date string',
  array: 'JSON array of values',
  object: 'Nested JSON object',
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface EndpointDocProps {
  method: Method;
  resource: string;
  baseUrl: string;
  schema: ResourceSchema;
}

function EndpointDoc({ method, resource, baseUrl, schema }: EndpointDocProps) {
  const [expanded, setExpanded] = useState(false);
  const url = `${baseUrl}/${resource}`;
  const example = generateExamplePayload(schema);

  const methodConfig: Record<Method, { color: string; desc: string; queryParams?: string[] }> = {
    GET: { color: 'method-get', desc: `List all ${resource} or fetch by ID`, queryParams: ['page', 'per_page', 'sort', 'order', 'id'] },
    POST: { color: 'method-post', desc: `Create a new ${resource.replace(/s$/, '')}` },
    PUT: { color: 'method-put', desc: `Update an existing ${resource.replace(/s$/, '')} by ID`, queryParams: ['id'] },
    DELETE: { color: 'method-delete', desc: `Delete a ${resource.replace(/s$/, '')} by ID`, queryParams: ['id'] },
  };

  const config = methodConfig[method];

  const exampleResponse = method === 'GET'
    ? JSON.stringify({ success: true, data: [{ id: '550e8400-...', ...example, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }], meta: { total: 1, page: 1, per_page: 25 } }, null, 2)
    : method === 'POST'
      ? JSON.stringify({ success: true, data: { id: '550e8400-...', ...example, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' } }, null, 2)
      : method === 'DELETE'
        ? JSON.stringify({ success: true, data: { deleted: true, id: '550e8400-...' } }, null, 2)
        : JSON.stringify({ success: true, data: { id: '550e8400-...', ...example } }, null, 2);

  return (
    <div className="border border-black/[0.04] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--warm)] transition-colors"
      >
        <span className={`method-badge ${config.color} text-[11px]`}>{method}</span>
        <code className="text-sm font-mono text-[var(--ink-2)]">/{resource}{method === 'PUT' || method === 'DELETE' ? '?id={id}' : ''}</code>
        <span className="text-xs text-[var(--ink-2)] ml-auto mr-2">{config.desc}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[var(--ink-2)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="border-t border-black/[0.04] overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* URL */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wider mb-2">Endpoint</h4>
                <div className="flex items-center gap-2 bg-white rounded px-3 py-2">
                  <code className="text-sm font-mono text-[var(--ink)] flex-1">{url}{method !== 'POST' && method !== 'GET' ? '?id={id}' : ''}</code>
                  <CopyBtn text={url} />
                </div>
              </div>

              {/* Query Params */}
              {config.queryParams && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wider mb-2">Query Parameters</h4>
                  <div className="space-y-1.5">
                    {config.queryParams.map((p) => (
                      <div key={p} className="flex items-center gap-3 text-sm py-1">
                        <code className="font-mono text-[var(--ink)]">{p}</code>
                        <span className="text-[var(--ink-2)]">—</span>
                        <span className="text-[var(--ink-2)] text-xs">
                          {p === 'page' ? 'Page number (default: 1)' :
                            p === 'per_page' ? 'Results per page (default: 25, max: 100)' :
                              p === 'sort' ? 'Sort field (default: created_at)' :
                                p === 'order' ? 'asc or desc (default: desc)' :
                                  p === 'id' ? 'UUID of the record (required for single-record ops)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Body (POST/PUT) */}
              {(method === 'POST' || method === 'PUT') && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wider mb-2">
                    Request Body {method === 'PUT' && <span className="text-[var(--ink-2)] normal-case">(partial updates allowed)</span>}
                  </h4>
                  <div className="space-y-1.5 mb-4">
                    {Object.entries(schema).map(([field, type]) => (
                      <div key={field} className="flex items-center gap-3 text-sm py-1.5 px-3 bg-white/[0.02] rounded">
                        <code className="font-mono text-[var(--ink-2)] w-32">{field}</code>
                        <span className="font-mono text-xs text-[var(--ink)]">{type}</span>
                        <span className="text-[var(--ink-2)] text-xs flex-1">{TYPE_DESCRIPTIONS[type] || ''}</span>
                        {method === 'POST' && <span className="text-[10px] text-amber-400/60 uppercase">required</span>}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/[0.04]">
                      <span className="text-[10px] text-[var(--ink-2)] uppercase">Example Body</span>
                      <CopyBtn text={JSON.stringify(example, null, 2)} />
                    </div>
                    <pre className="p-3 text-xs font-mono text-[var(--ink-2)] overflow-x-auto">
                      {JSON.stringify(example, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wider mb-2">Example Response</h4>
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/[0.04]">
                    <span className="text-[10px] text-emerald-400/80 font-mono">200 OK</span>
                    <CopyBtn text={exampleResponse} />
                  </div>
                  <pre className="p-3 text-xs font-mono text-[var(--ink-2)] overflow-x-auto max-h-64">
                    {exampleResponse}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DocsPage() {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/${DEMO_API_KEY}`
    : `/api/v1/${DEMO_API_KEY}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-[var(--ink)]" />
          <h1 className="text-2xl font-bold text-[var(--ink)]">API Documentation</h1>
        </div>
        <p className="text-[var(--ink-2)]">Auto-generated documentation for your Bookstore API</p>
      </div>

      {/* Overview card */}
      <div className="card p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-[var(--ink)] mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">Base URL</h3>
              <code className="text-xs font-mono text-[var(--ink)] break-all">{baseUrl}</code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">Authentication</h3>
              <p className="text-xs text-[var(--ink-2)]">API key embedded in URL path. No headers required.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">Rate Limit</h3>
              <p className="text-xs text-[var(--ink-2)]">60 requests/min (Free), 300/min (Pro)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error codes reference */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--ink-2)]" /> Response Format
        </h2>
        <p className="text-sm text-[var(--ink-2)] mb-3">All responses follow a consistent JSON envelope:</p>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white rounded-lg p-3">
            <div className="text-emerald-400 font-mono mb-1">Success</div>
            <pre className="text-[var(--ink-2)] font-mono">{`{ "success": true, "data": {...}, "meta": {...} }`}</pre>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-red-400 font-mono mb-1">Error</div>
            <pre className="text-[var(--ink-2)] font-mono">{`{ "success": false, "error": { "code": "...", "message": "..." } }`}</pre>
          </div>
        </div>
      </div>

      {/* Endpoints by resource */}
      {Object.entries(DEMO_SCHEMA).map(([resource, schema]) => (
        <div key={resource}>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3 flex items-center gap-2 capitalize">
            <ChevronRight className="h-4 w-4 text-[var(--ink)]" />
            {resource}
            <span className="text-xs font-normal text-[var(--ink-2)] ml-1">
              ({Object.keys(schema).length} fields)
            </span>
          </h2>
          <div className="space-y-2">
            {(['GET', 'POST', 'PUT', 'DELETE'] as Method[]).map((method) => (
              <EndpointDoc
                key={`${method}-${resource}`}
                method={method}
                resource={resource}
                baseUrl={baseUrl}
                schema={schema}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Status codes */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">HTTP Status Codes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ['200', 'OK', 'emerald'], ['201', 'Created', 'emerald'], ['400', 'Bad Request', 'amber'],
            ['402', 'Credits Exhausted', 'amber'], ['404', 'Not Found', 'red'], ['429', 'Rate Limited', 'red'],
          ].map(([code, text, color]) => (
            <div key={code} className="flex items-center gap-2 py-1.5 px-3 rounded bg-white/[0.02]">
              <span className={`font-mono font-bold text-${color}-400`}>{code}</span>
              <span className="text-[var(--ink-2)]">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
