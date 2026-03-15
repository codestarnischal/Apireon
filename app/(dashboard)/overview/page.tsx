'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

const sp = { type: 'spring' as const, stiffness: 260, damping: 25 };

function Cp({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <motion.button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
    className="btn-micro !text-[10px] !py-1 !px-2.5" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>{ok ? '✓' : 'Copy'}</motion.button>;
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
    const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (data?.length) { setProjects(data); setActive(data[0]); } setLoading(false);
  };
  const create = async () => {
    if (!prompt.trim() || creating) return; setCreating(true);
    const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
    const res = await fetch('/api/architect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, userId: session.user.id }) });
    const r = await res.json(); if (r.success) { setPrompt(''); await load(); } setCreating(false);
  };
  const baseUrl = typeof window !== 'undefined' && active ? `${window.location.origin}/api/v1/${active.api_key}` : '';

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-5 w-5 border-2 border-white/[0.06] border-t-[var(--gold)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}>
      <div className="glass-strong p-6">
        <p className="t-label mb-3">New API</p>
        <div className="flex gap-3">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder='Describe your API in plain English...' className="input-dark flex-1" onKeyDown={e => { if (e.key === 'Enter') create(); }} />
          <motion.button onClick={create} disabled={!prompt.trim() || creating} className="btn-gold !text-[11px] !py-3 whitespace-nowrap disabled:opacity-20" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {creating ? <motion.div className="h-4 w-4 border-2 border-[var(--bg)]/30 border-t-[var(--bg)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Create'}
          </motion.button>
        </div>
      </div>

      {projects.length > 1 && <div className="flex gap-2 flex-wrap">{projects.map(p => (
        <motion.button key={p.id} onClick={() => setActive(p)} className={`px-4 py-2 rounded-full text-[12px] font-semibold font-[var(--font-display)] tracking-wide uppercase cursor-pointer transition-all
          ${active?.id === p.id ? 'bg-[var(--gold)] text-[var(--bg)] border-none' : 'bg-transparent text-[var(--text-3)] border border-white/[0.06] hover:border-white/[0.1]'}`}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{p.name}</motion.button>
      ))}</div>}

      {active && <>
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="t-h2 text-white">{active.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[var(--green)]/10 text-[var(--green)] font-[var(--font-display)] tracking-wider uppercase">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Active
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ l: 'Base URL', v: baseUrl }, { l: 'API Key', v: active.api_key }].map(x => (
              <div key={x.l}>
                <p className="t-label text-[var(--text-3)] mb-2 text-[9px]">{x.l}</p>
                <div className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.04]">
                  <code className="t-mono text-[var(--text)] truncate mr-3">{x.v}</code>
                  <Cp text={x.v} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="t-h2 text-white">Endpoints</h2>
            <span className="t-label text-[var(--text-3)] bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.04] text-[9px]">{Object.keys(active.schema_definition).length}</span>
          </div>
          <div className="space-y-3">{Object.entries(active.schema_definition).map(([res, fields]) => (
            <motion.div key={res} className="glass overflow-hidden" layout>
              <button onClick={() => setExp(p => ({ ...p, [res]: !p[res] }))} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.01] transition-colors text-left cursor-pointer bg-transparent border-none">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5"><span className="m m-get">GET</span><span className="m m-post">POST</span><span className="m m-put">PUT</span><span className="m m-del">DEL</span></div>
                  <code className="text-[14px] font-semibold text-white t-mono">/{res}</code>
                </div>
                <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5"
                  animate={{ rotate: exp[res] ? 180 : 0 }} transition={sp}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></motion.svg>
              </button>
              <AnimatePresence>{exp[res] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }} className="border-t border-white/[0.03] overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-2.5 border border-white/[0.03] mb-4">
                      <code className="t-mono text-[var(--text-2)] text-[11px]">{baseUrl}/{res}</code><Cp text={`${baseUrl}/${res}`} />
                    </div>
                    <div className="grid gap-1.5">{Object.entries(fields).map(([f, t]) => (
                      <div key={f} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/[0.02]">
                        <span className="t-mono font-medium text-[var(--text)]">{f}</span>
                        <span className={`t-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full
                          ${t === 'string' ? 'bg-[var(--blue)]/10 text-[var(--blue)]' : t === 'number' ? 'bg-[var(--gold-soft)] text-[var(--gold)]' :
                          t === 'boolean' ? 'bg-[var(--green)]/10 text-[var(--green)]' : t === 'uuid' ? 'bg-purple-500/10 text-purple-400' :
                          t === 'email' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/[0.04] text-[var(--text-2)]'}`}>{t as string}</span>
                      </div>
                    ))}</div>
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </motion.div>
          ))}</div>
        </div>
      </>}

      {!active && !loading && <div className="text-center py-20"><p className="t-h2 text-white mb-2">No projects yet</p><p className="t-sm">Describe your first API above.</p></div>}
    </motion.div>
  );
}
