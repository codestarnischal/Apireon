'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const r = await fetch('/api/auth/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const d = await r.json(); if (!d.success) throw new Error(d.error); setStep('otp'); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' }); if (err) throw err; router.push('/overview'); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--warm)] flex items-center justify-center px-6">
      <motion.div className="w-full max-w-[400px]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.23,1,0.32,1] }}>
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.03em]">Procyon Labs</h1>
          <p className="text-[14px] text-[var(--ink-2)] mt-2">{step === 'email' ? 'Sign in with a one-time code' : `Code sent to ${email}`}</p>
        </div>
        <div className="card p-8" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}
          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div><label className="text-[13px] font-semibold text-[var(--ink)] mb-2 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-warm" placeholder="you@company.com" required autoFocus /></div>
              <motion.button type="submit" disabled={loading || !email} className="w-full btn-dark justify-center !py-3 disabled:opacity-40" whileHover={{ scale: 1.01 }}>
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}</motion.button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div><label className="text-[13px] font-semibold text-[var(--ink)] mb-2 block">Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} className="input-warm text-center text-[28px] tracking-[0.4em] font-bold" placeholder="······" maxLength={6} required autoFocus /></div>
              <motion.button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-dark justify-center !py-3" whileHover={{ scale: 1.01 }}>
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify'}</motion.button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} className="w-full text-[13px] text-[var(--ink-2)] font-medium hover:text-[var(--ink)] hover:underline py-1 bg-transparent border-none cursor-pointer">Different email</button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
