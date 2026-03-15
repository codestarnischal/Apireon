'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <motion.button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#1a1a1a] transition-all border-none cursor-pointer"
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {ok ? '✓ Copied' : 'Copy'}
    </motion.button>
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

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-6 w-6 border-2 border-[#e8eaed] border-t-[#1a73e8] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
      {/* Create */}
      <div className="surface-elevated p-6">
        <p className="label mb-3">New API</p>
        <div className="flex gap-3">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder='Describe your API in plain English...'
            className="input flex-1" onKeyDown={e => { if (e.key === 'Enter') create(); }} />
          <motion.button onClick={create} disabled={!prompt.trim() || creating}
            className="btn-fill whitespace-nowrap disabled:opacity-25" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {creating ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Create'}
          </motion.button>
        </div>
      </div>

      {/* Project tabs */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {projects.map(p => (
            <motion.button key={p.id} onClick={() => setActive(p)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all border-none cursor-pointer
                ${active?.id === p.id ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#5f6368] border border-[#e8eaed] hover:border-[#9aa0a6]'}`}
              style={{ border: active?.id === p.id ? 'none' : '1px solid #e8eaed' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {p.name}
            </motion.button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Credentials */}
          <div className="surface p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-[#1a1a1a] tracking-[-0.01em]">{active.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-[#34a853]" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Active
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[{ label: 'Base URL', value: baseUrl }, { label: 'API Key', value: active.api_key }].map(item => (
                <div key={item.label}>
                  <p className="label mb-2">{item.label}</p>
                  <div className="flex items-center justify-between bg-[#f8f9fa] rounded-xl px-4 py-3 border border-[#e8eaed]">
                    <code className="mono text-[#1a1a1a] truncate mr-3">{item.value}</code>
                    <CopyBtn text={item.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[17px] font-bold text-[#1a1a1a]">Endpoints</h2>
              <span className="label bg-[#f1f3f4] px-2.5 py-1 rounded-full">{Object.keys(active.schema_definition).length} resources</span>
            </div>
            <div className="space-y-3">
              {Object.entries(active.schema_definition).map(([resource, fields]) => (
                <motion.div key={resource} className="surface overflow-hidden" layout>
                  <button onClick={() => setExpanded(prev => ({ ...prev, [resource]: !prev[resource] }))}
                    className="w-full flex items-center justify-between p-5 hover:bg-[#fafafa] transition-colors text-left cursor-pointer bg-transparent border-none">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="method method-get">GET</span>
                        <span className="method method-post">POST</span>
                        <span className="method method-put">PUT</span>
                        <span className="method method-del">DEL</span>
                      </div>
                      <code className="text-[15px] font-semibold text-[#1a1a1a] font-[var(--font-mono)]">/{resource}</code>
                    </div>
                    <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2"
                      animate={{ rotate: expanded[resource] ? 180 : 0 }} transition={spring}>
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {expanded[resource] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="border-t border-[#e8eaed] overflow-hidden">
                        <div className="p-5 bg-[#f8f9fa]">
                          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-[#e8eaed] mb-4">
                            <code className="mono text-[#5f6368] text-[12px]">{baseUrl}/{resource}</code>
                            <CopyBtn text={`${baseUrl}/${resource}`} />
                          </div>
                          <div className="grid gap-1.5">
                            {Object.entries(fields).map(([field, type]) => (
                              <div key={field} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white border border-[#e8eaed]">
                                <span className="mono font-medium text-[#1a1a1a]">{field}</span>
                                <span className={`mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full
                                  ${type === 'string' ? 'bg-[#e8f0fe] text-[#1967d2]' : type === 'number' ? 'bg-[#fef7e0] text-[#b06000]' :
                                    type === 'boolean' ? 'bg-[#e6f4ea] text-[#137333]' : type === 'uuid' ? 'bg-[#f3e8fd] text-[#8430ce]' :
                                    type === 'email' ? 'bg-[#e0f7fa] text-[#00695c]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>{type as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {!active && !loading && (
        <div className="text-center py-20">
          <p className="display-md text-[#1a1a1a] mb-2">No projects yet</p>
          <p className="body-md">Describe your first API above to get started.</p>
        </div>
      )}
    </motion.div>
  );
}
