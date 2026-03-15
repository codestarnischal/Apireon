'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const NAV = [{ href: '/overview', l: 'Overview' }, { href: '/playground', l: 'Playground' }, { href: '/docs', l: 'Docs' }, { href: '/settings', l: 'Settings' }];

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
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/70 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[15px] font-[900] text-white font-[var(--font-display)] tracking-[-0.03em] uppercase">Procyon Labs</Link>
            <div className="h-4 w-px bg-white/[0.06]" />
            <nav className="flex items-center gap-0.5">
              {NAV.map(({ href, l }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} className={`relative px-4 py-2 text-[12px] font-semibold font-[var(--font-display)] tracking-wide uppercase rounded-full transition-all
                    ${active ? 'text-white' : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-white/[0.03]'}`}>
                    {l}
                    {active && <motion.div layoutId="dnav" className="absolute inset-0 bg-white/[0.05] rounded-full border border-white/[0.04] -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-[10px] text-[var(--text-3)] t-mono">{user.email}</span>}
            <motion.button onClick={() => { supabase.auth.signOut(); router.push('/'); }}
              className="text-[12px] text-[var(--text-3)] hover:text-[var(--gold)] font-semibold font-[var(--font-display)] tracking-wide uppercase transition-colors cursor-pointer bg-transparent border-none"
              whileHover={{ scale: 1.02 }}>Sign out</motion.button>
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
