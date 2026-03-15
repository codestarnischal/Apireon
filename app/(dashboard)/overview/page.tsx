'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <motion.button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="btn-pill !text-[11px] !py-1 !px-3" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {ok ? '✓' : 'Copy'}
    </motion.button>
  );
}

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [exp, setExp] = useState<Record<string, boolean>>({});

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (data?.length) { setProjects(data); setActive(data[0]); }
    setLoading(false);
  };
  const create = async () => {
    if (!prompt.trim() || creating) return; setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/architect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, userId: session.user.id }) });
    const r = await res.json();
    if (r.success) { setPrompt(''); await load(); }
    setCreating(false);
  };
  const baseUrl = typeof window !== 'undefined' && active ? `${window.location.origin}/api/v1/${active.api_key}` : '';

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-6 w-6 border-2 border-black/[0.08] border-t-[var(--accent)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}>
      <div className="card p-6">
        <p className="t-label text-violet-600 mb-3">New API</p>
        <div className="flex gap-3">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder='Describe your API...' className="input-warm flex-1" onKeyDown={e => { if (e.key === 'Enter') create(); }} />
          <motion.button onClick={create} disabled={!prompt.trim() || creating} className="btn-dark !text-[13px] whitespace-nowrap disabled:opacity-20" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {creating ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Create'}
          </motion.button>
        </div>
      </div>

      {projects.length > 1 && <div className="flex gap-2 flex-wrap">{projects.map(p => (
        <motion.button key={p.id} onClick={() => setActive(p)} className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all ${active?.id === p.id ? 'bg-[var(--ink)] text-[var(--ink)] border-none' : 'bg-transparent text-[var(--ink-2)] border border-black/[0.06] hover:border-black/[0.1]'}`}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{p.name}</motion.button>
      ))}</div>}

      {active && <>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="t-h2 text-[var(--ink)]">{active.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Active
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ l: 'Base URL', v: baseUrl }, { l: 'API Key', v: active.api_key }].map(x => (
              <div key={x.l}>
                <p className="t-label mb-2">{x.l}</p>
                <div className="flex items-center justify-between bg-[var(--cream)] rounded-xl px-4 py-3 border border-black/[0.06]">
                  <code className="t-mono text-[var(--ink)] truncate mr-3">{x.v}</code>
                  <CopyBtn text={x.v} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="t-h2 text-[var(--ink)]">Endpoints</h2>
            <span className="t-label bg-[var(--cream)] px-2.5 py-1 rounded-full border border-black/[0.06]">{Object.keys(active.schema_definition).length}</span>
          </div>
          <div className="space-y-3">{Object.entries(active.schema_definition).map(([res, fields]) => (
            <motion.div key={res} className="card overflow-hidden" layout>
              <button onClick={() => setExp(p => ({ ...p, [res]: !p[res] }))} className="w-full flex items-center justify-between p-5 hover:bg-[var(--cream)] transition-colors text-left cursor-pointer bg-transparent border-none">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5"><span className="m m-get">GET</span><span className="m m-post">POST</span><span className="m m-put">PUT</span><span className="m m-del">DEL</span></div>
                  <code className="text-[15px] font-semibold text-[var(--ink)] t-mono">/{res}</code>
                </div>
                <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--ink-3)]"
                  animate={{ rotate: exp[res] ? 180 : 0 }} transition={spring}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></motion.svg>
              </button>
              <AnimatePresence>{exp[res] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }} className="border-t border-black/[0.06] overflow-hidden">
                  <div className="p-5 bg-[var(--cream)]">
                    <div className="flex items-center justify-between bg-[var(--cream)] rounded-xl px-4 py-2.5 border border-black/[0.06] mb-4">
                      <code className="t-mono text-[var(--ink-2)] text-[12px]">{baseUrl}/{res}</code>
                      <CopyBtn text={`${baseUrl}/${res}`} />
                    </div>
                    <div className="grid gap-1.5">{Object.entries(fields).map(([f, t]) => (
                      <div key={f} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[var(--cream)] border border-white/[0.03]">
                        <span className="t-mono font-medium text-[var(--ink)]">{f}</span>
                        <span className={`t-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          t === 'string' ? 'bg-[var(--ink)]/10 text-violet-600' : t === 'number' ? 'bg-amber-50 text-amber-600' :
                          t === 'boolean' ? 'bg-emerald-50 text-emerald-600' : t === 'uuid' ? 'bg-cyan-50 text-cyan-600' :
                          t === 'email' ? 'bg-cyan-50 text-cyan-600' : 'bg-[var(--cream)] text-[var(--ink-2)]'}`}>{t as string}</span>
                      </div>
                    ))}</div>
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </motion.div>
          ))}</div>
        </div>
      </>}

      {!active && !loading && <div className="text-center py-20"><p className="t-h2 text-[var(--ink)] mb-2">No projects yet</p><p className="t-sm">Describe your first API above.</p></div>}
    </motion.div>
  );
}
