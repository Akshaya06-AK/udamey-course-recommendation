
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  career_goal TEXT,
  learning_streak INT NOT NULL DEFAULT 0,
  xp INT NOT NULL DEFAULT 0,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Interests (1 row per user/category)
CREATE TABLE public.user_interests (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT ALL ON public.user_interests TO service_role;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interests" ON public.user_interests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Courses (public catalog)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  instructor TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 4.5,
  students INT NOT NULL DEFAULT 0,
  duration_hours INT NOT NULL DEFAULT 8,
  difficulty TEXT NOT NULL DEFAULT 'beginner', -- beginner|intermediate|advanced
  skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  thumbnail_hue INT NOT NULL DEFAULT 220,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses public read" ON public.courses FOR SELECT TO anon, authenticated USING (true);

-- Enrollments / progress
CREATE TABLE public.enrollments (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0, -- 0..100
  completed BOOLEAN NOT NULL DEFAULT false,
  rating INT,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.enrollments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
