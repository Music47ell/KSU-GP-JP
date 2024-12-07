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
  contact_info TEXT
);

-- Seekers Table
CREATE TABLE IF NOT EXISTS public.seeker (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  contact_info TEXT
);

-- Job Listings Table
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.owner(user_id) ON DELETE CASCADE,
  time TIMESTAMPTZ NOT NULL,
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id UUID NOT NULL UNIQUE REFERENCES public.seeker(user_id) ON DELETE CASCADE, -- Enforce one resume per seeker
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Row-Level Security (RLS) Policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_policy ON admins FOR ALL
USING (TRUE);

CREATE POLICY "job owner policy on select" ON job_listings FOR SELECT USING (TRUE);
CREATE POLICY "job owner policy on insert" ON job_listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "job owner policy on update" ON job_listings FOR UPDATE WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "job owner policy on delete" ON job_listings FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "job seeker policy on select" ON job_interests FOR SELECT USING (TRUE);
CREATE POLICY "job seeker policy on insert" ON job_interests FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker policy on update" ON job_interests FOR UPDATE WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker policy on delete" ON job_interests FOR DELETE USING (auth.uid() = seeker_id);

CREATE POLICY "job seeker resume policy on select" ON resumes FOR SELECT USING (auth.uid() = seeker_id);
CREATE POLICY "job seeker resume policy on insert" ON resumes FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker resume policy on update" ON resumes FOR UPDATE WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "job seeker resume policy on delete" ON resumes FOR DELETE USING (auth.uid() = seeker_id);

-- Trigger Function to Handle New Resumes
CREATE OR REPLACE FUNCTION public.handle_resume_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete the existing resume if one exists
    DELETE FROM public.resumes WHERE seeker_id = NEW.seeker_id;
    RETURN NEW;
END;
$$;

-- Trigger to Replace Resume on Insert
CREATE TRIGGER replace_resume
BEFORE INSERT ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.handle_resume_upload();

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
        INSERT INTO public.seeker (user_id, name)
        VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
