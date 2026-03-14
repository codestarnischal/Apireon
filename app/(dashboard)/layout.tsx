'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap, LayoutDashboard, Play, BookOpen, Settings,
  ChevronLeft, ChevronRight, CreditCard, LogOut, Plus,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { href: '/playground', icon: Play, label: 'Playground' },
  { href: '/docs', icon: BookOpen, label: 'API Docs' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col
                  bg-surface-1/80 backdrop-blur-xl border-r border-white/[0.06]
                  transition-all duration-300 ease-out
                  ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-semibold text-white tracking-tight"
          >
            InstantAPI
          </motion.span>
        )}
      </div>

      {/* New Project Button */}
      <div className="px-3 py-4">
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                     bg-brand-600/20 border border-brand-500/30 text-brand-300
                     hover:bg-brand-600/30 hover:text-brand-200 transition-all text-sm font-medium
                     ${collapsed ? 'px-2' : 'px-4'}`}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>New Project</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                         transition-all duration-150
                         ${isActive
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }
                         ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-brand-400' : ''}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1 border-t border-white/[0.06]">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400
                     hover:text-zinc-200 hover:bg-white/[0.04] transition-all
                     ${collapsed ? 'justify-center' : ''}`}
        >
          <CreditCard className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Billing</span>}
        </Link>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500
                     hover:text-red-400 hover:bg-red-500/10 transition-all
                     ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-20 -right-3 h-6 w-6 rounded-full bg-surface-3 border border-white/[0.1]
                   flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-0">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`transition-all duration-300 min-h-screen
                   ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}
      >
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
