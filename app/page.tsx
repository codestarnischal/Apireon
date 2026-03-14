'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, Sparkles, Code2, Database, Globe,
  BookOpen, Shield, Gauge, ChevronRight, Check, Terminal, Star,
} from 'lucide-react';
import { PRICING_TIERS } from '@/lib/utils/constants';

// ============================================================
// Animated Background
// ============================================================
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-950/40 via-surface-0 to-surface-0" />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[128px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glow-cyan/8 rounded-full blur-[128px] animate-pulse-glow [animation-delay:1.5s]" />
    </div>
  );
}

// ============================================================
// Magic Input - The Live Demo Component
// ============================================================
function MagicInput() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    resources: Record<string, Record<string, string>>;
    baseUrl: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = [
    'A bookstore API with authors and books...',
    'A restaurant review platform with menus and ratings...',
    'An e-commerce backend with products, orders, and customers...',
    'A project management tool with tasks, teams, and sprints...',
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);

    // Simulate the schema generation (in production, this calls /api/architect)
    await new Promise((r) => setTimeout(r, 2200));

    // Demo result
    const demoResults: Record<string, any> = {
      default: {
        name: 'Custom API',
        resources: {
          items: { name: 'string', description: 'string', value: 'number', is_active: 'boolean' },
        },
        baseUrl: 'https://instantapi.dev/api/v1/abc-123',
      },
    };

    const lower = prompt.toLowerCase();
    if (lower.includes('book') || lower.includes('store')) {
      setResult({
        name: 'Bookstore API',
        resources: {
          books: { title: 'string', isbn: 'string', price: 'number', genre: 'string', author_id: 'uuid' },
          authors: { name: 'string', bio: 'string', email: 'email', website: 'url' },
        },
        baseUrl: 'https://instantapi.dev/api/v1/d4e5f6-demo',
      });
    } else if (lower.includes('restaurant') || lower.includes('food')) {
      setResult({
        name: 'Restaurant API',
        resources: {
          restaurants: { name: 'string', cuisine: 'string', address: 'string', rating: 'number' },
          reviews: { restaurant_id: 'uuid', reviewer: 'string', rating: 'number', comment: 'string' },
          menus: { restaurant_id: 'uuid', item_name: 'string', price: 'number', category: 'string' },
        },
        baseUrl: 'https://instantapi.dev/api/v1/a1b2c3-demo',
      });
    } else {
      setResult(demoResults.default);
    }

    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input area */}
      <div className="glass-panel-strong glow-border p-2">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholders[placeholderIdx]}
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-3 text-zinc-100 
                       placeholder:text-zinc-500 focus:outline-none text-lg leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="absolute right-2 bottom-2 btn-primary !px-5 !py-2.5 text-sm gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Architecting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate API
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="mt-6 glass-panel p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{result.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{result.baseUrl}</p>
                </div>
              </div>
              <span className="badge">
                <Check className="h-3 w-3 mr-1" /> Live
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(result.resources).map(([resource, fields]) => (
                <div key={resource} className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="method-badge method-get">GET</span>
                    <span className="method-badge method-post">POST</span>
                    <span className="method-badge method-put">PUT</span>
                    <span className="method-badge method-delete">DEL</span>
                    <code className="text-sm font-mono text-brand-300 ml-2">/{resource}</code>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(fields).map(([field, type]) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400 font-mono">{field}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-brand-400/80 font-mono">{type as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="btn-primary !py-2 text-sm gap-1.5">
                Open Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button className="btn-ghost !py-2 text-sm gap-1.5">
                <Terminal className="h-3.5 w-3.5" /> View Docs
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Feature Card
// ============================================================
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="glass-panel p-6 group hover:bg-white/[0.06] transition-all duration-300"
    >
      <div className="h-10 w-10 rounded-lg bg-brand-500/15 border border-brand-500/20 
                      flex items-center justify-center mb-4
                      group-hover:bg-brand-500/25 transition-colors">
        <Icon className="h-5 w-5 text-brand-400" />
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ============================================================
// Pricing Card
// ============================================================
function PricingCard({
  tier,
  popular = false,
}: {
  tier: (typeof PRICING_TIERS)[number];
  popular?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative glass-panel p-8 flex flex-col ${popular ? 'glow-border ring-1 ring-brand-500/30' : ''}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full shadow-glow-sm">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white capitalize">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${tier.price}</span>
          <span className="text-zinc-400 text-sm">/month</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <Check className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <button className={popular ? 'btn-primary w-full' : 'btn-ghost w-full'}>
        {tier.price === 0 ? 'Start Free' : 'Upgrade'}
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </motion.div>
  );
}

// ============================================================
// Navigation
// ============================================================
function Nav() {
  return (
    <nav className="fixed top-0 w-full z-40 bg-surface-0/60 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-semibold text-lg text-white tracking-tight">InstantAPI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-white transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">Sign in</a>
          <a href="/signup" className="btn-primary !py-2 !px-4 text-sm">
            Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </a>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-zinc-100">
      <GridBackground />
      <Nav />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                           bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm mb-8">
              <Star className="h-3.5 w-3.5" />
              Now with AI-powered schema generation
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          >
            Describe it.{' '}
            <span className="text-gradient">Deploy it.</span>
            <br />
            Done.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Turn a single sentence into a fully functional REST API — with endpoints,
            validation, docs, and a live database. No backend code required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <MagicInput />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex items-center justify-center gap-6 text-sm text-zinc-500"
          >
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 1,000 free requests</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Ships in 30 seconds</span>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need. <span className="text-gradient">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              From schema design to live deployment — all handled for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Sparkles} title="AI Schema Architect" description="Describe your API in plain English. Our AI designs the perfect schema with resources, fields, types, and relationships." delay={0} />
            <FeatureCard icon={Globe} title="Instant Live Endpoints" description="GET, POST, PUT, DELETE — all working immediately. Full CRUD operations on your data with zero configuration." delay={0.08} />
            <FeatureCard icon={Database} title="Hosted PostgreSQL" description="Every API gets its own isolated data store. Powered by Supabase with automatic backups and scaling." delay={0.16} />
            <FeatureCard icon={Shield} title="Built-in Validation" description="Every POST request is validated against your schema. Type checking, required fields, and format validation included." delay={0.24} />
            <FeatureCard icon={BookOpen} title="Auto Documentation" description="Swagger-like docs generated automatically from your schema. Interactive playground included." delay={0.32} />
            <FeatureCard icon={Gauge} title="Rate Limiting & Usage" description="Intelligent rate limiting per project. Usage tracking and credit management built in." delay={0.4} />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Three steps. Zero friction.</h2>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Describe your API', desc: 'Type a sentence like "I need a bookstore API with books and authors." Our Architect Engine handles the rest.' },
              { step: '02', title: 'Get your endpoints', desc: 'Instantly receive live REST endpoints with full CRUD, validation, and documentation — ready to use.' },
              { step: '03', title: 'Build your product', desc: 'Use the auto-generated code snippets in curl, JavaScript, or Python to integrate into your app immediately.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 
                              flex items-center justify-center font-mono text-brand-400 text-lg font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CODE DEMO ===== */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Works with <span className="text-gradient">any language</span>
            </h2>
          </div>
          <div className="glass-panel overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-zinc-500 font-mono ml-2">fetch.js</span>
            </div>
            <pre className="p-6 text-sm leading-relaxed overflow-x-auto">
              <code className="text-zinc-300">
{`// Create a new book — it's that simple
const response = await fetch(
  "https://instantapi.dev/api/v1/YOUR_KEY/books",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "The Great Gatsby",
      author_id: "550e8400-e29b-41d4-a716-446655440000",
      price: 12.99,
      genre: "Classic Fiction"
    })
  }
);

const { data } = await response.json();
console.log(data.id); // → "a1b2c3d4-..."
`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 text-lg">Start free. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <PricingCard key={tier.name} tier={tier} popular={i === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-white">InstantAPI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} InstantAPI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
