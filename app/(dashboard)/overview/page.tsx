'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#ebebed]">
      {ok ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (data?.length) { setProjects(data); setActive(data[0]); }
    setLoading(false);
  };

  const create = async () => {
    if (!prompt.trim() || creating) return;
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/architect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, userId: session.user.id }) });
    const result = await res.json();
    if (result.success) { setPrompt(''); await load(); }
    setCreating(false);
  };

  const baseUrl = typeof window !== 'undefined' && active ? `${window.location.origin}/api/v1/${active.api_key}` : '';

  if (loading) return <div className="flex justify-center py-32"><div className="h-6 w-6 border-2 border-[#d2d2d7] border-t-[#0071e3] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Create */}
      <div className="card-elevated p-6">
        <h2 className="text-[15px] font-bold text-[#1d1d1f] mb-3">Create a new API</h2>
        <div className="flex gap-3">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder='e.g. "A bookstore API with books and authors"'
            className="input-field flex-1" onKeyDown={e => { if (e.key === 'Enter') create(); }} />
          <button onClick={create} disabled={!prompt.trim() || creating} className="btn-primary whitespace-nowrap disabled:opacity-30">
            {creating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
          </button>
        </div>
      </div>

      {/* Project tabs */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {projects.map(p => (
            <button key={p.id} onClick={() => setActive(p)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all
                ${active?.id === p.id ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#424245] border border-[#d2d2d7] hover:border-[#86868b]'}`}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Credentials */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">{active.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e8f5e9] text-[#1b5e20]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4caf50]" /> Active
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-2 block">Base URL</label>
                <div className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                  <code className="text-[13px] font-mono text-[#1d1d1f] truncate mr-2">{baseUrl}</code>
                  <CopyBtn text={baseUrl} />
                </div>
              </div>
              <div>
                <label className="section-label mb-2 block">API Key</label>
                <div className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                  <code className="text-[13px] font-mono text-[#424245] truncate mr-2">{active.api_key}</code>
                  <CopyBtn text={active.api_key} />
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">Endpoints</h2>
              <span className="badge">{Object.keys(active.schema_definition).length} resources</span>
            </div>
            <div className="space-y-3">
              {Object.entries(active.schema_definition).map(([resource, fields]) => (
                <div key={resource} className="card overflow-hidden">
                  <button onClick={() => setExpanded(prev => ({ ...prev, [resource]: !prev[resource] }))}
                    className="w-full flex items-center justify-between p-5 hover:bg-[#fafafa] transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="method-badge method-get">GET</span>
                        <span className="method-badge method-post">POST</span>
                        <span className="method-badge method-put">PUT</span>
                        <span className="method-badge method-delete">DEL</span>
                      </div>
                      <code className="text-[15px] font-mono font-semibold text-[#1d1d1f]">/{resource}</code>
                      <span className="text-[12px] text-[#86868b]">{Object.keys(fields).length} fields</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2"
                      className={`transition-transform ${expanded[resource] ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {expanded[resource] && (
                    <div className="border-t border-black/[0.04] p-5 bg-[#fafafa]">
                      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-black/[0.04] mb-4">
                        <code className="text-[12px] font-mono text-[#424245]">{baseUrl}/{resource}</code>
                        <CopyBtn text={`${baseUrl}/${resource}`} />
                      </div>
                      <div className="grid gap-2">
                        {Object.entries(fields).map(([field, type]) => (
                          <div key={field} className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-white border border-black/[0.03]">
                            <span className="font-mono text-[13px] font-medium text-[#1d1d1f]">{field}</span>
                            <span className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full
                              ${type === 'string' ? 'bg-blue-50 text-blue-700' : type === 'number' ? 'bg-amber-50 text-amber-700' :
                                type === 'boolean' ? 'bg-green-50 text-green-700' : type === 'uuid' ? 'bg-purple-50 text-purple-700' :
                                type === 'email' ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-50 text-gray-600'}`}>{type as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!active && !loading && (
        <div className="text-center py-20">
          <p className="text-[22px] font-bold text-[#1d1d1f] mb-2">No projects yet</p>
          <p className="text-[#86868b]">Describe your first API above to get started.</p>
        </div>
      )}
    </div>
  );
}
