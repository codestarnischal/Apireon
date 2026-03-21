'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export type FilterKey = 'voice' | 'motion' | 'research';

interface FilterOption {
  key: FilterKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  softColor: string;
  description: string;
}

const FILTERS: FilterOption[] = [
  {
    key: 'voice',
    label: 'Procyon Voice',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    color: 'var(--calm-sage)',
    softColor: 'var(--calm-sage-soft)',
    description: 'Emotion-to-Speech · De-escalation · Calm communication',
  },
  {
    key: 'motion',
    label: 'Procyon Motion',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    color: 'var(--calm-sky)',
    softColor: 'var(--calm-sky-soft)',
    description: 'Simplified visuals · Educator tools · Sensory-friendly',
  },
  {
    key: 'research',
    label: 'Procyon Research',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    color: 'var(--calm-lavender)',
    softColor: 'var(--calm-lavender-soft)',
    description: 'Neurological Twin · Peer-reviewed frameworks · Labs',
  },
];

const dampedSpring = { type: 'spring' as const, stiffness: 160, damping: 22 };

interface FilterInteractionProps {
  onSelect: (key: FilterKey) => void;
  selected: FilterKey | null;
}

export default function FilterInteraction({ onSelect, selected }: FilterInteractionProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[520px] mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        {FILTERS.map((f, i) => {
          const isActive = selected === f.key;
          return (
            <motion.button
              key={f.key}
              onClick={() => onSelect(f.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, ...dampedSpring }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={clsx(
                'flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-500 cursor-pointer min-w-[160px]',
                isActive
                  ? 'border-current shadow-sm'
                  : 'border-transparent bg-white hover:bg-[var(--calm-warm)]'
              )}
              style={isActive ? { borderColor: f.color, background: f.softColor, color: f.color } : {}}
            >
              <span style={isActive ? { color: f.color } : { color: 'var(--ink-3)' }}>
                {f.icon}
              </span>
              <div className="text-left">
                <span className={clsx(
                  'text-[14px] font-semibold block leading-tight',
                  isActive ? '' : 'text-[var(--ink)]'
                )}>
                  {f.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Description for selected */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.p
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="text-[14px] text-[var(--ink-3)] text-center"
          >
            {FILTERS.find(f => f.key === selected)?.description}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export { FILTERS };
export type { FilterOption };
