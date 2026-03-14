'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#0071e3"/>
    <path d="M16 7l-7 10h5.5l-1 8 7-10h-5.5l1-8z" fill="white"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStep('otp');
    } catch (err: any) { setError(err.message || 'Failed to send code'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (verifyError) throw verifyError;
      router.push('/overview');
    } catch (err: any) { setError(err.message || 'Invalid or expired code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-[22px] font-bold text-[#1d1d1f] mt-4">
            {step === 'email' ? 'Sign in to Apireon' : 'Check your email'}
          </h1>
          <p className="text-[14px] text-[#86868b] mt-1.5 text-center">
            {step === 'email' ? 'Enter your email to receive a sign-in code' : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <div className="card-elevated p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-[#fce4ec] text-[#c62828] text-sm font-medium">{error}</div>
          )}

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#1d1d1f] mb-1.5 block">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field" placeholder="you@company.com" required autoFocus />
              </div>
              <button type="submit" disabled={loading || !email} className="w-full btn-primary !py-3 justify-center">
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#1d1d1f] mb-1.5 block">Verification code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-[28px] tracking-[0.35em] font-mono font-bold" placeholder="••••••"
                  maxLength={6} required autoFocus />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-primary !py-3 justify-center">
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & sign in'}
              </button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="w-full text-[13px] text-[#0071e3] font-medium hover:underline py-1">
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[12px] text-[#86868b] mt-6">
          By continuing, you agree to Apireon&apos;s Terms of Service
        </p>
      </div>
    </div>
  );
}
