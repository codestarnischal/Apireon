'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PRICING_TIERS } from '@/lib/utils/constants';
import Link from 'next/link';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-32"><div className="h-6 w-6 border-2 border-[#d2d2d7] border-t-[#0071e3] rounded-full animate-spin" /></div>;

  const used = profile?.requests_used ?? 0;
  const total = profile?.request_credits ?? 1000;
  const pct = Math.min(100, (used / total) * 100);

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-[22px] font-bold text-[#1d1d1f]">Settings</h1>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="section-label mb-4">Profile</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-[13px] font-semibold text-[#1d1d1f] mb-1.5 block">Name</label>
            <input defaultValue={profile?.full_name ?? ''} className="input-field" />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-[#1d1d1f] mb-1.5 block">Email</label>
            <input defaultValue={profile?.email ?? ''} className="input-field opacity-50" disabled />
          </div>
        </div>
        <button className="btn-primary !py-2.5 mt-4">Save changes</button>
      </div>

      {/* Usage */}
      <div className="card p-6">
        <h2 className="section-label mb-4">Usage this month</h2>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] text-[#424245]">API requests</span>
          <span className="text-[14px] font-mono font-bold text-[#1d1d1f]">{used.toLocaleString()} / {total.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct > 80 ? 'bg-[#ff3b30]' : pct > 50 ? 'bg-[#ff9500]' : 'bg-[#0071e3]'}`} />
        </div>
        <p className="text-[12px] text-[#86868b] mt-2">{(total - used).toLocaleString()} remaining</p>
      </div>

      {/* Plan */}
      <div className="card p-6">
        <h2 className="section-label mb-4">Plan</h2>
        <div className="grid gap-3">
          {PRICING_TIERS.map(tier => {
            const current = tier.name === (profile?.plan ?? 'free');
            return (
              <div key={tier.name} className={`flex items-center justify-between p-4 rounded-xl border transition-all
                ${current ? 'border-[#0071e3] bg-[#f0f7ff]' : 'border-black/[0.06] hover:border-[#d2d2d7]'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1d1d1f] capitalize">{tier.name}</span>
                    {current && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071e3] text-white">CURRENT</span>}
                  </div>
                  <p className="text-[13px] text-[#86868b] mt-0.5">{tier.credits.toLocaleString()} requests/mo · {tier.max_projects === -1 ? 'Unlimited' : tier.max_projects} projects</p>
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-bold text-[#1d1d1f]">${tier.price}</span>
                  <span className="text-[12px] text-[#86868b]">/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger */}
      <div className="card p-6 border-[#fce4ec]">
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#ff3b30] mb-3">Danger zone</h2>
        <p className="text-[14px] text-[#424245] mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <button className="px-4 py-2.5 rounded-full text-[13px] font-semibold text-[#ff3b30] bg-[#fff5f5] border border-[#fce4ec] hover:bg-[#fce4ec] transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );
}
