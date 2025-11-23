-- RLS Policies for offers table (Restricted to admin/super_admin only)
-- Run this in your Supabase SQL editor

-- Enable Row Level Security for offers table (if not already enabled)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow admin users to read offers" ON public.offers;
DROP POLICY IF EXISTS "Allow admin users to insert offers" ON public.offers;
DROP POLICY IF EXISTS "Allow admin users to update offers" ON public.offers;
DROP POLICY IF EXISTS "Allow admin users to delete offers" ON public.offers;

-- Helper function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- SELECT: Allow admin/super_admin to read offers
CREATE POLICY "Allow admin users to read offers" ON public.offers
    FOR SELECT USING (public.is_admin_or_super_admin());

-- INSERT: Allow admin/super_admin to create offers
CREATE POLICY "Allow admin users to insert offers" ON public.offers
    FOR INSERT WITH CHECK (public.is_admin_or_super_admin());

-- UPDATE: Allow admin/super_admin to update offers
CREATE POLICY "Allow admin users to update offers" ON public.offers
    FOR UPDATE USING (public.is_admin_or_super_admin());

-- DELETE: Allow admin/super_admin to delete offers
CREATE POLICY "Allow admin users to delete offers" ON public.offers
    FOR DELETE USING (public.is_admin_or_super_admin());

