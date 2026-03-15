'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const ease = [0.23, 1, 0.32, 1] as const;

function R({ children, d = 0, className = '' }: { children: React.ReactNode; d?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: d, ease }} className={className}>{children}</motion.div>;
}

// ═══════════════════════════════════════
// IRIDESCENT ORB — CSS-only 3D sphere
// ═══════════════════════════════════════
function IridescentOrb({ size = 320 }: { size?: number }) {
  return (
    <motion.div
      className="relative rounded-full"
      style={{ width: size, height: size }}
      animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Base sphere */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 35% 30%, #b8f0e8, #7dd4c8 25%, #4db8a8 40%, #3a9e8f 55%, #2d857a 70%, #1e6b63 85%)',
        boxShadow: '0 20px 60px rgba(77, 184, 168, 0.25), inset -20px -20px 40px rgba(30, 107, 99, 0.3), inset 20px 20px 40px rgba(184, 240, 232, 0.4)',
      }} />
      {/* Highlight */}
      <div className="absolute rounded-full" style={{
        top: '8%', left: '15%', width: '55%', height: '45%',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.7), rgba(200,245,238,0.3) 50%, transparent 70%)',
        filter: 'blur(3px)',
      }} />
      {/* Color shift overlay */}
      <motion.div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 60% 60%, rgba(100,180,255,0.15), rgba(180,140,255,0.08) 40%, transparent 70%)',
      }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rim light */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
      }} />
    </motion.div>
  );
}

// ═══════════════════════════════════════
// VOICE VISUALIZER BARS
// ═══════════════════════════════════════
function VoiceBars({ count = 28 }: { count?: number }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-12">
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} className="w-[3px] rounded-full bg-[var(--ink)]"
          animate={{ height: [6, 14 + Math.random() * 28, 8, 18 + Math.random() * 20, 6] }}
          transition={{ duration: 1.3 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
          style={{ opacity: 0.25 + Math.random() * 0.35 }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// ORCHESTRATION PIPELINE
// ═══════════════════════════════════════
function Pipeline() {
  const nodes = [
    { label: 'Input', color: 'var(--ink-3)' },
    { label: 'Gemini', color: 'var(--blue)' },
    { label: 'Claude', color: 'var(--orange)' },
    { label: 'Output', color: 'var(--green)' },
  ];
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-[500px] mx-auto">
      {nodes.map((n, i) => (
        <div key={n.label} className="flex items-center gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.12, ...spring }}
            className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl border-[1.5px] flex items-center justify-center text-[11px] font-bold"
              style={{ borderColor: n.color, color: n.color, background: `color-mix(in srgb, ${n.color} 8%, transparent)` }}>
              {n.label.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold text-[var(--ink-2)]">{n.label}</span>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div className="w-8 h-px flex-shrink-0" style={{ background: `linear-gradient(90deg, ${n.color}30, ${nodes[i + 1].color}30)` }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.12 + 0.08, duration: 0.5, ease }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// NAVIGATION — ElevenLabs style
// ═══════════════════════════════════════
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const subs = [
    { label: 'Procyon API', desc: 'High-performance REST gateways', dot: 'var(--blue)' },
    { label: 'Procyon AI', desc: 'Multi-model orchestration', dot: 'var(--violet)' },
    { label: 'Procyon Voice', desc: 'Conversational voice interface', dot: 'var(--green)' },
    { label: 'Procyon Research', desc: 'Whitepapers & experiments', dot: 'var(--orange)' },
  ];

  return (
    <motion.nav initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--cream)]/80 backdrop-blur-2xl border-b border-black/[0.04]' : ''}`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Brand + Fluid Dropdown */}
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <motion.button className="flex items-center gap-1.5 group" whileHover={{ scale: 1.01 }}>
              <span className="text-[19px] font-bold tracking-[-0.03em] text-[var(--ink)]">Procyon Labs</span>
              <motion.svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="3"
                animate={{ rotate: open ? 180 : 0 }} transition={spring}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="absolute top-full left-0 mt-3 w-[280px] bg-white rounded-2xl border border-black/[0.06] p-2 shadow-xl shadow-black/[0.06]">
                  {subs.map((s, i) => (
                    <motion.a key={s.label} href="#" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 22 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--cream)] transition-colors group cursor-pointer">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors">{s.label}</p>
                        <p className="text-[11px] text-[var(--ink-3)]">{s.desc}</p>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pill tabs like ElevenLabs */}
          <div className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 border border-black/[0.06]">
            {[
              { label: 'ProcyonAI', dot: 'var(--violet)', href: '#ai' },
              { label: 'ProcyonVoice', dot: 'var(--green)', href: '#voice' },
            ].map(tab => (
              <motion.a key={tab.label} href={tab.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--cream)] transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span className="w-2 h-2 rounded-full" style={{ background: tab.dot }} />
                {tab.label}
              </motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <motion.span className="btn-light !text-[13px] !py-2.5 !px-5 !border-black/[0.08]" whileHover={{ scale: 1.02 }}>Contact sales</motion.span>
          </Link>
          <Link href="/login">
            <motion.span className="btn-dark !text-[13px] !py-2.5 !px-5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Sign up</motion.span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ═══════════════════════════════════════
// VOICE INTERFACE — ElevenLabs style
// ═══════════════════════════════════════
function VoiceInterface() {
  return (
    <div className="flex flex-col items-center gap-8">
      <IridescentOrb size={280} />
      <div className="flex items-center gap-3 w-full max-w-[480px]">
        {/* Phone / mic button */}
        <motion.button className="w-12 h-12 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[var(--ink)] shadow-sm flex-shrink-0"
          whileHover={{ scale: 1.06, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} whileTap={{ scale: 0.94 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
        </motion.button>
        {/* Text input */}
        <div className="flex-1 relative">
          <input type="text" placeholder="Or type a message..." className="input-warm w-full !pr-12" />
          <motion.button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--ink)] text-white flex items-center justify-center"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PLATFORM CARD
// ═══════════════════════════════════════
function PlatformCard({ title, desc, features, dot, delay = 0 }: any) {
  return (
    <R d={delay}>
      <motion.div className="card-hover p-7 h-full" whileHover={{ scale: 1.003 }} transition={spring}>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
          <h3 className="text-[16px] font-bold text-[var(--ink)]">{title}</h3>
        </div>
        <p className="t-sm mb-5">{desc}</p>
        <ul className="space-y-2">{features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {f}
          </li>
        ))}</ul>
      </motion.div>
    </R>
  );
}

// ═══════════════════════════════════════
// PAGE
// ═══════════════════════════════════════
export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Nav />

      {/* ═══ HERO ═══ */}
      <section className="pt-28 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div className="text-center max-w-[620px] mx-auto mb-16"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}>
            <motion.p className="t-label text-[var(--violet)] mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Next-Generation AI Infrastructure
            </motion.p>
            <h1 className="t-hero text-[var(--ink)] mb-5">
              Bringing<br />technology to life
            </h1>
            <p className="t-body max-w-[440px] mx-auto mb-8">
              Powering the best enterprises, creators, and developers — from AI orchestration to real-time voice, Procyon Labs is the infrastructure for what comes next.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/login"><motion.span className="btn-dark" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon</motion.span></Link>
              <motion.a href="#platform" className="btn-light" whileHover={{ scale: 1.02 }}>Contact sales</motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VOICE HERO — ElevenLabs style ═══ */}
      <section id="voice" className="pb-24 px-6">
        <div className="max-w-[600px] mx-auto">
          <R>
            {/* Pill tabs */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {[
                { label: 'ProcyonAI', dot: 'var(--violet)', active: false },
                { label: 'ProcyonVoice', dot: 'var(--green)', active: true },
              ].map(tab => (
                <motion.button key={tab.label}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium border transition-all
                    ${tab.active ? 'bg-white border-black/[0.08] text-[var(--ink)] shadow-sm' : 'bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)]'}`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: tab.dot }} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
            <p className="text-center text-[var(--ink-2)] text-[14px] mb-8">Configure, deploy and monitor conversational agents</p>
          </R>

          <R d={0.1}>
            <div className="card p-10">
              <VoiceInterface />
            </div>
          </R>
        </div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="border-y border-black/[0.05] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: '<30s', l: 'Deploy time' }, { v: '99.99%', l: 'Uptime SLA' }, { v: '12ms', l: 'P50 latency' }, { v: '50k+', l: 'APIs deployed' }].map((m, i) => (
            <R key={m.l} d={i * 0.06} className="text-center">
              <div className="t-h2 text-[var(--ink)]">{m.v}</div>
              <div className="t-label mt-1.5">{m.l}</div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══ PLATFORM ═══ */}
      <section id="platform" className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <R className="max-w-[500px] mb-14">
            <p className="t-label text-[var(--blue)] mb-3">Platform</p>
            <h2 className="t-h1 text-[var(--ink)] mb-4">Modular by design.<br />Powerful by default.</h2>
            <p className="t-body">Four integrated systems. Work independently or as a unified stack.</p>
          </R>
          <div className="grid md:grid-cols-2 gap-5">
            <PlatformCard dot="var(--blue)" title="Procyon API" desc="High-performance REST gateways generated from natural language. Full CRUD, validation, docs, and managed PostgreSQL."
              features={['Schema generation from text', 'Auto-generated Swagger docs', 'Rate limiting & usage tracking', 'Managed PostgreSQL']} delay={0} />
            <PlatformCard dot="var(--violet)" title="Procyon AI" desc="Multi-model orchestration: Gemini handles prompt engineering, Claude performs deep reasoning, specialized models generate final outputs."
              features={['Gemini → Claude → Output pipeline', 'Context-aware routing', 'Streaming & batch modes', 'Custom model composition']} delay={0.06} />
            <PlatformCard dot="var(--green)" title="Procyon Voice" desc="State-of-the-art conversational voice interface with real-time audio, voice-to-text, and seamless mode switching."
              features={['Real-time voice interaction', 'Voice ↔ text switching', 'Audio visualizer UI', 'Low-latency streaming']} delay={0.12} />
            <PlatformCard dot="var(--orange)" title="Procyon Research" desc="Dedicated spaces for experimental model deployments, research papers, and cutting-edge AI infrastructure tooling."
              features={['Research paper repository', 'Experimental model access', 'Benchmark dashboards', 'Collaboration tools']} delay={0.18} />
          </div>
        </div>
      </section>

      {/* ═══ ORCHESTRATION ═══ */}
      <section id="ai" className="py-24 px-6 bg-white border-y border-black/[0.05]">
        <div className="max-w-[700px] mx-auto text-center">
          <R>
            <p className="t-label text-[var(--violet)] mb-3">Orchestration</p>
            <h2 className="t-h1 text-[var(--ink)] mb-4">Deep reasoning in action.</h2>
            <p className="t-body mb-12">See how Procyon AI chains multiple models into a single intelligent pipeline.</p>
          </R>
          <R d={0.12}><Pipeline /></R>
          <R d={0.2} className="mt-10">
            <div className="card-warm p-6 text-left">
              <p className="t-label text-[var(--violet)] mb-3">Example</p>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex gap-3"><span className="t-mono text-[var(--ink-3)] w-14 flex-shrink-0">Input</span><span className="text-[var(--ink)]">&ldquo;Analyze 500 customer reviews and generate a strategy report&rdquo;</span></div>
                <div className="flex gap-3"><span className="t-mono text-[var(--blue)] w-14 flex-shrink-0">Gemini</span><span className="text-[var(--ink-2)]">Structures prompt, chunks data, defines output schema</span></div>
                <div className="flex gap-3"><span className="t-mono text-[var(--orange)] w-14 flex-shrink-0">Claude</span><span className="text-[var(--ink-2)]">Sentiment analysis, pattern identification, insight generation</span></div>
                <div className="flex gap-3"><span className="t-mono text-[var(--green)] w-14 flex-shrink-0">Output</span><span className="text-[var(--ink-2)]">Structured JSON with confidence scores and recommendations</span></div>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ CODE ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-[640px] mx-auto">
          <R className="text-center mb-10"><h2 className="t-h1 text-[var(--ink)]">Universal compatibility.</h2></R>
          <R d={0.1}>
            <div className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a]">
                <div className="flex gap-1.5"><div className="h-[10px] w-[10px] rounded-full bg-[#ff5f57]" /><div className="h-[10px] w-[10px] rounded-full bg-[#febc2e]" /><div className="h-[10px] w-[10px] rounded-full bg-[#28c840]" /></div>
                <span className="text-[11px] text-[#666] font-[var(--font-mono)] ml-2">procyon.ts</span>
              </div>
              <pre className="bg-[#1a1a1a] p-6 text-[13px] leading-[1.8] overflow-x-auto font-[var(--font-mono)] text-[#ccc]"><code>{`import { Procyon } from "@procyon-labs/sdk";

const client = new Procyon({ apiKey: "pk_live_..." });

// Multi-model orchestration
const result = await client.orchestrate({
  pipeline: ["gemini:structure", "claude:reason"],
  input: "Analyze Q3 revenue trends",
  output: "json",
});

// Voice interaction
const voice = client.voice.connect({
  model: "procyon-voice-v2",
  onTranscript: (text) => console.log(text),
});`}</code></pre>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-24 px-6 bg-white border-y border-black/[0.05]">
        <div className="max-w-[1000px] mx-auto">
          <R className="text-center mb-14">
            <p className="t-label text-[var(--blue)] mb-3">Pricing</p>
            <h2 className="t-h1 text-[var(--ink)]">Start free. Scale precisely.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING_TIERS.map((t, i) => (
              <R key={t.name} d={i * 0.06}>
                <motion.div className={`relative card p-8 flex flex-col h-full ${i === 1 ? 'ring-2 ring-[var(--ink)]' : ''}`}
                  whileHover={{ y: -3 }} transition={spring}>
                  {i === 1 && <span className="absolute -top-3 left-6 px-3 py-1 bg-[var(--ink)] text-white text-[10px] font-bold rounded-full tracking-wider uppercase">Recommended</span>}
                  <p className="t-label mb-4">{t.name}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[38px] font-bold text-[var(--ink)] leading-none tracking-tight">${t.price}</span>
                    <span className="text-[14px] text-[var(--ink-3)]">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">{t.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--ink-2)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>{f}
                    </li>
                  ))}</ul>
                  <Link href="/login"><motion.span className={i === 1 ? 'btn-dark w-full justify-center' : 'btn-light w-full justify-center'} whileHover={{ scale: 1.02 }}>
                    {t.price === 0 ? 'Get started' : 'Upgrade'}
                  </motion.span></Link>
                </motion.div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6">
        <R className="max-w-[480px] mx-auto text-center">
          <h2 className="t-h1 text-[var(--ink)] mb-4">Ready to build?</h2>
          <p className="t-body mb-8">Create your first API in under a minute. No credit card required.</p>
          <Link href="/login"><motion.span className="btn-dark !text-[15px] !py-4 !px-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Build with Procyon →</motion.span></Link>
        </R>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-black/[0.06] py-14 px-6 bg-white">
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
                <p className="t-label mb-3">{c.t}</p>
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
