-- RPC Function to delete a user and all their data
-- This function must be created as SECURITY DEFINER to have permission to delete from auth.users
-- It should be owned by postgres to bypass RLS

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the ID of the user calling the function
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Delete from public tables
    -- (The frontend also does this, but doing it here ensures completeness)
    DELETE FROM public.transactions WHERE user_id = current_user_id;
    DELETE FROM public.recurring_transactions WHERE user_id = current_user_id;
    DELETE FROM public.goals WHERE user_id = current_user_id;
    DELETE FROM public.budgets WHERE user_id = current_user_id;
    DELETE FROM public.sessions WHERE user_id = current_user_id;
    DELETE FROM public.profiles WHERE id = current_user_id;

    -- 2. Delete the user from auth.users
    -- This is the part that requires SECURITY DEFINER and high privileges
    DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Ensure the function is owned by postgres
ALTER FUNCTION public.delete_user() OWNER TO postgres;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
