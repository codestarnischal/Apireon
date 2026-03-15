'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

// ================================================================
// SPRING CONFIG
// ================================================================
const spring = { type: 'spring', stiffness: 300, damping: 30 };
const springGentle = { type: 'spring', stiffness: 200, damping: 25 };
const easeOut = { duration: 0.6, ease: [0.23, 1, 0.32, 1] };

// ================================================================
// REVEAL WRAPPER — scroll-triggered fade-up
// ================================================================
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...easeOut, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ================================================================
// MICRO-INTERACTION LINK
// ================================================================
function MicroLink({ children, href = '#', className = '' }: { children: React.ReactNode; href?: string; className?: string }) {
  return (
    <motion.a href={href} className={`relative inline-flex items-center gap-1 group ${className}`}
      whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} transition={spring}>
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.a>
  );
}

// ================================================================
// FLUID NAVIGATION
// ================================================================
function FluidNav() {
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, ...easeOut }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-black/[0.04]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand + Fluid Dropdown */}
        <div className="flex items-center gap-8">
          {/* Typography-only Brand */}
          <Link href="/" className="flex items-center gap-0">
            <motion.span
              className="text-[22px] font-bold tracking-[-0.04em] text-[#1a1a1a] select-none"
              whileHover={{ scale: 1.01 }}
              transition={spring}
            >
              Apireon
            </motion.span>
          </Link>

          {/* Fluid hover menu */}
          <div className="relative hidden md:block"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            <motion.button
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#5f6368] hover:text-[#1a1a1a] transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              Platform
              <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                animate={{ rotate: hovered ? 180 : 0 }}
                transition={springGentle}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={springGentle}
                  className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-2xl border border-[#e8eaed] shadow-lg shadow-black/[0.06] p-2 overflow-hidden"
                >
                  {[
                    { label: 'API Builder', desc: 'Design APIs from natural language', href: '#' },
                    { label: 'Playground', desc: 'Test endpoints in real-time', href: '/playground' },
                    { label: 'Documentation', desc: 'Auto-generated API docs', href: '/docs' },
                    { label: 'Schema Engine', desc: 'AI-powered schema design', href: '#' },
                  ].map((item, i) => (
                    <motion.a key={item.label} href={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, ...springGentle }}
                      className="flex flex-col gap-0.5 px-4 py-3 rounded-xl hover:bg-[#f1f3f4] transition-colors group">
                      <span className="text-[14px] font-semibold text-[#1a1a1a] group-hover:text-[#1a73e8] transition-colors">{item.label}</span>
                      <span className="text-[12px] text-[#9aa0a6]">{item.desc}</span>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Static links */}
          <div className="hidden md:flex items-center gap-1">
            {['Research', 'Pricing', 'Blog'].map(item => (
              <motion.a key={item} href={item === 'Pricing' ? '#pricing' : '#'}
                className="text-[14px] font-medium text-[#5f6368] hover:text-[#1a1a1a] px-3 py-2 rounded-full hover:bg-black/[0.03] transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {item}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <motion.span className="btn-ghost text-[13px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Sign in</motion.span>
          </Link>
          <Link href="/login">
            <motion.span className="btn-fill text-[13px] !py-2.5 !px-5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Get started
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ================================================================
// DATA ART — Decorative SVG grid visualization
// ================================================================
function DataArt() {
  return (
    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-[480px] h-[480px] opacity-[0.07] pointer-events-none hidden lg:block" viewBox="0 0 400 400">
      {Array.from({ length: 20 }, (_, r) =>
        Array.from({ length: 20 }, (_, c) => (
          <motion.circle
            key={`${r}-${c}`}
            cx={c * 20 + 10} cy={r * 20 + 10}
            r={Math.random() > 0.7 ? 2.5 : 1.2}
            fill="#1a1a1a"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, delay: (r + c) * 0.08 },
              scale: { duration: 0.5, delay: (r + c) * 0.02 },
            }}
          />
        ))
      )}
    </svg>
  );
}

// ================================================================
// MAGIC INPUT
// ================================================================
function MagicInput() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phIdx, setPhIdx] = useState(0);
  const placeholders = ['A bookstore API with authors and books...', 'An inventory system with products and warehouses...', 'A recipe app with ingredients and categories...'];

  useEffect(() => { const i = setInterval(() => setPhIdx(p => (p + 1) % placeholders.length), 4000); return () => clearInterval(i); }, []);

  const generate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true); setResult(null);
    await new Promise(r => setTimeout(r, 2200));
    const l = prompt.toLowerCase();
    if (l.includes('book')) setResult({ name: 'Bookstore API', resources: { books: { title: 'string', isbn: 'string', price: 'number', author_id: 'uuid' }, authors: { name: 'string', bio: 'string', email: 'email' } } });
    else if (l.includes('restaurant') || l.includes('recipe')) setResult({ name: 'Recipe API', resources: { recipes: { name: 'string', prep_time: 'number', difficulty: 'string' }, ingredients: { name: 'string', unit: 'string', quantity: 'number' } } });
    else setResult({ name: 'Custom API', resources: { items: { name: 'string', description: 'string', value: 'number', active: 'boolean' } } });
    setGenerating(false);
  };

  return (
    <div className="w-full max-w-[640px]">
      <div className="surface-elevated p-1.5">
        <div className="relative">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={placeholders[phIdx]} rows={2}
            className="w-full resize-none bg-transparent px-5 py-4 pr-36 text-[16px] text-[#1a1a1a] placeholder:text-[#9aa0a6] focus:outline-none leading-relaxed"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } }} />
          <motion.button onClick={generate} disabled={!prompt.trim() || generating}
            className="absolute right-2.5 bottom-2.5 btn-fill !text-[13px] !py-2.5 !px-5 disabled:opacity-25 disabled:cursor-not-allowed"
            whileHover={{ scale: generating ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}>
            {generating ? (
              <><motion.div className="h-3.5 w-3.5 border-[2px] border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> Building...</>
            ) : 'Generate →'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mt-5 surface-elevated p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#1a1a1a]">{result.name}</h3>
                <p className="mono text-[#9aa0a6] mt-0.5">apireon.netlify.app/api/v1/•••</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-[#34a853]" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} /> Live
              </span>
            </div>
            {Object.entries(result.resources).map(([res, fields]: any) => (
              <div key={res} className="mb-3 last:mb-0 rounded-xl bg-[#f8f9fa] p-4 border border-[#e8eaed]">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="method method-get">GET</span>
                  <span className="method method-post">POST</span>
                  <span className="method method-put">PUT</span>
                  <span className="method method-del">DEL</span>
                  <code className="text-[14px] font-semibold text-[#1a1a1a] ml-1 font-[var(--font-mono)]">/{res}</code>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(fields).map(([f, t]: any) => (
                    <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[11px] border border-[#e8eaed]">
                      <span className="font-[var(--font-mono)] font-medium text-[#1a1a1a]">{f}</span>
                      <span className="text-[#9aa0a6]">{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 mt-5">
              <Link href="/login"><motion.span className="btn-fill !text-[13px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Open Dashboard</motion.span></Link>
              <motion.button className="btn-outline !text-[13px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>View Docs</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ================================================================
// LANDING PAGE
// ================================================================
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <FluidNav />

      {/* ======== HERO ======== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-mesh grain" />
        <DataArt />

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-24 pb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-[660px]"
          >
            <motion.p className="label mb-5 text-[var(--c-accent)]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Natural Language → Live API
            </motion.p>

            <h1 className="display-xl text-[#1a1a1a] mb-6">
              Build APIs by<br />describing them.
            </h1>

            <p className="body-lg max-w-[480px] mb-10">
              Apireon transforms plain English into production-ready REST APIs — complete with endpoints, validation, documentation, and a hosted PostgreSQL database.
            </p>

            <MagicInput />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: heroOpacity }}>
          <motion.div className="w-5 h-8 rounded-full border-2 border-[#9aa0a6] flex justify-center pt-1.5"
            animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-1 h-1.5 rounded-full bg-[#9aa0a6]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ======== METRICS BAR ======== */}
      <section className="border-y border-[#e8eaed] bg-white">
        <div className="max-w-[1240px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '<30s', label: 'Time to deploy' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '45ms', label: 'Avg response' },
            { value: '10k+', label: 'APIs created' },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="text-center">
              <div className="display-md text-[#1a1a1a]">{m.value}</div>
              <div className="label mt-2">{m.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-[1240px] mx-auto">
          <Reveal className="max-w-[560px] mb-16">
            <p className="label text-[var(--c-accent)] mb-3">Capabilities</p>
            <h2 className="display-lg text-[#1a1a1a] mb-4">Engineered for<br />developer velocity.</h2>
            <p className="body-lg">Every component of Apireon is designed to eliminate the distance between an idea and a working API.</p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '⚡', title: 'Schema Intelligence', desc: 'Describe your data model in natural language. Our engine infers types, relationships, and validation rules automatically.' },
              { icon: '◎', title: 'Instant Deployment', desc: 'Full CRUD endpoints — GET, POST, PUT, DELETE — operational within seconds. No build step, no pipeline.' },
              { icon: '▦', title: 'Managed PostgreSQL', desc: 'Each project receives an isolated Supabase database with automated backups, indexing, and row-level security.' },
              { icon: '✓', title: 'Type Validation', desc: 'Request payloads are validated against your schema in real-time. String, number, boolean, UUID, email, URL, date.' },
              { icon: '⊞', title: 'Live Documentation', desc: 'Interactive API docs are generated from your schema. Test endpoints directly in the browser with example payloads.' },
              { icon: '◈', title: 'Rate Intelligence', desc: 'Per-project rate limits, request credit tracking, and automatic abuse prevention with configurable thresholds.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <motion.div className="surface-interactive p-7 h-full" whileHover={{ scale: 1.005 }} transition={spring}>
                  <span className="text-[28px] block mb-5 select-none">{f.icon}</span>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">{f.title}</h3>
                  <p className="body-md text-[14px]">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="py-28 px-6 bg-white border-y border-[#e8eaed]">
        <div className="max-w-[720px] mx-auto">
          <Reveal className="text-center mb-16">
            <p className="label text-[var(--c-accent)] mb-3">Process</p>
            <h2 className="display-lg text-[#1a1a1a]">Three steps to production.</h2>
          </Reveal>

          <div className="space-y-5">
            {[
              { n: '01', title: 'Describe', desc: 'Tell us what you need in plain English. "A restaurant API with menus, orders, and reviews."' },
              { n: '02', title: 'Generate', desc: 'Our Architect Engine designs the schema, creates endpoints, configures validation, and provisions your database.' },
              { n: '03', title: 'Ship', desc: 'Copy auto-generated code snippets into your app. Your API is live with docs, playground, and monitoring.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <motion.div className="flex gap-6 items-start surface-interactive p-6" whileHover={{ x: 4 }} transition={spring}>
                  <span className="mono text-[32px] font-medium text-[#e8eaed] select-none leading-none">{step.n}</span>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">{step.title}</h3>
                    <p className="body-md text-[14px]">{step.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CODE SAMPLE ======== */}
      <section className="py-28 px-6">
        <div className="max-w-[720px] mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="display-lg text-[#1a1a1a]">Universal compatibility.</h2>
            <p className="body-lg mt-3">Use with any language, framework, or platform.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden border border-[#e8eaed]">
              <div className="flex items-center gap-2.5 px-5 py-3.5 bg-[#1a1a1a]">
                <div className="flex gap-2">
                  <div className="h-[10px] w-[10px] rounded-full bg-[#ea4335]" />
                  <div className="h-[10px] w-[10px] rounded-full bg-[#fbbc04]" />
                  <div className="h-[10px] w-[10px] rounded-full bg-[#34a853]" />
                </div>
                <span className="text-[11px] text-[#9aa0a6] font-[var(--font-mono)] ml-2">request.js</span>
              </div>
              <pre className="bg-[#1a1a1a] p-6 text-[13px] leading-[1.75] overflow-x-auto font-[var(--font-mono)]"><code className="text-[#e8eaed]">{`const response = await fetch(
  "https://apireon.netlify.app/api/v1/YOUR_KEY/books",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Thinking, Fast and Slow",
      price: 14.99,
      genre: "Psychology"
    })
  }
);

const { data } = await response.json();
console.log(data.id);`}</code></pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======== PRICING ======== */}
      <section id="pricing" className="py-28 px-6 bg-white border-y border-[#e8eaed]">
        <div className="max-w-[1040px] mx-auto">
          <Reveal className="text-center mb-14">
            <p className="label text-[var(--c-accent)] mb-3">Pricing</p>
            <h2 className="display-lg text-[#1a1a1a]">Start free. Scale precisely.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.08}>
                <motion.div
                  className={`relative surface p-8 flex flex-col h-full ${i === 1 ? 'ring-2 ring-[#1a1a1a]' : ''}`}
                  whileHover={{ y: -3 }} transition={spring}
                >
                  {i === 1 && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full tracking-wider uppercase">Recommended</span>
                  )}
                  <p className="label mb-4">{tier.name}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[40px] font-bold text-[#1a1a1a] leading-none tracking-tight">${tier.price}</span>
                    <span className="text-[14px] text-[#9aa0a6]">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#5f6368]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login">
                    <motion.span className={i === 1 ? 'btn-fill w-full justify-center' : 'btn-outline w-full justify-center'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {tier.price === 0 ? 'Get started' : 'Upgrade'}
                    </motion.span>
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="py-28 px-6">
        <Reveal className="max-w-[520px] mx-auto text-center">
          <h2 className="display-lg text-[#1a1a1a] mb-4">Start building today.</h2>
          <p className="body-lg mb-8">Create your first API in under a minute.<br />No credit card required.</p>
          <Link href="/login">
            <motion.span className="btn-fill !text-[15px] !px-8 !py-3.5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Get started free →
            </motion.span>
          </Link>
        </Reveal>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="border-t border-[#e8eaed] bg-white py-14 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-[18px] font-bold text-[#1a1a1a] tracking-[-0.03em]">Apireon</span>
              <p className="text-[13px] text-[#9aa0a6] mt-2 leading-relaxed">Natural language<br />to live APIs.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Documentation'] },
              { title: 'Developers', links: ['API Reference', 'Playground', 'Status', 'SDKs'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
            ].map(col => (
              <div key={col.title}>
                <p className="label mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <motion.a href="#" className="text-[13px] text-[#5f6368] hover:text-[#1a1a1a] transition-colors" whileHover={{ x: 2 }}>
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#e8eaed] gap-4">
            <p className="text-[12px] text-[#9aa0a6]">© {new Date().getFullYear()} Apireon. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Twitter', 'GitHub', 'Discord'].map(s => (
                <motion.a key={s} href="#" className="text-[12px] text-[#9aa0a6] hover:text-[#1a1a1a] transition-colors" whileHover={{ y: -1 }}>
                  {s}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
