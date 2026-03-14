'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PRICING_TIERS } from '@/lib/utils/constants';
import type { Profile } from '@/types';

const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-6 w-6 border-2 border-[#E5E4E2] border-t-[#1A1A19] rounded-full animate-spin" /></div>;

  const usedCredits = profile?.requests_used ?? 0;
  const totalCredits = profile?.request_credits ?? 1000;
  const pct = Math.min(100, (usedCredits / totalCredits) * 100);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A19]">Settings</h1>
        <p className="text-[#6B6B69] mt-1">Account, usage, and billing</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#1A1A19] mb-4">Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#9C9C99] mb-1.5 block">Name</label>
            <input type="text" defaultValue={profile?.full_name ?? ''} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-[#9C9C99] mb-1.5 block">Email</label>
            <input type="email" defaultValue={profile?.email ?? ''} className="input-field opacity-60" disabled />
          </div>
        </div>
        <button className="btn-primary !py-2 !px-4 text-sm mt-4">Save Changes</button>
      </div>

      {/* Usage */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#1A1A19] mb-4">Usage</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6B6B69]">API Requests</span>
          <span className="text-sm font-mono text-[#1A1A19]">{usedCredits.toLocaleString()} / {totalCredits.toLocaleString()}</span>
        </div>
        <div className="h-2.5 bg-[#F0F0EE] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-[#1A1A19]'}`} />
        </div>
        <p className="text-xs text-[#9C9C99] mt-2">{(totalCredits - usedCredits).toLocaleString()} credits remaining</p>
      </div>

      {/* Plan */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#1A1A19] mb-4">Plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PRICING_TIERS.map(tier => {
            const current = tier.name === (profile?.plan ?? 'free');
            return (
              <div key={tier.name} className={`p-4 rounded-xl border transition-all ${current ? 'border-[#1A1A19] bg-[#FAFAF9]' : 'border-[#E5E4E2] hover:border-[#D4D3D0]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{tier.name}</h3>
                  {current && <span className="badge text-[10px]">Current</span>}
                </div>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-2xl font-bold">${tier.price}</span>
                  <span className="text-xs text-[#9C9C99]">/mo</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {tier.features.slice(0, 4).map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#6B6B69]">
                      <span className="text-emerald-600"><CheckIcon /></span> {f}
                    </li>
                  ))}
                </ul>
                {!current && <button className="w-full btn-secondary !py-2 text-xs">Upgrade</button>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger */}
      <div className="card p-6 border-red-200">
        <h2 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h2>
        <p className="text-sm text-[#6B6B69] mb-3">Permanently delete your account and all data.</p>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
