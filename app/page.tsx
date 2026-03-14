'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

// Minimal inline icons
const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#0071e3"/>
    <path d="M16 7l-7 10h5.5l-1 8 7-10h-5.5l1-8z" fill="white" strokeLinejoin="round"/>
  </svg>
);
const ArrowRight = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const Sparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;

const placeholders = [
  'A bookstore API with authors and books...',
  'An e-commerce backend with products and orders...',
  'A restaurant review platform with ratings...',
  'A project tracker with tasks and sprints...',
];

function MagicInput() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setPhIdx(p => (p + 1) % placeholders.length), 4000);
    return () => clearInterval(i);
  }, []);

  const generate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2200));
    const l = prompt.toLowerCase();
    if (l.includes('book') || l.includes('store')) {
      setResult({ name: 'Bookstore API', resources: { books: { title: 'string', isbn: 'string', price: 'number', genre: 'string', author_id: 'uuid' }, authors: { name: 'string', bio: 'string', email: 'email' } } });
    } else if (l.includes('restaurant') || l.includes('food')) {
      setResult({ name: 'Restaurant API', resources: { restaurants: { name: 'string', cuisine: 'string', rating: 'number' }, reviews: { restaurant_id: 'uuid', rating: 'number', comment: 'string' } } });
    } else {
      setResult({ name: 'Custom API', resources: { items: { name: 'string', description: 'string', value: 'number', active: 'boolean' } } });
    }
    setGenerating(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card-elevated p-1.5">
        <div className="relative">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={placeholders[phIdx]}
            rows={2} className="w-full resize-none bg-transparent px-5 py-4 pr-40 text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none text-[17px] leading-relaxed"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } }} />
          <button onClick={generate} disabled={!prompt.trim() || generating}
            className="absolute right-3 bottom-3 btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
            {generating ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Building...</>
            ) : (
              <><Sparkles /> Generate</>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="mt-6 card-elevated p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1d1d1f]">{result.name}</h3>
                  <p className="text-xs text-[#86868b] font-mono">apireon.netlify.app/api/v1/•••</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#1b5e20]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4caf50] animate-pulse" /> Live
              </span>
            </div>
            {Object.entries(result.resources).map(([resource, fields]: any) => (
              <div key={resource} className="mb-3 last:mb-0 rounded-xl bg-[#f5f5f7] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="method-badge method-get">GET</span>
                  <span className="method-badge method-post">POST</span>
                  <span className="method-badge method-put">PUT</span>
                  <span className="method-badge method-delete">DEL</span>
                  <code className="text-sm font-mono font-semibold text-[#1d1d1f] ml-2">/{resource}</code>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(fields).map(([f, t]: any) => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-xs border border-black/[0.04]">
                      <span className="font-mono font-medium text-[#1d1d1f]">{f}</span>
                      <span className="text-[#86868b]">{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-3 mt-5">
              <Link href="/login" className="btn-primary">Open Dashboard <ArrowRight /></Link>
              <button className="btn-outline">View Docs</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Feature data
const features = [
  { icon: '⚡', title: 'AI-Powered Design', desc: 'Describe your API in plain English. Our engine creates the schema, types, and relationships automatically.' },
  { icon: '🌐', title: 'Instant Endpoints', desc: 'Full CRUD operations — GET, POST, PUT, DELETE — working in seconds. No deployment pipeline needed.' },
  { icon: '🗄️', title: 'Managed Database', desc: 'Each project gets isolated PostgreSQL storage on Supabase with backups and automatic scaling.' },
  { icon: '✅', title: 'Smart Validation', desc: 'Type checking, format validation, and required fields enforced on every request automatically.' },
  { icon: '📖', title: 'Live Documentation', desc: 'Interactive Swagger-style docs generated from your schema. Test endpoints right in the browser.' },
  { icon: '🔒', title: 'Rate Limiting', desc: 'Per-project rate limits, usage tracking, and credit management to keep your APIs healthy.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><Logo /><span className="font-bold text-[17px] tracking-tight text-[#1d1d1f]">Apireon</span></div>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#424245]">
            <a href="#features" className="hover:text-[#1d1d1f] transition-colors">Features</a>
            <a href="#how" className="hover:text-[#1d1d1f] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#1d1d1f] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] font-medium text-[#424245] hover:text-[#1d1d1f] transition-colors px-3 py-1.5">Sign in</Link>
            <Link href="/login" className="btn-primary !text-[13px] !px-4 !py-2">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[#0071e3] text-sm font-semibold mb-5 tracking-wide">THE FASTEST WAY TO BUILD APIs</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.6 }}
            className="text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1d1d1f] mb-5">
            Describe your API.<br />
            <span className="text-[#86868b]">We build the rest.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }}
            className="text-[19px] text-[#6e6e73] max-w-xl mx-auto mb-12 leading-relaxed">
            Turn a sentence into a live REST API with endpoints, validation, documentation, and a hosted database — in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }}>
            <MagicInput />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-5 text-[13px] text-[#86868b]">
            {['No credit card required', '1,000 free requests', 'Deploy in 30 seconds'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><span className="text-[#34c759]"><Check /></span> {t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-y border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-[0.15em] mb-5">Trusted by developers at</p>
          <div className="flex items-center justify-center gap-10 opacity-30">
            {['Vercel', 'Stripe', 'Linear', 'Notion', 'Figma'].map(name => (
              <span key={name} className="text-lg font-bold text-[#1d1d1f] select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0071e3] text-sm font-semibold mb-3 tracking-wide">FEATURES</p>
            <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-[#1d1d1f] leading-tight">
              Everything you need.<br className="hidden sm:block" />
              <span className="text-[#86868b]">Nothing you don&apos;t.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.06, duration: 0.5 }}
                className="card-interactive p-7">
                <span className="text-2xl mb-4 block">{f.icon}</span>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-2">{f.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-[#f5f5f7]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0071e3] text-sm font-semibold mb-3 tracking-wide">HOW IT WORKS</p>
            <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-[#1d1d1f]">Three steps. That&apos;s it.</h2>
          </div>
          <div className="space-y-6">
            {[
              { n: '1', title: 'Describe your API', desc: '"I need a bookstore API with books and authors." Type it in plain English.' },
              { n: '2', title: 'Get live endpoints', desc: 'Instantly receive working REST endpoints with validation, docs, and a database.' },
              { n: '3', title: 'Ship your product', desc: 'Copy the auto-generated code snippets into your app and start building.' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-black/[0.04]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-sm font-bold">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-[#1d1d1f] mb-1">{step.title}</h3>
                  <p className="text-[14px] text-[#6e6e73] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">Works everywhere.</h2>
            <p className="text-[#6e6e73] mt-2">Use with any language, framework, or platform.</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#2d2d2f]">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[11px] text-[#86868b] font-mono ml-3">app.js</span>
            </div>
            <pre className="code-block !rounded-none !rounded-b-2xl"><code>{`const res = await fetch(
  "https://apireon.netlify.app/api/v1/YOUR_KEY/books",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "The Great Gatsby",
      price: 12.99,
      genre: "Classic Fiction"
    })
  }
);

const { data } = await res.json();
console.log(data.id); // "a1b2c3d4-..."`}</code></pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0071e3] text-sm font-semibold mb-3 tracking-wide">PRICING</p>
            <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-[#1d1d1f]">Start free. Scale as you grow.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`relative bg-white rounded-2xl p-8 flex flex-col ${i === 1 ? 'ring-2 ring-[#0071e3] shadow-lg' : 'border border-black/[0.06]'}`}>
                {i === 1 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-[#0071e3] text-white text-[11px] font-bold rounded-full tracking-wide">MOST POPULAR</span>
                  </div>
                )}
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#86868b] mb-3">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[44px] font-extrabold text-[#1d1d1f] leading-none">${tier.price}</span>
                  <span className="text-[#86868b] text-sm font-medium">/mo</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#424245]">
                      <span className="text-[#34c759] mt-0.5 flex-shrink-0"><Check /></span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={i === 1 ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}>
                  {tier.price === 0 ? 'Get started' : 'Upgrade'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[36px] font-extrabold tracking-tight text-[#1d1d1f] mb-4">Ready to build?</h2>
          <p className="text-[#6e6e73] text-lg mb-8">Create your first API in under a minute. No credit card required.</p>
          <Link href="/login" className="btn-primary !text-base !px-8 !py-3.5">
            Get started free <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Logo /><span className="font-bold text-[#1d1d1f]">Apireon</span></div>
          <div className="flex items-center gap-6 text-[13px] text-[#86868b]">
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">GitHub</a>
          </div>
          <p className="text-[12px] text-[#86868b]">© {new Date().getFullYear()} Apireon</p>
        </div>
      </footer>
    </div>
  );
}
