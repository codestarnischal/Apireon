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
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div className="relative z-10 w-full max-w-[400px]" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.23,1,0.32,1] }}>
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-[900] text-white font-[var(--font-display)] tracking-[-0.04em] uppercase">Procyon Labs</h1>
          <p className="text-[14px] text-[var(--text-2)] mt-2 font-[var(--font-body)]">{step === 'email' ? 'Sign in with a one-time code' : `Code sent to ${email}`}</p>
        </div>

        <div className="glass-strong p-8">
          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-[13px]">{error}</div>}

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="text-[12px] font-semibold text-[var(--text-2)] mb-2 block font-[var(--font-display)] tracking-wide uppercase">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="you@company.com" required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || !email} className="w-full btn-gold justify-center !py-3.5 disabled:opacity-30" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-[var(--bg)]/30 border-t-[var(--bg)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Continue'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="text-[12px] font-semibold text-[var(--text-2)] mb-2 block font-[var(--font-display)] tracking-wide uppercase">Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} className="input-dark text-center text-[28px] tracking-[0.4em] font-[var(--font-mono)] font-bold" placeholder="······" maxLength={6} required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-gold justify-center !py-3.5" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-[var(--bg)]/30 border-t-[var(--bg)] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Verify'}
              </motion.button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} className="w-full text-[13px] text-[var(--gold)] font-medium hover:underline py-1 bg-transparent border-none cursor-pointer">Different email</button>
            </form>
          )}
        </div>
        <p className="text-center text-[11px] text-[var(--text-3)] mt-6">By continuing, you agree to our Terms of Service</p>
      </motion.div>
    </div>
  );
}
