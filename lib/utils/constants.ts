import { PricingTier } from '@/types';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'free',
    price: 0,
    credits: 1000,
    max_projects: 3,
    rate_limit: 60,
    features: [
      '1,000 API requests/month',
      '3 projects',
      '60 req/min rate limit',
      'Community support',
      'Auto-generated docs',
    ],
  },
  {
    name: 'pro',
    price: 29,
    credits: 50000,
    max_projects: 25,
    rate_limit: 300,
    features: [
      '50,000 API requests/month',
      '25 projects',
      '300 req/min rate limit',
      'Priority support',
      'Custom domains',
      'Webhook integrations',
    ],
  },
  {
    name: 'enterprise',
    price: 149,
    credits: 500000,
    max_projects: -1,
    rate_limit: 1000,
    features: [
      '500,000 API requests/month',
      'Unlimited projects',
      '1,000 req/min rate limit',
      'Dedicated support',
      'Custom domains',
      'SSO & RBAC',
      'SLA guarantee',
      'Data export',
    ],
  },
];

export const APP_CONFIG = {
  name: 'Apireon',
  tagline: 'Describe it. Deploy it. Done.',
  description: 'Turn natural language into live REST APIs with documentation, a playground, and database hosting — instantly.',
};
