
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '🧠',
  reason TEXT NOT NULL DEFAULT '',
  target_days INTEGER NOT NULL DEFAULT 90,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create day_logs table
CREATE TABLE public.day_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  relapse_reason TEXT,
  relapse_note TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  mood_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own day_logs" ON public.day_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own day_logs" ON public.day_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own day_logs" ON public.day_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own day_logs" ON public.day_logs FOR DELETE USING (auth.uid() = user_id);

-- Create pomodoro_sessions table
CREATE TABLE public.pomodoro_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  task TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pomodoro_sessions" ON public.pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pomodoro_sessions" ON public.pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood INTEGER NOT NULL DEFAULT 3 CHECK (mood >= 1 AND mood <= 5),
  triggers TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal_entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal_entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal_entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal_entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create urge_logs table
CREATE TABLE public.urge_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  duration INTEGER NOT NULL DEFAULT 0,
  journal_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.urge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own urge_logs" ON public.urge_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own urge_logs" ON public.urge_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create time_capsules table
CREATE TABLE public.time_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time_capsules" ON public.time_capsules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time_capsules" ON public.time_capsules FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
