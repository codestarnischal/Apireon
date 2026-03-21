'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import FilterInteraction, { type FilterKey, FILTERS } from '@/components/ui/filter-interaction';
import { PRICING_TIERS } from '@/lib/utils/constants';

const ease = [0.23, 1, 0.32, 1] as const;
const dampedSpring = { type: 'spring' as const, stiffness: 160, damping: 22 };

function R({ children, d = 0, className = '' }: { children: React.ReactNode; d?: number; className?: string }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: d, ease }} className={className}>{children}</motion.div>;
}

// ═══════════════════════════════════════
// ENTRY FLOW — Blank → Search → Bloom
// ═══════════════════════════════════════
function EntryGate({ onUnlock }: { onUnlock: (filter: FilterKey | 'all') => void }) {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterKey | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show filters after a brief moment
  useEffect(() => {
    const t = setTimeout(() => setShowFilters(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Auto-unlock when user types "procyon"
  useEffect(() => {
    if (query.toLowerCase().includes('procyon')) {
      const t = setTimeout(() => onUnlock(selectedFilter || 'all'), 400);
      return () => clearTimeout(t);
    }
  }, [query, selectedFilter, onUnlock]);

  const handleFilterSelect = (key: FilterKey) => {
    setSelectedFilter(key);
    setTimeout(() => onUnlock(key), 500);
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--calm-bg)] flex flex-col items-center justify-center px-6"
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6 }}
    >
      {/* Soft ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,166,138,0.06), transparent 70%)', filter: 'blur(40px)' }}
          animate={{ x: [0, 15, -10, 0], y: [0, -10, 12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-[50%] right-[20%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,164,200,0.05), transparent 70%)', filter: 'blur(40px)' }}
          animate={{ x: [0, -12, 15, 0], y: [0, 15, -8, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
      </div>

      <div className="relative z-10 w-full max-w-[560px] text-center">
        {/* Brand */}
        <motion.h1
          className="text-[32px] font-bold tracking-[-0.03em] text-[var(--ink)] mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease }}
        >
          Procyon Labs
        </motion.h1>

        <motion.p
          className="text-[16px] text-[var(--ink-2)] mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Therapeutic AI for every mind.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...dampedSpring }}
          className="mb-10"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Type "Procyon" or choose below...'
            className="input-calm text-center"
            autoFocus
          />
        </motion.div>

        {/* Filter toggles */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...dampedSpring }}
            >
              <p className="t-label mb-5">Or explore a pathway</p>
              <FilterInteraction onSelect={handleFilterSelect} selected={selectedFilter} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// SOFT BACKGROUND
// ═══════════════════════════════════════
function SoftBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[
        { x: '18%', y: '12%', s: 450, c: 'rgba(127,166,138,0.06)', dur: 22 },
        { x: '72%', y: '8%', s: 400, c: 'rgba(124,164,200,0.05)', dur: 26 },
        { x: '45%', y: '55%', s: 500, c: 'rgba(196,169,125,0.04)', dur: 24 },
      ].map((b, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: `radial-gradient(circle, ${b.c}, transparent 70%)`, filter: 'blur(50px)' }}
          animate={{ x: [0, 18, -14, 0], y: [0, -14, 10, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }} />
      ))}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}

// ═══════════════════════════════════════
// VOICE VISUALIZER — Dampened calm bars
// ═══════════════════════════════════════
function VoiceBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {Array.from({ length: 24 }, (_, i) => {
        const c = Math.abs(i - 11.5) / 11.5;
        const max = 32 * (1 - c * 0.5);
        return (
          <motion.div key={i} className="w-[3px] rounded-full" style={{ background: 'var(--calm-sage)', opacity: 0.2 + (1 - c) * 0.3 }}
            animate={{ height: [4, max * (0.3 + Math.random() * 0.7), 5, max * (0.4 + Math.random() * 0.6), 4] }}
            transition={{ duration: 1.8 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.05, ease: 'easeInOut' }} />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// ORCHESTRATION PIPELINE with real logos
// ═══════════════════════════════════════
function Pipeline() {
  const nodes = [
    { l: 'Input', c: 'var(--ink-3)', type: 'text' as const },
    { l: 'Gemini', c: 'var(--calm-sky)', type: 'logo' as const, src: '/gemini.png' },
    { l: 'Claude', c: 'var(--calm-sand)', type: 'logo' as const, src: '/claude.png' },
    { l: 'Output', c: 'var(--calm-sage)', type: 'text' as const },
  ];
  return (
    <div className="flex items-center justify-center gap-3 max-w-[520px] mx-auto">
      {nodes.map((n, i) => (
        <div key={n.l} className="flex items-center gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.15, ...dampedSpring }} className="flex flex-col items-center gap-2.5">
            {n.type === 'logo' ? (
              <motion.div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center overflow-hidden group cursor-pointer"
                style={{ borderColor: `color-mix(in srgb, ${n.c} 25%, transparent)`, background: `color-mix(in srgb, ${n.c} 6%, transparent)` }}
                whileHover={{ scale: 1.06 }} transition={dampedSpring}>
                <img src={n.src} alt={n.l} className="w-9 h-9 object-contain transition-all duration-700 ease-out grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100" />
              </motion.div>
            ) : (
              <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-[12px] font-bold"
                style={{ borderColor: `color-mix(in srgb, ${n.c} 25%, transparent)`, color: n.c, background: `color-mix(in srgb, ${n.c} 6%, transparent)` }}>
                {n.l.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-[12px] font-medium text-[var(--ink-2)]">{n.l}</span>
          </motion.div>
          {i < 3 && (
            <motion.div className="w-8 h-px bg-[var(--ink-4)]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.1, duration: 0.6, ease }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// NAV — Morphing header
// ═══════════════════════════════════════
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.header className="fixed top-0 left-0 right-0 z-50" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }}>
      <motion.div className="absolute inset-0 border-b" animate={{
        backgroundColor: scrolled ? 'rgba(250,249,246,0.88)' : 'rgba(250,249,246,0)',
        borderColor: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0)',
      }} transition={{ duration: 0.5, ease }} style={{ backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)' }} />

      <div className="relative max-w-[1200px] mx-auto px-6">
        <motion.div className="flex items-center justify-between" animate={{ height: scrolled ? 56 : 68 }} transition={{ duration: 0.5, ease }}>
          <div className="relative flex-shrink-0" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <span className="text-[20px] font-bold tracking-[-0.03em] text-[var(--ink)] cursor-pointer" style={{ fontFamily: 'var(--font-display)' }}>Procyon Labs</span>
            <AnimatePresence>
              {hovering && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }} transition={dampedSpring}
                  className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-black/[0.05] py-2 px-1 min-w-[180px]"
                  style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.06)' }}>
                  {['Research', 'AI', 'Voice', 'API'].map((s, i) => (
                    <motion.a key={s} href={`#${s.toLowerCase()}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, ...dampedSpring }}
                      className="block px-4 py-2.5 text-[14px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--calm-warm)] rounded-xl transition-colors">
                      Procyon {s}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center links — summoned on scroll */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <AnimatePresence>
              {scrolled && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={dampedSpring} className="flex items-center gap-1 bg-white/70 rounded-full p-1 border border-black/[0.04]" style={{ backdropFilter: 'blur(8px)' }}>
                  {[{ l: 'Features', h: '#platform' }, { l: 'About', h: '#ai' }, { l: 'Pricing', h: '#pricing' }].map((link, i) => (
                    <motion.a key={link.l} href={link.h} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, ...dampedSpring }}
                      className="px-5 py-2 text-[13px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] rounded-full hover:bg-white/80 transition-all">
                      {link.l}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/login"><motion.span className="text-[14px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] px-3 py-2 transition-colors cursor-pointer" whileHover={{ scale: 1.02 }}>Sign in</motion.span></Link>
            <Link href="/login"><motion.span className="btn-calm !text-[13px] !py-2.5 !px-6" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

// ═══════════════════════════════════════
// THERAPEUTIC SECTION CARDS
// ═══════════════════════════════════════
function TherapeuticSection({ id, color, softColor, icon, title, subtitle, features, reversed = false }: {
  id: string; color: string; softColor: string; icon: React.ReactNode; title: string; subtitle: string; features: { title: string; desc: string }[]; reversed?: boolean;
}) {
  return (
    <section id={id} className="py-20 px-6">
      <div className="max-w-[1100px] mx-auto">
        <R>
          <div className={clsx('flex flex-col lg:flex-row gap-12 items-center', reversed && 'lg:flex-row-reverse')}>
            {/* Visual */}
            <div className="flex-1 flex justify-center">
              <motion.div className="w-[260px] h-[260px] rounded-[40px] flex items-center justify-center"
                style={{ background: softColor, border: `2px solid color-mix(in srgb, ${color} 15%, transparent)` }}
                whileHover={{ scale: 1.03, rotate: 1 }} transition={dampedSpring}>
                <motion.div style={{ color }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  {icon}
                </motion.div>
              </motion.div>
            </div>
            {/* Content */}
            <div className="flex-1 max-w-[480px]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="t-label" style={{ color }}>{title}</span>
              </div>
              <h2 className="t-h1 text-[var(--ink)] mb-4">{subtitle}</h2>
              <div className="space-y-4">
                {features.map((f, i) => (
                  <R key={f.title} d={i * 0.08}>
                    <div className="card-calm-hover p-5">
                      <h3 className="t-h2 text-[var(--ink)] mb-1">{f.title}</h3>
                      <p className="t-sm">{f.desc}</p>
                    </div>
                  </R>
                ))}
              </div>
            </div>
          </div>
        </R>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export default function Page() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey | 'all'>('all');

  const handleUnlock = useCallback((filter: FilterKey | 'all') => {
    setActiveFilter(filter);
    setUnlocked(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!unlocked ? (
        <EntryGate key="gate" onUnlock={handleUnlock} />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          className="min-h-screen bg-[var(--calm-bg)]"
        >
          <SoftBackground />
          <Nav />

          {/* ═══ HERO ═══ */}
          <section className="relative z-10 pt-36 pb-12 px-6">
            <div className="max-w-[1100px] mx-auto text-center">
              <motion.p className="t-label text-[var(--calm-sage)] mb-5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Therapeutic AI Infrastructure
              </motion.p>
              <motion.h1 className="t-display text-[var(--ink)] mb-5"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease }}>
                AI designed for<br />every kind of mind.
              </motion.h1>
              <motion.p className="t-body text-[17px] max-w-[480px] mx-auto mb-10"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6, ease }}>
                Calm communication, accessible learning, and research-grade neurological tools — built with care for dyslexia, autism, and Tourette&apos;s.
              </motion.p>

              {/* Active filter indicator */}
              {activeFilter !== 'all' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full" style={{ background: FILTERS.find(f => f.key === activeFilter)?.color }} />
                  <span className="text-[14px] font-semibold" style={{ color: FILTERS.find(f => f.key === activeFilter)?.color }}>
                    {FILTERS.find(f => f.key === activeFilter)?.label}
                  </span>
                  <button onClick={() => setActiveFilter('all')} className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] ml-2 underline cursor-pointer bg-transparent border-none">
                    Show all
                  </button>
                </motion.div>
              )}

              {/* Voice interface */}
              <motion.div className="max-w-[420px] mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease }}>
                <div className="card-calm p-6">
                  <VoiceBars />
                  <div className="flex items-center gap-3 mt-4">
                    <motion.button className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--calm-sage)', color: 'white' }}
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                    </motion.button>
                    <input type="text" placeholder="Speak or type gently..." className="input-calm !rounded-full !py-3 !pl-5 !pr-10 !text-[15px] flex-1" />
                  </div>
                  <p className="text-[12px] text-[var(--ink-4)] text-center mt-3">Safe space · No rush · Switch modes anytime</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ═══ VOICE SECTION ═══ */}
          {(activeFilter === 'all' || activeFilter === 'voice') && (
            <TherapeuticSection id="voice" color="var(--calm-sage)" softColor="var(--calm-sage-soft)"
              icon={<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>}
              title="Procyon Voice" subtitle="Calm communication for frustrated minds."
              features={[
                { title: 'Emotion-to-Speech', desc: 'Detects rising frustration and adjusts tone, pace, and vocabulary to de-escalate — never mirrors anger back.' },
                { title: 'Tic-Aware Listening', desc: 'Designed for Tourette\'s: filters involuntary sounds, waits patiently, and never interrupts during vocal tics.' },
                { title: 'Sensory Volume Control', desc: 'Users control speech rate, pitch, and pauses. Whisper mode for overstimulated moments.' },
              ]} />
          )}

          {/* ═══ MOTION SECTION ═══ */}
          {(activeFilter === 'all' || activeFilter === 'motion') && (
            <TherapeuticSection id="motion" color="var(--calm-sky)" softColor="var(--calm-sky-soft)" reversed
              icon={<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
              title="Procyon Motion" subtitle="Visual learning without the noise."
              features={[
                { title: 'Simplified Visuals', desc: 'Generates clean, low-stimulus educational animations. No flickering, no rapid movement, no visual clutter.' },
                { title: 'Educator Toolkit', desc: 'Teachers build custom visual stories for autistic and dyslexic students. Adjustable complexity per student.' },
                { title: 'Dampened Motion', desc: 'Every animation runs at 0.6× speed minimum with extended easing curves. Respects prefers-reduced-motion.' },
              ]} />
          )}

          {/* ═══ RESEARCH SECTION ═══ */}
          {(activeFilter === 'all' || activeFilter === 'research') && (
            <TherapeuticSection id="research" color="var(--calm-lavender)" softColor="var(--calm-lavender-soft)"
              icon={<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
              title="Procyon Research" subtitle="Peer-reviewed AI for neurology."
              features={[
                { title: 'Neurological Digital Twin', desc: 'Model cognitive patterns to predict overstimulation, communication breakdowns, and tic episodes before they happen.' },
                { title: 'Peer-Reviewed Frameworks', desc: 'Every therapeutic model is grounded in published neuroscience. Open-source validation by clinical researchers.' },
                { title: 'Labs & Experiments', desc: 'Run A/B trials on accessibility interventions. Measure outcomes against neurotypical baselines with ethical oversight.' },
              ]} />
          )}

          {/* ═══ ORCHESTRATION ═══ */}
          {activeFilter === 'all' && (
            <section id="ai" className="py-20 px-6 bg-white/40 border-y border-black/[0.03]">
              <div className="max-w-[660px] mx-auto text-center">
                <R><p className="t-label text-[var(--calm-sky)] mb-3">Orchestration</p>
                  <h2 className="t-h1 text-[var(--ink)] mb-4">Models that understand together.</h2>
                  <p className="t-body mb-12">Gemini structures. Claude reasons. The output is therapeutic and precise.</p></R>
                <R d={0.1}><Pipeline /></R>
              </div>
            </section>
          )}

          {/* ═══ PRICING ═══ */}
          <section id="pricing" className="py-20 px-6">
            <div className="max-w-[960px] mx-auto">
              <R className="text-center mb-14">
                <p className="t-label text-[var(--calm-sage)] mb-3">Access</p>
                <h2 className="t-h1 text-[var(--ink)]">Gentle pricing for important work.</h2>
              </R>
              <div className="grid md:grid-cols-3 gap-5">
                {PRICING_TIERS.map((t, i) => (
                  <R key={t.name} d={i * 0.08}>
                    <motion.div className={clsx('relative card-calm p-8 flex flex-col h-full', i === 1 && 'ring-2 ring-[var(--calm-sage)]')}
                      whileHover={{ y: -3 }} transition={dampedSpring}>
                      {i === 1 && <span className="absolute -top-3 left-6 px-3 py-1 text-white text-[10px] font-bold rounded-full tracking-wider uppercase" style={{ background: 'var(--calm-sage)' }}>Recommended</span>}
                      <p className="t-label text-[var(--ink-3)] mb-4">{t.name}</p>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-[36px] font-bold text-[var(--ink)] leading-none tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>${t.price}</span>
                        <span className="text-[14px] text-[var(--ink-3)]">/mo</span>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">{t.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--ink-2)]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--calm-sage)" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>{f}
                        </li>
                      ))}</ul>
                      <Link href="/login"><motion.span className={i === 1 ? 'btn-calm w-full justify-center' : 'btn-soft w-full justify-center'} whileHover={{ scale: 1.02 }}>
                        {t.price === 0 ? 'Start gently' : 'Upgrade'}
                      </motion.span></Link>
                    </motion.div>
                  </R>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="py-20 px-6">
            <R className="max-w-[420px] mx-auto text-center">
              <h2 className="t-h1 text-[var(--ink)] mb-4">Every mind deserves great AI.</h2>
              <p className="t-body mb-8">Start building therapeutic experiences today.</p>
              <Link href="/login"><motion.span className="btn-calm !text-[15px] !py-4 !px-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon →</motion.span></Link>
            </R>
          </section>

          {/* ═══ FOOTER ═══ */}
          <footer className="border-t border-black/[0.04] py-14 px-6 bg-white/30">
            <div className="max-w-[1100px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                  <span className="text-[17px] font-bold text-[var(--ink)] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)' }}>Procyon Labs</span>
                  <p className="text-[13px] text-[var(--ink-3)] mt-2 leading-relaxed">Therapeutic AI<br />for every mind.</p>
                </div>
                {[
                  { t: 'Platform', l: ['Procyon Voice', 'Procyon Motion', 'Procyon Research', 'API'] },
                  { t: 'Accessibility', l: ['Dyslexia Tools', 'Autism Support', 'Tourette\'s Care', 'Educators'] },
                  { t: 'Company', l: ['About', 'Blog', 'Careers', 'Contact'] },
                  { t: 'Legal', l: ['Privacy', 'Terms', 'Ethics', 'Research'] },
                ].map(c => (
                  <div key={c.t}>
                    <p className="t-label mb-3">{c.t}</p>
                    <ul className="space-y-2.5">{c.l.map(l => <li key={l}><a href="#" className="text-[14px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">{l}</a></li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-black/[0.04] gap-4">
                <p className="text-[13px] text-[var(--ink-3)]">© {new Date().getFullYear()} Procyon Labs. Built with care.</p>
                <div className="flex gap-5">{['Twitter', 'GitHub', 'Discord'].map(s => <a key={s} href="#" className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">{s}</a>)}</div>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
