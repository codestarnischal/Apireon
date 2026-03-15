'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const NAV = [
  { href: '/overview', label: 'Overview' },
  { href: '/playground', label: 'Playground' },
  { href: '/docs', label: 'Docs' },
  { href: '/settings', label: 'Settings' },
];

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
      <header className="sticky top-0 z-40 bg-[var(--bg)]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[16px] font-bold text-white font-[var(--font-display)] tracking-[-0.03em]">Procyon Labs</Link>
            <div className="h-4 w-px bg-white/[0.08]" />
            <nav className="flex items-center gap-0.5">
              {NAV.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-all
                      ${active ? 'text-white' : 'text-[var(--text-2)] hover:text-white hover:bg-white/[0.04]'}`}>
                    {label}
                    {active && <motion.div layoutId="dash-nav" className="absolute inset-0 bg-white/[0.06] rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-[11px] text-[var(--text-3)] t-mono">{user.email}</span>}
            <motion.button onClick={() => { supabase.auth.signOut(); router.push('/'); }}
              className="text-[13px] text-[var(--text-3)] hover:text-white font-medium transition-colors cursor-pointer bg-transparent border-none"
              whileHover={{ scale: 1.02 }}>Sign out</motion.button>
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
