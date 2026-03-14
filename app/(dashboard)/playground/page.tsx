'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Copy, Check, ChevronDown, Clock, CheckCircle2,
  XCircle, Loader2, Code2, Send,
} from 'lucide-react';
import { generateGetSnippet, generatePostSnippet, type SnippetLanguage } from '@/lib/utils/code-snippets';
import { generateExamplePayload } from '@/lib/validators/schema-validator';
import type { ResourceSchema, FieldType } from '@/types';

// Demo project data
const DEMO_API_KEY = 'd4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f80';
const DEMO_SCHEMA: Record<string, ResourceSchema> = {
  books: {
    title: 'string' as FieldType,
    isbn: 'string' as FieldType,
    price: 'number' as FieldType,
    genre: 'string' as FieldType,
    author_id: 'uuid' as FieldType,
    published_date: 'date' as FieldType,
    in_stock: 'boolean' as FieldType,
  },
  authors: {
    name: 'string' as FieldType,
    bio: 'string' as FieldType,
    email: 'email' as FieldType,
    website: 'url' as FieldType,
    born_year: 'number' as FieldType,
  },
  reviews: {
    book_id: 'uuid' as FieldType,
    reviewer_name: 'string' as FieldType,
    rating: 'number' as FieldType,
    comment: 'string' as FieldType,
  },
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  POST: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  PUT: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  DELETE: 'text-red-400 bg-red-500/15 border-red-500/30',
};

interface RequestResponse {
  status: number;
  statusText: string;
  data: unknown;
  time: number;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded hover:bg-[#f5f5f7] transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#424245]" />}
    </button>
  );
}

export default function PlaygroundPage() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [resource, setResource] = useState('books');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [snippetLang, setSnippetLang] = useState<SnippetLanguage>('curl');
  const [showSnippets, setShowSnippets] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/${DEMO_API_KEY}`
    : `/api/v1/${DEMO_API_KEY}`;
  const fullUrl = `${baseUrl}/${resource}`;

  // Auto-fill example body when switching to POST
  const handleMethodChange = (m: HttpMethod) => {
    setMethod(m);
    if (m === 'POST' && !body.trim()) {
      const schema = DEMO_SCHEMA[resource];
      if (schema) {
        setBody(JSON.stringify(generateExamplePayload(schema), null, 2));
      }
    }
  };

  const handleResourceChange = (r: string) => {
    setResource(r);
    if (method === 'POST') {
      const schema = DEMO_SCHEMA[r];
      if (schema) setBody(JSON.stringify(generateExamplePayload(schema), null, 2));
    }
  };

  // Execute the request
  const executeRequest = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (['POST', 'PUT'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(fullUrl, options);
      const data = await res.json();
      const time = Math.round(performance.now() - start);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        time,
      });
    } catch (err: any) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: { error: err.message },
        time: Math.round(performance.now() - start),
      });
    } finally {
      setLoading(false);
    }
  }, [method, fullUrl, body]);

  // Get code snippet
  const getSnippet = () => {
    const schema = DEMO_SCHEMA[resource];
    if (method === 'POST' && schema) {
      return generatePostSnippet(baseUrl, resource, schema, snippetLang);
    }
    return generateGetSnippet(baseUrl, resource, snippetLang);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">API Playground</h1>
        <p className="text-[#424245] mt-1">Test your API endpoints directly in the browser</p>
      </div>

      {/* Request Builder */}
      <div className="card-elevated overflow-hidden">
        {/* Method + URL bar */}
        <div className="flex items-center gap-3 p-4 border-b border-black/[0.06]">
          {/* Method selector */}
          <div className="relative">
            <select
              value={method}
              onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
              className={`appearance-none font-mono font-bold text-sm pl-3 pr-8 py-2.5 rounded-lg 
                         border cursor-pointer ${METHOD_COLORS[method]}`}
            >
              {(['GET', 'POST', 'PUT', 'DELETE'] as HttpMethod[]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none opacity-60" />
          </div>

          {/* Resource selector */}
          <div className="relative">
            <select
              value={resource}
              onChange={(e) => handleResourceChange(e.target.value)}
              className="appearance-none bg-[#f5f5f7] border border-black/[0.06] text-[#424245]
                        font-mono text-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none
                        focus:ring-2 focus:ring-brand-500/40"
            >
              {Object.keys(DEMO_SCHEMA).map((r) => (
                <option key={r} value={r}>/{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-[#424245]" />
          </div>

          {/* Full URL display */}
          <div className="flex-1 flex items-center gap-2 bg-[#f5f5f7] rounded-lg px-3 py-2.5 border border-black/[0.06]">
            <code className="text-sm font-mono text-[#424245] truncate">{fullUrl}</code>
            <CopyBtn text={fullUrl} />
          </div>

          {/* Send button */}
          <button
            onClick={executeRequest}
            disabled={loading}
            className="btn-primary !py-2.5 !px-5 text-sm gap-2 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>

        {/* Body editor (for POST/PUT) */}
        <AnimatePresence>
          {['POST', 'PUT'].includes(method) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-black/[0.06]"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[#f5f5f7]">
                <span className="text-xs font-semibold text-[#424245] uppercase tracking-wider">Request Body</span>
                <button
                  onClick={() => {
                    const schema = DEMO_SCHEMA[resource];
                    if (schema) setBody(JSON.stringify(generateExamplePayload(schema), null, 2));
                  }}
                  className="text-xs text-[#1d1d1f] hover:text-[#1d1d1f] transition-colors"
                >
                  Fill example
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full bg-transparent px-4 py-3 font-mono text-sm text-[#424245] 
                          focus:outline-none resize-none leading-relaxed"
                placeholder='{ "key": "value" }'
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response Panel */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            {/* Response header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] bg-[#f5f5f7]">
              <div className="flex items-center gap-3">
                {response.status >= 200 && response.status < 300 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={`font-mono text-sm font-bold ${response.status >= 200 && response.status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {response.status} {response.statusText}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-[#424245]">
                  <Clock className="h-3 w-3" /> {response.time}ms
                </span>
                <CopyBtn text={JSON.stringify(response.data, null, 2)} />
              </div>
            </div>

            {/* Response body */}
            <pre className="p-5 text-sm font-mono text-[#424245] overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Snippets */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f5f5f7] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Code2 className="h-4 w-4 text-[#1d1d1f]" />
            <span className="font-semibold text-white text-sm">Code Snippets</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#424245] transition-transform ${showSnippets ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showSnippets && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-black/[0.06]"
            >
              {/* Language tabs */}
              <div className="flex items-center gap-1 px-4 py-2 bg-[#f5f5f7] border-b border-black/[0.06]">
                {(['curl', 'javascript', 'python'] as SnippetLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSnippetLang(lang)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                               ${snippetLang === lang
                        ? 'bg-[#f5f5f7] text-white'
                        : 'text-[#424245] hover:text-[#424245]'}`}
                  >
                    {lang}
                  </button>
                ))}
                <div className="flex-1" />
                <CopyBtn text={getSnippet()} />
              </div>

              <pre className="p-5 text-sm font-mono text-[#424245] overflow-x-auto leading-relaxed">
                {getSnippet()}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
