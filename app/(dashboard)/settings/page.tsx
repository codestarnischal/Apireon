'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PRICING_TIERS } from '@/lib/utils/constants';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data); setLoading(false);
  })(); }, []);

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-5 w-5 border-2 border-white/[0.06] border-t-[var(--gold)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  const used = profile?.requests_used ?? 0, total = profile?.request_credits ?? 1000, pct = Math.min(100, (used / total) * 100);

  return (
    <motion.div className="space-y-8 max-w-[640px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}>
      <h1 className="t-h1 text-white">Settings</h1>

      <div className="glass p-6">
        <p className="t-label text-[var(--text-3)] mb-4 text-[9px]">Profile</p>
        <div className="grid gap-4">
          <div><label className="text-[12px] font-semibold text-[var(--text-2)] mb-2 block font-[var(--font-display)] tracking-wide uppercase">Name</label><input defaultValue={profile?.full_name ?? ''} className="input-dark" /></div>
          <div><label className="text-[12px] font-semibold text-[var(--text-2)] mb-2 block font-[var(--font-display)] tracking-wide uppercase">Email</label><input defaultValue={profile?.email ?? ''} className="input-dark opacity-50" disabled /></div>
        </div>
        <motion.button className="btn-gold !text-[11px] !py-2.5 mt-5" whileHover={{ scale: 1.02 }}>Save</motion.button>
      </div>

      <div className="glass p-6">
        <p className="t-label text-[var(--text-3)] mb-4 text-[9px]">Usage</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] text-[var(--text-2)]">Requests</span>
          <span className="t-mono font-medium text-white">{used.toLocaleString()} / {total.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
            className={`h-full rounded-full ${pct > 80 ? 'bg-[var(--red)]' : pct > 50 ? 'bg-[var(--gold)]' : 'bg-[var(--gold)]'}`} />
        </div>
        <p className="text-[11px] text-[var(--text-3)] mt-2">{(total - used).toLocaleString()} remaining</p>
      </div>

      <div className="glass p-6">
        <p className="t-label text-[var(--text-3)] mb-4 text-[9px]">Plan</p>
        <div className="grid gap-3">{PRICING_TIERS.map(t => {
          const cur = t.name === (profile?.plan ?? 'free');
          return (
            <motion.div key={t.name} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cur ? 'border-[var(--gold)]/30 bg-[var(--gold-soft)]' : 'border-white/[0.04] hover:border-white/[0.08]'}`} whileHover={{ x: 2 }}>
              <div>
                <div className="flex items-center gap-2"><span className="text-[14px] font-bold text-white capitalize font-[var(--font-display)]">{t.name}</span>
                {cur && <span className="px-2 py-0.5 rounded-full text-[8px] font-[800] bg-[var(--gold)] text-[var(--bg)] tracking-[0.15em] uppercase font-[var(--font-display)]">Current</span>}</div>
                <p className="text-[11px] text-[var(--text-3)] mt-0.5">{t.credits.toLocaleString()} req/mo</p>
              </div>
              <span className="text-[18px] font-[800] text-white font-[var(--font-display)]">${t.price}<span className="text-[11px] font-normal text-[var(--text-3)]">/mo</span></span>
            </motion.div>
          );
        })}</div>
      </div>

      <div className="glass p-6" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
        <p className="t-label text-[var(--red)] mb-3 text-[9px]">Danger</p>
        <p className="text-[14px] text-[var(--text-2)] mb-4">Permanently delete your account and data.</p>
        <motion.button className="px-5 py-2.5 rounded-full text-[11px] font-[700] font-[var(--font-display)] tracking-wide uppercase text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/20 cursor-pointer hover:bg-[var(--red)]/20 transition-colors"
          whileHover={{ scale: 1.02 }}>Delete account</motion.button>
      </div>
    </motion.div>
  );
}
