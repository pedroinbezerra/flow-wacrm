-- Migration 025: Add sector column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sector text NULL;
