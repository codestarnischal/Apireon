// ============================================================
// Apireon - Global Type Definitions
// ============================================================

export type Plan = 'free' | 'pro' | 'enterprise';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  request_credits: number;
  requests_used: number;
  max_projects: number;
  created_at: string;
  updated_at: string;
}

export type FieldType = 'string' | 'number' | 'boolean' | 'uuid' | 'array' | 'object' | 'email' | 'url' | 'date';

export interface ResourceSchema {
  [fieldName: string]: FieldType;
}

export interface SchemaDefinition {
  [resourceName: string]: ResourceSchema;
}

export interface Project {
  id: string;
  user_id: string;
  api_key: string;
  name: string;
  description: string | null;
  schema_definition: SchemaDefinition;
  is_active: boolean;
  rate_limit_per_minute: number;
  created_at: string;
  updated_at: string;
}

export interface DataRecord {
  id: string;
  project_id: string;
  resource_name: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: string;
  project_id: string;
  resource_name: string;
  method: string;
  status_code: number;
  ip_address: string | null;
  created_at: string;
}

// Architect Engine types
export interface ArchitectPrompt {
  description: string;
}

export interface ArchitectResponse {
  name: string;
  description: string;
  schema: SchemaDefinition;
}

// API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Dashboard types
export interface UsageStats {
  total_requests: number;
  credits_remaining: number;
  requests_today: number;
  top_resources: { name: string; count: number }[];
}

export interface PricingTier {
  name: Plan;
  price: number;
  credits: number;
  max_projects: number;
  rate_limit: number;
  features: string[];
}
