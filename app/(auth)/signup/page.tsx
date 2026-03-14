'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Github } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In production: supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-white tracking-tight">InstantAPI</span>
        </div>

        <div className="glass-panel-strong p-8">
          <h1 className="text-xl font-bold text-white text-center mb-1">Create your account</h1>
          <p className="text-sm text-zinc-400 text-center mb-6">Start building APIs in seconds</p>

          <button className="w-full btn-ghost !py-2.5 text-sm mb-4 gap-2">
            <Github className="h-4 w-4" /> Continue with GitHub
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" placeholder="Alex Developer" required />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••" minLength={8} required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary !py-2.5 text-sm">
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-3.5 w-3.5 ml-1" /></>
              )}
            </button>
          </form>

          <p className="text-[11px] text-zinc-600 text-center mt-4">
            By signing up, you agree to our Terms and Privacy Policy
          </p>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
