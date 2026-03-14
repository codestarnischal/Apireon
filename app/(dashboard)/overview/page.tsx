'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Copy, Check, ExternalLink, Zap, Database, Globe, Shield,
  TrendingUp, Clock, Activity, ChevronDown, RefreshCw,
} from 'lucide-react';
import type { Project, SchemaDefinition } from '@/types';

// ============================================================
// Demo data (replace with real Supabase queries in production)
// ============================================================
const DEMO_PROJECT: Project = {
  id: 'proj-001',
  user_id: 'user-001',
  api_key: 'd4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f80',
  name: 'Bookstore API',
  description: 'A complete bookstore backend with books, authors, and reviews',
  schema_definition: {
    books: {
      title: 'string',
      isbn: 'string',
      price: 'number',
      genre: 'string',
      author_id: 'uuid',
      published_date: 'date',
      in_stock: 'boolean',
    },
    authors: {
      name: 'string',
      bio: 'string',
      email: 'email',
      website: 'url',
      born_year: 'number',
    },
    reviews: {
      book_id: 'uuid',
      reviewer_name: 'string',
      rating: 'number',
      comment: 'string',
    },
  },
  is_active: true,
  rate_limit_per_minute: 60,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================
// CopyButton
// ============================================================
function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md hover:bg-white/[0.08] transition-colors ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
      )}
    </button>
  );
}

// ============================================================
// Stat Card
// ============================================================
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'brand',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'brand' | 'emerald' | 'amber' | 'cyan';
}) {
  const colorMap = {
    brand: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </div>
  );
}

// ============================================================
// Resource Card
// ============================================================
function ResourceCard({
  resource,
  fields,
  baseUrl,
}: {
  resource: string;
  fields: Record<string, string>;
  baseUrl: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const endpointUrl = `${baseUrl}/${resource}`;

  return (
    <motion.div
      layout
      className="glass-panel overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="method-badge method-get text-[10px]">GET</span>
            <span className="method-badge method-post text-[10px]">POST</span>
            <span className="method-badge method-put text-[10px]">PUT</span>
            <span className="method-badge method-delete text-[10px]">DEL</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">/{resource}</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{Object.keys(fields).length} fields</p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 
                     ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/[0.06]"
        >
          {/* Endpoint URL */}
          <div className="px-5 py-3 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Endpoint:</span>
              <code className="text-xs font-mono text-brand-300 flex-1 truncate">{endpointUrl}</code>
              <CopyButton text={endpointUrl} />
            </div>
          </div>

          {/* Schema fields */}
          <div className="p-5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Schema</h4>
            <div className="space-y-2">
              {Object.entries(fields).map(([field, type]) => (
                <div
                  key={field}
                  className="flex items-center justify-between py-1.5 px-3 rounded-md bg-white/[0.02]"
                >
                  <span className="font-mono text-sm text-zinc-300">{field}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full
                    ${type === 'string' ? 'bg-blue-500/15 text-blue-400' :
                      type === 'number' ? 'bg-amber-500/15 text-amber-400' :
                        type === 'boolean' ? 'bg-emerald-500/15 text-emerald-400' :
                          type === 'uuid' ? 'bg-purple-500/15 text-purple-400' :
                            type === 'email' ? 'bg-cyan-500/15 text-cyan-400' :
                              type === 'url' ? 'bg-indigo-500/15 text-indigo-400' :
                                type === 'date' ? 'bg-rose-500/15 text-rose-400' :
                                  'bg-zinc-500/15 text-zinc-400'}`}>
                    {type}
                  </span>
                </div>
              ))}
              {/* Auto fields */}
              {['id → uuid (auto)', 'created_at → timestamp (auto)', 'updated_at → timestamp (auto)'].map((f) => (
                <div key={f} className="flex items-center py-1.5 px-3 rounded-md opacity-40">
                  <span className="font-mono text-xs text-zinc-500 italic">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// OVERVIEW PAGE
// ============================================================
export default function OverviewPage() {
  const project = DEMO_PROJECT;
  const baseUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/${project.api_key}`;
  const resources = Object.entries(project.schema_definition);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <p className="text-zinc-400 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !py-2 !px-3 text-sm gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate Key
          </button>
          <button className="btn-primary !py-2 !px-4 text-sm gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" /> View Docs
          </button>
        </div>
      </div>

      {/* API Credentials */}
      <div className="glass-panel-strong p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">API Credentials</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Base URL</label>
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-4 py-2.5 border border-white/[0.06]">
              <code className="text-sm font-mono text-brand-300 flex-1 truncate">{baseUrl}</code>
              <CopyButton text={baseUrl} />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">API Key</label>
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-4 py-2.5 border border-white/[0.06]">
              <code className="text-sm font-mono text-zinc-300 flex-1 truncate">{project.api_key}</code>
              <CopyButton text={project.api_key} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Requests" value="1,247" subtext="+12% from last week" color="brand" />
        <StatCard icon={Database} label="Records Stored" value="384" subtext="Across all resources" color="emerald" />
        <StatCard icon={Clock} label="Avg. Response" value="45ms" subtext="p95: 120ms" color="cyan" />
        <StatCard icon={Shield} label="Credits Left" value="753" subtext="of 1,000 (Free plan)" color="amber" />
      </div>

      {/* Resource Manager */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Resources
            <span className="text-sm font-normal text-zinc-500 ml-2">({resources.length} endpoints)</span>
          </h2>
        </div>
        <div className="space-y-3">
          {resources.map(([resource, fields]) => (
            <ResourceCard
              key={resource}
              resource={resource}
              fields={fields as Record<string, string>}
              baseUrl={baseUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
