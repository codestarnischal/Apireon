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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  })(); }, []);

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-6 w-6 border-2 border-black/[0.08] border-t-[var(--accent)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  const used = profile?.requests_used ?? 0, total = profile?.request_credits ?? 1000, pct = Math.min(100, (used / total) * 100);

  return (
    <motion.div className="space-y-8 max-w-[640px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}>
      <h1 className="t-h1 text-[var(--ink)]">Settings</h1>

      <div className="card p-6">
        <p className="t-label mb-4">Profile</p>
        <div className="grid gap-4">
          <div><label className="text-[13px] font-semibold text-[var(--ink)] mb-2 block">Name</label><input defaultValue={profile?.full_name ?? ''} className="input-warm" /></div>
          <div><label className="text-[13px] font-semibold text-[var(--ink)] mb-2 block">Email</label><input defaultValue={profile?.email ?? ''} className="input-warm opacity-50" disabled /></div>
        </div>
        <motion.button className="btn-dark !py-2.5 !text-[13px] mt-5" whileHover={{ scale: 1.02 }}>Save</motion.button>
      </div>

      <div className="card p-6">
        <p className="t-label mb-4">Usage</p>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] text-[var(--ink-2)]">Requests this month</span>
          <span className="t-mono font-medium text-[var(--ink)]">{used.toLocaleString()} / {total.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-[var(--cream-2)] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
            className={`h-full rounded-full ${pct > 80 ? 'bg-[var(--red)]' : pct > 50 ? 'bg-[var(--yellow)]' : 'bg-[var(--ink)]'}`} />
        </div>
        <p className="text-[11px] text-[var(--ink-3)] mt-2">{(total - used).toLocaleString()} remaining</p>
      </div>

      <div className="card p-6">
        <p className="t-label mb-4">Plan</p>
        <div className="grid gap-3">{PRICING_TIERS.map(t => {
          const cur = t.name === (profile?.plan ?? 'free');
          return (
            <motion.div key={t.name} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cur ? 'border-[var(--violet)] bg-[var(--ink)]/5' : 'border-black/[0.06] hover:border-black/[0.08]'}`} whileHover={{ x: 2 }}>
              <div>
                <div className="flex items-center gap-2"><span className="font-bold text-[var(--ink)] capitalize text-[14px] font-[var(--font-display)]">{t.name}</span>
                {cur && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--ink)] text-[var(--ink)] tracking-wider">CURRENT</span>}</div>
                <p className="text-[12px] text-[var(--ink-3)] mt-0.5">{t.credits.toLocaleString()} req/mo</p>
              </div>
              <span className="text-[18px] font-bold text-[var(--ink)] font-[var(--font-display)]">${t.price}<span className="text-[12px] font-normal text-[var(--ink-3)]">/mo</span></span>
            </motion.div>
          );
        })}</div>
      </div>

      <div className="card p-6 border-red-200">
        <p className="t-label text-red-600 mb-3">Danger zone</p>
        <p className="text-[14px] text-[var(--ink-2)] mb-4">Permanently delete your account and all data.</p>
        <motion.button className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-red-600 bg-red-50 border border-red-200 cursor-pointer hover:bg-[var(--red)]/20 transition-colors"
          whileHover={{ scale: 1.02 }}>Delete account</motion.button>
      </div>
    </motion.div>
  );
}
