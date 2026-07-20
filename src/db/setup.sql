-- ============================================================================
-- KSU Job Portal — Database Setup
-- Run this in the Supabase SQL Editor (one statement at a time if needed).
-- ============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. Custom Enums
DO $$ BEGIN
    CREATE TYPE JOB_APPROVAL AS ENUM ('APPROVED', 'DENIED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. Tables
-- ============================================================================

-- Admins
CREATE TABLE IF NOT EXISTS public.admins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Owners
CREATE TABLE IF NOT EXISTS public.owner (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
    name TEXT,
    company TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Seekers
CREATE TABLE IF NOT EXISTS public.seeker (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
    name TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job Listings
CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID PRIMARY KEY NOT NULL DEFAULT extensions.uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.owner(user_id) ON DELETE CASCADE,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    approved JOB_APPROVAL DEFAULT 'PENDING'
);

-- Job Interests (seeker expresses interest in a job)
CREATE TABLE IF NOT EXISTS public.job_interests (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
    seeker_id UUID NOT NULL REFERENCES public.seeker(user_id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owner(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_job_listings_owner ON public.job_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_approved ON public.job_listings(approved);
CREATE INDEX IF NOT EXISTS idx_job_interests_job ON public.job_interests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_seeker ON public.job_interests(seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_owner ON public.job_interests(owner_id);

-- ============================================================================
-- 5. Row-Level Security
-- ============================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_interests ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY admin_all_policy ON public.admins
    FOR ALL USING (auth.role() = 'authenticated');

-- Owners: public read, self insert/update/delete
CREATE POLICY owner_select_policy ON public.owner
    FOR SELECT USING (true);

CREATE POLICY owner_insert_policy ON public.owner
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY owner_update_policy ON public.owner
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY owner_delete_policy ON public.owner
    FOR DELETE USING (auth.uid() = user_id);

-- Seekers: public read, self insert/update/delete
CREATE POLICY seeker_select_policy ON public.seeker
    FOR SELECT USING (true);

CREATE POLICY seeker_insert_policy ON public.seeker
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY seeker_update_policy ON public.seeker
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY seeker_delete_policy ON public.seeker
    FOR DELETE USING (auth.uid() = user_id);

-- Job Listings: public read, owner insert/update/delete
CREATE POLICY job_listings_select_policy ON public.job_listings
    FOR SELECT USING (true);

CREATE POLICY job_listings_insert_policy ON public.job_listings
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY job_listings_update_policy ON public.job_listings
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY job_listings_delete_policy ON public.job_listings
    FOR DELETE USING (auth.uid() = owner_id);

-- Job Interests: public read, seeker insert/update/delete
CREATE POLICY job_interests_select_policy ON public.job_interests
    FOR SELECT USING (true);

CREATE POLICY job_interests_insert_policy ON public.job_interests
    FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY job_interests_update_policy ON public.job_interests
    FOR UPDATE USING (auth.uid() = seeker_id);

CREATE POLICY job_interests_delete_policy ON public.job_interests
    FOR DELETE USING (auth.uid() = seeker_id);

-- ============================================================================
-- 6. Auth Trigger: Auto-create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.raw_user_meta_data ->> 'role' = 'admin' THEN
        INSERT INTO public.admins (user_id, name)
        VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
    ELSIF NEW.raw_user_meta_data ->> 'role' = 'owner' THEN
        INSERT INTO public.owner (user_id, name, company)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'name',
            NEW.raw_user_meta_data ->> 'company'
        );
    ELSIF NEW.raw_user_meta_data ->> 'role' = 'seeker' THEN
        INSERT INTO public.seeker (user_id, name, resume_url, github_url, linkedin_url, portfolio_url)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'name',
            NEW.raw_user_meta_data ->> 'resume_url',
            NEW.raw_user_meta_data ->> 'github_url',
            NEW.raw_user_meta_data ->> 'linkedin_url',
            NEW.raw_user_meta_data ->> 'portfolio_url'
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
