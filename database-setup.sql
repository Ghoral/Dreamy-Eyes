-- Database setup script for Dreamy Eyes CMS Dashboard
-- Run this in your Supabase SQL editor

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (if not exists)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'paid', 'cancelled', 'delivered')) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
CREATE POLICY "Allow public read access to users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to orders" ON public.orders
    FOR SELECT USING (true);

-- Insert sample data for testing (optional)
INSERT INTO public.users (email) VALUES 
    ('john@example.com'),
    ('jane@example.com'),
    ('bob@example.com'),
    ('alice@example.com'),
    ('charlie@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (user_id, country) VALUES 
    ((SELECT id FROM public.users WHERE email = 'john@example.com'), 'USA'),
    ((SELECT id FROM public.users WHERE email = 'jane@example.com'), 'USA'),
    ((SELECT id FROM public.users WHERE email = 'bob@example.com'), 'France'),
    ((SELECT id FROM public.users WHERE email = 'alice@example.com'), 'Germany'),
    ((SELECT id FROM public.users WHERE email = 'charlie@example.com'), 'UK')
ON CONFLICT DO NOTHING;

INSERT INTO public.orders (user_id, status, total_amount) VALUES 
    ((SELECT id FROM public.users WHERE email = 'john@example.com'), 'paid', 299.99),
    ((SELECT id FROM public.users WHERE email = 'jane@example.com'), 'paid', 199.99),
    ((SELECT id FROM public.users WHERE email = 'bob@example.com'), 'paid', 399.99),
    ((SELECT id FROM public.users WHERE email = 'alice@example.com'), 'pending', 149.99),
    ((SELECT id FROM public.users WHERE email = 'charlie@example.com'), 'paid', 599.99)
ON CONFLICT DO NOTHING;


