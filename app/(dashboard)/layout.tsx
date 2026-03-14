'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#0071e3"/>
    <path d="M16 7l-7 10h5.5l-1 8 7-10h-5.5l1-8z" fill="white"/>
  </svg>
);

const NAV = [
  { href: '/overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { href: '/playground', label: 'Playground', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><polygon points="6 3 20 12 6 21 6 3"/></svg> },
  { href: '/docs', label: 'API Docs', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 7v14"/><path d="M4 7.5C4 5.01 5.79 3 8 3h12v18H8c-2.21 0-4-2.01-4-4.5v-9z"/></svg> },
  { href: '/settings', label: 'Settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg> },
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
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] flex items-center px-6">
        <div className="flex items-center gap-2 mr-8">
          <Logo />
          <span className="font-bold text-[15px] text-[#1d1d1f] tracking-tight">Apireon</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all
                  ${active ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]/60'}`}>
                <span className={active ? 'text-[#0071e3]' : ''}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="text-[12px] text-[#86868b]">{user.email}</span>}
          <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }}
            className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors">
            Sign out
          </button>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
