-- ============================================================
-- InstantAPI - Complete Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES - User accounts and usage limits
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  request_credits INTEGER NOT NULL DEFAULT 1000,
  requests_used INTEGER NOT NULL DEFAULT 0,
  max_projects INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. PROJECTS - Each project is one user-defined API
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  schema_definition JSONB NOT NULL DEFAULT '{}',
  -- schema_definition example:
  -- {
  --   "books": {
  --     "title": "string",
  --     "author_id": "uuid",
  --     "price": "number",
  --     "published": "boolean",
  --     "tags": "array"
  --   },
  --   "authors": {
  --     "name": "string",
  --     "bio": "string",
  --     "born_year": "number"
  --   }
  -- }
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. DATA_RECORDS - Universal storage for all user API data
-- ============================================================
CREATE TABLE public.data_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_name TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. REQUEST_LOG - Track every API call for usage/rate limiting
-- ============================================================
CREATE TABLE public.request_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  status_code INTEGER NOT NULL DEFAULT 200,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_api_key ON public.projects(api_key);
CREATE INDEX idx_data_records_project_resource ON public.data_records(project_id, resource_name);
CREATE INDEX idx_data_records_created ON public.data_records(created_at DESC);
CREATE INDEX idx_request_log_project ON public.request_log(project_id, created_at DESC);
CREATE INDEX idx_request_log_rate ON public.request_log(project_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users manage their own
CREATE POLICY "Users view own projects"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Data records: accessible through project ownership
CREATE POLICY "Users view own data"
  ON public.data_records FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users insert own data"
  ON public.data_records FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users update own data"
  ON public.data_records FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own data"
  ON public.data_records FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Request log: users view their own
CREATE POLICY "Users view own logs"
  ON public.request_log FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET requests_used = requests_used + 1,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check rate limit (returns TRUE if allowed)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_project_id UUID, p_limit INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.request_log
  WHERE project_id = p_project_id
    AND created_at > NOW() - INTERVAL '1 minute';
  RETURN recent_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SERVICE ROLE POLICIES (for API route access with service key)
-- ============================================================
-- The API routes use the service role key to bypass RLS
-- This is safe because the routes validate the api_key themselves
