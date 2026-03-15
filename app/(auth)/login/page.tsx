'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const easeOut = { duration: 0.6, ease: [0.23, 1, 0.32, 1] };

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
    } catch (err: any) { setError(err.message || 'Failed to send code'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (verifyError) throw verifyError;
      router.push('/overview');
    } catch (err: any) { setError(err.message || 'Invalid or expired code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <motion.div className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={easeOut}>

        <div className="text-center mb-8">
          <motion.span className="text-[28px] font-bold tracking-[-0.04em] text-[#1a1a1a]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Apireon
          </motion.span>
          <motion.p className="text-[15px] text-[#5f6368] mt-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {step === 'email' ? 'Sign in with a one-time code' : `Enter the code sent to ${email}`}
          </motion.p>
        </div>

        <motion.div className="surface-elevated p-8"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...easeOut }}>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 px-4 py-3 rounded-xl bg-[#fce8e6] text-[#c5221f] text-[13px] font-medium">{error}</motion.div>
          )}

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-[#1a1a1a] mb-2 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="you@company.com" required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || !email}
                className="w-full btn-fill justify-center !py-3" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Continue'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-[#1a1a1a] mb-2 block">Verification code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-[28px] tracking-[0.4em] font-[var(--font-mono)] font-bold" placeholder="······"
                  maxLength={6} required autoFocus />
              </div>
              <motion.button type="submit" disabled={loading || otp.length !== 6}
                className="w-full btn-fill justify-center !py-3" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : 'Verify & sign in'}
              </motion.button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="w-full text-[13px] text-[#1a73e8] font-medium hover:underline py-1 bg-transparent border-none cursor-pointer">
                Use a different email
              </button>
            </form>
          )}
        </motion.div>

        <p className="text-center text-[12px] text-[#9aa0a6] mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
