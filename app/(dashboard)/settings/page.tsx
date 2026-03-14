'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, CreditCard, Shield, Trash2,
  Check, ChevronRight, AlertTriangle, Gauge, User,
} from 'lucide-react';
import { PRICING_TIERS } from '@/lib/utils/constants';

export default function SettingsPage() {
  const [currentPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const usedCredits = 247;
  const totalCredits = 1000;
  const usagePercent = (usedCredits / totalCredits) * 100;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account, usage, and billing</p>
      </div>

      {/* Profile */}
      <div className="glass-panel p-6">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-brand-400" /> Profile
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Full Name</label>
            <input type="text" defaultValue="Alex Developer" className="input-field" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Email</label>
            <input type="email" defaultValue="alex@example.com" className="input-field" disabled />
          </div>
        </div>
        <button className="btn-primary !py-2 !px-4 text-sm mt-4">Save Changes</button>
      </div>

      {/* Usage & Credits */}
      <div className="glass-panel-strong p-6">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
          <Gauge className="h-4 w-4 text-amber-400" /> Usage & Credits
        </h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">API Requests Used</span>
            <span className="text-sm font-mono text-white">
              {usedCredits.toLocaleString()} / {totalCredits.toLocaleString()}
            </span>
          </div>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">
            {totalCredits - usedCredits} credits remaining this billing period
          </p>
        </div>

        {usagePercent > 70 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-200 font-medium">Running low on credits</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Upgrade to Pro for 50,000 monthly requests and higher rate limits.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Selector */}
      <div className="glass-panel p-6">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-brand-400" /> Billing & Plan
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier) => {
            const isCurrentPlan = tier.name === currentPlan;
            return (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentPlan
                    ? 'border-brand-500/40 bg-brand-500/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white capitalize">{tier.name}</h3>
                  {isCurrentPlan && <span className="badge text-[10px]">Current</span>}
                </div>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-2xl font-bold text-white">${tier.price}</span>
                  <span className="text-xs text-zinc-500">/mo</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {tier.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                      <Check className="h-3 w-3 text-brand-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrentPlan ? (
                  <button className="w-full btn-ghost !py-2 text-xs">
                    Upgrade <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                ) : (
                  <div className="w-full text-center text-xs text-zinc-500 py-2">Active plan</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel p-6">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-emerald-400" /> Security
        </h2>
        <div className="space-y-3">
          <button className="btn-ghost !py-2 !px-4 text-sm">Change Password</button>
          <button className="btn-ghost !py-2 !px-4 text-sm">Regenerate All API Keys</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-4">
          <Trash2 className="h-4 w-4" /> Danger Zone
        </h2>
        <p className="text-sm text-zinc-400 mb-3">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 
                          border border-red-500/20 hover:bg-red-500/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
