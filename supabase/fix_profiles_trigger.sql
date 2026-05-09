-- Fix: New user registration failing with "Database error saving new user"
-- Root cause: handle_new_user trigger runs as supabase_auth_admin which doesn't bypass RLS,
-- and there was no INSERT policy on the profiles table.

-- Step 1: Add INSERT policy for authenticated users (allows the trigger to work)
-- (This policy may already exist if fix_profiles_trigger.sql was run before)
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END
$body$;

-- Step 2: Recreate the handle_new_user function as postgres (superuser) so it bypasses RLS
-- The SECURITY DEFINER with the owner being postgres will bypass RLS completely.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Step 3: Ensure the function is owned by postgres (bypasses RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Step 4: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant execute on the function to supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
