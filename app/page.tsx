'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

const ease = [0.23, 1, 0.32, 1] as const;
const sp = { type: 'spring' as const, stiffness: 260, damping: 26 };

function R({ children, d = 0, className = '' }: { children: React.ReactNode; d?: number; className?: string }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: d, ease }} className={className}>{children}</motion.div>;
}

// ═════════════════════════════════════════
// WARM AI BACKGROUND — soft flowing shapes
// ═════════════════════════════════════════
function WarmBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 20, damping: 15 });
  const sy = useSpring(my, { stiffness: 20, damping: 15 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 30);
      my.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [mx, my]);

  const blobs = [
    { x: '20%', y: '15%', s: 500, c: 'rgba(200,180,140,0.12)', dur: 20 },
    { x: '70%', y: '10%', s: 450, c: 'rgba(180,200,210,0.08)', dur: 25 },
    { x: '50%', y: '55%', s: 550, c: 'rgba(210,195,165,0.08)', dur: 22 },
    { x: '15%', y: '70%', s: 400, c: 'rgba(190,210,200,0.06)', dur: 28 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: `radial-gradient(circle, ${b.c}, transparent 70%)`, filter: 'blur(50px)', x: sx, y: sy }}
          animate={{ x: [0, 25, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2.5 }} />
      ))}
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
    </div>
  );
}

// ═════════════════════════════════════════
// NEURAL MESH — Soft generative SVG
// ═════════════════════════════════════════
function NeuralMesh() {
  const [paths, setPaths] = useState<string[]>([]);
  const frame = useRef(0);

  const gen = useCallback((t: number, layer: number) => {
    const pts = 7;
    const base = 110 + layer * 22;
    let d = '';
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const n = Math.sin(t * 0.6 + i * 1.8 + layer) * 20 + Math.cos(t * 0.4 + i * 2.5) * 12;
      const x = 200 + Math.cos(a) * (base + n);
      const y = 200 + Math.sin(a) * (base + n);
      d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    return d + 'Z';
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      const t = frame.current * 0.012;
      frame.current++;
      setPaths([gen(t, 0), gen(t + 0.8, 1), gen(t + 1.6, 2)]);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gen]);

  return (
    <motion.div className="w-[280px] h-[280px]" animate={{ rotate: [0, 360] }} transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(180,160,120,0.18)" /><stop offset="100%" stopColor="rgba(180,160,120,0.03)" /></linearGradient>
          <linearGradient id="b" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(140,170,190,0.1)" /><stop offset="100%" stopColor="rgba(140,170,190,0.02)" /></linearGradient>
          <linearGradient id="c"><stop offset="0%" stopColor="rgba(0,0,0,0.04)" /><stop offset="100%" stopColor="rgba(0,0,0,0.01)" /></linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={`url(#${['a','b','c'][i]})`}
            stroke={i === 0 ? 'rgba(180,160,120,0.15)' : 'rgba(0,0,0,0.03)'}
            strokeWidth={i === 0 ? 1 : 0.5}
            style={{ transition: 'all 0.12s ease' }} />
        ))}
        <motion.circle cx="200" cy="200" r="3" fill="rgba(180,160,120,0.4)"
          animate={{ r: [2.5, 4.5, 2.5], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      </svg>
    </motion.div>
  );
}

// ═════════════════════════════════════════
// VOICE VISUALIZER — Warm bars
// ═════════════════════════════════════════
function VoiceBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {Array.from({ length: 28 }, (_, i) => {
        const c = Math.abs(i - 13.5) / 13.5;
        const max = 36 * (1 - c * 0.6);
        return (
          <motion.div key={i} className="w-[2.5px] rounded-full bg-[var(--ink)]"
            style={{ opacity: 0.15 + (1 - c) * 0.25 }}
            animate={{ height: [4, max * (0.3 + Math.random() * 0.7), 5, max * (0.4 + Math.random() * 0.6), 4] }}
            transition={{ duration: 1.2 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.035, ease: 'easeInOut' }} />
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════
// PIPELINE — Real logos, mono → color hover
// ═════════════════════════════════════════
function Pipeline() {
  const nodes = [
    { l: 'Input', c: '#9e9e98', type: 'text' as const },
    { l: 'Gemini', c: '#4285f4', type: 'logo' as const, src: '/gemini.png' },
    { l: 'Claude', c: '#cc785c', type: 'logo' as const, src: '/claude.png' },
    { l: 'Output', c: '#2d8a4e', type: 'text' as const },
  ];
  return (
    <div className="flex items-center justify-center gap-3 max-w-[520px] mx-auto">
      {nodes.map((node, i) => (
        <div key={node.l} className="flex items-center gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.12, ...sp }} className="flex flex-col items-center gap-2.5">
            {node.type === 'logo' ? (
              /* Logo node — grayscale by default, color on hover */
              <motion.div
                className="w-16 h-16 rounded-2xl border-[1.5px] flex items-center justify-center overflow-hidden group cursor-pointer"
                style={{ borderColor: `${node.c}20`, background: `${node.c}06` }}
                whileHover={{ scale: 1.08, borderColor: `${node.c}40` }}
                transition={sp}
              >
                <img
                  src={node.src}
                  alt={node.l}
                  className="w-9 h-9 object-contain transition-all duration-500 ease-out grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </motion.div>
            ) : (
              /* Text node — Input/Output */
              <div className="w-16 h-16 rounded-2xl border-[1.5px] flex items-center justify-center text-[11px] font-bold"
                style={{ borderColor: `${node.c}30`, color: node.c, background: `${node.c}08` }}>
                {node.l.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-[11px] font-medium text-[var(--ink-2)]">{node.l}</span>
          </motion.div>
          {i < 3 && (
            <motion.div className="w-8 h-px bg-[var(--ink-4)]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.12 + 0.08, duration: 0.5, ease }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

  return (
    <motion.nav initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--warm)]/80 backdrop-blur-2xl border-b border-black/[0.04]' : ''}`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Brand — text expansion on hover */}
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <motion.button className="flex items-baseline gap-1.5" whileHover={{ scale: 1.005 }}>
              <span className="text-[20px] font-bold tracking-[-0.03em] text-[var(--ink)]">Procyon Labs</span>
              <motion.span className="text-[10px] text-[var(--ink-3)]" animate={{ rotate: open ? 180 : 0 }} transition={sp}>▾</motion.span>
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  className="absolute top-full left-0 mt-1.5 overflow-hidden">
                  <div className="py-1">
                    {['Research', 'AI', 'Voice', 'API'].map((s, i) => (
                      <motion.a key={s} href={`#${s.toLowerCase()}`}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 22 }}
                        className="block py-1.5 text-[14px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors whitespace-nowrap cursor-pointer">
                        Procyon {s}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {['Platform', 'Research', 'Pricing'].map(l => (
              <motion.a key={l} href={l === 'Pricing' ? '#pricing' : `#${l.toLowerCase()}`}
                className="text-[14px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] px-3 py-2 rounded-full hover:bg-black/[0.03] transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{l}</motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login"><motion.span className="text-[14px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] px-3 py-2 transition-colors cursor-pointer" whileHover={{ scale: 1.02 }}>Sign in</motion.span></Link>
          <Link href="/login"><motion.span className="btn-dark !text-[13px] !py-2.5 !px-6" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ═════════════════════════════════════════
// TYPEWRITER — Types text character by character
// ═════════════════════════════════════════
function Typewriter({ text, delay = 0, speed = 35, className = '', onDone }: {
  text: string; delay?: number; speed?: number; className?: string; onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
      return () => clearTimeout(t);
    } else if (!done) {
      setDone(true);
      onDone?.();
    }
  }, [started, displayed, text, speed, done, onDone]);

  return (
    <span className={className}>
      {displayed}
      {started && !done && (
        <motion.span
          className="inline-block w-[2px] h-[0.9em] bg-[var(--ink)] ml-[2px] align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// ═════════════════════════════════════════
// HERO TEXT — Procyon generates the text
// ═════════════════════════════════════════
function HeroText() {
  const [showDesc, setShowDesc] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  return (
    <>
      <motion.div className="flex items-center gap-2 mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink-3)] animate-pulse" />
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--ink-3)]">
          Procyon Labs is generating
        </p>
      </motion.div>

      <h1 className="text-[clamp(2.8rem,5.5vw,4.2rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[var(--ink)] mb-6 min-h-[2.4em]">
        <Typewriter
          text="Build the impossible."
          delay={600}
          speed={55}
          onDone={() => setShowDesc(true)}
        />
      </h1>

      <div className="min-h-[4em] mb-8 max-w-[420px]">
        {showDesc && (
          <p className="text-[17px] text-[var(--ink-2)] leading-relaxed">
            <Typewriter
              text="Advanced orchestration, real-time voice, and managed infrastructure for teams pushing boundaries."
              delay={400}
              speed={18}
              onDone={() => setShowButtons(true)}
            />
          </p>
        )}
      </div>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={showButtons ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease }}
      >
        <Link href="/login"><motion.span className="btn-dark" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
        <motion.a href="#platform" className="btn-outline" whileHover={{ scale: 1.02 }}>Explore platform</motion.a>
      </motion.div>
    </>
  );
}

// ═════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════
export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--warm)]">
      <WarmBackground />
      <Nav />

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left text */}
            <motion.div className="flex-1 max-w-[520px]"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}>
              <HeroText />
            </motion.div>

            {/* Right — Neural Mesh + Voice */}
            <motion.div className="flex-1 flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 1, ease }}>
              <NeuralMesh />
              <div className="card p-5 w-full max-w-[380px]" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
                <VoiceBars />
                <div className="flex items-center gap-3 mt-4">
                  <motion.button className="w-10 h-10 rounded-full bg-[var(--ink)] text-white flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </motion.button>
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Or type a message..." className="input-warm !rounded-full !py-2.5 !pl-4 !pr-10 !text-[14px] w-full" />
                    <motion.button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--warm-2)] text-[var(--ink-2)] flex items-center justify-center"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </motion.button>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--ink-4)] text-center mt-3">Speak or type — switch anytime</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="relative z-10 py-10 border-y border-black/[0.04] bg-white/40 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: '<30s', l: 'Deploy time' }, { v: '99.99%', l: 'Uptime' }, { v: '12ms', l: 'P50 latency' }, { v: '50k+', l: 'APIs deployed' }].map((m, i) => (
            <R key={m.l} d={i * 0.06} className="text-center">
              <div className="text-[clamp(1.2rem,2vw,1.5rem)] font-bold text-[var(--ink)] tracking-[-0.02em]">{m.v}</div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)] mt-1">{m.l}</div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ PLATFORM ═══ */}
      <section id="platform" className="relative z-10 py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <R className="max-w-[460px] mb-14">
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--ink-3)] mb-3">Platform</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-4 leading-tight">Four systems.<br />One infrastructure.</h2>
            <p className="text-[16px] text-[var(--ink-2)] leading-relaxed">Each pillar works independently — or composes into a unified AI stack.</p>
          </R>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { t: 'Procyon API', d: 'High-performance REST gateways from natural language. Full CRUD, validation, docs, managed PostgreSQL.', f: ['Schema from text', 'Type validation', 'Auto docs', 'Rate limiting'] },
              { t: 'Procyon AI', d: 'Multi-model orchestration: Gemini structures, Claude reasons, specialized models generate output.', f: ['Gemini → Claude pipeline', 'Context routing', 'Streaming mode', 'Custom composition'] },
              { t: 'Procyon Voice', d: 'Conversational voice interface with real-time processing, transcription, and seamless mode switching.', f: ['Real-time voice', 'Voice ↔ text switching', 'Audio visualizer', 'Sub-200ms latency'] },
              { t: 'Procyon Research', d: 'Experimental deployments, research papers, benchmarks, and frontier AI infrastructure tooling.', f: ['Paper repository', 'Model experiments', 'Benchmarks', 'Collaboration'] },
            ].map((c, i) => (
              <R key={c.t} d={i * 0.06}>
                <motion.div className="card-hover p-7 h-full" whileHover={{ scale: 1.003 }} transition={sp}>
                  <h3 className="text-[16px] font-bold text-[var(--ink)] mb-2">{c.t}</h3>
                  <p className="text-[14px] text-[var(--ink-2)] leading-relaxed mb-4">{c.d}</p>
                  <ul className="space-y-1.5">{c.f.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>{f}
                    </li>
                  ))}</ul>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ORCHESTRATION ═══ */}
      <section id="ai" className="relative z-10 py-24 px-6 bg-white/40 border-y border-black/[0.04]">
        <div className="max-w-[660px] mx-auto text-center">
          <R><p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--ink-3)] mb-3">Orchestration</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-4">Deep reasoning, visualized.</h2>
            <p className="text-[16px] text-[var(--ink-2)] leading-relaxed mb-12">How Procyon chains models into a single intelligent pipeline.</p></R>
          <R d={0.1}><Pipeline /></R>
          <R d={0.2} className="mt-10">
            <div className="card p-6 text-left" style={{ background: 'var(--warm-2)' }}>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)] mb-3">Example</p>
              <div className="space-y-3 text-[13px]">
                {[
                  { k: 'Input', v: '"Analyze 500 reviews and generate a strategy report"', c: 'var(--ink-3)', logo: null },
                  { k: 'Gemini', v: 'Structures prompt, chunks data, defines output schema', c: '#4285f4', logo: '/gemini.png' },
                  { k: 'Claude', v: 'Sentiment analysis, pattern detection, insight generation', c: '#cc785c', logo: '/claude.png' },
                  { k: 'Output', v: 'Structured JSON with confidence scores and recommendations', c: '#2d8a4e', logo: null },
                ].map(r => (
                  <div key={r.k} className="flex gap-3 items-start">
                    <span className="font-semibold w-16 flex-shrink-0 flex items-center gap-1.5" style={{ color: r.c }}>
                      {r.logo && <img src={r.logo} alt={r.k} className="w-4 h-4 object-contain" />}
                      {r.k}
                    </span>
                    <span className="text-[var(--ink-2)]">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ CODE ═══ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-[600px] mx-auto">
          <R className="text-center mb-10"><h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-[var(--ink)]">Any language. Any framework.</h2></R>
          <R d={0.1}>
            <div className="rounded-2xl overflow-hidden border border-black/[0.06]">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a]">
                <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></div>
                <span className="text-[11px] text-[#666] font-[var(--font)] ml-2">procyon.ts</span>
              </div>
              <pre className="bg-[#1a1a1a] p-6 text-[13px] leading-[1.85] overflow-x-auto font-[monospace] text-[#ccc]"><code>{`import { Procyon } from "@procyon-labs/sdk";

const client = new Procyon({ apiKey: "pk_live_..." });

const result = await client.orchestrate({
  pipeline: ["gemini:structure", "claude:reason"],
  input: "Analyze Q3 revenue trends",
  output: "json",
});

const voice = client.voice.connect({
  model: "procyon-voice-v2",
  onTranscript: (text) => console.log(text),
});`}</code></pre>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-white/40 border-y border-black/[0.04]">
        <div className="max-w-[960px] mx-auto">
          <R className="text-center mb-14">
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--ink-3)] mb-3">Pricing</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-[var(--ink)]">Start free. Scale precisely.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-4">
            {PRICING_TIERS.map((t, i) => (
              <R key={t.name} d={i * 0.06}>
                <motion.div className={`relative card p-8 flex flex-col h-full ${i === 1 ? 'ring-2 ring-[var(--ink)]' : ''}`}
                  whileHover={{ y: -3 }} transition={sp}>
                  {i === 1 && <span className="absolute -top-3 left-6 px-3 py-1 bg-[var(--ink)] text-white text-[10px] font-bold rounded-full tracking-wider uppercase">Recommended</span>}
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)] mb-4">{t.name}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[38px] font-bold text-[var(--ink)] leading-none tracking-tight">${t.price}</span>
                    <span className="text-[14px] text-[var(--ink-3)]">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">{t.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--ink-2)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d8a4e" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>{f}
                    </li>
                  ))}</ul>
                  <Link href="/login"><motion.span className={i === 1 ? 'btn-dark w-full justify-center' : 'btn-outline w-full justify-center'} whileHover={{ scale: 1.02 }}>
                    {t.price === 0 ? 'Get started' : 'Upgrade'}
                  </motion.span></Link>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 py-24 px-6">
        <R className="max-w-[420px] mx-auto text-center">
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-4">Ready to build?</h2>
          <p className="text-[16px] text-[var(--ink-2)] leading-relaxed mb-8">Create your first API in under a minute.</p>
          <Link href="/login"><motion.span className="btn-dark !text-[15px] !py-3.5 !px-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon →</motion.span></Link>
        </R>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-black/[0.05] py-14 px-6 bg-white/30">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-[17px] font-bold text-[var(--ink)] tracking-[-0.02em]">Procyon Labs</span>
              <p className="text-[12px] text-[var(--ink-3)] mt-2 leading-relaxed">Next-generation<br />AI infrastructure.</p>
            </div>
            {[
              { t: 'Platform', l: ['Procyon API', 'Procyon AI', 'Procyon Voice', 'Research'] },
              { t: 'Developers', l: ['Documentation', 'API Reference', 'SDKs', 'Status'] },
              { t: 'Company', l: ['About', 'Blog', 'Careers', 'Contact'] },
              { t: 'Legal', l: ['Privacy', 'Terms', 'Security', 'DPA'] },
            ].map(c => (
              <div key={c.t}>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)] mb-3">{c.t}</p>
                <ul className="space-y-2">{c.l.map(l => <li key={l}><motion.a href="#" className="text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors" whileHover={{ x: 2 }}>{l}</motion.a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-black/[0.05] gap-4">
            <p className="text-[12px] text-[var(--ink-3)]">© {new Date().getFullYear()} Procyon Labs</p>
            <div className="flex gap-5">{['Twitter', 'GitHub', 'Discord'].map(s => <motion.a key={s} href="#" className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors" whileHover={{ y: -1 }}>{s}</motion.a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
