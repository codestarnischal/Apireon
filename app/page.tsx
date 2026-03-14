'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/utils/constants';

const Zap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const ArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const Sparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
const Check = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const Globe = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>;
const Database = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>;
const Shield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>;
const Book = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 7v14M2 7.5C2 5.01 4.01 3 6.5 3H20v18H6.5A3.5 3.5 0 0 1 3 17.5v-10"/></svg>;
const Gauge = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16.5V9.5"/><circle cx="12" cy="12" r="10"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;

const placeholders = [
  'A bookstore API with authors and books...',
  'A restaurant review platform with menus...',
  'An e-commerce backend with products and orders...',
  'A task manager with projects and teams...',
];

function MagicInput() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setPhIdx(p => (p + 1) % placeholders.length), 3500);
    return () => clearInterval(i);
  }, []);

  const generate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const l = prompt.toLowerCase();
    if (l.includes('book') || l.includes('store')) {
      setResult({ name: 'Bookstore API', resources: { books: { title: 'string', isbn: 'string', price: 'number', genre: 'string', author_id: 'uuid' }, authors: { name: 'string', bio: 'string', email: 'email' } } });
    } else if (l.includes('restaurant') || l.includes('food')) {
      setResult({ name: 'Restaurant API', resources: { restaurants: { name: 'string', cuisine: 'string', rating: 'number' }, reviews: { restaurant_id: 'uuid', rating: 'number', comment: 'string' } } });
    } else {
      setResult({ name: 'Custom API', resources: { items: { name: 'string', description: 'string', value: 'number', is_active: 'boolean' } } });
    }
    setGenerating(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="card-elevated p-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholders[phIdx]}
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-3 text-[#1A1A19] placeholder:text-[#9C9C99] focus:outline-none text-lg leading-relaxed"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } }}
          />
          <button onClick={generate} disabled={!prompt.trim() || generating}
            className="absolute right-2 bottom-2 btn-primary !px-5 !py-2.5 text-sm gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {generating ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Architecting...</>
            ) : (
              <><Sparkles /> Generate API</>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }} className="mt-6 card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#F0F0EE] flex items-center justify-center text-[#1A1A19]"><Zap /></div>
                <div>
                  <h3 className="font-semibold text-[#1A1A19]">{result.name}</h3>
                  <p className="text-xs text-[#9C9C99] font-mono">https://apireon.netlify.app/api/v1/demo</p>
                </div>
              </div>
              <span className="badge-success"><Check /> Live</span>
            </div>
            <div className="space-y-3">
              {Object.entries(result.resources).map(([resource, fields]: any) => (
                <div key={resource} className="bg-[#FAFAF9] rounded-lg p-4 border border-[#E5E4E2]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="method-badge method-get">GET</span>
                    <span className="method-badge method-post">POST</span>
                    <span className="method-badge method-put">PUT</span>
                    <span className="method-badge method-delete">DEL</span>
                    <code className="text-sm font-mono text-[#1A1A19] ml-2">/{resource}</code>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(fields).map(([field, type]: any) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        <span className="text-[#6B6B69] font-mono">{field}</span>
                        <span className="text-[#D4D3D0]">&middot;</span>
                        <span className="text-[#9C9C99] font-mono">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/login" className="btn-primary !py-2 text-sm gap-1.5">Open Dashboard <ArrowRight /></Link>
              <button className="btn-secondary !py-2 text-sm gap-1.5">View Docs</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5, ease: [0.19, 1, 0.22, 1] }} className="card p-6 hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-[#F0F0EE] border border-[#E5E4E2] flex items-center justify-center mb-4 text-[#1A1A19]">
        {icon}
      </div>
      <h3 className="font-semibold text-[#1A1A19] mb-2">{title}</h3>
      <p className="text-sm text-[#6B6B69] leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1A1A19]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#FAFAF9]/80 backdrop-blur-xl border-b border-[#E5E4E2]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1A1A19] flex items-center justify-center text-white"><Zap /></div>
            <span className="font-semibold text-lg tracking-tight">Apireon</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#6B6B69]">
            <a href="#features" className="hover:text-[#1A1A19] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#1A1A19] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#6B6B69] hover:text-[#1A1A19] transition-colors">Sign in</Link>
            <Link href="/login" className="btn-primary !py-2 !px-4 text-sm">Get Started <span className="ml-1"><ArrowRight /></span></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0F0EE] border border-[#E5E4E2] text-[#6B6B69] text-sm mb-8">
              <Sparkles /> AI-powered schema generation
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            Describe it.<br /><span className="text-[#9C9C99]">Deploy it.</span><br />Done.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-[#6B6B69] max-w-2xl mx-auto mb-12 leading-relaxed">
            Turn a single sentence into a fully functional REST API — with endpoints, validation, docs, and a live database.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
            <MagicInput />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex items-center justify-center gap-6 text-sm text-[#9C9C99]">
            <span className="flex items-center gap-1.5"><span className="text-emerald-600"><Check /></span> No credit card</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600"><Check /></span> 1,000 free requests</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600"><Check /></span> Ships in 30 seconds</span>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need. <span className="text-[#9C9C99]">Nothing you don&apos;t.</span></h2>
            <p className="text-[#6B6B69] text-lg max-w-xl mx-auto">From schema design to live deployment — handled for you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Sparkles />} title="AI Schema Architect" description="Describe your API in plain English. Our AI designs the perfect schema with resources, fields, and types." delay={0} />
            <FeatureCard icon={<Globe />} title="Instant Live Endpoints" description="GET, POST, PUT, DELETE — all working immediately with full CRUD operations." delay={0.08} />
            <FeatureCard icon={<Database />} title="Hosted PostgreSQL" description="Every API gets its own isolated data store powered by Supabase with automatic backups." delay={0.16} />
            <FeatureCard icon={<Shield />} title="Built-in Validation" description="Every POST request is validated against your schema. Type checking and format validation included." delay={0.24} />
            <FeatureCard icon={<Book />} title="Auto Documentation" description="Swagger-like docs generated automatically from your schema with interactive playground." delay={0.32} />
            <FeatureCard icon={<Gauge />} title="Rate Limiting" description="Intelligent rate limiting per project with usage tracking and credit management." delay={0.4} />
          </div>
        </div>
      </section>

      {/* Code Demo */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Works with <span className="text-[#9C9C99]">any language</span></h2>
          <div className="rounded-xl overflow-hidden border border-[#E5E4E2] shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A19] border-b border-[#333]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="text-xs text-[#6B6B69] font-mono ml-2">fetch.js</span>
            </div>
            <pre className="p-6 text-sm leading-relaxed overflow-x-auto bg-[#1A1A19]">
              <code className="text-[#D4D3D0]">
{`// Create a new book — it's that simple
const response = await fetch(
  "https://apireon.netlify.app/api/v1/YOUR_KEY/books",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "The Great Gatsby",
      author_id: "550e8400-e29b-41d4-...",
      price: 12.99,
      genre: "Classic Fiction"
    })
  }
);

const { data } = await response.json();
console.log(data.id); // → "a1b2c3d4-..."`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-[#6B6B69] text-lg">Start free. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`card p-8 flex flex-col ${i === 1 ? 'ring-2 ring-[#1A1A19] shadow-md' : ''}`}>
                {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="px-3 py-1 bg-[#1A1A19] text-white text-xs font-semibold rounded-full">Most Popular</span></div>}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold capitalize">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-[#9C9C99] text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#6B6B69]">
                      <span className="text-emerald-600 mt-0.5"><Check /></span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={i === 1 ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}>
                  {tier.price === 0 ? 'Start Free' : 'Upgrade'} <span className="ml-1"><ChevronRight /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E4E2] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#1A1A19] flex items-center justify-center text-white"><Zap /></div>
            <span className="font-semibold">Apireon</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-[#9C9C99]">
            <a href="#" className="hover:text-[#1A1A19] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1A1A19] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1A1A19] transition-colors">Status</a>
          </div>
          <p className="text-xs text-[#D4D3D0]">&copy; {new Date().getFullYear()} Apireon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
