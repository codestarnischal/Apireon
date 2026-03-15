'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

const sp = { type: 'spring' as const, stiffness: 260, damping: 25 };
const ease = [0.23, 1, 0.32, 1] as const;

function R({ children, d = 0, className = '' }: { children: React.ReactNode; d?: number; className?: string }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-80px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: d, ease }} className={className}>{children}</motion.div>;
}

// ═══════════════════════════════════════════════════
// DYNAMIC ATMOSPHERE — Living background layer
// ═══════════════════════════════════════════════════
function Atmosphere() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 60);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 60);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Neural filaments */}
      {[
        { x: '15%', y: '20%', w: 600, c: 'rgba(212,168,67,0.04)', dur: 22 },
        { x: '65%', y: '10%', w: 500, c: 'rgba(91,156,245,0.03)', dur: 28 },
        { x: '40%', y: '60%', w: 700, c: 'rgba(212,168,67,0.03)', dur: 25 },
        { x: '80%', y: '70%', w: 400, c: 'rgba(255,255,255,0.02)', dur: 20 },
      ].map((f, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{
          left: f.x, top: f.y, width: f.w, height: f.w,
          background: `radial-gradient(circle, ${f.c}, transparent 70%)`,
          filter: 'blur(60px)',
          x: smoothX, y: smoothY,
        }}
          animate={{ x: [0, 40, -30, 0], y: [0, -35, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
        />
      ))}
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// NEURAL PULSE — Generative morphing geometry
// ═══════════════════════════════════════════════════
function NeuralPulse() {
  const [paths, setPaths] = useState<string[]>([]);
  const frameRef = useRef(0);

  const generatePath = useCallback((t: number, layer: number) => {
    const points = 8;
    const baseR = 100 + layer * 20;
    const pts: string[] = [];
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise = Math.sin(t * 0.8 + i * 1.5 + layer) * 25 + Math.cos(t * 0.5 + i * 2.2) * 15;
      const r = baseR + noise;
      const x = 200 + Math.cos(angle) * r;
      const y = 200 + Math.sin(angle) * r;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ') + ' Z';
  }, []);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      const t = frameRef.current * 0.015;
      frameRef.current++;
      setPaths([generatePath(t, 0), generatePath(t + 1, 1), generatePath(t + 2, 2)]);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [generatePath]);

  return (
    <motion.div className="relative w-[320px] h-[320px]"
      animate={{ rotate: [0, 360] }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(212,168,67,0.3)" /><stop offset="100%" stopColor="rgba(212,168,67,0.05)" /></linearGradient>
          <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(91,156,245,0.15)" /><stop offset="100%" stopColor="rgba(91,156,245,0.03)" /></linearGradient>
          <linearGradient id="g3" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.06)" /><stop offset="100%" stopColor="rgba(255,255,255,0.01)" /></linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={`url(#g${i + 1})`} stroke={i === 0 ? 'rgba(212,168,67,0.2)' : i === 1 ? 'rgba(91,156,245,0.1)' : 'rgba(255,255,255,0.04)'}
            strokeWidth={i === 0 ? 1.5 : 0.5} filter={i === 0 ? 'url(#glow)' : undefined}
            style={{ transition: 'all 0.15s ease' }} />
        ))}
        {/* Center pulse */}
        <motion.circle cx="200" cy="200" r="4" fill="var(--gold)"
          animate={{ r: [3, 6, 3], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// VOICE VISUALIZER
// ═══════════════════════════════════════════════════
function VoiceViz() {
  return (
    <div className="flex items-end justify-center gap-[2.5px] h-14">
      {Array.from({ length: 36 }, (_, i) => {
        const center = Math.abs(i - 17.5) / 17.5;
        const maxH = 48 * (1 - center * 0.6);
        return (
          <motion.div key={i} className="w-[2.5px] rounded-full"
            style={{ background: `linear-gradient(to top, var(--gold), rgba(212,168,67,0.3))` }}
            animate={{ height: [4, maxH * (0.4 + Math.random() * 0.6), 6, maxH * (0.3 + Math.random() * 0.7), 4] }}
            transition={{ duration: 1.1 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }} />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ORCHESTRATION FLOW
// ═══════════════════════════════════════════════════
function Flow() {
  const nodes = [
    { l: 'Prompt', c: 'var(--text-3)' },
    { l: 'Gemini', c: 'var(--blue)' },
    { l: 'Claude', c: 'var(--gold)' },
    { l: 'Output', c: 'var(--green)' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-[520px] mx-auto">
      {nodes.map((n, i) => (
        <div key={n.l} className="flex items-center gap-2">
          <motion.div initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.15, ...sp }} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl border flex items-center justify-center"
              style={{ borderColor: `color-mix(in srgb, ${n.c} 30%, transparent)`, background: `color-mix(in srgb, ${n.c} 5%, transparent)` }}>
              <span className="text-[12px] font-bold font-[var(--font-display)] tracking-wide" style={{ color: n.c }}>{n.l.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-2)]">{n.l}</span>
          </motion.div>
          {i < 3 && (
            <motion.div className="w-6 h-px" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${n.c} 20%, transparent), color-mix(in srgb, ${nodes[i + 1].c} 20%, transparent))` }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.1, duration: 0.5, ease }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// FLUID NAV — Pure text expansion
// ═══════════════════════════════════════════════════
function Nav() {
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6, ease }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-white/[0.03]' : ''}`}>
      <div className="max-w-[1240px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Brand + text expansion */}
          <div className="relative" onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
            <motion.button className="flex items-baseline gap-2" whileHover={{ scale: 1.005 }}>
              <span className="text-[20px] font-[900] tracking-[-0.04em] text-white font-[var(--font-display)] uppercase">Procyon Labs</span>
              <motion.span className="text-[var(--text-3)] text-[11px]" animate={{ rotate: expanded ? 180 : 0 }} transition={sp}>▾</motion.span>
            </motion.button>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  className="absolute top-full left-0 mt-2 overflow-hidden">
                  <div className="py-2">
                    {['Research', 'AI', 'Voice', 'API'].map((item, i) => (
                      <motion.a key={item} href={`#${item.toLowerCase()}`}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 22 }}
                        className="block py-1.5 text-[14px] font-medium text-[var(--text-3)] hover:text-[var(--gold)] transition-colors whitespace-nowrap cursor-pointer">
                        Procyon {item}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {['Platform', 'Research', 'Pricing'].map(n => (
              <motion.a key={n} href={n === 'Pricing' ? '#pricing' : `#${n.toLowerCase()}`}
                className="text-[13px] font-medium text-[var(--text-3)] hover:text-white px-3 py-2 rounded-full hover:bg-white/[0.03] transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{n}</motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login"><motion.span className="text-[13px] font-medium text-[var(--text-3)] hover:text-white px-3 py-2 transition-colors cursor-pointer" whileHover={{ scale: 1.02 }}>Sign in</motion.span></Link>
          <Link href="/login"><motion.span className="btn-gold !text-[11px] !py-3 !px-6" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>Build with Procyon</motion.span></Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function Page() {
  const footerRef = useRef(null);
  const footerInView = useInView(footerRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll();
  const footerScale = useTransform(scrollYProgress, [0.85, 1], [0.95, 1]);
  const footerY = useTransform(scrollYProgress, [0.85, 1], [60, 0]);

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <Atmosphere />
      <Nav />

      {/* ═══ HERO: COMMAND CENTER ═══ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div className="text-center" initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease }}>
          <motion.p className="t-label mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            AI Research Infrastructure
          </motion.p>
          <h1 className="t-mega text-white mb-4">
            Build the<br />impossible
          </h1>
          <p className="t-body text-[17px] max-w-[420px] mx-auto mb-10">
            Advanced orchestration. Real-time voice. Managed infrastructure — for teams building what comes next.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/login"><motion.span className="btn-gold" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>Build with Procyon</motion.span></Link>
            <motion.a href="#platform" className="btn-ghost" whileHover={{ scale: 1.02 }}>Explore →</motion.a>
          </div>
        </motion.div>

        {/* Neural Pulse Visualizer */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1.2, ease }}>
          <NeuralPulse />
        </motion.div>

        {/* Voice interface below pulse */}
        <motion.div className="mt-8 w-full max-w-[500px]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7, ease }}>
          <div className="glass-strong p-6 flex flex-col items-center gap-5">
            <VoiceViz />
            <div className="flex items-center gap-3 w-full">
              <motion.button className="w-11 h-11 rounded-full bg-[var(--gold)] text-[var(--bg)] flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.08, boxShadow: '0 0 24px var(--gold-glow)' }} whileTap={{ scale: 0.9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </motion.button>
              <div className="flex-1 relative">
                <input type="text" placeholder="Or type a message..." className="input-dark w-full !rounded-full !py-3 !pl-5 !pr-12 !text-[14px]" />
                <motion.button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/[0.06] text-[var(--text-2)] flex items-center justify-center border border-white/[0.04]"
                  whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.button>
              </div>
            </div>
            <p className="t-xs">Speak to Procyon or type — switch modes anytime</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="relative z-10 border-y border-white/[0.03] mt-20">
        <div className="max-w-[1240px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: '<30s', l: 'Deploy time' }, { v: '99.99%', l: 'Uptime' }, { v: '12ms', l: 'P50 latency' }, { v: '50k+', l: 'APIs live' }].map((m, i) => (
            <R key={m.l} d={i * 0.08} className="text-center">
              <div className="t-h1 text-white">{m.v}</div>
              <div className="t-label text-[var(--text-3)] mt-2">{m.l}</div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ PLATFORM ═══ */}
      <section id="platform" className="relative z-10 py-28 px-6">
        <div className="max-w-[1240px] mx-auto">
          <R className="max-w-[500px] mb-16">
            <p className="t-label mb-4">Platform</p>
            <h2 className="t-h1 text-white mb-4">Four systems.<br />One infrastructure.</h2>
            <p className="t-body">Each pillar operates independently — or composes into a unified AI stack.</p>
          </R>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { tag: 'API', title: 'Procyon API', desc: 'High-performance REST gateways from natural language. Full CRUD, validation, auto-docs, and managed PostgreSQL.', feats: ['Schema generation from text', 'Type validation per request', 'Auto-generated documentation', 'Managed PostgreSQL'], color: 'var(--blue)' },
              { tag: 'AI', title: 'Procyon AI', desc: 'Multi-model orchestration: Gemini structures prompts, Claude performs deep reasoning, specialized models generate final output.', feats: ['Gemini → Claude → Output', 'Context-aware model routing', 'Streaming & batch modes', 'Custom composition'], color: 'var(--gold)' },
              { tag: 'Voice', title: 'Procyon Voice', desc: 'Real-time conversational interface with audio processing, transcription, synthesis, and seamless voice/text switching.', feats: ['Real-time voice interaction', 'Voice ↔ text switching', 'Neural audio visualizer', 'Sub-200ms latency'], color: 'var(--green)' },
              { tag: 'Research', title: 'Procyon Research', desc: 'Experimental model deployments, research papers, benchmark tools, and infrastructure for pushing the frontier.', feats: ['Paper repository', 'Experimental model access', 'Benchmark dashboards', 'Collaboration tools'], color: 'var(--text-3)' },
            ].map((card, i) => (
              <R key={card.tag} d={i * 0.08}>
                <motion.div className="glass-hover p-8 h-full" whileHover={{ scale: 1.003 }} transition={sp}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-[900] font-[var(--font-display)] tracking-widest"
                      style={{ background: `color-mix(in srgb, ${card.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${card.color} 15%, transparent)`, color: card.color }}>
                      {card.tag.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="t-h3 text-white">{card.title}</h3>
                  </div>
                  <p className="t-sm mb-5">{card.desc}</p>
                  <ul className="space-y-2">{card.feats.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--text-2)]">
                      <span className="w-1 h-1 rounded-full" style={{ background: card.color }} /> {f}
                    </li>
                  ))}</ul>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ORCHESTRATION ═══ */}
      <section id="ai" className="relative z-10 py-28 px-6 border-y border-white/[0.03]">
        <div className="max-w-[700px] mx-auto text-center">
          <R><p className="t-label mb-4">Orchestration</p><h2 className="t-h1 text-white mb-4">Deep reasoning, visualized.</h2><p className="t-body mb-14">Watch how Procyon chains models into an intelligent pipeline.</p></R>
          <R d={0.12}><Flow /></R>
          <R d={0.2} className="mt-12">
            <div className="glass p-6 text-left">
              <p className="t-label mb-3">Live Example</p>
              <div className="space-y-3 text-[13px]">
                {[
                  { k: 'Input', v: '"Analyze 500 reviews and create a strategy report"', c: 'var(--text-3)' },
                  { k: 'Gemini', v: 'Structures prompt, defines schema, chunks data', c: 'var(--blue)' },
                  { k: 'Claude', v: 'Sentiment analysis, pattern detection, insights', c: 'var(--gold)' },
                  { k: 'Output', v: 'Structured JSON with scores and recommendations', c: 'var(--green)' },
                ].map(r => (
                  <div key={r.k} className="flex gap-3 items-start">
                    <span className="t-mono w-14 flex-shrink-0 font-medium" style={{ color: r.c }}>{r.k}</span>
                    <span className="text-[var(--text-2)]">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ CODE ═══ */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-[640px] mx-auto">
          <R className="text-center mb-10"><h2 className="t-h1 text-white">Any language. Any framework.</h2></R>
          <R d={0.1}>
            <div className="glass overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
                <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[var(--red)]" /><div className="h-2.5 w-2.5 rounded-full bg-[var(--gold)]" /><div className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" /></div>
                <span className="t-mono text-[var(--text-3)] ml-2 text-[11px]">procyon.ts</span>
              </div>
              <pre className="p-6 text-[13px] leading-[1.9] overflow-x-auto font-[var(--font-mono)] text-[var(--text-2)]"><code>{`import { Procyon } from "@procyon-labs/sdk";

const client = new Procyon({ apiKey: "pk_live_..." });

const result = await client.orchestrate({
  pipeline: ["gemini:structure", "claude:reason"],
  input: "Analyze Q3 revenue and optimize pricing",
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

      {/* ═══ PRICING — Glassmorphism ═══ */}
      <section id="pricing" className="relative z-10 py-28 px-6 border-y border-white/[0.03]">
        <div className="max-w-[1040px] mx-auto">
          <R className="text-center mb-16">
            <p className="t-label mb-4">Access</p>
            <h2 className="t-h1 text-white">Research-grade infrastructure.<br />Transparent pricing.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING_TIERS.map((t, i) => (
              <R key={t.name} d={i * 0.08}>
                <motion.div className={`relative h-full flex flex-col p-8 ${i === 1 ? 'glass-strong ring-1 ring-[var(--gold)]/30' : 'glass'}`}
                  whileHover={{ y: -4, scale: 1.01 }} transition={sp}>
                  {i === 1 && <span className="absolute -top-3 left-6 px-4 py-1 bg-[var(--gold)] text-[var(--bg)] text-[9px] font-[800] font-[var(--font-display)] rounded-full tracking-[0.15em] uppercase">Recommended</span>}
                  <p className="t-label text-[var(--text-3)] mb-4">{t.name}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-[42px] font-[900] text-white leading-none tracking-[-0.03em] font-[var(--font-display)]">${t.price}</span>
                    <span className="text-[13px] text-[var(--text-3)]">/mo</span>
                  </div>
                  <ul className="space-y-3.5 mb-10 flex-1">{t.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--text-2)]">
                      <span className="text-[var(--gold)] mt-0.5">›</span> {f}
                    </li>
                  ))}</ul>
                  <Link href="/login"><motion.span className={i === 1 ? 'btn-gold w-full justify-center !text-[11px]' : 'btn-ghost w-full justify-center !text-[11px]'}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>{t.price === 0 ? 'Get started' : 'Upgrade'}</motion.span></Link>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GRAVITY-DEFYING FOOTER ═══ */}
      <motion.footer ref={footerRef} className="relative z-10 overflow-hidden"
        style={{ scale: footerScale, y: footerY }}>
        {/* Star field */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 80 }, (_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: Math.random() > 0.9 ? 2 : 1, height: Math.random() > 0.9 ? 2 : 1 }}
              animate={{ opacity: [0.1, 0.5 + Math.random() * 0.5, 0.1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }} />
          ))}
          {/* Procyon star — bright center */}
          <motion.div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--gold)]"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6], boxShadow: ['0 0 20px var(--gold-glow)', '0 0 60px var(--gold-glow)', '0 0 20px var(--gold-glow)'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative z-10 pt-32 pb-16 px-6 border-t border-white/[0.03]">
          {/* Final CTA */}
          <motion.div className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }} animate={footerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease }}>
            <h2 className="t-mega text-white text-[clamp(2rem,5vw,3.5rem)] mb-5">Build with<br />Procyon</h2>
            <p className="t-body mb-8 max-w-[360px] mx-auto">Join thousands of developers pushing the frontier of AI.</p>
            <Link href="/login"><motion.span className="btn-gold !text-[12px] !py-4 !px-10" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>Get started free →</motion.span></Link>
          </motion.div>

          {/* Links */}
          <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2 md:col-span-1">
              <span className="text-[16px] font-[900] text-white tracking-[-0.03em] font-[var(--font-display)] uppercase">Procyon Labs</span>
              <p className="text-[11px] text-[var(--text-3)] mt-2 leading-relaxed">Next-generation<br />AI infrastructure.</p>
            </div>
            {[
              { t: 'Platform', l: ['Procyon API', 'Procyon AI', 'Procyon Voice', 'Research'] },
              { t: 'Developers', l: ['Documentation', 'API Reference', 'SDKs', 'Status'] },
              { t: 'Company', l: ['About', 'Blog', 'Careers', 'Contact'] },
              { t: 'Legal', l: ['Privacy', 'Terms', 'Security', 'DPA'] },
            ].map(c => (
              <div key={c.t}>
                <p className="t-label text-[var(--text-3)] mb-3 text-[9px]">{c.t}</p>
                <ul className="space-y-2">{c.l.map(l => <li key={l}><motion.a href="#" className="text-[13px] text-[var(--text-3)] hover:text-[var(--gold)] transition-colors" whileHover={{ x: 3 }}>{l}</motion.a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.03] gap-4">
            <p className="text-[11px] text-[var(--text-3)]">© {new Date().getFullYear()} Procyon Labs. All rights reserved.</p>
            <div className="flex gap-5">{['Twitter', 'GitHub', 'Discord'].map(s => <motion.a key={s} href="#" className="text-[11px] text-[var(--text-3)] hover:text-[var(--gold)] transition-colors" whileHover={{ y: -2 }}>{s}</motion.a>)}</div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
