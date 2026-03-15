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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.push('/login');
      else setUser(s.user);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-[#e8eaed]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[18px] font-bold tracking-[-0.04em] text-[#1a1a1a]">Apireon</Link>
            <div className="h-5 w-px bg-[#e8eaed]" />
            <nav className="flex items-center gap-0.5">
              {NAV.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-all
                      ${active ? 'text-[#1a1a1a]' : 'text-[#5f6368] hover:text-[#1a1a1a] hover:bg-black/[0.03]'}`}>
                    {label}
                    {active && (
                      <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-[#f1f3f4] rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-[12px] text-[#9aa0a6] font-[var(--font-mono)]">{user.email}</span>}
            <motion.button onClick={() => { supabase.auth.signOut(); router.push('/'); }}
              className="text-[13px] text-[#5f6368] hover:text-[#1a1a1a] font-medium transition-colors cursor-pointer bg-transparent border-none"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Sign out
            </motion.button>
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
