'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

const CopyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-md hover:bg-[#F0F0EE] transition-colors">
      {copied ? <span className="text-emerald-600"><CheckIcon /></span> : <span className="text-[#9C9C99]"><CopyIcon /></span>}
    </button>
  );
}

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setProjects(data);
      setActiveProject(data[0]);
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!prompt.trim() || creating) return;
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: session.user.id }),
      });
      const result = await res.json();
      if (result.success) {
        setPrompt('');
        await loadProjects();
      }
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const baseUrl = typeof window !== 'undefined' && activeProject
    ? `${window.location.origin}/api/v1/${activeProject.api_key}` : '';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-6 w-6 border-2 border-[#E5E4E2] border-t-[#1A1A19] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A19]">Dashboard</h1>
        <p className="text-[#6B6B69] mt-1">Manage your API projects</p>
      </div>

      {/* Create new project */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#1A1A19] mb-3">Create new API</h2>
        <div className="flex gap-3">
          <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your API... e.g. 'A bookstore API with books and authors'"
            className="input-field flex-1" onKeyDown={e => { if (e.key === 'Enter') createProject(); }} />
          <button onClick={createProject} disabled={!prompt.trim() || creating} className="btn-primary !px-5 text-sm gap-2 whitespace-nowrap disabled:opacity-40">
            {creating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusIcon />}
            Create
          </button>
        </div>
      </div>

      {/* Project selector */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {projects.map(p => (
            <button key={p.id} onClick={() => setActiveProject(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${activeProject?.id === p.id ? 'bg-[#1A1A19] text-white border-[#1A1A19]' : 'bg-white text-[#6B6B69] border-[#E5E4E2] hover:border-[#D4D3D0]'}`}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {activeProject && (
        <>
          {/* Credentials */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-[#1A1A19] mb-4">{activeProject.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#9C9C99] mb-1.5 block">Base URL</label>
                <div className="flex items-center gap-2 bg-[#FAFAF9] rounded-lg px-4 py-2.5 border border-[#E5E4E2]">
                  <code className="text-sm font-mono text-[#1A1A19] flex-1 truncate">{baseUrl}</code>
                  <CopyButton text={baseUrl} />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#9C9C99] mb-1.5 block">API Key</label>
                <div className="flex items-center gap-2 bg-[#FAFAF9] rounded-lg px-4 py-2.5 border border-[#E5E4E2]">
                  <code className="text-sm font-mono text-[#6B6B69] flex-1 truncate">{activeProject.api_key}</code>
                  <CopyButton text={activeProject.api_key} />
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A19] mb-4">
              Resources <span className="text-sm font-normal text-[#9C9C99]">({Object.keys(activeProject.schema_definition).length} endpoints)</span>
            </h2>
            <div className="space-y-3">
              {Object.entries(activeProject.schema_definition).map(([resource, fields]) => (
                <div key={resource} className="card overflow-hidden">
                  <button onClick={() => setExpanded(prev => ({ ...prev, [resource]: !prev[resource] }))}
                    className="w-full flex items-center justify-between p-5 hover:bg-[#FAFAF9] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <span className="method-badge method-get text-[10px]">GET</span>
                        <span className="method-badge method-post text-[10px]">POST</span>
                        <span className="method-badge method-put text-[10px]">PUT</span>
                        <span className="method-badge method-delete text-[10px]">DEL</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[#1A1A19]">/{resource}</h3>
                        <p className="text-xs text-[#9C9C99] font-mono">{Object.keys(fields).length} fields</p>
                      </div>
                    </div>
                    <span className={`transition-transform ${expanded[resource] ? 'rotate-180' : ''}`}><ChevronDown /></span>
                  </button>
                  {expanded[resource] && (
                    <div className="border-t border-[#E5E4E2] p-5">
                      <div className="flex items-center gap-2 mb-4 bg-[#FAFAF9] rounded-lg px-3 py-2 border border-[#E5E4E2]">
                        <code className="text-xs font-mono text-[#6B6B69] flex-1 truncate">{baseUrl}/{resource}</code>
                        <CopyButton text={`${baseUrl}/${resource}`} />
                      </div>
                      <div className="space-y-2">
                        {Object.entries(fields).map(([field, type]) => (
                          <div key={field} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-[#FAFAF9]">
                            <span className="font-mono text-sm text-[#1A1A19]">{field}</span>
                            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                              type === 'string' ? 'bg-blue-50 text-blue-700' :
                              type === 'number' ? 'bg-amber-50 text-amber-700' :
                              type === 'boolean' ? 'bg-emerald-50 text-emerald-700' :
                              type === 'uuid' ? 'bg-purple-50 text-purple-700' :
                              type === 'email' ? 'bg-cyan-50 text-cyan-700' :
                              'bg-[#F0F0EE] text-[#6B6B69]'}`}>{type as string}</span>
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

      {!activeProject && !loading && (
        <div className="card p-12 text-center">
          <p className="text-[#9C9C99] text-lg">No projects yet. Describe your first API above to get started.</p>
        </div>
      )}
    </div>
  );
}
