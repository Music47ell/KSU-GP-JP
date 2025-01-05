CREATE TYPE JOB_APPROVAL AS ENUM ('APPROVED', 'DENIED', 'PENDING');

-- Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT
);

-- Owners Table
CREATE TABLE IF NOT EXISTS public.owner (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  company TEXT
);

-- Seekers Table
CREATE TABLE IF NOT EXISTS public.seeker (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  resume_url TEXT,
	github_url TEXT,
	linkedin_url TEXT,
	portfolio_url TEXT
);

-- Job Listings Table
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.owner(user_id) ON DELETE CASCADE,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  approved JOB_APPROVAL DEFAULT 'PENDING'
);

-- Job Interests Table
CREATE TABLE IF NOT EXISTS public.job_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.seeker(user_id) ON DELETE CASCADE,
	owner_id UUID NOT NULL REFERENCES public.owner(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row-Level Security (RLS) Policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_policy ON admins FOR ALL
USING (TRUE);

create policy "owner are viewable by everyone."
  on owner for select
  using ( true );

create policy "owner can insert their own profile."
  on owner for insert
  with check ( auth.uid() = user_id );

create policy "owner can update own profile."
  on owner for update
  using ( auth.uid() = user_id );

create policy "owner can delete own profile."
  on owner for delete
  using ( auth.uid() = user_id );

CREATE POLICY "job owner policy on select" ON job_listings FOR SELECT USING (TRUE);
CREATE POLICY "job owner policy on insert" ON job_listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "job owner policy on update" ON job_listings FOR UPDATE WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "job owner policy on delete" ON job_listings FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "job seeker policy on select" ON job_interests FOR SELECT USING (TRUE);
CREATE POLICY "job seeker policy on insert" ON job_interests FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker policy on update" ON job_interests FOR UPDATE WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker policy on delete" ON job_interests FOR DELETE USING (auth.uid() = seeker_id);

-- Function and Trigger for New User Roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.raw_user_meta_data ->> 'role' = 'admin' THEN
        INSERT INTO public.admins (user_id, name)
        VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
    ELSIF NEW.raw_user_meta_data ->> 'role' = 'owner' THEN
        INSERT INTO public.owner (user_id, name)
        VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
    ELSIF NEW.raw_user_meta_data ->> 'role' = 'seeker' THEN
        INSERT INTO public.seeker (user_id, name, resume_url)
        VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', new.raw_user_meta_data->>'resume_url');
    END IF;

    RETURN NEW;
END;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
