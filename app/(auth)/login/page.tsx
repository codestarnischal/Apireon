'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const ease = [0.23, 1, 0.32, 1] as const;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStep('otp');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (err) throw err;
      router.push('/overview');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      {/* Subtle ambient orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,106,239,0.06) 0%, transparent 70%)' }} />

      <motion.div className="relative z-10 w-full max-w-[400px]" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-white font-[var(--font-display)] tracking-[-0.03em]">Procyon Labs</h1>
          <p className="text-[14px] text-[var(--text-2)] mt-2">
            {step === 'email' ? 'Sign in with a one-time code' : `Code sent to ${email}`}
          </p>
        </div>

        <div className="sf-elevated p-8">
          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--red)]/10 text-[var(--red)] text-[13px] font-medium border border-[var(--red)]/20">{error}</div>}

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-white mb-2 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="you@company.com" required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || !email} className="w-full btn-glow justify-center !py-3" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Continue'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-white mb-2 block">Verification code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-dark text-center text-[28px] tracking-[0.4em] font-[var(--font-mono)] font-bold" placeholder="······" maxLength={6} required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-glow justify-center !py-3" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Verify & sign in'}
              </motion.button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="w-full text-[13px] text-[var(--accent)] font-medium hover:underline py-1 bg-transparent border-none cursor-pointer">Use a different email</button>
            </form>
          )}
        </div>
        <p className="text-center text-[11px] text-[var(--text-3)] mt-6">By continuing, you agree to our Terms of Service</p>
      </motion.div>
    </div>
  );
}
