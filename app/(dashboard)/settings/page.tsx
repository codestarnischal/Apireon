'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PRICING_TIERS } from '@/lib/utils/constants';
import type { Profile } from '@/types';

const easeOut = { duration: 0.5, ease: [0.23, 1, 0.32, 1] };

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

  if (loading) return <div className="flex justify-center py-32"><motion.div className="h-6 w-6 border-2 border-[#e8eaed] border-t-[#1a73e8] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /></div>;

  const used = profile?.requests_used ?? 0;
  const total = profile?.request_credits ?? 1000;
  const pct = Math.min(100, (used / total) * 100);

  return (
    <motion.div className="space-y-8 max-w-[640px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeOut}>
      <h1 className="display-md text-[#1a1a1a]">Settings</h1>

      <div className="surface p-6">
        <p className="label mb-4">Profile</p>
        <div className="grid gap-4">
          <div>
            <label className="text-[13px] font-semibold text-[#1a1a1a] mb-2 block">Name</label>
            <input defaultValue={profile?.full_name ?? ''} className="input" />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-[#1a1a1a] mb-2 block">Email</label>
            <input defaultValue={profile?.email ?? ''} className="input opacity-50" disabled />
          </div>
        </div>
        <motion.button className="btn-fill !py-2.5 mt-5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Save changes</motion.button>
      </div>

      <div className="surface p-6">
        <p className="label mb-4">Usage</p>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] text-[#5f6368]">API requests this month</span>
          <span className="mono font-medium text-[#1a1a1a]">{used.toLocaleString()} / {total.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-[#f1f3f4] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct > 80 ? 'bg-[#ea4335]' : pct > 50 ? 'bg-[#fbbc04]' : 'bg-[#1a73e8]'}`} />
        </div>
        <p className="text-[12px] text-[#9aa0a6] mt-2">{(total - used).toLocaleString()} remaining</p>
      </div>

      <div className="surface p-6">
        <p className="label mb-4">Plan</p>
        <div className="grid gap-3">
          {PRICING_TIERS.map(tier => {
            const current = tier.name === (profile?.plan ?? 'free');
            return (
              <motion.div key={tier.name}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${current ? 'border-[#1a73e8] bg-[#e8f0fe]/30' : 'border-[#e8eaed] hover:border-[#d2d2d7]'}`}
                whileHover={{ x: 2 }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1a1a1a] capitalize text-[14px]">{tier.name}</span>
                    {current && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a73e8] text-white tracking-wider">CURRENT</span>}
                  </div>
                  <p className="text-[12px] text-[#9aa0a6] mt-0.5">{tier.credits.toLocaleString()} req/mo</p>
                </div>
                <span className="text-[18px] font-bold text-[#1a1a1a]">${tier.price}<span className="text-[12px] font-normal text-[#9aa0a6]">/mo</span></span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="surface p-6" style={{ borderColor: '#fce8e6' }}>
        <p className="label text-[#ea4335] mb-3">Danger zone</p>
        <p className="text-[14px] text-[#5f6368] mb-4">Permanently delete your account and all associated data.</p>
        <motion.button className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-[#ea4335] bg-[#fce8e6] border-none cursor-pointer hover:bg-[#f9d0cc] transition-colors"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Delete account</motion.button>
      </div>
    </motion.div>
  );
}
