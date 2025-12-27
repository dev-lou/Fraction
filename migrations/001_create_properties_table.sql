-- SQL migration for Supabase/ Postgres

CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  city text,
  lat double precision,
  lng double precision,
  status text,
  apy text,
  token_price_usd numeric,
  token_contract text,
  available integer,
  total integer,
  blueprint_url text,
  render_url text,
  tokenized_url text,
  image_verified boolean DEFAULT false,
  last_image_verified_at timestamp with time zone,
  last_synced_at timestamp with time zone,
  last_block_synced bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- simple trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.properties;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
