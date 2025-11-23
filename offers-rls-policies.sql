-- RLS Policies for offers table
-- Run this in your Supabase SQL editor

-- Enable Row Level Security for offers table (if not already enabled)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read offers" ON public.offers;
DROP POLICY IF EXISTS "Allow authenticated users to insert offers" ON public.offers;
DROP POLICY IF EXISTS "Allow authenticated users to update offers" ON public.offers;
DROP POLICY IF EXISTS "Allow authenticated users to delete offers" ON public.offers;

-- Create policies for authenticated users
-- SELECT: Allow authenticated users to read offers
CREATE POLICY "Allow authenticated users to read offers" ON public.offers
    FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: Allow authenticated users to create offers
CREATE POLICY "Allow authenticated users to insert offers" ON public.offers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Allow authenticated users to update offers
CREATE POLICY "Allow authenticated users to update offers" ON public.offers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- DELETE: Allow authenticated users to delete offers
CREATE POLICY "Allow authenticated users to delete offers" ON public.offers
    FOR DELETE USING (auth.role() = 'authenticated');

