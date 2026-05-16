-- Migration to add has_used_trial to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;
