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

-- Create get_products function with pagination support
CREATE OR REPLACE FUNCTION get_products(
    limit_value INTEGER DEFAULT 10,
    offset_value INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM public.products;
    
    -- Get paginated products
    SELECT json_build_object(
        'data', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'price', price,
                    'created_at', created_at,
                    'updated_at', updated_at
                )
            )
            FROM (
                SELECT id, title, price, created_at, updated_at
                FROM public.products
                ORDER BY created_at DESC
                LIMIT limit_value
                OFFSET offset_value
            ) AS products
        ),
        'total', total_count
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create get_profiles_by_role function with pagination support
CREATE OR REPLACE FUNCTION get_profiles_by_role(
    p_role TEXT,
    p_limit INTEGER DEFAULT 10,
    p_page INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    offset_value INTEGER;
BEGIN
    -- Calculate offset
    offset_value := (p_page - 1) * p_limit;
    
    -- Get total count for the role
    SELECT COUNT(*) INTO total_count 
    FROM public.profiles 
    WHERE role = p_role;
    
    -- Get paginated profiles
    SELECT json_build_object(
        'data', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'email', email,
                    'first_name', first_name,
                    'last_name', last_name,
                    'role', role
                )
            )
            FROM (
                SELECT id, email, first_name, last_name, role
                FROM public.profiles
                WHERE role = p_role
                ORDER BY created_at DESC
                LIMIT p_limit
                OFFSET offset_value
            ) AS profiles
        ),
        'total', total_count
    ) INTO result;
    
    RETURN result;
END;
$$;

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


