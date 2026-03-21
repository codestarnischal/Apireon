'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const NAV = [{ href: '/overview', l: 'Overview' }, { href: '/playground', l: 'Playground' }, { href: '/docs', l: 'Docs' }, { href: '/settings', l: 'Settings' }];
const dsp = { type: 'spring' as const, stiffness: 160, damping: 22 };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login'); else setUser(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) router.push('/login'); else setUser(s.user); });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--calm-bg)]">
      <header className="sticky top-0 z-40 border-b border-black/[0.04]" style={{ background: 'rgba(250,249,246,0.88)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[17px] font-bold text-[var(--ink)] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-display)' }}>Procyon Labs</Link>
            <div className="h-4 w-px bg-black/[0.06]" />
            <nav className="flex items-center gap-0.5 bg-white rounded-full p-1 border border-black/[0.04]">
              {NAV.map(({ href, l }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} className={`relative px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${active ? 'text-[var(--ink)]' : 'text-[var(--ink-3)] hover:text-[var(--ink)]'}`}>
                    {l}
                    {active && <motion.div layoutId="dnav" className="absolute inset-0 bg-[var(--calm-warm)] rounded-full border border-black/[0.03] -z-10" transition={dsp} />}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-[12px] text-[var(--ink-3)]">{user.email}</span>}
            <motion.button onClick={() => { supabase.auth.signOut(); router.push('/'); }}
              className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] font-medium transition-colors cursor-pointer bg-transparent border-none"
              whileHover={{ scale: 1.02 }}>Sign out</motion.button>
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
