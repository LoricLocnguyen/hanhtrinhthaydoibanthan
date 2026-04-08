CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.squad_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  is_relapsed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(squad_id, device_id)
);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Anyone can create squads" ON public.squads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view squad members" ON public.squad_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join squads" ON public.squad_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can update themselves" ON public.squad_members FOR UPDATE USING (true);
CREATE POLICY "Members can leave squads" ON public.squad_members FOR DELETE USING (true);

CREATE INDEX idx_squads_code ON public.squads(code);
CREATE INDEX idx_squad_members_squad_id ON public.squad_members(squad_id);
CREATE INDEX idx_squad_members_device_id ON public.squad_members(device_id);