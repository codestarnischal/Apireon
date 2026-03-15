'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };
const springGentle = { type: 'spring' as const, stiffness: 180, damping: 22 };
const ease = [0.23, 1, 0.32, 1] as const;

// ═══════════════════════════════════════════════
// REVEAL ON SCROLL
// ═══════════════════════════════════════════════
function R({ children, d = 0, className = '' }: { children: React.ReactNode; d?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: d, ease }} className={className}>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// LIVING NEURAL BACKGROUND
// ═══════════════════════════════════════════════
function NeuralField() {
  const orbs = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    y: 10 + Math.random() * 80,
    size: 200 + Math.random() * 400,
    color: i % 2 === 0 ? 'rgba(124,106,239,0.08)' : 'rgba(62,207,255,0.05)',
    dur: 15 + Math.random() * 10,
    delay: i * 2,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08080a]/50 to-[#08080a]" style={{ top: '60%' }} />
      {/* Floating orbs */}
      {orbs.map(o => (
        <motion.div key={o.id} className="absolute rounded-full"
          style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.size, height: o.size, background: o.color, filter: 'blur(80px)' }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.15, 0.9, 1], opacity: [0.5, 0.8, 0.4, 0.5] }}
          transition={{ duration: o.dur, repeat: Infinity, delay: o.delay, ease: 'easeInOut' }} />
      ))}
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// VOICE VISUALIZER — Audio waveform bars
// ═══════════════════════════════════════════════
function VoiceVisualizer() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-16">
      {Array.from({ length: 32 }, (_, i) => (
        <motion.div key={i} className="w-[3px] rounded-full"
          style={{ background: `linear-gradient(to top, var(--accent), var(--accent-2))` }}
          animate={{ height: [8, 20 + Math.random() * 40, 12, 30 + Math.random() * 30, 8] }}
          transition={{ duration: 1.2 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ORCHESTRATION FLOW — Visual pipeline
// ═══════════════════════════════════════════════
function OrchestrationFlow() {
  const nodes = [
    { label: 'Prompt', sub: 'Natural language input', color: 'var(--text-3)' },
    { label: 'Gemini', sub: 'Prompt engineering', color: '#4285f4' },
    { label: 'Claude', sub: 'Deep reasoning', color: '#cc785c' },
    { label: 'Output', sub: 'Structured response', color: 'var(--green)' },
  ];
  return (
    <div className="flex items-center justify-between gap-2 w-full max-w-[560px] mx-auto">
      {nodes.map((n, i) => (
        <div key={n.label} className="flex items-center gap-2">
          <motion.div className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.15, ...springGentle }}>
            <div className="w-14 h-14 rounded-2xl border flex items-center justify-center text-[11px] font-bold font-[var(--font-display)]"
              style={{ borderColor: n.color, color: n.color, background: `${n.color}10` }}>
              {n.label.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-[var(--text)]">{n.label}</p>
              <p className="text-[10px] text-[var(--text-3)]">{n.sub}</p>
            </div>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div className="flex-1 h-px min-w-[24px]" style={{ background: `linear-gradient(90deg, ${n.color}40, ${nodes[i + 1].color}40)` }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.1, duration: 0.6, ease }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// FLUID NAVIGATION
// ═══════════════════════════════════════════════
function FluidNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const subItems = [
    { label: 'Procyon API', desc: 'High-performance developer gateways', tag: 'api' },
    { label: 'Procyon AI', desc: 'Multi-model orchestration engine', tag: 'ai' },
    { label: 'Procyon Voice', desc: 'Real-time conversational interface', tag: 'voice' },
    { label: 'Procyon Research', desc: 'Whitepapers & experimental models', tag: 'research' },
  ];

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6, ease }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#08080a]/70 backdrop-blur-2xl border-b border-white/[0.04]' : ''}`}>
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Fluid Brand Dropdown */}
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <motion.button className="flex items-center gap-2 group" whileHover={{ scale: 1.01 }}>
              <span className="text-[17px] font-bold tracking-[-0.04em] text-white font-[var(--font-display)]">Procyon Labs</span>
              <motion.svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                className="text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors"
                animate={{ rotate: open ? 180 : 0 }} transition={springGentle}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 4, scale: 0.97, filter: 'blur(2px)' }}
                  transition={springGentle}
                  className="absolute top-full left-0 mt-3 w-[300px] bg-[var(--bg-2)] rounded-2xl border border-white/[0.06] p-2 shadow-2xl shadow-black/50">
                  {subItems.map((item, i) => (
                    <motion.a key={item.tag} href={`#${item.tag}`}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, ...springGentle }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] font-[var(--font-display)] group-hover:bg-[var(--accent)]/20 transition-colors">
                        {item.tag.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white group-hover:text-[var(--accent)] transition-colors">{item.label}</p>
                        <p className="text-[11px] text-[var(--text-3)]">{item.desc}</p>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[{ l: 'Platform', h: '#api' }, { l: 'Research', h: '#research' }, { l: 'Pricing', h: '#pricing' }].map(n => (
              <motion.a key={n.l} href={n.h} className="text-[13px] font-medium text-[var(--text-2)] hover:text-white px-3 py-2 rounded-full hover:bg-white/[0.04] transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{n.l}</motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login"><motion.span className="text-[13px] font-medium text-[var(--text-2)] hover:text-white px-3 py-2 transition-colors cursor-pointer" whileHover={{ scale: 1.02 }}>Sign in</motion.span></Link>
          <Link href="/login"><motion.span className="btn-glow !text-[13px] !py-2.5 !px-6" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════
// PLATFORM CARD
// ═══════════════════════════════════════════════
function PlatformCard({ tag, title, desc, features, color, delay = 0 }: any) {
  return (
    <R d={delay}>
      <motion.div className="sf-interactive p-8 h-full" whileHover={{ scale: 1.005 }} transition={spring}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold font-[var(--font-display)]"
            style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
            {tag.toUpperCase()}
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white font-[var(--font-display)]">{title}</h3>
          </div>
        </div>
        <p className="t-body-sm mb-5">{desc}</p>
        <ul className="space-y-2">
          {features.map((f: string) => (
            <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--text-2)]">
              <span style={{ color }} className="text-[14px]">›</span> {f}
            </li>
          ))}
        </ul>
      </motion.div>
    </R>
  );
}

// ═══════════════════════════════════════════════
// MAGIC INPUT
// ═══════════════════════════════════════════════
function MagicInput() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const phs = ['A bookstore API with authors, books, and reviews...', 'An IoT dashboard with devices and sensor readings...', 'A social platform with users, posts, and comments...'];
  const [phi, setPhi] = useState(0);
  useEffect(() => { const i = setInterval(() => setPhi(p => (p + 1) % phs.length), 4500); return () => clearInterval(i); }, []);

  const gen = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true); setResult(null);
    await new Promise(r => setTimeout(r, 2200));
    const l = prompt.toLowerCase();
    if (l.includes('book')) setResult({ name: 'Bookstore API', res: { books: { title: 'string', isbn: 'string', price: 'number', author_id: 'uuid' }, authors: { name: 'string', bio: 'string', email: 'email' } } });
    else setResult({ name: 'Custom API', res: { items: { name: 'string', description: 'string', value: 'number', active: 'boolean' } } });
    setGenerating(false);
  };

  return (
    <div className="w-full max-w-[600px]">
      <div className="sf-elevated p-1.5">
        <div className="relative">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={phs[phi]} rows={2}
            className="w-full resize-none bg-transparent px-5 py-4 pr-36 text-[15px] text-white placeholder:text-[var(--text-3)] focus:outline-none leading-relaxed font-[var(--font-body)]"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gen(); } }} />
          <motion.button onClick={gen} disabled={!prompt.trim() || generating}
            className="absolute right-2.5 bottom-2.5 btn-glow !text-[13px] !py-2.5 !px-5 disabled:opacity-20 disabled:cursor-not-allowed"
            whileHover={{ scale: generating ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}>
            {generating ? <><motion.div className="h-3.5 w-3.5 border-[2px] border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> Building...</> : 'Generate →'}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }} className="mt-4 sf-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-white font-[var(--font-display)]">{result.name}</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--green)]/10 text-[var(--green)]">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Live
              </span>
            </div>
            {Object.entries(result.res).map(([r, f]: any) => (
              <div key={r} className="mb-2 last:mb-0 rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="m m-get">GET</span><span className="m m-post">POST</span><span className="m m-put">PUT</span><span className="m m-del">DEL</span>
                  <code className="text-[13px] font-semibold text-white ml-1 t-mono">/{r}</code>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(f).map(([k, v]: any) => (
                    <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] border border-white/[0.04]">
                      <span className="t-mono font-medium text-white">{k}</span><span className="text-[var(--text-3)]">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 mt-4">
              <Link href="/login"><motion.span className="btn-glow !text-[12px] !py-2 !px-5" whileHover={{ scale: 1.03 }}>Open Dashboard</motion.span></Link>
              <motion.button className="btn-ghost-light !text-[12px] !py-2 !px-4" whileHover={{ scale: 1.03 }}>Docs</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════
export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <FluidNav />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <NeuralField />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-28 pb-20 w-full">
          <motion.div className="max-w-[640px]" initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease }}>
            <motion.p className="t-label text-[var(--accent)] mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              Next-Generation AI Infrastructure
            </motion.p>
            <h1 className="t-display text-white mb-7">
              Build the<br />impossible.
            </h1>
            <p className="t-body text-[18px] max-w-[460px] mb-10">
              Procyon Labs is an elite AI research platform — advanced orchestration, real-time voice, and managed infrastructure for teams pushing boundaries.
            </p>
            <div className="flex items-center gap-4 mb-10">
              <Link href="/login"><motion.span className="btn-glow !text-[15px] !py-3.5 !px-8" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
              <motion.a href="#api" className="btn-ghost-light !text-[14px]" whileHover={{ scale: 1.02 }}>Explore platform →</motion.a>
            </div>
            <MagicInput />
          </motion.div>
        </div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: '<30s', l: 'Deploy time' }, { v: '99.99%', l: 'Uptime' }, { v: '12ms', l: 'P50 latency' }, { v: '50k+', l: 'APIs deployed' }].map((m, i) => (
            <R key={m.l} d={i * 0.08} className="text-center">
              <div className="t-h2 text-white">{m.v}</div>
              <div className="t-label mt-2">{m.l}</div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ PLATFORM SECTIONS ═══ */}
      <section id="api" className="py-28 px-6">
        <div className="max-w-[1280px] mx-auto">
          <R className="max-w-[560px] mb-14">
            <p className="t-label text-[var(--accent)] mb-3">Platform</p>
            <h2 className="t-h1 text-white mb-4">Modular by design.<br />Powerful by default.</h2>
            <p className="t-body">Four integrated systems that work independently or as a unified stack.</p>
          </R>
          <div className="grid md:grid-cols-2 gap-5">
            <PlatformCard tag="AP" title="Procyon API" desc="High-performance REST gateways generated from natural language. Full CRUD, validation, docs, and managed PostgreSQL — deployed in seconds."
              features={['Schema generation from text', 'Type validation per request', 'Auto-generated Swagger docs', 'Rate limiting & usage tracking']} color="var(--accent)" delay={0} />
            <PlatformCard tag="AI" title="Procyon AI" desc="Multi-model orchestration where Gemini handles prompt engineering, Claude performs deep reasoning, and specialized models generate final outputs."
              features={['Gemini → Claude → Output pipeline', 'Context-aware routing', 'Streaming & batch modes', 'Custom model composition']} color="var(--accent-2)" delay={0.08} />
            <PlatformCard tag="VO" title="Procyon Voice" desc="State-of-the-art conversational voice interface with real-time audio processing, voice-to-text, text-to-voice, and seamless mode switching."
              features={['Real-time voice interaction', 'Voice ↔ text mode switching', 'Audio visualizer interface', 'Low-latency streaming']} color="var(--green)" delay={0.16} />
            <PlatformCard tag="RE" title="Procyon Research" desc="Dedicated spaces for experimental model deployments, research papers, and cutting-edge AI infrastructure tooling for advanced use cases."
              features={['Research paper repository', 'Experimental model access', 'Benchmark dashboards', 'Collaboration tools']} color="var(--yellow)" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ═══ AI ORCHESTRATION ═══ */}
      <section id="ai" className="py-28 px-6 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-[800px] mx-auto text-center">
          <R>
            <p className="t-label text-[var(--accent-2)] mb-3">Orchestration</p>
            <h2 className="t-h1 text-white mb-4">Deep reasoning in action.</h2>
            <p className="t-body mb-12">See how Procyon AI chains multiple models into a single, intelligent pipeline — each handling what it does best.</p>
          </R>
          <R d={0.15}><OrchestrationFlow /></R>
          <R d={0.25} className="mt-12">
            <div className="sf p-6 text-left">
              <p className="t-label text-[var(--accent)] mb-2">Example Flow</p>
              <div className="space-y-3 text-[13px]">
                <div className="flex gap-3"><span className="t-mono text-[var(--text-3)] w-12 flex-shrink-0">Input</span><span className="text-[var(--text)]">"Analyze customer sentiment from these 500 reviews and generate a strategy report"</span></div>
                <div className="flex gap-3"><span className="t-mono text-[#4285f4] w-12 flex-shrink-0">Gemini</span><span className="text-[var(--text-2)]">Structures the prompt, chunks data, defines output schema</span></div>
                <div className="flex gap-3"><span className="t-mono text-[#cc785c] w-12 flex-shrink-0">Claude</span><span className="text-[var(--text-2)]">Performs sentiment analysis, identifies patterns, generates insights</span></div>
                <div className="flex gap-3"><span className="t-mono text-[var(--green)] w-12 flex-shrink-0">Output</span><span className="text-[var(--text-2)]">Structured JSON report with confidence scores and actionable recommendations</span></div>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ VOICE ═══ */}
      <section id="voice" className="py-28 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <R>
            <p className="t-label text-[var(--green)] mb-3">Procyon Voice</p>
            <h2 className="t-h1 text-white mb-4">Speak. Listen. Build.</h2>
            <p className="t-body mb-12">A real-time voice interface that understands context, streams responses, and lets you switch between voice and text seamlessly.</p>
          </R>
          <R d={0.12}>
            <div className="sf-elevated p-8">
              <VoiceVisualizer />
              <p className="t-body-sm mt-5 text-center italic">&ldquo;Create an API for a restaurant with menus and reviews&rdquo;</p>
              <div className="flex justify-center gap-3 mt-6">
                <motion.button className="btn-glow !rounded-full !w-14 !h-14 !p-0 flex items-center justify-center" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </motion.button>
                <motion.button className="btn-ghost-light !rounded-full !w-14 !h-14 !p-0 flex items-center justify-center" whileHover={{ scale: 1.08 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
              </div>
              <p className="text-[11px] text-[var(--text-3)] mt-3">Press mic to speak · Switch to text anytime</p>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ CODE ═══ */}
      <section className="py-28 px-6 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-[680px] mx-auto">
          <R className="text-center mb-10"><h2 className="t-h1 text-white">Universal compatibility.</h2></R>
          <R d={0.1}>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
              <div className="flex items-center gap-2.5 px-5 py-3 bg-[var(--bg-2)] border-b border-white/[0.04]">
                <div className="flex gap-1.5"><div className="h-[9px] w-[9px] rounded-full bg-[var(--red)]" /><div className="h-[9px] w-[9px] rounded-full bg-[var(--yellow)]" /><div className="h-[9px] w-[9px] rounded-full bg-[var(--green)]" /></div>
                <span className="t-mono text-[var(--text-3)] ml-2">orchestrate.ts</span>
              </div>
              <pre className="bg-[var(--bg-2)] p-6 text-[13px] leading-[1.8] overflow-x-auto font-[var(--font-mono)] text-[var(--text-2)]"><code>{`import { Procyon } from "@procyon-labs/sdk";

const procyon = new Procyon({ apiKey: "pk_live_..." });

// Multi-model orchestration
const result = await procyon.orchestrate({
  pipeline: ["gemini:structure", "claude:reason"],
  input: "Analyze Q3 revenue trends and suggest optimizations",
  output: "json",
});

// Voice-enabled interaction
const voice = procyon.voice.connect({
  model: "procyon-voice-v2",
  onTranscript: (text) => console.log(text),
});`}</code></pre>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-[1040px] mx-auto">
          <R className="text-center mb-14">
            <p className="t-label text-[var(--accent)] mb-3">Pricing</p>
            <h2 className="t-h1 text-white">Start free. Scale precisely.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING_TIERS.map((t, i) => (
              <R key={t.name} d={i * 0.08}>
                <motion.div className={`relative sf p-8 flex flex-col h-full ${i === 1 ? 'ring-1 ring-[var(--accent)]' : ''}`}
                  whileHover={{ y: -3 }} transition={spring}>
                  {i === 1 && <span className="absolute -top-3 left-6 px-3 py-1 bg-[var(--accent)] text-white text-[10px] font-bold font-[var(--font-display)] rounded-full tracking-wider uppercase">Recommended</span>}
                  <p className="t-label mb-4">{t.name}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[38px] font-bold text-white leading-none tracking-tight font-[var(--font-display)]">${t.price}</span>
                    <span className="text-[14px] text-[var(--text-3)]">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--text-2)]">
                        <span className="text-[var(--green)] mt-0.5 flex-shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login"><motion.span className={i === 1 ? 'btn-glow w-full justify-center' : 'btn-ghost-light w-full justify-center'} whileHover={{ scale: 1.02 }}>
                    {t.price === 0 ? 'Get started' : 'Upgrade'}
                  </motion.span></Link>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 px-6">
        <R className="max-w-[480px] mx-auto text-center">
          <h2 className="t-h1 text-white mb-4">Ready to build the impossible?</h2>
          <p className="t-body mb-8">Join thousands of developers building with Procyon.</p>
          <Link href="/login"><motion.span className="btn-glow !text-[15px] !py-4 !px-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon →</motion.span></Link>
        </R>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.04] py-14 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-[17px] font-bold text-white tracking-[-0.03em] font-[var(--font-display)]">Procyon Labs</span>
              <p className="text-[12px] text-[var(--text-3)] mt-2 leading-relaxed">Next-generation<br />AI infrastructure.</p>
            </div>
            {[
              { t: 'Platform', l: ['Procyon API', 'Procyon AI', 'Procyon Voice', 'Research'] },
              { t: 'Developers', l: ['Documentation', 'API Reference', 'SDKs', 'Status'] },
              { t: 'Company', l: ['About', 'Blog', 'Careers', 'Contact'] },
              { t: 'Legal', l: ['Privacy', 'Terms', 'Security', 'DPA'] },
            ].map(c => (
              <div key={c.t}>
                <p className="t-label mb-3">{c.t}</p>
                <ul className="space-y-2">{c.l.map(l => <li key={l}><motion.a href="#" className="text-[13px] text-[var(--text-2)] hover:text-white transition-colors" whileHover={{ x: 2 }}>{l}</motion.a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.04] gap-4">
            <p className="text-[12px] text-[var(--text-3)]">© {new Date().getFullYear()} Procyon Labs. All rights reserved.</p>
            <div className="flex gap-5">{['Twitter', 'GitHub', 'Discord'].map(s => <motion.a key={s} href="#" className="text-[12px] text-[var(--text-3)] hover:text-white transition-colors" whileHover={{ y: -1 }}>{s}</motion.a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
